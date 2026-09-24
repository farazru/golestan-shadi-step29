export const WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"] as const;

export const PERIODS = [
  { period: 1, label: "زنگ اول", startTime: "08:00", endTime: "08:45" },
  { period: 2, label: "زنگ دوم", startTime: "08:55", endTime: "09:40" },
  { period: 3, label: "زنگ سوم", startTime: "10:00", endTime: "10:45" },
  { period: 4, label: "زنگ چهارم", startTime: "10:55", endTime: "11:40" },
  { period: 5, label: "زنگ پنجم", startTime: "12:00", endTime: "12:45" },
  { period: 6, label: "زنگ ششم", startTime: "13:00", endTime: "13:45" },
] as const;

// JS getDay(): 0 Sun ... 6 Sat. Iranian week starts Saturday.
export function iranWeekday(now = new Date()) {
  // Sat=0 ... Fri=6
  return (now.getDay() + 1) % 7;
}
