import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { BirthdayBoard } from "@/components/birthday-board";
import { WeatherBox } from "@/components/weather-box";
import { db } from "@/db";
import { publicNews, galleryItems } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ACADEMIC_YEAR } from "@/lib/year";
import { SCHOOL } from "@/lib/school";
import { SiteFooter } from "@/components/site-footer";
import { safeQuery } from "@/lib/db-safe";

export default async function Home() {
  const news = await safeQuery(
    () => db.select().from(publicNews).orderBy(desc(publicNews.createdAt)).limit(8),
    [],
  );
  const gallery = await safeQuery(
    () => db.select().from(galleryItems).orderBy(desc(galleryItems.id)).limit(8),
    [],
  );

  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-3 py-5 md:gap-6 md:px-4 md:py-8">
        <section className="school-card-mint relative overflow-hidden rounded-[2rem] px-6 pb-6 pt-8 text-center">
          <div className="mx-auto w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="گلستان شادی" className="logo-blend mx-auto h-28 w-28 object-contain md:h-52 md:w-52" />
          </div>
          <p className="h-display mt-4">گلستان شادی</p>
          <p className="mt-2 font-bold text-ink/80">
            پیش‌دبستان، دبستان و زبانکده · شهر جدید سهند · {ACADEMIC_YEAR}
          </p>
          <p className="body-relaxed mx-auto mt-4 max-w-2xl">
            محیطی پویا و امن برای آموزش و شکوفایی استعدادها. پیش‌دبستان مختلط، دبستان دخترانه، زبانکده انگلیسی.
          </p>
        </section>

        <section className="school-frame rounded-2xl px-6 py-5 text-center">
          <p className="text-sm font-bold">حضرت امیرالمؤمنین علی علیه‌السلام</p>
          <p className="body-relaxed mt-2 font-medium">بهترین یاور برای خودسازی، قناعت است.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/about" className="school-card-mint rounded-3xl p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kids-girls.jpg" alt="" className="h-28 w-full rounded-2xl object-cover" />
            <p className="mt-3 text-lg font-extrabold">دبستان دخترانه</p>
            <p className="mt-1 text-sm">پایه‌های اول تا ششم</p>
          </Link>
          <Link href="/preregister" className="school-card-sun rounded-3xl p-5">
            <p className="mt-2 text-lg font-extrabold">پیش‌دبستان مختلط</p>
            <p className="mt-1 text-sm">آمادگی دختر و پسر</p>
          </Link>
          <Link href="/language" className="school-card rounded-3xl p-5">
            <p className="role-pill">انگلیسی</p>
            <p className="mt-3 text-lg font-extrabold">زبانکده</p>
            <p className="mt-1 text-sm text-muted">آموزش انگلیسی · تماس با دفتر</p>
          </Link>
        </div>

        <section className="imath-banner relative overflow-hidden rounded-[2rem] px-6 py-7 text-center">
          <span className="imath-ribbon">تنها نماینده رسمی</span>
          <p className="mt-2 text-2xl font-extrabold tracking-tight">آیمث iMath</p>
          <p className="body-relaxed mx-auto mt-2 max-w-xl font-medium">
            تنها نمایندگی رسمی آیمث در شهر جدید سهند — روش جهانی آموزش مفاهیم پایه ریاضی برای کودکان، همراه با بازی و
            سرگرمی.
          </p>
          <a
            href={`tel:${SCHOOL.imathPhone}`}
            className="btn-secondary mt-4 inline-block rounded-full px-5 py-2 text-sm font-extrabold"
          >
            جهت اطلاعات بیشتر از شرایط و کلاس‌ها تماس بفرمایید
          </a>
        </section>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kids-hero.jpg"
          alt=""
          className="w-full rounded-[2rem] border-[3px] border-mint object-cover"
        />

        <BirthdayBoard />

        <section className="school-card overflow-hidden rounded-3xl p-0">
          <div className="flex items-center justify-between bg-ink px-5 py-3 text-white">
            <h2 className="h-section text-white">آلبوم مدرسه</h2>
            <Link href="/gallery" className="text-sm font-bold text-sun underline">
              همه عکس‌ها
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-4">
            {gallery.length === 0 ? (
              <p className="empty col-span-full p-6 text-center">هنوز عکسی بارگذاری نشده. مدیر از داشبورد آلبوم را پر می‌کند.</p>
            ) : (
              gallery.map((g) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={g.id} src={g.imageUrl} alt={g.title ?? ""} className="h-28 w-full rounded-xl object-cover" />
              ))
            )}
          </div>
        </section>

        <section className="school-card rounded-3xl p-5">
          <h2 className="h-section mb-3">اخبار کودک و نوجوان</h2>
          {news.length === 0 ? (
            <p className="empty">خبری ثبت نشده است. مدیر می‌تواند از داشبورد خبر بگذارد.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {news.map((n) => (
                <li key={n.id}>
                  <a href={n.link || "/news"} className="font-bold hover:underline">
                    {n.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <WeatherBox />
          <section className="school-card-sun rounded-3xl p-5">
            <h2 className="h-section mb-3">تماس با ما</h2>
            <p className="body-relaxed">
              مدیریت: {SCHOOL.manager}
              <br />
              همراه: ۰۹۱۴۴۱۶۹۱۵۹
              <br />
              ثابت: ۰۴۱۳۳۴۰۶۶۳۱
              <br />
              سهند · {SCHOOL.instagramHandle}
            </p>
            <Link href="/contact" className="mt-3 inline-block rounded-full bg-ink px-4 py-2 text-sm font-bold text-sun">
              صفحه تماس و نقشه
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
