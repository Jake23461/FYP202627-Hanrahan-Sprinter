import { Pressable, StyleSheet, Text } from "react-native";

import { borders, colors, fonts, fontSizes, letterSpacing, spacing } from "../theme";

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.panel,
    borderColor: colors.ink,
    borderWidth: borders.width,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    color: colors.ink,
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.label,
    letterSpacing: letterSpacing.label,
  },
  labelSelected: {
    color: colors.panel,
  },
});
