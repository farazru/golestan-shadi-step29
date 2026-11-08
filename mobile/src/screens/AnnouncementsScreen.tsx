import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { api } from "../api";
import { theme } from "../theme";
import { Card, Empty, ErrorText, Screen } from "../ui";

type Msg = { id: number; title: string; content: string; courseName?: string | null };

export function AnnouncementsScreen() {
  const [rows, setRows] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api("/api/messages").then((d) => setRows((d as { messages?: Msg[] }).messages ?? [])).catch((e) => setError(e.message));
  }, []);

  return (
    <Screen title="اطلاعیه‌ها" subtitle="پیام‌های دفتر و معلم">
      {error ? <ErrorText text={error} /> : null}
      {rows.length === 0 && !error ? <Empty text="اطلاعیه‌ای نیست." /> : null}
      {rows.map((m) => (
        <Card key={m.id}>
          <Text style={styles.title}>{m.title}</Text>
          {m.courseName ? <Text style={styles.meta}>{m.courseName}</Text> : null}
          <Text style={styles.body}>{m.content}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "800", textAlign: "right", color: theme.ink },
  meta: { marginTop: 4, color: theme.teal, textAlign: "right", fontSize: 12 },
  body: { marginTop: 8, textAlign: "right", lineHeight: 22, color: theme.ink },
});
