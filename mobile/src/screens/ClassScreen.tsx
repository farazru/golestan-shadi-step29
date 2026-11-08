import { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../api";
import { theme } from "../theme";
import { Card, Empty, ErrorText, Screen } from "../ui";

type Course = { id: number; name: string; meetingUrl?: string | null; grade?: string; roomId?: string | null };
type Student = { studentId: string; firstName: string; lastName: string };

export function ClassScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [picked, setPicked] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await api("/api/courses");
    setCourses((d as { courses?: Course[] }).courses ?? []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function openRoster(c: Course) {
    setPicked(c);
    try {
      const d = await api(`/api/roster?courseId=${c.id}`);
      const data = d as { students?: Student[]; roomId?: string | null };
      setStudents(data.students ?? []);
      setPicked({ ...c, meetingUrl: c.meetingUrl, roomId: data.roomId } as Course);
    } catch {
      setStudents([]);
    }
  }

  async function mark(studentId: string, status: "present" | "absent" | "late") {
    if (!picked) return;
    setBusy(true);
    try {
      await api("/api/attendance", {
        method: "POST",
        body: JSON.stringify({ roomId: picked.roomId, studentId, status }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="کلاس" subtitle="ورود به کلاس و حضور" onRefresh={load}>
      {error ? <ErrorText text={error} /> : null}
      {courses.length === 0 ? <Empty text="هنوز دوره‌ای نیست." action="از مدیر کد دعوت بگیرید." /> : null}
      {courses.map((c) => (
        <Card key={c.id}>
          <Text style={styles.title}>{c.name}</Text>
          <Text style={styles.meta}>{c.grade}</Text>
          <View style={styles.row}>
            {c.meetingUrl ? (
              <Pressable style={styles.btn} onPress={() => Linking.openURL(c.meetingUrl!)}>
                <Text style={styles.btnText}>ورود به کلاس</Text>
              </Pressable>
            ) : (
              <Text style={styles.meta}>لینک کلاس هنوز نیست</Text>
            )}
            <Pressable onPress={() => openRoster(c)}>
              <Text style={styles.link}>حضور</Text>
            </Pressable>
          </View>
        </Card>
      ))}
      {picked ? (
        <View>
          <Text style={styles.section}>حضور — {picked.name}</Text>
          {students.length === 0 ? <Empty text="دانش‌آموزی در این کلاس نیست." action="دفتر باید ثبت‌نام کند." /> : null}
          {students.map((s) => (
            <Card key={s.studentId}>
              <Text style={styles.title}>{s.firstName} {s.lastName}</Text>
              <View style={styles.row}>
                <Pressable disabled={busy} onPress={() => mark(s.studentId, "present")}><Text style={styles.ok}>حاضر</Text></Pressable>
                <Pressable disabled={busy} onPress={() => mark(s.studentId, "late")}><Text style={styles.warn}>تأخیر</Text></Pressable>
                <Pressable disabled={busy} onPress={() => mark(s.studentId, "absent")}><Text style={styles.bad}>غایب</Text></Pressable>
              </View>
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "800", textAlign: "right", color: theme.ink },
  meta: { marginTop: 4, textAlign: "right", color: theme.muted },
  section: { marginVertical: 8, fontWeight: "800", textAlign: "right" },
  row: { flexDirection: "row-reverse", gap: 16, marginTop: 10, alignItems: "center" },
  btn: { backgroundColor: theme.teal, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  btnText: { color: "#fff", fontWeight: "800" },
  link: { color: theme.teal, fontWeight: "700" },
  ok: { color: theme.ok, fontWeight: "800" },
  warn: { color: "#8A5A00", fontWeight: "800" },
  bad: { color: theme.danger, fontWeight: "800" },
});
