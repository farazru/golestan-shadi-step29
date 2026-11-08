import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080";

const COOKIE_KEY = "gs.cookie";

export async function saveCookie(setCookie: string | null) {
  if (!setCookie) return;
  const pair = setCookie.split(";")[0];
  await AsyncStorage.setItem(COOKIE_KEY, pair);
}

export async function clearSession() {
  await AsyncStorage.removeItem(COOKIE_KEY);
}

async function cookieHeader() {
  const cookie = await AsyncStorage.getItem(COOKIE_KEY);
  return cookie ? { Cookie: cookie } : {};
}

export async function api(path: string, init: RequestInit = {}) {
  const headers = {
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(await cookieHeader()),
    ...(init.headers || {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "خطا در ارتباط با سرور");
  }
  return data;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/sign-in/username`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || "کد ملی یا رمز عبور اشتباه است.");
  }
  await saveCookie(res.headers.get("set-cookie"));
  return data;
}

export async function session() {
  return api("/api/auth/get-session");
}
