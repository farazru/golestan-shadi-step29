"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

const ABOUT = [
  ["اهداف", "/about#goals"],
  ["امکانات", "/about#facilities"],
  ["دستاوردها", "/about#achievements"],
  ["کادر آموزشی", "/about#teachers"],
  ["کادر اداری", "/about#office"],
  ["اعضای هیات امنا", "/about#board"],
  ["برترین‌ها", "/about#stars"],
];

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const [tools, setTools] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        ref={triggerRef}
        aria-label="منو"
        aria-expanded={open}
        aria-controls={menuId}
        className="inline-flex h-11 w-11 items-center justify-center text-2xl font-bold text-ink"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>
      {open ? (
        <div
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="منوی سایت"
          className="fixed inset-0 z-50 overflow-y-auto bg-ink text-white"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <button
            type="button"
            ref={closeRef}
            aria-label="بستن منو"
            className="absolute left-3 top-3 inline-flex h-11 w-11 items-center justify-center text-3xl"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
          <nav className="flex flex-col gap-1 px-6 pb-16 pt-16 text-right text-lg">
            <Link href="/" onClick={() => setOpen(false)} className="min-h-12 border-b border-white/20 py-3">
              صفحه اصلی
            </Link>
            <button type="button" className="min-h-12 border-b border-white/20 py-3 text-right" onClick={() => setAbout((v) => !v)}>
              درباره ما ▾
            </button>
            {about
              ? ABOUT.map(([t, h]) => (
                  <Link key={t} href={h} onClick={() => setOpen(false)} className="min-h-12 bg-mint/20 px-4 py-3">
                    {t}
                  </Link>
                ))
              : null}
            <Link href="/extra" onClick={() => setOpen(false)} className="min-h-12 border-b border-white/20 py-3">
              فوق برنامه
            </Link>
            <button type="button" className="min-h-12 border-b border-white/20 py-3 text-right" onClick={() => setTools((v) => !v)}>
              امکانات سایت ▾
            </button>
            {tools ? (
              <>
                <Link href="/gallery" onClick={() => setOpen(false)} className="min-h-12 bg-mint/20 px-4 py-3">
                  آلبوم
                </Link>
                <Link href="/calendar" onClick={() => setOpen(false)} className="min-h-12 bg-mint/20 px-4 py-3">
                  تقویم
                </Link>
                <Link href="/timetable" onClick={() => setOpen(false)} className="min-h-12 bg-mint/20 px-4 py-3">
                  برنامه هفتگی
                </Link>
                <Link href="/imath" onClick={() => setOpen(false)} className="min-h-12 bg-mint/20 px-4 py-3">
                  آیمث
                </Link>
              </>
            ) : null}
            <Link href="/language" onClick={() => setOpen(false)} className="min-h-12 border-b border-white/20 py-3">
              زبانکده انگلیسی
            </Link>
            <Link href="/preregister" onClick={() => setOpen(false)} className="min-h-12 border-b border-white/20 py-3">
              پیش ثبت نام
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="min-h-12 py-3">
              تماس با ما
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-4 min-h-12 rounded-full bg-sun px-4 py-3 text-center font-extrabold text-ink"
            >
              ورود
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
