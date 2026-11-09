import { useAuth } from "../context/AuthProvider";
import { signOut } from "../data/auth";
import { Button } from "./Button";
import { FormScreen } from "./FormScreen";
import { Label } from "./Label";

// Shown when someone is signed in but their profile couldn't be loaded, usually
// because there's no connection. Log out stays available so nobody gets stuck.
export function ProfileErrorScreen() {
  const { retryProfile } = useAuth();

  return (
    <FormScreen
      title="COULDN'T LOAD YOUR PROFILE"
      footer={
        <>
          <Button label="TRY AGAIN" onPress={retryProfile} />
          <Button label="LOG OUT" variant="outline" onPress={() => signOut().catch(() => {})} />
        </>
      }
    >
      <Label>Check your connection and try again.</Label>
    </FormScreen>
  );
}
