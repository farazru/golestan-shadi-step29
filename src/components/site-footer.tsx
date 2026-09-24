import Link from "next/link";
import { SCHOOL } from "@/lib/school";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1zM17.35 6.4a1.15 1.15 0 1 0 1.15 1.15 1.15 1.15 0 0 0-1.15-1.15z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <div className="overflow-hidden border-t border-border bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kids-strip.jpg" alt="" className="mx-auto max-h-56 w-full max-w-5xl object-cover object-bottom" />
      </div>
      <div className="bg-ink text-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold">{SCHOOL.name}</p>
            <p className="mt-2 text-sm leading-7 text-white/80">{SCHOOL.legalLine}</p>
            <p className="mt-1 text-sm text-white/70">{SCHOOL.region}</p>
          </div>
          <div className="text-sm leading-8">
            <p className="font-semibold">پیوندها</p>
            <Link href="/about" className="mt-2 block text-white/85 hover:underline">
              درباره ما
            </Link>
            <Link href="/imath" className="block text-white/85 hover:underline">
              آیمث
            </Link>
            <Link href="/preregister" className="block text-white/85 hover:underline">
              پیش‌ثبت‌نام
            </Link>
            <Link href="/language" className="block text-white/85 hover:underline">
              زبانکده
            </Link>
            <Link href="/contact" className="block text-white/85 hover:underline">
              تماس و نقشه
            </Link>
          </div>
          <div className="text-sm leading-8">
            <p className="font-semibold">دفتر</p>
            <p className="mt-2">مدیریت: {SCHOOL.manager}</p>
            <a className="block" href={`tel:${SCHOOL.phoneMobile}`} dir="ltr">
              همراه: {SCHOOL.phoneMobile}
            </a>
            <a className="block" href={`tel:${SCHOOL.phoneLandline}`} dir="ltr">
              ثابت: {SCHOOL.phoneLandline}
            </a>
            <a
              className="mt-2 inline-flex items-center gap-2 font-bold text-sun"
              href={SCHOOL.instagram}
              target="_blank"
              rel="noreferrer"
            >
              <InstagramIcon />
              {SCHOOL.instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
