import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { publicNews } from "@/db/schema";
import { desc } from "drizzle-orm";
import { BackLink } from "@/components/back-link";

export default async function NewsPage() {
  const rows = await db.select().from(publicNews).orderBy(desc(publicNews.createdAt));
  return (
    <div className="min-h-full school-hero-bg">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <BackLink fallback="/dashboard" />
        <h1 className="mb-4 text-2xl font-semibold text-[var(--school-teal-dark)]">اخبار</h1>
        <ul className="flex flex-col gap-3">
          {rows.map((n) => (
            <li key={n.id} className="school-card rounded-2xl p-4">
              <p className="font-medium">{n.title}</p>
              {n.body ? <p className="mt-1 text-sm text-slate-600">{n.body}</p> : null}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
