import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { borders, colors, fonts, fontSizes, letterSpacing, spacing } from "../theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "dark" | "outline";
  loading?: boolean;
};

export function Button({ label, onPress, variant = "dark", loading = false }: ButtonProps) {
  const textColor = variant === "outline" ? colors.ink : colors.panel;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderWidth: borders.width,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dark: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: colors.ink,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.button,
    letterSpacing: letterSpacing.label,
  },
});
