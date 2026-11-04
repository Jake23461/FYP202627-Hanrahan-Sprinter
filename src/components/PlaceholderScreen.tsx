import { StyleSheet, Text } from "react-native";

import { colors, fonts, fontSizes, letterSpacing, spacing } from "../theme";
import { Label } from "./Label";
import { Panel } from "./Panel";
import { PaperBackground } from "./PaperBackground";

type PlaceholderScreenProps = {
  title: string;
};

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <PaperBackground style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Panel>
        <Label>Coming soon</Label>
      </Panel>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.heading,
    letterSpacing: letterSpacing.tight,
  },
});
