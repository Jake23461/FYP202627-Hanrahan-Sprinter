import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { confirmAction } from "../../components/confirm";
import { Label } from "../../components/Label";
import { NewPbScreen } from "../../components/NewPbScreen";
import { PaperBackground } from "../../components/PaperBackground";
import { RepRow } from "../../components/RepRow";
import { TextField, type TextFieldInput } from "../../components/TextField";
import { useAuth } from "../../context/AuthProvider";
import { clearLogDraft, loadLogDraft, saveLogDraft } from "../../data/drafts";
import { toNewRep } from "../../data/mappers";
import { getPersonalBests } from "../../data/personalBests";
import { saveSession } from "../../data/sessions";
import type { NewRep, Rep, SessionFocus, StartType, Surface, TimingMethod } from "../../data/types";
import { isoToDisplay, parseDisplayDate, todayIso, validateSessionDate } from "../../lib/dates";
import { errorMessage } from "../../lib/errors";
import { makeLogDraft, type LogDraft } from "../../lib/logDraft";
import { findNewPbs, type NewPb } from "../../lib/pbs";
import {
  DISTANCE_PICKS,
  FOCUS_OPTIONS,
  START_OPTIONS,
  SURFACE_OPTIONS,
  TIMING_OPTIONS,
} from "../../lib/sessionOptions";
import { validateRpe } from "../../lib/validation";
import { borders, colors, fonts, fontSizes, letterSpacing, spacing } from "../../theme";

// The number pad has no ":" on iOS, so minutes and seconds like 1:02.31 couldn't be typed.
const TIME_KEYBOARD = Platform.OS === "ios" ? "numbers-and-punctuation" : "default";

export default function LogScreen() {
  // The session.
  const [date, setDate] = useState(() => isoToDisplay(todayIso()));
  const [focus, setFocus] = useState<SessionFocus | null>(null);
  const [surface, setSurface] = useState<Surface | null>(null);
  const [rpe, setRpe] = useState("");
  const [notes, setNotes] = useState("");
  const [reps, setReps] = useState<NewRep[]>([]);

  // The add rep box. Distance, start, timing and effort stay set after each
  // rep, so a set of 5 x 30m only needs the time typed each time.
  const [distanceText, setDistanceText] = useState("");
  const [timeText, setTimeText] = useState("");
  const [startType, setStartType] = useState<StartType>("blocks");
  const [timingMethod, setTimingMethod] = useState<TimingMethod>("hand");
  const [maxEffort, setMaxEffort] = useState(true);
  const [repNote, setRepNote] = useState("");
  const [repError, setRepError] = useState<string | null>(null);
  const timeInput = useRef<TextFieldInput>(null);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pbResult, setPbResult] = useState<{ pbs: NewPb[]; reps: Rep[]; sessionDate: string } | null>(null);

  // An unsaved session left on the phone, for example after swiping the app closed.
  const { profile } = useAuth();
  const userId = profile?.id ?? null;
  const [draftChecked, setDraftChecked] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<LogDraft | null>(null);

  useEffect(() => {
    if (userId === null) {
      return;
    }
    let current = true;
    loadLogDraft(userId)
      .then((draft) => {
        if (current) {
          setPendingDraft(draft);
          setDraftChecked(true);
        }
      })
      .catch(() => {
        if (current) {
          setDraftChecked(true);
        }
      });
    return () => {
      current = false;
    };
  }, [userId]);

  // Keep the draft up to date as the form changes. It waits until any old draft
  // has been checked and dealt with, so it can't overwrite one before it's offered.
  useEffect(() => {
    if (userId === null || !draftChecked || pendingDraft !== null) {
      return;
    }
    const write =
      reps.length === 0
        ? clearLogDraft(userId)
        : saveLogDraft(userId, makeLogDraft({ date, focus, surface, rpe, notes, reps }));
    // A draft that fails to save is only a lost convenience, so it isn't shown as an error.
    write.catch(() => {});
  }, [userId, draftChecked, pendingDraft, date, focus, surface, rpe, notes, reps]);

  function handleResume() {
    if (pendingDraft === null) {
      return;
    }
    setDate(pendingDraft.date);
    setFocus(pendingDraft.focus);
    setSurface(pendingDraft.surface);
    setRpe(pendingDraft.rpe);
    setNotes(pendingDraft.notes);
    setReps(pendingDraft.reps);
    setPendingDraft(null);
    setMessage(null);
  }

  function handleDiscard() {
    if (userId !== null) {
      clearLogDraft(userId).catch(() => {});
    }
    setPendingDraft(null);
  }

  function handleAddRep() {
    const result = toNewRep({ distanceText, timeText, timingMethod, startType, maxEffort, note: repNote });
    if (result.error !== null) {
      setRepError(result.error);
      return;
    }

    setReps((current) => [...current, result.rep]);
    setTimeText("");
    setRepNote("");
    setRepError(null);
    setMessage(null);
    timeInput.current?.focus();
  }

  function clearSession() {
    setDate(isoToDisplay(todayIso()));
    setFocus(null);
    setSurface(null);
    setRpe("");
    setNotes("");
    setReps([]);
    setTimeText("");
    setRepNote("");
    setRepError(null);
    setError(null);
  }

  async function handleCancel() {
    const confirmed =
      reps.length === 0 ||
      (await confirmAction({
        title: "Clear this session?",
        message: "The reps you've added will be lost.",
        confirmLabel: "Clear",
      }));
    if (confirmed) {
      clearSession();
    }
  }

  async function handleSave() {
    const problem =
      (reps.length === 0 ? "Add at least one rep before saving." : null) ??
      validateSessionDate(date) ??
      validateRpe(rpe);
    setError(problem);
    setMessage(null);
    if (problem) {
      return;
    }

    setSaving(true);
    try {
      // PBs come from the personal_bests view, so compare it before and after
      // the save. If either read fails, the session still saves without the PB screen.
      const before = await getPersonalBests().catch(() => null);
      const saved = await saveSession(
        {
          sessionDate: parseDisplayDate(date) ?? undefined,
          focus,
          surface,
          rpe: rpe.trim() === "" ? null : Number(rpe),
          notes: notes.trim() === "" ? null : notes.trim(),
        },
        reps,
      );
      const after = await getPersonalBests().catch(() => null);
      const newPbs = before && after ? findNewPbs(before, after) : [];

      const count = reps.length;
      clearSession();
      if (newPbs.length > 0) {
        setPbResult({ pbs: newPbs, reps: saved.reps, sessionDate: saved.sessionDate });
      } else {
        setMessage(`Session saved: ${count} ${count === 1 ? "rep" : "reps"}.`);
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  if (pbResult) {
    return <NewPbScreen {...pbResult} onDone={() => setPbResult(null)} />;
  }

  return (
    <PaperBackground style={styles.screen}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {pendingDraft ? (
          <View style={styles.draftBanner}>
            <Label style={styles.draftText}>
              {`Unsaved session · ${pendingDraft.reps.length} ${pendingDraft.reps.length === 1 ? "rep" : "reps"} · ${pendingDraft.date}`}
            </Label>
            <View style={styles.row}>
              <View style={styles.half}>
                <Button label="RESUME" variant="primary" onPress={handleResume} />
              </View>
              <View style={styles.half}>
                <Button label="DISCARD" variant="outline" onPress={handleDiscard} />
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text accessibilityRole="header" style={styles.cardTitle}>
              LOG A SESSION
            </Text>
            {reps.length > 0 ? <Label style={styles.unsaved}>Unsaved</Label> : null}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.row}>
              <View style={styles.half}>
                <TextField
                  label="Date"
                  value={date}
                  onChangeText={setDate}
                  placeholder="DD/MM/YYYY"
                  keyboardType={TIME_KEYBOARD}
                />
              </View>
              <View style={styles.half}>
                <TextField
                  label="RPE /10"
                  value={rpe}
                  onChangeText={setRpe}
                  placeholder="Optional"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.group}>
              <Label>Focus</Label>
              <View style={styles.chips}>
                {FOCUS_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={focus === option.value}
                    onPress={() => setFocus(focus === option.value ? null : option.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.group}>
              <Label>Surface</Label>
              <View style={styles.chips}>
                {SURFACE_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={surface === option.value}
                    onPress={() => setSurface(surface === option.value ? null : option.value)}
                  />
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>REPS</Text>

            {reps.length === 0 ? (
              <Label>No reps yet. Add your first one below.</Label>
            ) : (
              <View>
                {reps.map((rep, index) => (
                  <RepRow
                    // Reps have no id until they're saved, and can only be removed, so the index is stable enough.
                    key={index}
                    number={index + 1}
                    rep={rep}
                    onRemove={() => setReps((current) => current.filter((_, i) => i !== index))}
                  />
                ))}
              </View>
            )}

            <View style={styles.addRep}>
              <View style={styles.group}>
                <Label>Distance</Label>
                <View style={styles.chips}>
                  {DISTANCE_PICKS.map((distance) => (
                    <Chip
                      key={distance}
                      label={`${distance}`}
                      selected={distanceText === String(distance)}
                      onPress={() => setDistanceText(String(distance))}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <TextField
                    label="Metres"
                    value={distanceText}
                    onChangeText={setDistanceText}
                    placeholder="Other"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.half}>
                  <TextField
                    ref={timeInput}
                    label="Time"
                    value={timeText}
                    onChangeText={setTimeText}
                    placeholder="11.84"
                    keyboardType={TIME_KEYBOARD}
                    returnKeyType="done"
                    onSubmitEditing={handleAddRep}
                    submitBehavior="submit"
                  />
                </View>
              </View>

              <View style={styles.group}>
                <Label>Start</Label>
                <View style={styles.chips}>
                  {START_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      selected={startType === option.value}
                      onPress={() => setStartType(option.value)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.group}>
                <Label>Timing and effort</Label>
                <View style={styles.chips}>
                  {TIMING_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      selected={timingMethod === option.value}
                      onPress={() => setTimingMethod(option.value)}
                    />
                  ))}
                  <Chip label="Max effort" selected={maxEffort} onPress={() => setMaxEffort(!maxEffort)} />
                </View>
              </View>

              <TextField label="Rep note" value={repNote} onChangeText={setRepNote} placeholder="Optional" />

              {repError ? (
                <Text accessibilityLiveRegion="polite" style={styles.error}>
                  {repError}
                </Text>
              ) : null}
              <Button label="+ ADD REP" variant="outline" onPress={handleAddRep} />
            </View>

            <TextField
              label="Session notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional"
              multiline
              style={styles.notes}
            />

            {error ? (
              <Text accessibilityLiveRegion="polite" style={styles.error}>
                {error}
              </Text>
            ) : null}
            {message ? (
              <Text accessibilityLiveRegion="polite" style={styles.message}>
                {message}
              </Text>
            ) : null}
            <Button label="SAVE SESSION" loading={saving} onPress={handleSave} />
            <Button label="CANCEL" variant="outline" onPress={handleCancel} />
          </View>
        </View>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  draftBanner: {
    backgroundColor: colors.panel,
    borderColor: colors.accent,
    borderWidth: borders.width,
    gap: spacing.sm,
    padding: spacing.md,
  },
  draftText: {
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.ink,
    borderWidth: borders.width,
  },
  cardHeader: {
    alignItems: "center",
    backgroundColor: colors.accent,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.panel,
    fontFamily: fonts.display,
    fontSize: fontSizes.heading * 0.75,
    letterSpacing: letterSpacing.tight,
  },
  unsaved: {
    color: colors.panel,
  },
  cardBody: {
    gap: spacing.md,
    padding: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  group: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.body * 1.5,
    letterSpacing: letterSpacing.tight,
  },
  addRep: {
    borderColor: colors.ink,
    borderStyle: "dashed",
    borderWidth: borders.width,
    gap: spacing.md,
    padding: spacing.md,
  },
  notes: {
    minHeight: 80,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  error: {
    color: colors.accent,
    fontFamily: fonts.title,
    fontSize: fontSizes.body,
  },
  message: {
    color: colors.slate,
    fontFamily: fonts.title,
    fontSize: fontSizes.body,
  },
});
