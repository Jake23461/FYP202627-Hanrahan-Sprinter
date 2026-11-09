import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { FormScreen } from "../../components/FormScreen";
import { Label } from "../../components/Label";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../context/AuthProvider";
import { signOut } from "../../data/auth";
import type { AgeGroup } from "../../data/types";
import { errorMessage } from "../../lib/errors";
import { AGE_GROUP_OPTIONS, EVENT_OPTIONS } from "../../lib/profile";
import { validateUsername } from "../../lib/validation";
import { spacing } from "../../theme";

export default function EventsScreen() {
  const { profile, saveProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [events, setEvents] = useState<string[]>(profile?.events ?? []);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(profile?.ageGroup ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleEvent(event: string) {
    setEvents((current) =>
      current.includes(event) ? current.filter((item) => item !== event) : [...current, event],
    );
  }

  async function handleFinish() {
    const problem =
      validateUsername(username) ??
      (events.length === 0 ? "Pick at least one event." : null) ??
      (ageGroup === null ? "Pick your age group." : null);
    setError(problem);
    if (problem) {
      return;
    }

    setSaving(true);
    try {
      // Keep the events in distance order, whatever order they were tapped in.
      const ordered = EVENT_OPTIONS.filter((option) => events.includes(option));
      // On success the profile is complete and the router moves on to the tabs.
      await saveProfile({ username, events: ordered, ageGroup });
    } catch (caught) {
      setError(errorMessage(caught));
      setSaving(false);
    }
  }

  return (
    <FormScreen
      title={"WHAT DO\nYOU RUN?"}
      step={{ number: 2, name: "Your events" }}
      error={error}
      footer={
        <>
          <Button label="FINISH →" loading={saving} onPress={handleFinish} />
          <Button label="LOG OUT" variant="outline" onPress={() => signOut().catch(() => {})} />
        </>
      }
    >
      <TextField
        label="Username"
        value={username}
        onChangeText={(text) => setUsername(text.trim().toLowerCase())}
        autoCapitalize="none"
        autoComplete="username"
        autoCorrect={false}
        textContentType="username"
      />

      <View style={styles.group}>
        <Label>Pick your main distances</Label>
        <View style={styles.chips}>
          {EVENT_OPTIONS.map((event) => (
            <Chip
              key={event}
              label={event}
              selected={events.includes(event)}
              onPress={() => toggleEvent(event)}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Label>Your age group</Label>
        <View style={styles.chips}>
          {AGE_GROUP_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={ageGroup === option}
              onPress={() => setAgeGroup(option)}
            />
          ))}
        </View>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
