import {
  Archivo_400Regular,
  Archivo_600SemiBold,
  Archivo_900Black,
  useFonts,
} from "@expo-google-fonts/archivo";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { PaperBackground } from "../components/PaperBackground";
import { ProfileErrorScreen } from "../components/ProfileErrorScreen";
import { AuthProvider, useAuth } from "../context/AuthProvider";
import { colors } from "../theme";

// Keep the splash screen up until the fonts and login are ready. This runs at
// the top level so it happens before the first screen can render.
SplashScreen.preventAutoHideAsync();

// Stack.Protected removes the screens whose guard is false, so signed out users
// can't reach the tabs and the router moves people on when the status changes.
function RootNavigator() {
  const { status } = useAuth();
  const ready = status !== "loading";

  useEffect(() => {
    if (ready) {
      SplashScreen.hide();
    }
  }, [ready]);

  if (status === "loading") {
    return <PaperBackground style={{ flex: 1 }} />;
  }
  if (status === "profileError") {
    return <ProfileErrorScreen />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.paper },
        headerShown: false,
      }}
    >
      <Stack.Protected
        guard={status === "ready"}
        redirectTo={status === "needsProfile" ? "/events" : "/welcome"}
      >
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={status !== "ready"} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Archivo_400Regular,
    Archivo_600SemiBold,
    Archivo_900Black,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  // If a font fails to load, carry on with the system font rather than
  // leaving the app stuck on the splash screen.
  if (!fontsLoaded && fontError === null) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
