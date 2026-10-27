import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "امکانات",
  description: "امکانات آموزشی و رفاهی گلستان شادی در شهر جدید سهند.",
  path: "/facilities",
});

const items = [
  { title: "کلاس‌های مجهز", text: "کلاس‌های روشن با میز و تخته مناسب سن کودکان." },
  { title: "حیاط و بازی", text: "فضای باز برای بازی و فعالیت بدنی در ساعات تفریح." },
  { title: "کتابخانه کوچک", text: "کتاب‌های داستان و آموزشی برای پیش‌دبستان و دبستان." },
  { title: "زبانکده", text: "کلاس‌های انگلیسی با سطح‌بندی برای کودکان و نوجوانان." },
  { title: "سرویس ایاب و ذهاب", text: "امکان استفاده از سرویس مدرسه با هماهنگی دفتر." },
];

export default function FacilitiesPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <BackLink />
        <h1 className="text-2xl font-semibold text-[#0f5c4c]">امکانات</h1>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <li key={it.title} className="school-card rounded-2xl p-4">
              <h2 className="font-semibold">{it.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{it.text}</p>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
