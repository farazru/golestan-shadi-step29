"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CommentForm({ postId }: { postId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/parenting/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        authorName: form.get("authorName"),
        body: form.get("body"),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "ارسال نشد.");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
      <input name="authorName" required placeholder="نام شما" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      <textarea name="body" required placeholder="نظر شما" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      <button type="submit" disabled={pending} className="self-start rounded-full bg-teal-700 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-60">
        {pending ? "…" : "ارسال نظر"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
