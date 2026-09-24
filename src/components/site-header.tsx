import Link from "next/link";
import { getSession } from "@/lib/get-session";
import { ACADEMIC_YEAR } from "@/lib/year";
import { ROLE_FA } from "@/lib/roles";
import { SiteMenu } from "./site-menu";

export async function SiteHeader() {
  const session = await getSession();
  return (
    <header className="sticky top-0 z-40 bg-mint text-ink" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2 md:gap-3 md:px-4">
        <SiteMenu />
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center md:justify-start md:gap-3 md:text-right"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="" className="logo-blend h-11 w-11 shrink-0 object-contain md:h-16 md:w-16" />
          <span className="min-w-0 font-extrabold leading-tight">
            <span className="block truncate text-sm md:text-base">گلستان شادی</span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-ink/80 md:block">
              پیش‌دبستان، دبستان دخترانه و زبانکده · سهند · {ACADEMIC_YEAR}
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 text-sm">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center rounded-full bg-sun px-3 py-2 font-extrabold text-ink"
            >
              {ROLE_FA[session.user.role] ?? session.user.role}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-full bg-sun px-3 py-2 font-extrabold text-ink"
            >
              <span className="md:hidden">ورود</span>
              <span className="hidden md:inline">ورود به سایت</span>
            </Link>
          )}
        </div>
      </div>
      <nav className="mx-auto hidden max-w-5xl flex-wrap items-center justify-end gap-4 px-4 pb-3 text-sm font-bold md:flex">
        <Link href="/">صفحه اصلی</Link>
        <Link href="/about">درباره ما</Link>
        <Link href="/extra">فوق برنامه</Link>
        <Link href="/gallery">آلبوم</Link>
        <Link href="/calendar">تقویم {ACADEMIC_YEAR}</Link>
        <Link href="/imath">آیمث</Link>
        <Link href="/language">زبانکده</Link>
        <Link href="/preregister">پیش ثبت‌نام</Link>
        <Link href="/contact">تماس با ما</Link>
      </nav>
    </header>
  );
}
