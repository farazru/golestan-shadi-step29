import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { SCHOOL } from "@/lib/school";
import { LanguageForm } from "./form";

export default function LanguagePage() {
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <BackLink />
        <section className="school-card rounded-3xl p-8">
          <p className="role-pill w-fit">زبانکده · {SCHOOL.language}</p>
          <h1 className="mt-3 text-2xl font-semibold text-[#0f5c4c]">زبانکده گلستان شادی</h1>
          <p className="mt-3 text-sm leading-8">
            آموزش انگلیسی برای کودکان و نوجوانان — مختلط. فرم زیر را پر کنید تا دفتر با شما تماس بگیرد.
          </p>
          <LanguageForm />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
