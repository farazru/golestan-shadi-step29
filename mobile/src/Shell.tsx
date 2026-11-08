import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { HomeScreen } from "./screens/HomeScreen";
import { AnnouncementsScreen } from "./screens/AnnouncementsScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { TuitionScreen } from "./screens/TuitionScreen";
import { StudyScreen } from "./screens/StudyScreen";
import { AttendanceScreen } from "./screens/AttendanceScreen";

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
        {TABS.map((t) => (
          <Pressable key={t.id} onPress={() => setTab(t.id)} style={styles.tab}>
            <Text style={tab === t.id ? styles.on : styles.off}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fffdf6" },
  body: { flex: 1 },
  bar: {
    flexDirection: "row-reverse",
    borderTopWidth: 1,
    borderColor: "#d9e7e5",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingBottom: 18,
  },
  tab: { flex: 1, alignItems: "center" },
  on: { color: "#0f5c4c", fontWeight: "800", fontSize: 12 },
  off: { color: "#7b8f8c", fontSize: 12 },
});
