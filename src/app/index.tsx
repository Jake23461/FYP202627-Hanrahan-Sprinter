import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";

import { supabase } from "../lib/supabase";

export default function Index() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function loadMessage() {
      const { data, error } = await supabase
        .from("test_messages")
        .select("message")
        .limit(1)
        .single();

      if (error) {
        setMessage("Error: " + error.message);
      } else {
        setMessage(data.message);
      }
    }

    loadMessage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sprinter</Text>
      <Text>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
});
