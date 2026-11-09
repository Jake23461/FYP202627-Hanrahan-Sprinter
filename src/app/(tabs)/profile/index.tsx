import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../../../components/Button";
import { Label } from "../../../components/Label";
import { Panel } from "../../../components/Panel";
import { PaperBackground } from "../../../components/PaperBackground";
import { useAuth } from "../../../context/AuthProvider";
import { signOut } from "../../../data/auth";
import { errorMessage } from "../../../lib/errors";
import { colors, fonts, fontSizes, letterSpacing, spacing } from "../../../theme";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Label>{label}</Label>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  async function handleLogOut() {
    setError(null);
    setLeaving(true);
    try {
      // On success the session ends and the router moves back to the welcome screen.
      await signOut();
    } catch (caught) {
      setError(errorMessage(caught));
      setLeaving(false);
    }
  }

  // The tabs only show with a complete profile, but it's briefly empty during log out.
  if (profile === null) {
    return <PaperBackground style={styles.screen} />;
  }

  return (
    <PaperBackground style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        {profile.displayName.toUpperCase()}
      </Text>

      <Panel style={styles.panel}>
        <Detail label="Username" value={`@${profile.username}`} />
        <Detail label="Events" value={profile.events.join("  ")} />
        <Detail label="Age group" value={profile.ageGroup ?? ""} />
      </Panel>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="LOG OUT" variant="outline" loading={leaving} onPress={handleLogOut} />
      </View>
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
  panel: {
    gap: spacing.md,
  },
  detail: {
    gap: spacing.xs,
  },
  value: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: fontSizes.body,
  },
  footer: {
    gap: spacing.sm,
    marginTop: "auto",
  },
  error: {
    color: colors.accent,
    fontFamily: fonts.title,
    fontSize: fontSizes.body,
  },
});
