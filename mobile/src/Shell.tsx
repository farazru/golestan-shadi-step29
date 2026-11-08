import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { HomeScreen } from "./screens/HomeScreen";
import { AnnouncementsScreen } from "./screens/AnnouncementsScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { TuitionScreen } from "./screens/TuitionScreen";
import { StudyScreen } from "./screens/StudyScreen";
import { ClassScreen } from "./screens/ClassScreen";
import { ComposeScreen } from "./screens/ComposeScreen";
import { MoreScreen } from "./screens/MoreScreen";
import { theme } from "./theme";

const TABS = [
  { id: "home", label: "خانه" },
  { id: "class", label: "کلاس" },
  { id: "news", label: "اطلاعیه" },
  { id: "fee", label: "شهریه" },
  { id: "more", label: "بیشتر" },
] as const;

export function Shell({ onOut }: { onOut: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("home");
  const [compose, setCompose] = useState(false);

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        {tab === "home" ? <HomeScreen onOut={onOut} /> : null}
        {tab === "class" ? <ClassScreen /> : null}
        {tab === "news" ? (compose ? <ComposeScreen /> : <AnnouncementsScreen />) : null}
        {tab === "fee" ? <TuitionScreen /> : null}
        {tab === "more" ? <MoreScreen /> : null}
      </View>
      {tab === "news" ? (
        <Pressable style={styles.fab} onPress={() => setCompose((v) => !v)}>
          <Text style={styles.fabText}>{compose ? "لیست" : "جدید"}</Text>
        </Pressable>
      ) : null}
      <View style={styles.bar}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <Pressable key={t.id} onPress={() => { setTab(t.id); setCompose(false); }} style={styles.tab}>
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
  },
  tab: { flex: 1, alignItems: "center" },
  pill: { backgroundColor: "#E7F4F1", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  on: { color: theme.tealDark, fontWeight: "800", fontSize: 12 },
  off: { color: "#8AA09C", fontSize: 12, paddingVertical: 6 },
  fab: { position: "absolute", left: 16, bottom: 78, backgroundColor: theme.sun, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  fabText: { fontWeight: "800", color: theme.tealDark },
});
