import type { CapacitorConfig } from "@capacitor/cli";

// Point this at the live school site. The app is a native shell around that site.
const serverUrl = process.env.CAPACITOR_SERVER_URL || "https://golestanshadi.ir";

const config: CapacitorConfig = {
  appId: "ir.golestanshadi.app",
  appName: "گلستان شادی",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
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
