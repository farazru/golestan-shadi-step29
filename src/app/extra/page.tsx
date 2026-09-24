import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";

const items = [
  ["قرآن و احکام", "برنامه هفتگی با هماهنگی دفتر اعلام می‌شود."],
  ["ورزش و بازی گروهی", "ساعت زنگ ورزش روی برنامه کلاسی هر پایه."],
  ["هنر و کاردستی", "نمایش آثار در آلبوم مدرسه."],
  ["زبانکده انگلیسی", "صفحه زبانکده — دفتر پس از فرم تماس می‌گیرد."],
];

export default function ExtraPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <BackLink />
        <section className="school-card rounded-3xl p-6">
          <h1 className="h-display text-[var(--school-teal-dark)]">فعالیتهای فوق برنامه</h1>
          <p className="body-relaxed mt-3 text-sm text-[var(--foreground)]/70">
            فهرست زیر نمونه است. مدیر می‌تواند از بخش اخبار و آلبوم، عکس و اطلاعیه هر فعالیت را بگذارد.
          </p>
          <ul className="mt-6 grid gap-3">
            {items.map(([t, b]) => (
              <li key={t} className="rounded-2xl border border-teal-100 bg-white/70 p-4">
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm text-slate-600">{b}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
