import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../api";

type Account = { id: number; fullName: string; classGroup: string; feeToman: number };
type Payment = { accountId: number; amountToman: number; monthKey: string };

export function TuitionScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api("/api/tuition")
      .then((d) => {
        const data = d as { accounts?: Account[]; payments?: Payment[] };
        setAccounts(data.accounts ?? []);
        setPayments(data.payments ?? []);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>شهریه</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {accounts.length === 0 && !error ? <Text style={styles.empty}>حساب شهریه‌ای نیست.</Text> : null}
      {accounts.map((a) => {
        const paid = payments.filter((p) => p.accountId === a.id).reduce((s, p) => s + p.amountToman, 0);
        const due = a.feeToman - paid;
        return (
          <View key={a.id} style={styles.card}>
            <Text style={styles.cardTitle}>{a.fullName}</Text>
            <Text style={styles.meta}>{a.classGroup}</Text>
            <Text style={styles.line}>کل: {a.feeToman.toLocaleString("fa-IR")} تومان</Text>
            <Text style={styles.line}>پرداخت‌شده: {paid.toLocaleString("fa-IR")}</Text>
            <Text style={styles.due}>مانده: {due.toLocaleString("fa-IR")} تومان</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fffdf6" },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f5c4c", textAlign: "right", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#d9e7e5" },
  cardTitle: { fontWeight: "800", textAlign: "right" },
  meta: { marginTop: 4, textAlign: "right", color: "#4b635f" },
  line: { marginTop: 6, textAlign: "right" },
  due: { marginTop: 6, textAlign: "right", fontWeight: "800", color: "#0f5c4c" },
  empty: { textAlign: "right", color: "#4b635f" },
  error: { color: "#b42318", textAlign: "right", marginBottom: 8 },
});
