import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "آیین‌نامه",
  description: "آیین‌نامه و مقررات گلستان شادی.",
  path: "/regulations",
});

const rules = [
  "ورود و خروج دانش‌آموز فقط با هماهنگی دفتر انجام می‌شود.",
  "حضور به‌موقع در کلاس الزامی است. تأخیر مکرر به دفتر گزارش می‌شود.",
  "استفاده از تلفن همراه در کلاس ممنوع است.",
  "لباس و ظاهر باید مطابق شئونات مدرسه باشد.",
  "والدین برای پیگیری وضعیت فرزند از طریق دفتر یا پیام‌های اعلام‌شده اقدام کنند.",
  "شهریه طبق قرارداد و در تاریخ‌های اعلام‌شده پرداخت می‌شود.",
];

export default function RegulationsPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <BackLink />
        <h1 className="text-2xl font-semibold text-[#0f5c4c]">آیین‌نامه</h1>
        <ol className="mt-6 list-decimal space-y-3 pr-5 text-sm leading-7">
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
