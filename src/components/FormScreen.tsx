import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { borders, colors, fonts, fontSizes, letterSpacing, spacing } from "../theme";
import { Label } from "./Label";
import { PaperBackground } from "./PaperBackground";

const TOTAL_STEPS = 2;

type FormScreenProps = {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  error?: string | null;
  showBack?: boolean;
  step?: { number: number; name: string };
};

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/welcome");
  }
}

// The shared layout of the auth screens. The scroll view keeps every field
// reachable when the keyboard is up on a small phone.
export function FormScreen({ title, children, footer, error, showBack = false, step }: FormScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <PaperBackground style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screen}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.md, paddingTop: insets.top + spacing.md },
          ]}
        >
          {showBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={spacing.sm}
              onPress={goBack}
              style={styles.back}
            >
              <Text style={styles.backLabel}>← BACK</Text>
            </Pressable>
          )}

          {step && (
            <View style={styles.progress}>
              <View style={styles.bars}>
                {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                  <View
                    key={index}
                    style={[styles.bar, index < step.number && styles.barDone]}
                  />
                ))}
              </View>
              <Label>{`Step ${step.number} of ${TOTAL_STEPS} · ${step.name}`}</Label>
            </View>
          )}

          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>

          <View style={styles.fields}>{children}</View>

          <View style={styles.footer}>
            {error ? (
              <Text accessibilityLiveRegion="polite" style={styles.error}>
                {error}
              </Text>
            ) : null}
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  back: {
    alignSelf: "flex-start",
  },
  backLabel: {
    color: colors.ink,
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.label,
    letterSpacing: letterSpacing.label,
  },
  progress: {
    gap: spacing.sm,
  },
  bars: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  bar: {
    backgroundColor: colors.ink,
    flex: 1,
    height: borders.rule,
  },
  barDone: {
    backgroundColor: colors.accent,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: fontSizes.heading,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSizes.heading,
    paddingTop: spacing.xs,
  },
  fields: {
    gap: spacing.md,
  },
  footer: {
    gap: spacing.sm,
    justifyContent: "flex-end",
    marginTop: "auto",
    paddingTop: spacing.md,
  },
  error: {
    color: colors.accent,
    fontFamily: fonts.title,
    fontSize: fontSizes.body,
  },
});
