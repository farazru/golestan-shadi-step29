import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../api";

type Msg = { id: number; title: string; content: string; courseName?: string | null; createdAt?: string };

export function AnnouncementsScreen() {
  const [rows, setRows] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api("/api/messages")
      .then((d) => setRows((d as { messages?: Msg[] }).messages ?? []))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>اطلاعیه‌ها</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {rows.length === 0 && !error ? <Text style={styles.empty}>اطلاعیه‌ای نیست.</Text> : null}
      {rows.map((m) => (
        <View key={m.id} style={styles.card}>
          <Text style={styles.cardTitle}>{m.title}</Text>
          {m.courseName ? <Text style={styles.meta}>{m.courseName}</Text> : null}
          <Text style={styles.body}>{m.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fffdf6" },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f5c4c", textAlign: "right", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#d9e7e5" },
  cardTitle: { fontWeight: "800", textAlign: "right" },
  meta: { marginTop: 4, color: "#0f5c4c", textAlign: "right", fontSize: 12 },
  body: { marginTop: 8, textAlign: "right", lineHeight: 22 },
  empty: { textAlign: "right", color: "#4b635f" },
  error: { color: "#b42318", textAlign: "right", marginBottom: 8 },
});
