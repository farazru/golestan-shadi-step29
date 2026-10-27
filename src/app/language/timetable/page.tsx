import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "برنامه زبانکده",
  description: "برنامه کلاس‌های زبانکده انگلیسی گلستان شادی.",
  path: "/language/timetable",
});

const slots = [
  { day: "شنبه", time: "۱۶:۰۰ – ۱۷:۰۰", level: "مبتدی" },
  { day: "شنبه", time: "۱۷:۰۰ – ۱۸:۰۰", level: "مقدماتی" },
  { day: "دوشنبه", time: "۱۶:۰۰ – ۱۷:۰۰", level: "متوسط" },
  { day: "دوشنبه", time: "۱۷:۰۰ – ۱۸:۰۰", level: "پیشرفته" },
  { day: "چهارشنبه", time: "۱۶:۰۰ – ۱۷:۰۰", level: "مبتدی" },
  { day: "چهارشنبه", time: "۱۷:۰۰ – ۱۸:۰۰", level: "مقدماتی" },
];

export default function LanguageTimetablePage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <BackLink fallback="/language" />
        <h1 className="text-2xl font-semibold text-[#0f5c4c]">برنامه زبانکده</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          برنامه کلاس‌های انگلیسی. برای ثبت‌نام از فرم زبانکده استفاده کنید.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {slots.map((s, i) => (
            <li key={i} className="school-card flex items-center justify-between rounded-2xl p-4 text-sm">
              <span className="font-medium">{s.day}</span>
              <span dir="ltr">{s.time}</span>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-800">{s.level}</span>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
