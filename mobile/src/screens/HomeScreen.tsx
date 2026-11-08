import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api, clearSession } from "../api";

type Me = { firstName?: string; lastName?: string; role?: string };

export function HomeScreen({ onOut }: { onOut: () => void }) {
  const [me, setMe] = useState<Me | null>(null);
  const [stats, setStats] = useState<{ activeClasses?: number; unpaidToman?: number } | null>(null);
  const [courses, setCourses] = useState<{ id: number; name: string; grade?: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api("/api/auth/get-session")
      .then((d) => setMe((d as { user?: Me }).user ?? null))
      .catch((e) => setError(e.message));
    api("/api/courses")
      .then((d) => setCourses((d as { courses?: typeof courses }).courses ?? []))
      .catch(() => {});
    api("/api/manager-stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  const role = me?.role === "teacher" ? "معلم" : me?.role === "manager" || me?.role === "deputy" ? "دفتر" : "دانش‌آموز";

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.hi}>
        {me ? `${me.firstName ?? ""} ${me.lastName ?? ""}` : "گلستان شادی"}
      </Text>
      <Text style={styles.role}>{role}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {stats ? (
        <View style={styles.row}>
          <Card label="کلاس‌ها" value={String(stats.activeClasses ?? 0)} />
          <Card label="مانده شهریه" value={String(stats.unpaidToman ?? 0)} />
        </View>
      ) : null}

      <Text style={styles.section}>کلاس‌های من</Text>
      {courses.length === 0 ? (
        <Text style={styles.empty}>هنوز دوره‌ای نیست — از مدیر کد دعوت بگیرید.</Text>
      ) : (
        courses.map((c) => (
          <View key={c.id} style={styles.item}>
            <Text style={styles.itemTitle}>{c.name}</Text>
            <Text style={styles.itemMeta}>{c.grade}</Text>
          </View>
        ))
      )}

      <Pressable
        style={styles.out}
        onPress={async () => {
          await clearSession();
          onOut();
        }}
      >
        <Text style={styles.outText}>خروج</Text>
      </Pressable>
    </ScrollView>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fffdf6" },
  content: { padding: 20, paddingTop: 56 },
  hi: { fontSize: 24, fontWeight: "800", color: "#0f5c4c", textAlign: "right" },
  role: { marginTop: 4, color: "#4b635f", textAlign: "right" },
  section: { marginTop: 24, marginBottom: 8, fontWeight: "800", textAlign: "right" },
  empty: { textAlign: "right", color: "#4b635f" },
  item: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d9e7e5",
  },
  itemTitle: { fontWeight: "700", textAlign: "right" },
  itemMeta: { marginTop: 4, color: "#4b635f", textAlign: "right" },
  row: { flexDirection: "row-reverse", gap: 10, marginTop: 20 },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#d9e7e5" },
  cardLabel: { color: "#4b635f", textAlign: "right" },
  cardValue: { marginTop: 6, fontSize: 20, fontWeight: "800", textAlign: "right" },
  out: { marginTop: 28, alignSelf: "flex-end" },
  outText: { color: "#0f5c4c", fontWeight: "700" },
  error: { color: "#b42318", marginTop: 8, textAlign: "right" },
});
