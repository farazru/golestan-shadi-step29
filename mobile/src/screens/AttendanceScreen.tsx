import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { api } from "../api";
import { theme } from "../theme";
import { Card, Empty, ErrorText, Screen } from "../ui";

type Row = { id: number; firstName: string; lastName: string; status: string; courseName?: string };

export function AttendanceScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [staff, setStaff] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const label: Record<string, string> = { present: "حاضر", absent: "غایب", late: "تأخیر" };

  useEffect(() => {
    api("/api/attendance?view=semester")
      .then((d) => setRows((d as { records?: Row[] }).records ?? []))
      .catch((e) => {
        setStaff(false);
        setError(e.message);
      });
  }, []);

  return (
    <Screen title="حضور و غیاب" subtitle={staff ? "نمای دفتر و معلم" : "وضعیت شما"}>
      {!staff ? <Empty text="حضور را معلم در کلاس ثبت می‌کند. نتیجه برای دفتر و شما در سایت جمع می‌شود." /> : null}
      {staff && error ? <ErrorText text={error} /> : null}
      {staff && rows.length === 0 && !error ? <Empty text="رکوردی نیست." /> : null}
      {rows.slice(0, 40).map((r) => (
        <Card key={r.id}>
          <Text style={styles.title}>{r.firstName} {r.lastName}</Text>
          <Text style={r.status === "absent" ? styles.bad : styles.meta}>
            {r.courseName ?? ""} · {label[r.status] ?? r.status}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "800", textAlign: "right", color: theme.ink },
  meta: { marginTop: 4, textAlign: "right", color: theme.muted },
  bad: { marginTop: 4, textAlign: "right", color: theme.danger, fontWeight: "700" },
});
