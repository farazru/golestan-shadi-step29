import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { EnrollmentDesk } from "./enrollment-desk";

export default function EnrollmentPage() {
  return (
    <div className="school-hero-bg min-h-full">
      <SiteHeader />
      <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-10">در حال بارگذاری پرونده…</main>}>
        <EnrollmentDesk />
      </Suspense>
    </div>
  );
}
