"use client";

import { useEffect, useRef, useState } from "react";
import { useDataChannel } from "@livekit/components-react";

type Msg = { id: number; body: string; firstName: string; lastName: string; role: string };

const TOPIC = "class-chat";

export function ClassChat({ courseId }: { courseId: number }) {
  const [rows, setRows] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set<number>());

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/class-chat?courseId=${courseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const messages: Msg[] = data.messages ?? [];
        messages.forEach((m) => seenIds.current.add(m.id));
        setRows(messages);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const { send } = useDataChannel(TOPIC, (msg) => {
    try {
      const text = new TextDecoder().decode(msg.payload);
      const parsed = JSON.parse(text) as Msg;
      if (seenIds.current.has(parsed.id)) return;
      seenIds.current.add(parsed.id);
      setRows((prev) => [...prev, parsed]);
    } catch {
      /* ignore malformed packets */
    }
  });

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [rows.length]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const body = text;
    setText("");

    // Persist first so we get the real database id (used for dedup),
    // then broadcast that exact saved message over the data channel so
    // everyone currently connected sees it immediately.
    const res = await fetch("/api/class-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, body }),
    });
    const data = await res.json().catch(() => null);
    if (data?.message) {
      seenIds.current.add(data.message.id);
      setRows((prev) => [...prev, data.message]);
      const bytes = new TextEncoder().encode(JSON.stringify(data.message));
      void send(bytes, { reliable: true, topic: TOPIC });
    }
  }

  return (
    <aside dir="rtl" className="flex h-full min-h-0 w-72 flex-col border-s border-teal-100 bg-white text-teal-950">
      <p className="border-b px-3 py-2 text-sm font-semibold">گفتگوی کلاس</p>
      <div ref={box} className="min-h-0 flex-1 overflow-y-auto px-3 py-2 text-sm">
        {rows.map((m) => (
          <p key={m.id} className="mb-2 leading-6">
            <span className="font-medium">{m.firstName}:</span> {m.body}
          </p>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-1 border-t p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="field flex-1 rounded-lg px-2 py-1 text-sm"
          placeholder="پیام به فارسی…"
          lang="fa"
        />
        <button className="btn-primary rounded-lg px-2 text-xs">ارسال</button>
      </form>
    </aside>
  );
}
