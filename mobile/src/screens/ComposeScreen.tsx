import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { api } from "../api";
import { theme } from "../theme";
import { Screen } from "../ui";

export function ComposeScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function send() {
    setMsg(null);
    try {
      await api("/api/messages", { method: "POST", body: JSON.stringify({ title, content, courseId: "all" }) });
      setTitle("");
      setContent("");
      setMsg("اطلاعیه ارسال شد.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ارسال نشد.");
    }
  }

  return (
    <Screen title="اطلاعیه جدید" subtitle="برای کل مدرسه">
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="عنوان" textAlign="right" />
      <TextInput style={[styles.input, styles.area]} value={content} onChangeText={setContent} placeholder="متن" textAlign="right" multiline />
      <Pressable style={styles.btn} onPress={send}>
        <Text style={styles.btnText}>ارسال</Text>
      </Pressable>
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: theme.line, borderRadius: 14, padding: 14, marginBottom: 12 },
  area: { minHeight: 120, textAlignVertical: "top" },
  btn: { backgroundColor: theme.teal, borderRadius: 999, padding: 14 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "800" },
  msg: { marginTop: 12, textAlign: "right", color: theme.ink },
});
