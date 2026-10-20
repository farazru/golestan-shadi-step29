"use client";

import { useRouter } from "next/navigation";

export function BackLink({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  function goBack() {
    // history.length > 1 means there is a previous page in this tab
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      aria-label="بازگشت به صفحه قبل"
      onClick={goBack}
      className="mb-4 inline-flex min-h-11 items-center gap-2 font-bold text-ink"
    >
      <span aria-hidden="true">→</span>
      <span>بازگشت</span>
    </button>
  );
}
