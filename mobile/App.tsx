import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { session } from "./src/api";
import { LoginScreen } from "./src/screens/LoginScreen";
import { Shell } from "./src/Shell";

export default function App() {
  const [ready, setReady] = useState(false);
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    session()
      .then(() => setInApp(true))
      .catch(() => setInApp(false))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <SafeAreaView style={styles.boot} />;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      {inApp ? <Shell onOut={() => setInApp(false)} /> : <LoginScreen onDone={() => setInApp(true)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fffdf6" },
  boot: { flex: 1, backgroundColor: "#fffdf6" },
});
