import { useState } from "react";

import { Button } from "../../components/Button";
import { FormScreen } from "../../components/FormScreen";
import { TextField } from "../../components/TextField";
import { signUp } from "../../data/auth";
import { errorMessage } from "../../lib/errors";
import { validateDisplayName, validateEmail, validatePassword } from "../../lib/validation";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleNext() {
    const problem =
      validateDisplayName(name) ?? validateEmail(email) ?? validatePassword(password);
    setError(problem);
    if (problem) {
      return;
    }

    setSaving(true);
    try {
      // On success the session changes and the router moves on to the events step.
      await signUp(name, email, password);
    } catch (caught) {
      setError(errorMessage(caught));
      setSaving(false);
    }
  }

  return (
    <FormScreen
      title={"CREATE YOUR\nACCOUNT"}
      showBack
      step={{ number: 1, name: "Account" }}
      error={error}
      footer={<Button label="NEXT →" loading={saving} onPress={handleNext} />}
    >
      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        textContentType="name"
      />
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
        autoComplete="new-password"
        secureTextEntry
        textContentType="newPassword"
      />
    </FormScreen>
  );
}
