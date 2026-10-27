import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "دستاوردها",
  description: "دستاوردها و افتخارات گلستان شادی.",
  path: "/achievements",
});

const items = [
  { year: "۱۴۰۴", title: "نمایندگی آیمث در سهند", text: "تنها نماینده رسمی آیمث در شهر جدید سهند." },
  { year: "۱۴۰۳", title: "گسترش زبانکده", text: "افزایش کلاس‌های انگلیسی برای کودکان و نوجوانان." },
  { year: "۱۴۰۲", title: "پیش‌دبستان و دبستان", text: "پوشش کامل آمادگی و پایه‌های اول تا ششم." },
];

export default function AchievementsPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <BackLink />
        <h1 className="text-2xl font-semibold text-[#0f5c4c]">دستاوردها</h1>
        <ul className="mt-6 flex flex-col gap-4">
          {items.map((it) => (
            <li key={it.title} className="school-card rounded-2xl p-4">
              <p className="text-xs text-teal-700">{it.year}</p>
              <h2 className="mt-1 font-semibold">{it.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{it.text}</p>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
