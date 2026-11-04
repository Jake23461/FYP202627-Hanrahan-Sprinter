import type { ReactNode } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { colors, fonts, fontSizes, letterSpacing } from "../theme";

type LabelProps = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Label({ children, style }: LabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: fontSizes.label,
    letterSpacing: letterSpacing.label,
    textTransform: "uppercase",
  },
});
