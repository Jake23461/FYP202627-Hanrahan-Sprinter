import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { Rep } from "../data/types";
import { dateParts } from "../lib/dates";
import { describeImprovement, type NewPb } from "../lib/pbs";
import { START_OPTIONS, TIMING_OPTIONS } from "../lib/sessionOptions";
import { formatRepTime } from "../lib/times";
import { borders, colors, fonts, fontSizes, letterSpacing, spacing } from "../theme";
import { Button } from "./Button";
import { Label } from "./Label";

type NewPbScreenProps = {
  pbs: NewPb[];
  reps: Rep[];
  sessionDate: string;
  onDone: () => void;
};

function PbCard({ pb, reps }: { pb: NewPb; reps: Rep[] }) {
  const index = reps.findIndex((rep) => rep.id === pb.repId);
  const start = START_OPTIONS.find((option) => option.value === reps[index]?.startType)?.label;
  const timing = TIMING_OPTIONS.find((option) => option.value === pb.timingMethod)?.label;
  const heading = [`${pb.distanceM}m`, start ? `from ${start}` : null, timing].filter(Boolean).join(" · ");

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Label style={styles.cardLabel}>{heading}</Label>
        {index >= 0 ? <Label style={styles.cardLabel}>{`Rep ${index + 1} of ${reps.length}`}</Label> : null}
      </View>
      <Text style={styles.time}>{formatRepTime(pb.timeS)}</Text>
      <Label style={styles.improvement}>{`▼ ${describeImprovement(pb)}`}</Label>
    </View>
  );
}

// Shown after a save that set at least one PB, in place of the Log form.
export function NewPbScreen({ pbs, reps, sessionDate, onDone }: NewPbScreenProps) {
  const { weekday, day, month } = dateParts(sessionDate);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Label style={styles.kicker}>{`Session saved · ${weekday} ${day} ${month}`}</Label>
      <Text accessibilityRole="header" style={styles.title}>
        {pbs.length === 1 ? "NEW PB!" : `${pbs.length} NEW PBS!`}
      </Text>
      {pbs.map((pb) => (
        <PbCard key={`${pb.distanceM}-${pb.timingMethod}`} pb={pb} reps={reps} />
      ))}
      <View style={styles.footer}>
        <Button label="DONE" variant="outline" onPress={onDone} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.accent,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  kicker: {
    color: colors.panel,
  },
  title: {
    color: colors.panel,
    fontFamily: fonts.display,
    fontSize: fontSizes.hero,
    letterSpacing: letterSpacing.tight,
    textShadowColor: colors.ink,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  card: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
    borderWidth: borders.width,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: colors.panel,
  },
  time: {
    color: colors.panel,
    fontFamily: fonts.display,
    fontSize: fontSizes.hero,
    letterSpacing: letterSpacing.tight,
  },
  improvement: {
    color: colors.accent,
  },
  footer: {
    marginTop: "auto",
    paddingTop: spacing.md,
  },
});
