import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/Button";
import { Label } from "../../components/Label";
import { Panel } from "../../components/Panel";
import { PaperBackground } from "../../components/PaperBackground";
import { useAuth } from "../../context/AuthProvider";
import { loadLogDraft } from "../../data/drafts";
import { getSessionsWithReps } from "../../data/sessions";
import type { SessionWithReps } from "../../data/types";
import { dateParts } from "../../lib/dates";
import { errorMessage } from "../../lib/errors";
import { summariseSession } from "../../lib/sessionSummary";
import { formatRepTime } from "../../lib/times";
import { borders, colors, fonts, fontSizes, letterSpacing, spacing } from "../../theme";

function SessionRow({ session }: { session: SessionWithReps }) {
  const { weekday, day, month } = dateParts(session.sessionDate);
  const { title, summary, best } = summariseSession(session);

  return (
    <View style={styles.row}>
      <View style={styles.date}>
        <Text style={styles.dateText}>{`${day} ${month}`}</Text>
        <Label>{weekday}</Label>
      </View>
      <View style={styles.middle}>
        <Text style={styles.title}>{title}</Text>
        <Label>{summary}</Label>
      </View>
      {best ? (
        <View style={styles.best}>
          <Label>{`${best.distanceM}m${best.timingMethod === "electronic" ? " · Elec" : ""}`}</Label>
          <Text style={styles.bestTime}>{formatRepTime(best.timeS)}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TrainScreen() {
  const { profile } = useAuth();
  const userId = profile?.id ?? null;
  const [sessions, setSessions] = useState<SessionWithReps[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [draftReps, setDraftReps] = useState(0);

  const load = useCallback(async () => {
    try {
      setSessions(await getSessionsWithReps());
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    }
    if (userId !== null) {
      const draft = await loadLogDraft(userId).catch(() => null);
      setDraftReps(draft?.reps.length ?? 0);
    }
  }, [userId]);

  // Reload every time TRAIN comes back into view, so a session saved on the Log
  // tab shows straight away.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const header = (
    <View style={styles.header}>
      {draftReps > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate("/log")}
          style={styles.draft}
        >
          <Label style={styles.draftText}>
            {`Unsaved session · ${draftReps} ${draftReps === 1 ? "rep" : "reps"} · Continue →`}
          </Label>
        </Pressable>
      ) : null}
      <View style={styles.headingRow}>
        <Text accessibilityRole="header" style={styles.heading}>
          RECENT
        </Text>
        <Pressable accessibilityRole="button" hitSlop={spacing.sm} onPress={() => router.navigate("/log")}>
          <Label style={styles.logLink}>+ Log a session</Label>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

  return (
    <PaperBackground style={styles.screen}>
      <FlatList
        data={sessions ?? []}
        keyExtractor={(session) => session.id}
        renderItem={({ item }) => <SessionRow session={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          sessions === null ? undefined : (
            <Panel style={styles.empty}>
              <Label>No sessions yet. Log your first one.</Label>
              <Button label="LOG A SESSION" onPress={() => router.navigate("/log")} />
            </Panel>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.ink} />
        }
        contentContainerStyle={styles.content}
      />
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  draft: {
    backgroundColor: colors.panel,
    borderColor: colors.accent,
    borderWidth: borders.width,
    padding: spacing.md,
  },
  draftText: {
    color: colors.ink,
  },
  headingRow: {
    alignItems: "center",
    borderBottomColor: colors.ink,
    borderBottomWidth: borders.width,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
  },
  heading: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.heading,
    letterSpacing: letterSpacing.tight,
  },
  logLink: {
    color: colors.accent,
  },
  error: {
    color: colors.accent,
    fontFamily: fonts.title,
    fontSize: fontSizes.body,
  },
  empty: {
    gap: spacing.md,
  },
  row: {
    alignItems: "center",
    borderBottomColor: colors.ink,
    borderBottomWidth: borders.width / 2,
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  date: {
    gap: spacing.xs,
    width: 72,
  },
  dateText: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.body * 1.25,
    letterSpacing: letterSpacing.tight,
  },
  middle: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.title,
    fontSize: fontSizes.body,
  },
  best: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  bestTime: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.body * 1.5,
    letterSpacing: letterSpacing.tight,
  },
});
