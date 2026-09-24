import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { BackLink } from "@/components/back-link";

export default function ParentsAssoc() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <BackLink />
        <section className="school-card rounded-3xl p-6">
          <h1 className="h-display text-[var(--school-teal-dark)]">انجمن اولیا</h1>
          <p className="body-relaxed mt-3 text-sm leading-8">
            جلسات انجمن و اطلاعیه‌های مربوط به خانواده‌ها از همین صفحه و بخش اخبار اعلام می‌شود. ولی دانش‌آموز پس از تأیید
            دفتر، حضور و تکالیف فرزند را در داشبورد می‌بیند — نه کلاس زنده.
          </p>
          <Link href="/preregister" className="btn-primary mt-5 inline-block rounded-full px-4 py-2 text-sm">
            پیش ثبت‌نام
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
