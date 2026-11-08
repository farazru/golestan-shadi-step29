import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../api";

type Row = { id: number; firstName: string; lastName: string; status: string; courseName?: string };

export function AttendanceScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState(true);

  useEffect(() => {
    api("/api/attendance?view=semester")
      .then((d) => setRows((d as { records?: Row[] }).records ?? []))
      .catch((e) => {
        setStaff(false);
        setError(e.message);
      });
  }, []);

  const label: Record<string, string> = { present: "حاضر", absent: "غایب", late: "تأخیر" };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>حضور و غیاب</Text>
      {!staff ? (
        <Text style={styles.empty}>حضور را معلم در کلاس ثبت می‌کند. نتیجه برای دفتر و شما در سایت جمع می‌شود.</Text>
      ) : null}
      {staff && error ? <Text style={styles.error}>{error}</Text> : null}
      {staff && rows.length === 0 && !error ? <Text style={styles.empty}>رکوردی نیست.</Text> : null}
      {rows.slice(0, 40).map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.cardTitle}>{r.firstName} {r.lastName}</Text>
          <Text style={styles.meta}>{r.courseName ?? ""} · {label[r.status] ?? r.status}</Text>
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
  meta: { marginTop: 4, textAlign: "right", color: "#4b635f" },
  empty: { textAlign: "right", color: "#4b635f", lineHeight: 22 },
  error: { color: "#b42318", textAlign: "right", marginBottom: 8 },
});
