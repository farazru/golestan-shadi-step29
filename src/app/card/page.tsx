import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { ACADEMIC_YEAR } from "@/lib/year";
import { BackLink } from "@/components/back-link";

export default async function CardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const me = session.user;
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <BackLink fallback="/dashboard" />
      <div className="rounded-3xl bg-[var(--school-teal)] p-6 text-center text-white shadow-lg">
        <p className="text-xs">کارت دانش‌آموزی · {ACADEMIC_YEAR}</p>
        <p className="mt-4 text-2xl font-semibold">{me.firstName} {me.lastName}</p>
        <p className="mt-1 text-sm">{me.grade ?? "پایه هنوز ثبت نشده"}</p>
        <p className="mt-6 font-mono text-sm">{me.username}</p>
      </div>
    </main>
  );
}
