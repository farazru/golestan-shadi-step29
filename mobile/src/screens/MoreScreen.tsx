import { useEffect, useState } from "react";
import { Pressable, Share, StyleSheet, Text, TextInput } from "react-native";
import { api } from "../api";
import { theme } from "../theme";
import { Card, Empty, Screen } from "../ui";

type Slot = { id: number; weekday: number; period: number; courseName: string; startTime?: string };
type Lead = { id: number; childName: string; phone: string; grade?: string; trackingCode?: string };
type Person = { id: string; firstName: string; lastName: string };

export function MoreScreen() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [hw, setHw] = useState<{ id: number; title: string; dueAt?: string; courseName?: string }[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [missing, setMissing] = useState<Person[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDay, setEventDay] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  async function load() {
    api("/api/timetable").then((d) => setSlots((d as { slots?: Slot[] }).slots ?? [])).catch(() => {});
    api("/api/assignments").then((d) => setHw((d as { assignments?: typeof hw }).assignments ?? [])).catch(() => {});
    api("/api/preregister").then((d) => setLeads((d as { rows?: Lead[] }).rows ?? [])).catch(() => {});
    api("/api/incomplete-profiles").then((d) => setMissing((d as { students?: Person[] }).students ?? [])).catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  async function addEvent() {
    try {
      await api("/api/calendar-events", { method: "POST", body: JSON.stringify({ title: eventTitle, day: eventDay, kind: "event" }) });
      setEventTitle("");
      setEventDay("");
      setNote("رویداد ثبت شد.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "ثبت نشد.");
    }
  }

  async function copyDue() {
    const d = await api("/api/tuition/overdue");
    const text = (d as { text?: string }).text || "مورد معوقی نیست.";
    await Share.share({ message: text });
  }

  async function changePass() {
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: oldPass, newPassword: newPass }),
      });
      setNote("رمز عوض شد.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "تغییر رمز نشد. از دفتر بخواهید.");
    }
  }

  const days = ["", "شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

  return (
    <Screen title="بیشتر" subtitle="برنامه، تکلیف، دفتر" onRefresh={load}>
      <Text style={styles.section}>برنامه هفتگی</Text>
      {slots.length === 0 ? <Empty text="برنامه‌ای نیست." action="دفتر زنگ‌ها را در سایت می‌چیند." /> : null}
      {slots.map((s) => (
        <Card key={s.id}>
          <Text style={styles.title}>{s.courseName}</Text>
          <Text style={styles.meta}>{days[s.weekday] ?? s.weekday} · زنگ {s.period} {s.startTime ?? ""}</Text>
        </Card>
      ))}

      <Text style={styles.section}>تکالیف</Text>
      {hw.length === 0 ? <Empty text="تکلیفی نیست." action="معلم از سایت تکلیف می‌گذارد." /> : null}
      {hw.map((h) => (
        <Card key={h.id}>
          <Text style={styles.title}>{h.title}</Text>
          <Text style={styles.meta}>{h.courseName} {h.dueAt ? `· تا ${h.dueAt}` : ""}</Text>
        </Card>
      ))}

      <Text style={styles.section}>رویداد جدید</Text>
      <TextInput style={styles.input} value={eventTitle} onChangeText={setEventTitle} placeholder="عنوان" textAlign="right" />
      <TextInput style={styles.input} value={eventDay} onChangeText={setEventDay} placeholder="۱۴۰۵-۰۷-۱۵" textAlign="right" />
      <Pressable style={styles.btn} onPress={addEvent}><Text style={styles.btnText}>ثبت رویداد</Text></Pressable>

      <Text style={styles.section}>دفتر</Text>
      <Pressable style={styles.btn} onPress={copyDue}><Text style={styles.btnText}>یادآوری شهریه برای واتساپ</Text></Pressable>
      {leads.slice(0, 8).map((l) => (
        <Card key={l.id}>
          <Text style={styles.title}>{l.childName}</Text>
          <Text style={styles.meta}>{l.phone} {l.trackingCode ? `· ${l.trackingCode}` : ""}</Text>
        </Card>
      ))}
      {missing.slice(0, 8).map((p) => (
        <Card key={p.id}>
          <Text style={styles.title}>{p.firstName} {p.lastName}</Text>
          <Text style={styles.meta}>پرونده ناقص</Text>
        </Card>
      ))}
      <Text style={styles.section}>تغییر رمز</Text>
      <TextInput style={styles.input} value={oldPass} onChangeText={setOldPass} placeholder="رمز فعلی" secureTextEntry textAlign="right" />
      <TextInput style={styles.input} value={newPass} onChangeText={setNewPass} placeholder="رمز جدید" secureTextEntry textAlign="right" />
      <Pressable style={styles.btn} onPress={changePass}><Text style={styles.btnText}>ذخیره رمز</Text></Pressable>
      {note ? <Text style={styles.meta}>{note}</Text> : null}
      <Text style={styles.hint}>اعلان لحظه‌ای بعد از بالا آمدن سایت و ثبت توکن گوشی فعال می‌شود. تغییر رمز را دفتر از سایت انجام می‌دهد.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 8, marginBottom: 8, fontWeight: "800", textAlign: "right", color: theme.ink },
  title: { fontWeight: "800", textAlign: "right", color: theme.ink },
  meta: { marginTop: 4, textAlign: "right", color: theme.muted },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: theme.line, borderRadius: 14, padding: 12, marginBottom: 8 },
  btn: { backgroundColor: theme.teal, borderRadius: 999, padding: 12, marginBottom: 10 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "800" },
  hint: { marginTop: 8, textAlign: "right", color: theme.muted, lineHeight: 20 },
});
