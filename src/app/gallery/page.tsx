import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { BackLink } from "@/components/back-link";

export default async function GalleryPage() {
  const items = await db.select().from(galleryItems);
  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <BackLink />
        <h1 className="mb-4 h-display text-[var(--school-teal-dark)]">آلبوم</h1>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">آلبوم خالی است.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {items.map((g) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={g.id} src={g.imageUrl} alt={g.title ?? ""} className="h-44 w-full rounded-2xl object-cover" />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
