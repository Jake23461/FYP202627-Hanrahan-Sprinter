import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSizes, letterSpacing } from "../theme";

const NAME = "SPRINTER";
const SHADOW_OFFSET = 2;

type WordmarkProps = {
  size?: number;
};

// Two copies of the name, slightly offset, like a misaligned print run.
// The back copy is hidden from screen readers so the name is only read once.
export function Wordmark({ size = fontSizes.wordmark }: WordmarkProps) {
  const text = [styles.text, { fontSize: size }];

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel="Sprinter"
      style={styles.wordmark}
    >
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[text, styles.shadow]}
      >
        {NAME}
      </Text>
      <Text style={[text, styles.front]}>{NAME}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    alignSelf: "flex-start",
    transform: [{ scaleX: 1.05 }],
    transformOrigin: "left",
  },
  text: {
    fontFamily: fonts.display,
    letterSpacing: letterSpacing.tight,
  },
  shadow: {
    color: colors.slate,
    left: SHADOW_OFFSET,
    opacity: 0.5,
    position: "absolute",
    top: SHADOW_OFFSET,
  },
  front: {
    color: colors.accent,
  },
});
