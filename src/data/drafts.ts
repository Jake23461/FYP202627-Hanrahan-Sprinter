// Keeps the unsaved Log session on the phone with AsyncStorage, where the login
// is kept too. Each account has its own key, so another account signed in on
// the same phone never sees it.

import AsyncStorage from "@react-native-async-storage/async-storage";

import { parseLogDraft, type LogDraft } from "../lib/logDraft";

function draftKey(userId: string): string {
  return `sprinter.logDraft.${userId}`;
}

export async function loadLogDraft(userId: string): Promise<LogDraft | null> {
  return parseLogDraft(await AsyncStorage.getItem(draftKey(userId)));
}

export async function saveLogDraft(userId: string, draft: LogDraft): Promise<void> {
  await AsyncStorage.setItem(draftKey(userId), JSON.stringify(draft));
}

export async function clearLogDraft(userId: string): Promise<void> {
  await AsyncStorage.removeItem(draftKey(userId));
}
