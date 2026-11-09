import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { Label } from "../../components/Label";
import { PaperBackground } from "../../components/PaperBackground";
import { Wordmark } from "../../components/Wordmark";
import { colors, fonts, fontSizes, letterSpacing, spacing } from "../../theme";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <PaperBackground
      style={[
        styles.screen,
        { paddingBottom: insets.bottom + spacing.md, paddingTop: insets.top + spacing.xl },
      ]}
    >
      <View style={styles.intro}>
        <Label style={styles.kicker}>Sprint training · Squads · Film room</Label>
        <Wordmark size={fontSizes.hero} />
        <Text accessibilityRole="header" style={styles.headline}>
          TRAIN FAST.{"\n"}TRAIN TOGETHER.
        </Text>
        <Text style={styles.body}>
          Log every rep, chase your PBs and race your squad every week.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label="GET STARTED" variant="primary" onPress={() => router.push("/sign-up")} />
        <Button label="I HAVE AN ACCOUNT" variant="outline" onPress={() => router.push("/sign-in")} />
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  intro: {
    gap: spacing.md,
  },
  kicker: {
    color: colors.accent,
  },
  headline: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.heading,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSizes.heading,
  },
  body: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
  },
  actions: {
    gap: spacing.sm,
  },
});
