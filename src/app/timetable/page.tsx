import { SiteHeader } from "@/components/site-header";
import { TimetableGrid } from "./timetable-client";
import { BackLink } from "@/components/back-link";

export default function TimetablePage() {
  return (
    <div className="min-h-full school-hero-bg">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <BackLink fallback="/dashboard" />
        <TimetableGrid />
      </main>
    </div>
  );
}
