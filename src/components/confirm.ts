import { Alert, Platform } from "react-native";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
};

// Asks "are you sure?" and resolves true if they confirm. Alert does nothing in
// a web browser, so the web version uses the browser's own confirm box.
export function confirmAction({ title, message, confirmLabel }: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: confirmLabel, style: "destructive", onPress: () => resolve(true) },
      ],
      // Tapping outside the box on Android counts as cancelling.
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
