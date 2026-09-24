import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SCHOOL } from "@/lib/school";
import { BackLink } from "@/components/back-link";

export default function ContactPage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <BackLink />
        <section className="school-card rounded-3xl p-6">
          <h1 className="text-2xl font-semibold">تماس با ما</h1>
          <p className="mt-2 text-sm text-muted">{SCHOOL.legalLine}</p>
          <dl className="mt-5 space-y-3 text-sm leading-8">
            <div>
              <dt className="font-medium">مدیریت</dt>
              <dd>{SCHOOL.manager}</dd>
            </div>
            <div>
              <dt className="font-medium">همراه</dt>
              <dd dir="ltr" className="text-left">
                <a href={`tel:${SCHOOL.phoneMobile}`}>{SCHOOL.phoneMobile}</a>
              </dd>
            </div>
            <div>
              <dt className="font-medium">تلفن ثابت</dt>
              <dd dir="ltr" className="text-left">
                <a href={`tel:${SCHOOL.phoneLandline}`}>{SCHOOL.phoneLandline}</a>
              </dd>
            </div>
            <div>
              <dt className="font-medium">اینستاگرام</dt>
              <dd>
                <a href={SCHOOL.instagram} className="text-teal-800 underline" target="_blank" rel="noreferrer">
                  {SCHOOL.instagramHandle}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-medium">آدرس</dt>
              <dd>
                {SCHOOL.address}
                <br />
                <a href={SCHOOL.mapsUrl} className="text-teal-800 underline" target="_blank" rel="noreferrer">
                  باز کردن در گوگل‌مپ
                </a>
              </dd>
            </div>
          </dl>
        </section>
        <iframe
          title="نقشه سهند"
          src={SCHOOL.mapsEmbed}
          className="mt-6 h-72 w-full rounded-3xl border-0 shadow"
          loading="lazy"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
