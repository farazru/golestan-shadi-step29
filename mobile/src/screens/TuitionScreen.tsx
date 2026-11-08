import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { api } from "../api";
import { theme } from "../theme";
import { Card, Empty, ErrorText, Screen } from "../ui";

type Account = { id: number; fullName: string; classGroup: string; feeToman: number };
type Payment = { accountId: number; amountToman: number };

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
    <Screen title="شهریه" subtitle="مبالغ به تومان">
      {error ? <ErrorText text={error} /> : null}
      {accounts.length === 0 && !error ? <Empty text="حساب شهریه‌ای نیست." /> : null}
      {accounts.map((a) => {
        const paid = payments.filter((p) => p.accountId === a.id).reduce((s, p) => s + p.amountToman, 0);
        const due = a.feeToman - paid;
        return (
          <Card key={a.id}>
            <Text style={styles.title}>{a.fullName}</Text>
            <Text style={styles.meta}>{a.classGroup}</Text>
            <Text style={styles.line}>کل {a.feeToman.toLocaleString("fa-IR")}</Text>
            <Text style={styles.line}>پرداخت‌شده {paid.toLocaleString("fa-IR")}</Text>
            <Text style={due > 0 ? styles.due : styles.ok}>مانده {due.toLocaleString("fa-IR")} تومان</Text>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "800", textAlign: "right", color: theme.ink },
  meta: { marginTop: 4, textAlign: "right", color: theme.muted },
  line: { marginTop: 8, textAlign: "right", color: theme.ink },
  due: { marginTop: 8, textAlign: "right", fontWeight: "800", color: theme.danger },
  ok: { marginTop: 8, textAlign: "right", fontWeight: "800", color: theme.ok },
});
