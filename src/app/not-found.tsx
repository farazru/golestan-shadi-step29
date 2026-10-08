import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-sm">۴۰۴</p>
      <h1 className="mt-2 text-2xl font-bold">این صفحه پیدا نشد</h1>
      <Link href="/" className="btn-primary mt-6 inline-flex items-center rounded-full px-5 py-2">
        صفحه اصلی
      </Link>
    </main>
  );
}
