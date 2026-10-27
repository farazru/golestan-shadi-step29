import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "کادر آموزشی",
  description: "معرفی کادر آموزشی و اداری گلستان شادی.",
  path: "/staff",
});

const staff = [
  { name: "مدیریت", role: "مدیر مجموعه", note: "هماهنگی آموزشی و ارتباط با خانواده‌ها." },
  { name: "معاونت", role: "معاون آموزشی", note: "حضور و غیاب، پرونده‌ها و هماهنگی کلاس‌ها." },
  { name: "معلمان پایه", role: "دبستان", note: "تدریس دروس پایه اول تا ششم." },
  { name: "مربیان پیش‌دبستان", role: "آمادگی", note: "فعالیت‌های آموزشی و بازی برای آمادگی." },
  { name: "مدرس زبان", role: "زبانکده", note: "کلاس‌های انگلیسی سطح‌بندی‌شده." },
];

export default function StaffPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <BackLink />
        <h1 className="text-2xl font-semibold text-[#0f5c4c]">کادر آموزشی</h1>
        <p className="mt-2 text-sm text-slate-600">اسامی و عکس‌ها به‌زودی از دفتر اضافه می‌شود.</p>
        <ul className="mt-6 flex flex-col gap-3">
          {staff.map((s) => (
            <li key={s.name} className="school-card rounded-2xl p-4">
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-teal-800">{s.role}</p>
              <p className="mt-1 text-sm text-slate-600">{s.note}</p>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
