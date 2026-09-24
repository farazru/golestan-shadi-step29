"use client";

export function TimeGreeting({ name }: { name: string }) {
  const h = new Date().getHours();
  const hello = h < 11 ? "صبح بخیر" : h < 15 ? "ظهر بخیر" : h < 19 ? "عصر بخیر" : "شب بخیر";
  return (
    <p className="text-sm text-[var(--muted)]">
      {hello} {name}
    </p>
  );
}
