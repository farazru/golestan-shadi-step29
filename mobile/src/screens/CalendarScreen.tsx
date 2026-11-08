import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { api } from "../api";
import { theme } from "../theme";
import { Card, Empty, ErrorText, Screen } from "../ui";

type Ev = { id: number; title: string; day: string; kind: string };

export function CalendarScreen() {
  const [rows, setRows] = useState<Ev[]>([]);
  const [error, setError] = useState<string | null>(null);
  const kind: Record<string, string> = { event: "رویداد", holiday: "تعطیل", exam: "امتحان" };

  useEffect(() => {
    api("/api/calendar-events").then((d) => setRows((d as { items?: Ev[] }).items ?? [])).catch((e) => setError(e.message));
  }, []);

  return (
    <Screen title="تقویم" subtitle="رویدادها و امتحان‌ها">
      {error ? <ErrorText text={error} /> : null}
      {rows.length === 0 && !error ? <Empty text="رویدادی ثبت نشده." /> : null}
      {rows.map((e) => (
        <Card key={e.id}>
          <View style={styles.row}>
            <Text style={styles.badge}>{kind[e.kind] ?? e.kind}</Text>
            <Text style={styles.title}>{e.title}</Text>
          </View>
          <Text style={styles.meta}>{e.day}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  title: { fontWeight: "800", color: theme.ink, flex: 1, textAlign: "right" },
  meta: { marginTop: 8, textAlign: "right", color: theme.muted },
  badge: { backgroundColor: "#FFF4DC", color: "#8A5A00", borderRadius: 999, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: "700" },
});
