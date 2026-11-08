import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "./theme";

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Empty({ text }: { text: string }) {
  return <Text style={styles.empty}>{text}</Text>;
}

export function ErrorText({ text }: { text: string }) {
  return <Text style={styles.error}>{text}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    backgroundColor: theme.tealDark,
    paddingTop: 54,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "800", textAlign: "right" },
  sub: { color: "#D7E8E4", marginTop: 4, textAlign: "right" },
  body: { padding: 16, paddingBottom: 28 },
  card: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.line,
  },
  empty: { textAlign: "right", color: theme.muted, lineHeight: 22, marginTop: 8 },
  error: { color: theme.danger, textAlign: "right", marginBottom: 8 },
});
