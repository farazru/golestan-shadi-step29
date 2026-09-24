import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { ACADEMIC_YEAR } from "@/lib/year";
import { CalendarBoard } from "./calendar-board";

export default async function CalendarPage() {
  const events = await db.select().from(calendarEvents);
  const session = await getSession();
  const canManage = session?.user.role === "manager" || session?.user.role === "deputy";

  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <BackLink />
        <h1 className="h-display text-[var(--school-teal-dark)]">تقویم {ACADEMIC_YEAR}</h1>
        <p className="mt-2 text-sm">سال تحصیلی مهر تا خرداد. روزهای رنگی رویداد دفتر هستند.</p>
        <div className="mt-6">
          <CalendarBoard initial={events} canManage={!!canManage} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
