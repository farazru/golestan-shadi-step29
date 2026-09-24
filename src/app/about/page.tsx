import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SCHOOL } from "@/lib/school";
import { BackLink } from "@/components/back-link";

const blocks = [
  {
    id: "goals",
    t: "اهداف",
    b: "ایجاد محیطی پویا، امن و الهام‌بخش برای آموزش، پرورش و شکوفایی استعداد کودکان و نوجوانان. همراهی خانواده در مسیر رشد فرزند.",
  },
  {
    id: "facilities",
    t: "امکانات",
    b: "کلاس حضوری و آنلاین با الوکام، برنامه هفتگی، پرونده دانش‌آموز، شهریه و آلبوم. زبانکده انگلیسی در همان مجموعه.",
  },
  {
    id: "achievements",
    t: "دستاوردها",
    b: "متن افتخارات سال را دفتر از داشبورد در بخش اخبار و آلبوم به‌روز می‌کند. این صفحه ساختار آماده دارد.",
  },
  {
    id: "teachers",
    t: "کادر آموزشی",
    b: "فهرست معلمان هر درس در داشبورد مدیر دیده می‌شود. پس از ثبت دوره، نام معلم روی کارت دانش‌آموز می‌آید.",
  },
  {
    id: "office",
    t: "کادر اداری",
    b: `مدیریت: ${SCHOOL.manager}. نقش‌های سامانه: مدیر، معاون، معلم، دانش‌آموز و ولی.`,
  },
  {
    id: "board",
    t: "اعضای هیات امنا",
    b: "اسامی هیات امنا را دفتر اینجا یا در اخبار مدرسه اعلام می‌کند.",
  },
  {
    id: "stars",
    t: "برترین‌ها",
    b: "دانش‌آموزان برگزیده ماه از طریق اطلاعیه‌ها و ویجت تولد در صفحه اصلی معرفی می‌شوند.",
  },
];

export default function AboutPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <BackLink />
        <section className="school-card mb-6 rounded-3xl p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="" className="mx-auto h-20 w-auto object-contain" />
          <h1 className="h-display mt-3">درباره مدرسه گلستان شادی</h1>
          <p className="body-relaxed mt-2 text-[var(--foreground)]/75">
            {SCHOOL.legalLine} · {SCHOOL.region}
            <br />
            پیش‌دبستان {SCHOOL.preschool} · دبستان {SCHOOL.elementary} · زبانکده {SCHOOL.language} ({SCHOOL.languageMix})
          </p>
        </section>
        <div className="grid gap-3 md:grid-cols-2">
          {blocks.map((x) => (
            <section id={x.id} key={x.id} className="school-card scroll-mt-24 rounded-2xl p-5">
              <h2 className="h-section text-[var(--school-teal-dark)]">{x.t}</h2>
              <p className="body-relaxed mt-2 text-sm">{x.b}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
