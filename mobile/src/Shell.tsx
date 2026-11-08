import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { HomeScreen } from "./screens/HomeScreen";
import { AnnouncementsScreen } from "./screens/AnnouncementsScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { TuitionScreen } from "./screens/TuitionScreen";
import { StudyScreen } from "./screens/StudyScreen";
import { AttendanceScreen } from "./screens/AttendanceScreen";
import { theme } from "./theme";

const TABS = [
  { id: "home", label: "خانه" },
  { id: "news", label: "اطلاعیه" },
  { id: "cal", label: "تقویم" },
  { id: "att", label: "حضور" },
  { id: "fee", label: "شهریه" },
  { id: "study", label: "کارنامه" },
] as const;

export function Shell({ onOut }: { onOut: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("home");

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        {tab === "home" ? <HomeScreen onOut={onOut} /> : null}
        {tab === "news" ? <AnnouncementsScreen /> : null}
        {tab === "cal" ? <CalendarScreen /> : null}
        {tab === "att" ? <AttendanceScreen /> : null}
        {tab === "fee" ? <TuitionScreen /> : null}
        {tab === "study" ? <StudyScreen /> : null}
      </View>
      <View style={styles.bar}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <Pressable key={t.id} onPress={() => setTab(t.id)} style={styles.tab}>
              <View style={on ? styles.pill : undefined}>
                <Text style={on ? styles.on : styles.off}>{t.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  body: { flex: 1 },
  bar: {
    flexDirection: "row-reverse",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: theme.line,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  tab: { flex: 1, alignItems: "center" },
  pill: { backgroundColor: "#E7F4F1", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6 },
  on: { color: theme.tealDark, fontWeight: "800", fontSize: 11 },
  off: { color: "#8AA09C", fontSize: 11, paddingVertical: 6 },
});
