import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "راهنما و پرسش‌های متداول",
  description: "راهنمای استفاده از سایت و پرسش‌های متداول والدین.",
  path: "/help",
});

const faqs = [
  { q: "چگونه وارد سایت شوم؟", a: "با کد ملی و رمز عبور از صفحه ورود. اگر حساب ندارید، از پیش‌ثبت‌نام شروع کنید." },
  { q: "رمز عبور را فراموش کردم.", a: "با دفتر مدرسه تماس بگیرید. مدیر می‌تواند رمز را بازنشانی کند." },
  { q: "چگونه فرزندم را به کلاس اضافه کنم؟", a: "دفتر یا معلم فرزند را در دوره ثبت‌نام می‌کند. شما فقط وضعیت را می‌بینید." },
  { q: "حضور و غیاب را کجا ببینم؟", a: "بعد از ورود، در داشبورد بخش حضور نمایش داده می‌شود." },
  { q: "شهریه را چطور بپردازم؟", a: "مبلغ و تاریخ را دفتر اعلام می‌کند. رسید را نگه دارید." },
  { q: "کلاس آنلاین کجاست؟", a: "معلم لینک الوکام را در دوره می‌گذارد. دانش‌آموز از داشبورد وارد می‌شود." },
];

export default function HelpPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <BackLink />
        <h1 className="text-2xl font-semibold text-[#0f5c4c]">راهنما و پرسش‌های متداول</h1>
        <ul className="mt-6 flex flex-col gap-4">
          {faqs.map((f) => (
            <li key={f.q} className="school-card rounded-2xl p-4">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-1 text-sm leading-7 text-slate-600">{f.a}</p>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
