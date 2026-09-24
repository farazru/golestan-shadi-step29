import { SiteHeader } from "@/components/site-header";
import { ACADEMIC_YEAR } from "@/lib/year";
import { ExamsClient } from "./exams-client";
import { BackLink } from "@/components/back-link";

export default function ExamsPage() {
  return (
    <div className="min-h-full school-hero-bg">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <BackLink fallback="/dashboard" />
        <h1 className="text-2xl font-semibold text-[var(--school-teal-dark)]">برنامه امتحانات {ACADEMIC_YEAR}</h1>
        <ExamsClient />
      </main>
    </div>
  );
}
