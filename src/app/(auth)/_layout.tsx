import { Stack } from "expo-router";

import { useAuth } from "../../context/AuthProvider";
import { colors } from "../../theme";

// The events step needs a signed in user, because it saves to their profile.
// The other screens are only for people who are signed out.
export default function AuthLayout() {
  const { status } = useAuth();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.paper },
        headerShown: false,
      }}
    >
      <Stack.Protected guard={status === "signedOut"} redirectTo="/events">
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={status === "needsProfile"} redirectTo="/welcome">
        <Stack.Screen name="events" />
      </Stack.Protected>
    </Stack>
  );
}
