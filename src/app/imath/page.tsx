import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { SCHOOL } from "@/lib/school";

export default function IMathPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <BackLink />
        <section className="school-card-gold rounded-3xl p-8 text-center">
          <p className="role-pill mx-auto w-fit bg-[#084843] text-white">آیمث · iMath</p>
          <h1 className="mt-4 text-3xl font-extrabold">نمایندگی رسمی آیمث</h1>
          <p className="mt-2 font-bold">تنها در شهر جدید سهند</p>
          <p className="body-relaxed mt-4 text-right">
            آیمث روش آموزش مفاهیم پایه ریاضی با بازی، شعر و داستان است (معمولاً ۳ تا ۷ سال). جزئیات کلاس‌ها و شهریه را دفتر
            اعلام می‌کند.
          </p>
          <a href={`tel:${SCHOOL.imathPhone}`} className="btn-primary mt-5 inline-block rounded-full px-5 py-2 text-sm font-bold">
            تماس برای شرایط و کلاس‌ها
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
