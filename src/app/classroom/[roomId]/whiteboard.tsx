"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useDataChannel } from "@livekit/components-react";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false },
);

const TOPIC = "whiteboard";

type Api = {
  updateScene: (opts: { elements: unknown[] }) => void;
  getSceneElements: () => unknown[];
};

export function SharedWhiteboard({ roomId }: { roomId: string }) {
  const apiRef = useRef<Api | null>(null);
  const applyingRemote = useRef(false);
  const lastSent = useRef("");
  const [ready] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { send } = useDataChannel(TOPIC, (msg) => {
    try {
      const text = new TextDecoder().decode(msg.payload);
      if (text === lastSent.current) return;
      const parsed = JSON.parse(text) as { elements?: unknown[] };
      if (!parsed.elements || !apiRef.current) return;
      applyingRemote.current = true;
      apiRef.current.updateScene({ elements: parsed.elements });
      queueMicrotask(() => {
        applyingRemote.current = false;
      });
    } catch {
      // ignore malformed packets
    }
  });

  const broadcast = useCallback(
    (elements: unknown[]) => {
      if (applyingRemote.current) return;
      const payload = JSON.stringify({ elements });
      if (payload === lastSent.current) return;
      if (payload.length > 60_000) return; // skip oversized scenes
      lastSent.current = payload;
      const bytes = new TextEncoder().encode(payload);
      void send(bytes, { reliable: true, topic: TOPIC });
    },
    [send],
  );

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChange = useCallback(
    (elements: unknown[]) => {
      if (applyingRemote.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => broadcast(elements), 350);

      // Separately, persist to the database every few seconds so the
      // board survives everyone leaving and coming back later — this is
      // a slower/rarer save than the near-instant live broadcast above.
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const payload = JSON.stringify({ elements });
        if (payload.length > 500_000) return; // safety cap on stored size
        fetch("/api/whiteboard", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, whiteboardJson: payload }),
        }).catch(() => {});
      }, 3000);
    },
    [broadcast, roomId],
  );

  // On mount: load whatever was last saved for this room and restore it.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/whiteboard?roomId=${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.whiteboardJson || !apiRef.current) return;
        try {
          const parsed = JSON.parse(data.whiteboardJson) as { elements?: unknown[] };
          if (parsed.elements) {
            applyingRemote.current = true;
            apiRef.current.updateScene({ elements: parsed.elements });
            queueMicrotask(() => {
              applyingRemote.current = false;
            });
          }
        } catch {
          // ignore malformed saved data
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [roomId, ready]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!ready) {
    return <p className="p-4 text-sm text-teal-800/60">در حال بارگذاری تخته…</p>;
  }

  return (
    <div className="h-full min-h-[320px] w-full overflow-hidden rounded-2xl border border-teal-100 bg-[#fffdf8] shadow-sm">
      <Excalidraw
        langCode="en"
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
        onChange={(elements) => onChange(elements as unknown[])}
        excalidrawAPI={(api) => {
          apiRef.current = api as unknown as Api;
        }}
      />
    </div>
  );
}
