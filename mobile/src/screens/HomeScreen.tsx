import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api, clearSession } from "../api";
import { theme } from "../theme";
import { Card, Empty, ErrorText, Screen } from "../ui";

type Me = { firstName?: string; lastName?: string; role?: string };

export function HomeScreen({ onOut }: { onOut: () => void }) {
  const [me, setMe] = useState<Me | null>(null);
  const [stats, setStats] = useState<{ activeClasses?: number; unpaidToman?: number; attendanceRecords?: number } | null>(null);
  const [courses, setCourses] = useState<{ id: number; name: string; grade?: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    api("/api/auth/get-session").then((d) => setMe((d as { user?: Me }).user ?? null)).catch((e) => setError(e.message));
    api("/api/courses").then((d) => setCourses((d as { courses?: typeof courses }).courses ?? [])).catch(() => {});
    api("/api/manager-stats").then(setStats).catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  const role = me?.role === "teacher" ? "معلم" : me?.role === "manager" || me?.role === "deputy" ? "دفتر" : "دانش‌آموز";

  return (
    <Screen title={me ? `${me.firstName ?? ""} ${me.lastName ?? ""}` : "گلستان شادی"} subtitle={role} onRefresh={load}>
      {error ? <ErrorText text={error} /> : null}
      {stats ? (
        <View style={styles.row}>
          <Mini label="کلاس‌ها" value={String(stats.activeClasses ?? 0)} />
          <Mini label="حضور" value={String(stats.attendanceRecords ?? 0)} />
          <Mini label="مانده" value={new Intl.NumberFormat("fa-IR").format(stats.unpaidToman ?? 0)} />
        </View>
      ) : null}
      <Text style={styles.section}>کلاس‌ها</Text>
      {courses.length === 0 ? <Empty text="هنوز دوره‌ای نیست — از مدیر کد دعوت بگیرید." /> : null}
      {courses.map((c) => (
        <Card key={c.id}>
          <Text style={styles.itemTitle}>{c.name}</Text>
          <Text style={styles.meta}>{c.grade}</Text>
        </Card>
      ))}
      <Pressable style={styles.out} onPress={async () => { await clearSession(); onOut(); }}>
        <Text style={styles.outText}>خروج از حساب</Text>
      </Pressable>
    </Screen>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.mini}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", gap: 8, marginBottom: 8 },
  mini: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: theme.line },
  miniLabel: { color: theme.muted, fontSize: 12, textAlign: "right" },
  miniValue: { marginTop: 6, fontWeight: "800", color: theme.tealDark, textAlign: "right" },
  section: { marginTop: 12, marginBottom: 8, fontWeight: "800", textAlign: "right", color: theme.ink },
  itemTitle: { fontWeight: "800", textAlign: "right", color: theme.ink },
  meta: { marginTop: 4, textAlign: "right", color: theme.muted },
  out: { marginTop: 12, alignSelf: "flex-end", paddingVertical: 8 },
  outText: { color: theme.teal, fontWeight: "700" },
});
