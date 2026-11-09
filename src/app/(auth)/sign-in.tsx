import { useState } from "react";

import { Button } from "../../components/Button";
import { FormScreen } from "../../components/FormScreen";
import { TextField } from "../../components/TextField";
import { signIn } from "../../data/auth";
import { errorMessage } from "../../lib/errors";
import { validateEmail } from "../../lib/validation";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSignIn() {
    const problem = validateEmail(email) ?? (password === "" ? "Enter your password." : null);
    setError(problem);
    if (problem) {
      return;
    }

    setSaving(true);
    try {
      // On success the session changes and the router moves on.
      await signIn(email, password);
    } catch (caught) {
      setError(errorMessage(caught));
      setSaving(false);
    }
  }

  return (
    <FormScreen
      title={"WELCOME\nBACK"}
      showBack
      error={error}
      footer={<Button label="SIGN IN" loading={saving} onPress={handleSignIn} />}
    >
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="current-password"
        secureTextEntry
        textContentType="password"
      />
    </FormScreen>
  );
}
