import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { login } from "../api";
import { theme } from "../theme";

export function LoginScreen({ onDone }: { onDone: () => void }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setError(null);
    if (!/^\d{10}$/.test(id)) {
      setError("کد ملی باید دقیقاً ۱۰ رقم باشد.");
      return;
    }
    setPending(true);
    try {
      await login(id, password);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ورود نشد.");
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <View style={styles.mark}>
          <Text style={styles.markText}>گ</Text>
        </View>
        <Text style={styles.brand}>گلستان شادی</Text>
        <Text style={styles.tag}>پیش‌دبستان، دبستان و زبانکده</Text>
      </View>
      <View style={styles.sheet}>
        <Text style={styles.label}>ورود به سامانه</Text>
        <TextInput style={styles.input} value={id} onChangeText={setId} keyboardType="number-pad" maxLength={10} placeholder="کد ملی" placeholderTextColor="#8AA09C" textAlign="right" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="رمز عبور" placeholderTextColor="#8AA09C" textAlign="right" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.btn} onPress={submit} disabled={pending}>
          <Text style={styles.btnText}>{pending ? "در حال ورود…" : "ورود"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.tealDark },
  hero: { paddingTop: 90, paddingHorizontal: 24, alignItems: "center" },
  mark: { width: 72, height: 72, borderRadius: 24, backgroundColor: theme.sun, alignItems: "center", justifyContent: "center" },
  markText: { fontSize: 32, fontWeight: "800", color: theme.tealDark },
  brand: { marginTop: 16, color: "#fff", fontSize: 28, fontWeight: "800" },
  tag: { marginTop: 6, color: "#D7E8E4" },
  sheet: { marginTop: 36, flex: 1, backgroundColor: theme.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  label: { fontSize: 18, fontWeight: "800", color: theme.ink, textAlign: "right", marginBottom: 16 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: theme.line, borderRadius: 14, padding: 14, marginBottom: 12, fontSize: 16, color: theme.ink },
  btn: { backgroundColor: theme.teal, borderRadius: 999, padding: 16, marginTop: 8 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "800" },
  error: { color: theme.danger, textAlign: "right", marginBottom: 8 },
});
