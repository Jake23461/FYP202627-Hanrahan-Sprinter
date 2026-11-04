import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { borders, colors, spacing } from "../theme";
import { PaperBackground } from "./PaperBackground";
import { Wordmark } from "./Wordmark";

export function TopBar() {
  // The inset keeps the wordmark below the notch or status bar.
  const insets = useSafeAreaInsets();

  return (
    <PaperBackground style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      <Wordmark />
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomColor: colors.ink,
    borderBottomWidth: borders.rule,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
