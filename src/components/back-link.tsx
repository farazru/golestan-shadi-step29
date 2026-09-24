"use client";

import { useRouter } from "next/navigation";

export function BackLink({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="بازگشت به صفحه قبل"
      onClick={() => {
        const ref = typeof document !== "undefined" ? document.referrer : "";
        const same = Boolean(ref && ref.startsWith(window.location.origin) && ref !== window.location.href);
        if (same) router.back();
        else router.push(fallback);
      }}
      className="mb-4 inline-flex min-h-11 items-center gap-2 font-bold text-ink"
    >
      <span aria-hidden="true">←</span>
      <span>بازگشت</span>
    </button>
  );
}
