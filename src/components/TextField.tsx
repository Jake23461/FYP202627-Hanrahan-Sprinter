import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { borders, colors, fonts, fontSizes, spacing } from "../theme";
import { Label } from "./Label";

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Label>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.panel,
    borderColor: colors.ink,
    borderWidth: borders.width,
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: fontSizes.body,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
});
