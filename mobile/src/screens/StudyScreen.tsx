import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../api";

type Exam = { id: number; title: string; day?: string; courseId?: number };
type Card = { id: number; title: string; fileName?: string };

export function StudyScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api("/api/exams")
      .then((d) => setExams((d as { exams?: Exam[] }).exams ?? []))
      .catch((e) => setError(e.message));
    api("/api/report-cards")
      .then((d) => setCards((d as { items?: Card[] }).items ?? []))
      .catch(() => {});
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>امتحان و کارنامه</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.section}>امتحان‌ها</Text>
      {exams.length === 0 ? <Text style={styles.empty}>امتحانی ثبت نشده.</Text> : null}
      {exams.map((e) => (
        <View key={e.id} style={styles.card}>
          <Text style={styles.cardTitle}>{e.title}</Text>
          {e.day ? <Text style={styles.meta}>{e.day}</Text> : null}
        </View>
      ))}
      <Text style={styles.section}>کارنامه‌ها</Text>
      {cards.length === 0 ? <Text style={styles.empty}>کارنامه‌ای بارگذاری نشده.</Text> : null}
      {cards.map((c) => (
        <View key={c.id} style={styles.card}>
          <Text style={styles.cardTitle}>{c.title}</Text>
          <Text style={styles.meta}>دانلود از سایت مدرسه</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fffdf6" },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f5c4c", textAlign: "right", marginBottom: 12 },
  section: { marginTop: 8, marginBottom: 8, fontWeight: "800", textAlign: "right" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#d9e7e5" },
  cardTitle: { fontWeight: "800", textAlign: "right" },
  meta: { marginTop: 4, textAlign: "right", color: "#4b635f" },
  empty: { textAlign: "right", color: "#4b635f", marginBottom: 8 },
  error: { color: "#b42318", textAlign: "right", marginBottom: 8 },
});
