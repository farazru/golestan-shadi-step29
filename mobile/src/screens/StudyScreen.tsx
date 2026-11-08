import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { api } from "../api";
import { theme } from "../theme";
import { Card, Empty, ErrorText, Screen } from "../ui";

type Exam = { id: number; title: string; day?: string };
type Item = { id: number; title: string };

export function StudyScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [cards, setCards] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api("/api/exams").then((d) => setExams((d as { exams?: Exam[] }).exams ?? [])).catch((e) => setError(e.message));
    api("/api/report-cards").then((d) => setCards((d as { items?: Item[] }).items ?? [])).catch(() => {});
  }, []);

  return (
    <Screen title="امتحان و کارنامه" subtitle="برنامه و فایل‌های دفتر">
      {error ? <ErrorText text={error} /> : null}
      <Text style={styles.section}>امتحان‌ها</Text>
      {exams.length === 0 ? <Empty text="امتحانی ثبت نشده." /> : null}
      {exams.map((e) => (
        <Card key={e.id}>
          <Text style={styles.title}>{e.title}</Text>
          {e.day ? <Text style={styles.meta}>{e.day}</Text> : null}
        </Card>
      ))}
      <Text style={styles.section}>کارنامه‌ها</Text>
      {cards.length === 0 ? <Empty text="کارنامه‌ای بارگذاری نشده." /> : null}
      {cards.map((c) => (
        <Card key={c.id}>
          <Text style={styles.title}>{c.title}</Text>
          <Text style={styles.meta}>دانلود از سایت مدرسه</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 4, marginBottom: 8, fontWeight: "800", textAlign: "right", color: theme.ink },
  title: { fontWeight: "800", textAlign: "right", color: theme.ink },
  meta: { marginTop: 4, textAlign: "right", color: theme.muted },
});
