import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../api";

type Ev = { id: number; title: string; day: string; kind: string };

export function CalendarScreen() {
  const [rows, setRows] = useState<Ev[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api("/api/calendar-events")
      .then((d) => setRows((d as { items?: Ev[] }).items ?? []))
      .catch((e) => setError(e.message));
  }, []);

  const kind: Record<string, string> = { event: "رویداد", holiday: "تعطیل", exam: "امتحان" };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>تقویم</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {rows.length === 0 && !error ? <Text style={styles.empty}>رویدادی ثبت نشده.</Text> : null}
      {rows.map((e) => (
        <View key={e.id} style={styles.card}>
          <Text style={styles.cardTitle}>{e.title}</Text>
          <Text style={styles.meta}>{e.day} · {kind[e.kind] ?? e.kind}</Text>
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
  meta: { marginTop: 6, textAlign: "right", color: "#4b635f" },
  empty: { textAlign: "right", color: "#4b635f" },
  error: { color: "#b42318", textAlign: "right", marginBottom: 8 },
});
