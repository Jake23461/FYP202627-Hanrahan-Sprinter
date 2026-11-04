// Design tokens for the whole app. Screens and components read colours and
// fonts from here, so changing the look only means changing this file.

export const colors = {
  paper: "#ECE3D2",
  panel: "#F4EFE3",
  ink: "#231C15",
  accent: "#E23A1C",
  slate: "#3C4A5B",
  muted: "#7A6E5B",
} as const;

// In React Native each font weight is its own family, so we pick a family
// here instead of setting fontWeight on the text.
export const fonts = {
  body: "Archivo_400Regular",
  title: "Archivo_600SemiBold",
  display: "Archivo_900Black",
  mono: "SpaceMono_400Regular",
  monoBold: "SpaceMono_700Bold",
} as const;

export const fontSizes = {
  label: 11,
  tab: 12,
  body: 16,
  wordmark: 26,
  heading: 34,
} as const;

// letterSpacing is in pixels in React Native, not em.
export const letterSpacing = {
  tight: -0.5,
  label: 1.5,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borders = {
  width: 2,
  tabIndicator: 3,
  rule: 4,
} as const;
