import { ReactNode, useRef } from "react";
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "./theme";

export function Screen({
  title,
  subtitle,
  children,
  onRefresh,
  refreshing,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }).start();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      <Animated.View style={{ flex: 1, opacity: fade }}>
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={theme.teal} /> : undefined}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Empty({ text, action }: { text: string; action?: string }) {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.empty}>{text}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
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
  emptyBox: { backgroundColor: "#fff", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: theme.line },
  empty: { textAlign: "right", color: theme.muted, lineHeight: 22 },
  action: { marginTop: 8, textAlign: "right", color: theme.teal, fontWeight: "700" },
  error: { color: theme.danger, textAlign: "right", marginBottom: 8 },
});
