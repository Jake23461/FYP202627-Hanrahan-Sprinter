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

import { colors } from "../theme";

// Keep the splash screen up until the fonts are ready. This runs at the top
// level so it happens before the first screen can render.
SplashScreen.preventAutoHideAsync();

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
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) {
      SplashScreen.hide();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.paper },
        headerShown: false,
      }}
    />
  );
}
