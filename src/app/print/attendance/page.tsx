import { desc } from "drizzle-orm";
import { db } from "@/db";
import { attendance, user, classSessions, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatJalali } from "@/lib/jalali";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { BackLink } from "@/components/back-link";

export default async function PrintAttendance() {
  const session = await getSession();
  if (!session || (session.user.role !== "manager" && session.user.role !== "teacher")) redirect("/dashboard");
  const rows = await db
    .select({
      status: attendance.status,
      recordedAt: attendance.recordedAt,
      firstName: user.firstName,
      lastName: user.lastName,
      courseName: courses.name,
    })
    .from(attendance)
    .innerJoin(user, eq(attendance.studentId, user.id))
    .innerJoin(classSessions, eq(attendance.classSessionId, classSessions.id))
    .innerJoin(courses, eq(classSessions.courseId, courses.id))
    .orderBy(desc(attendance.recordedAt));

  return (
    <main className="bg-white p-8 text-black" dir="rtl">
      <div className="print:hidden">
        <BackLink fallback="/dashboard" />
      </div>
      <h1 className="text-2xl font-bold">گزارش حضور و غیاب</h1>
      <p className="mb-4 text-sm">چاپ از سامانه مدرسه</p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2">دانش‌آموز</th>
            <th className="border p-2">دوره</th>
            <th className="border p-2">وضعیت</th>
            <th className="border p-2">تاریخ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border p-2">{r.firstName} {r.lastName}</td>
              <td className="border p-2">{r.courseName}</td>
              <td className="border p-2">{r.status === "present" ? "حاضر" : r.status === "late" ? "تأخیر" : "غایب"}</td>
              <td className="border p-2">{formatJalali(r.recordedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <script dangerouslySetInnerHTML={{ __html: "window.print()" }} />
    </main>
  );
}
