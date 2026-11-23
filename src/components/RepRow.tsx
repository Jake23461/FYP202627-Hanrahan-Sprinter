import { Pressable, StyleSheet, Text, View } from "react-native";

import type { NewRep } from "../data/types";
import { START_OPTIONS, TIMING_OPTIONS } from "../lib/sessionOptions";
import { formatRepTime } from "../lib/times";
import { borders, colors, fonts, fontSizes, spacing } from "../theme";
import { Label } from "./Label";

type RepRowProps = {
  number: number;
  rep: NewRep;
  // Only the Log form passes this, because saved reps can't be edited.
  onRemove?: () => void;
};

// One rep in a list: "1  30m  4.21s" with "Blocks · Hand" underneath.
export function RepRow({ number, rep, onRemove }: RepRowProps) {
  const details = [
    START_OPTIONS.find((option) => option.value === rep.startType)?.label,
    TIMING_OPTIONS.find((option) => option.value === rep.timingMethod)?.label,
    rep.maxEffort ? null : "Training",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.row}>
      <Text style={styles.number}>{number}</Text>
      <View style={styles.main}>
        <Text style={styles.text}>
          {rep.distanceM}m  {formatRepTime(rep.timeS)}
        </Text>
        <Label>{details}</Label>
        {rep.note ? <Text style={styles.note}>{rep.note}</Text> : null}
      </View>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove rep ${number}`}
          hitSlop={spacing.sm}
          onPress={onRemove}
        >
          <Text style={styles.remove}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomColor: colors.ink,
    borderBottomWidth: borders.width / 2,
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  number: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.body * 1.25,
    width: spacing.lg,
  },
  main: {
    flex: 1,
    gap: spacing.xs,
  },
  text: {
    color: colors.ink,
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.body,
  },
  note: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: fontSizes.label + 2,
  },
  remove: {
    color: colors.ink,
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.heading * 0.6,
  },
});
