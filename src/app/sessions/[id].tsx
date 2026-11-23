import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { confirmAction } from "../../components/confirm";
import { Label } from "../../components/Label";
import { PaperBackground } from "../../components/PaperBackground";
import { RepRow } from "../../components/RepRow";
import { deleteSession, getSession } from "../../data/sessions";
import type { SessionWithReps } from "../../data/types";
import { dateParts } from "../../lib/dates";
import { errorMessage } from "../../lib/errors";
import { FOCUS_OPTIONS, SURFACE_OPTIONS } from "../../lib/sessionOptions";
import { borders, colors, fonts, fontSizes, letterSpacing, spacing } from "../../theme";

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

// One saved session and its reps, opened from the history list on TRAIN.
export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  // undefined while loading, null if it doesn't exist or belongs to someone else.
  const [session, setSession] = useState<SessionWithReps | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let current = true;
    getSession(id)
      .then((loaded) => {
        if (current) {
          setSession(loaded);
        }
      })
      .catch((caught) => {
        if (current) {
          setError(errorMessage(caught));
        }
      });
    return () => {
      current = false;
    };
  }, [id]);

  async function handleDelete() {
    const confirmed = await confirmAction({
      title: "Delete this session?",
      message: "Its reps will be deleted too. This can't be undone.",
      confirmLabel: "Delete",
    });
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      // The reps go too, through on delete cascade in the database.
      await deleteSession(id);
      goBack();
    } catch (caught) {
      setError(errorMessage(caught));
      setDeleting(false);
    }
  }

  let body;
  if (session === undefined && error === null) {
    body = <Label>Loading…</Label>;
  } else if (session === null) {
    body = <Label>{"This session couldn't be found. It may have been deleted."}</Label>;
  } else if (session) {
    const { weekday, day, month } = dateParts(session.sessionDate);
    const details = [
      FOCUS_OPTIONS.find((option) => option.value === session.focus)?.label,
      SURFACE_OPTIONS.find((option) => option.value === session.surface)?.label,
      session.rpe === null ? null : `RPE ${session.rpe}/10`,
    ]
      .filter(Boolean)
      .join(" · ");

    body = (
      <>
        <Label>{weekday}</Label>
        <Text accessibilityRole="header" style={styles.title}>{`${day} ${month}`}</Text>
        {details ? <Text style={styles.details}>{details}</Text> : null}
        {session.notes ? <Text style={styles.notes}>{session.notes}</Text> : null}

        <View style={styles.reps}>
          <Text style={styles.sectionTitle}>REPS</Text>
          {session.reps.map((rep) => (
            <RepRow key={rep.id} number={rep.position} rep={rep} />
          ))}
        </View>

        <View style={styles.footer}>
          <Button label="DELETE SESSION" variant="outline" loading={deleting} onPress={handleDelete} />
        </View>
      </>
    );
  }

  return (
    <PaperBackground style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.md, paddingTop: insets.top + spacing.md },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={spacing.sm}
          onPress={goBack}
          style={styles.back}
        >
          <Text style={styles.backLabel}>← BACK</Text>
        </Pressable>
        {body}
        {error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  back: {
    alignSelf: "flex-start",
    paddingBottom: spacing.sm,
  },
  backLabel: {
    color: colors.ink,
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.label,
    letterSpacing: letterSpacing.label,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.heading,
    letterSpacing: letterSpacing.tight,
  },
  details: {
    color: colors.ink,
    fontFamily: fonts.title,
    fontSize: fontSizes.body,
  },
  notes: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
  },
  reps: {
    borderTopColor: colors.ink,
    borderTopWidth: borders.width,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.body * 1.5,
    letterSpacing: letterSpacing.tight,
  },
  footer: {
    marginTop: "auto",
    paddingTop: spacing.lg,
  },
  error: {
    color: colors.accent,
    fontFamily: fonts.title,
    fontSize: fontSizes.body,
  },
});
