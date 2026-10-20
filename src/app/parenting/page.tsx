import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { db } from "@/db";
import { parentingPosts, parentingComments } from "@/db/schema";
import { desc } from "drizzle-orm";
import { pageMeta } from "@/lib/seo";
import { CommentForm } from "./comment-form";

export const metadata = pageMeta({
  title: "تربیت و روان‌شناسی کودک",
  description: "نکته‌های تربیتی و روان‌شناسی برای والدین گلستان شادی.",
  path: "/parenting",
});

export default async function ParentingPage() {
  const posts = await db.select().from(parentingPosts).orderBy(desc(parentingPosts.createdAt));
  const comments = await db.select().from(parentingComments).orderBy(desc(parentingComments.createdAt));
  const byPost = new Map<number, typeof comments>();
  for (const c of comments) {
    const list = byPost.get(c.postId) ?? [];
    list.push(c);
    byPost.set(c.postId, list);
  }

  return (
    <div className="school-hero-bg flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <BackLink />
        <h1 className="text-2xl font-semibold text-[#0f5c4c]">تربیت و روان‌شناسی کودک</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          نکته‌هایی که مدیر و معاون برای والدین می‌نویسند. می‌توانید نظر بگذارید.
        </p>
        <ul className="mt-6 flex flex-col gap-4">
          {posts.length === 0 ? (
            <li className="school-card rounded-2xl p-4 text-sm text-slate-500">هنوز مطلبی نیست.</li>
          ) : (
            posts.map((p) => {
              const list = byPost.get(p.id) ?? [];
              return (
                <li key={p.id} className="school-card rounded-2xl p-4">
                  <h2 className="font-medium">{p.title}</h2>
                  <p className="mt-2 text-sm leading-7 whitespace-pre-wrap">{p.body}</p>
                  {p.imageUrl ? (
                    // External manager-provided URL; next/image would require a remotePatterns allowlist.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="mt-3 max-h-64 w-full rounded-xl object-cover" />
                  ) : null}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">نظرها ({list.length})</p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {list.map((c) => (
                        <li key={c.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                          <span className="font-medium">{c.authorName}:</span> {c.body}
                        </li>
                      ))}
                    </ul>
                    <CommentForm postId={p.id} />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
