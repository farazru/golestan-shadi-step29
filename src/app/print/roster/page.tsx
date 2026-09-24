import { db } from "@/db";
import { courses, enrollments, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { BackLink } from "@/components/back-link";

export default async function PrintRoster() {
  const session = await getSession();
  if (!session || (session.user.role !== "manager" && session.user.role !== "teacher")) redirect("/dashboard");
  const rows = await db
    .select({
      courseName: courses.name,
      grade: courses.grade,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(user, eq(enrollments.studentId, user.id));

  return (
    <main className="bg-white p-8 text-black" dir="rtl">
      <div className="print:hidden">
        <BackLink fallback="/dashboard" />
      </div>
      <h1 className="text-2xl font-bold">لیست کلاس‌ها</h1>
      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2">دوره</th>
            <th className="border p-2">پایه</th>
            <th className="border p-2">دانش‌آموز</th>
            <th className="border p-2">کد ملی</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border p-2">{r.courseName}</td>
              <td className="border p-2">{r.grade}</td>
              <td className="border p-2">{r.firstName} {r.lastName}</td>
              <td className="border p-2">{r.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <script dangerouslySetInnerHTML={{ __html: "window.print()" }} />
    </main>
  );
}
