import type { CapacitorConfig } from "@capacitor/cli";

// Production: https://golestanshadi.ir
// Test before the site is live:
//   CAPACITOR_SERVER_URL=http://10.0.2.2:8080 npx cap sync android   (Android emulator → your PC)
//   CAPACITOR_SERVER_URL=http://192.168.1.20:8080 npx cap sync android (phone on same Wi‑Fi)
const serverUrl = process.env.CAPACITOR_SERVER_URL || "https://golestanshadi.ir";
const isLocal = serverUrl.startsWith("http://");

const config: CapacitorConfig = {
  appId: "ir.golestanshadi.app",
  appName: "گلستان شادی",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: isLocal,
    androidScheme: isLocal ? "http" : "https",
  },
  android: {
    allowMixedContent: isLocal,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#fffdf6",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f5c4c",
    },
  },
};

export default config;
