import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { login } from "../api";

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
    <View style={styles.wrap}>
      <Text style={styles.brand}>گلستان شادی</Text>
      <Text style={styles.sub}>ورود دانش‌آموز، معلم یا دفتر</Text>
      <TextInput
        style={styles.input}
        value={id}
        onChangeText={setId}
        keyboardType="number-pad"
        maxLength={10}
        placeholder="کد ملی"
        textAlign="right"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="رمز عبور"
        textAlign="right"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.btn} onPress={submit} disabled={pending}>
        <Text style={styles.btnText}>{pending ? "…" : "ورود"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fffdf6" },
  brand: { fontSize: 28, fontWeight: "800", color: "#0f5c4c", textAlign: "center" },
  sub: { marginTop: 8, marginBottom: 24, textAlign: "center", color: "#4b635f" },
  input: {
    borderWidth: 1,
    borderColor: "#d9e7e5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  btn: { backgroundColor: "#0f5c4c", borderRadius: 999, padding: 14, marginTop: 8 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "800" },
  error: { color: "#b42318", marginBottom: 8, textAlign: "right" },
});
