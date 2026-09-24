"use client";

import { useState } from "react";
import { DisciplineWidget } from "./discipline-panel";

export function RosterItem({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-amber-100 px-3 py-1 text-xs hover:bg-amber-200"
      >
        {name}
      </button>
      {open ? <DisciplineWidget studentId={id} /> : null}
    </li>
  );
}
