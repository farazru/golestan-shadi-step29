"use client";

import { useEffect, useState } from "react";

type Note = {
  id: number;
  note: string;
  kind: string;
  createdAt: string;
  actorFirstName: string | null;
  actorLastName: string | null;
};

const KIND_LABELS: Record<string, string> = {
  note: "یادداشت",
  warning: "تذکر",
  serious: "تذکر جدی",
};

export function DisciplineWidget({ studentId }: { studentId: string }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    fetch(`/api/discipline?studentId=${studentId}`)
      .then((r) => r.json())
      .then((d) => setNotes(d.items ?? []))
      .catch(() => setNotes([]));
  }

  useEffect(refresh, [studentId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/discipline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, note: form.get("note"), kind: form.get("kind") }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "ثبت تذکر انجام نشد.");
      return;
    }
    e.currentTarget.reset();
    refresh();
  }

  return (
    <div className="mt-2 rounded-lg bg-amber-50 p-3">
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <select name="kind" defaultValue="note" className="rounded-md border border-amber-200 px-2 py-1 text-xs">
            <option value="note">یادداشت</option>
            <option value="warning">تذکر</option>
            <option value="serious">تذکر جدی</option>
          </select>
          <input
            name="note"
            required
            placeholder="متن تذکر یا یادداشت"
            className="flex-1 rounded-md border border-amber-200 px-2 py-1 text-xs"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-amber-700 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
          >
            {pending ? "…" : "ثبت"}
          </button>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </form>

      <ul className="mt-3 flex flex-col gap-1">
        {notes === null ? (
          <li className="text-xs text-amber-800/60">در حال بارگذاری…</li>
        ) : notes.length === 0 ? (
          <li className="text-xs text-amber-800/60">پرونده‌ای ثبت نشده.</li>
        ) : (
          notes.map((n) => (
            <li key={n.id} className="rounded-md bg-white px-2 py-1 text-xs">
              <span className="font-medium">{KIND_LABELS[n.kind] ?? n.kind}:</span> {n.note}
              <span className="mr-1 text-amber-700/60">
                — {n.actorFirstName} {n.actorLastName}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// For manager/deputy: search any student by کد ملی, then show their file.
export function DisciplineLookup() {
  const [idNumber, setIdNumber] = useState("");
  const [student, setStudent] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setStudent(null);
    const res = await fetch(`/api/students/lookup?idNumber=${encodeURIComponent(idNumber)}`);
    setPending(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "پیدا نشد.");
      return;
    }
    setStudent(data.student);
  }

  return (
    <div className="rounded-xl border border-teal-100 p-4">
      <p className="text-sm font-medium">دفتر انضباطی — جست‌وجوی دانش‌آموز</p>
      <form onSubmit={search} className="mt-3 flex gap-2">
        <input
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          placeholder="کد ملی دانش‌آموز"
          className="flex-1 rounded-md border border-teal-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "…" : "جست‌وجو"}
        </button>
      </form>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      {student ? (
        <div className="mt-3">
          <p className="text-sm font-medium">
            {student.firstName} {student.lastName}
          </p>
          <DisciplineWidget studentId={student.id} />
        </div>
      ) : null}
    </div>
  );
}
