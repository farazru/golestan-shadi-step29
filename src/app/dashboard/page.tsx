import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, classSessions, user, staffInvites, parentLinks } from "@/db/schema";
import { getSession } from "@/lib/get-session";
import { SignOutButton } from "./sign-out-button";
import { EnrollButton } from "./enroll-button";
import { CreateInviteForm } from "./create-invite-form";
import { CreateCourseForm } from "./create-course-form";
import { UnenrolledStudentsPanel } from "./unenrolled-students-panel";
import { AnnouncementsPanel } from "./announcements-panel";
import { TeacherAttendancePanel, ManagerAttendancePanel } from "./attendance-panel";
import { OfficePanel, HomeworkPanel, GradesPanel, AvatarPicker } from "./office-panel";
import { IncompletePanel, ProfileBanner } from "./incomplete-panel";
import { ContentManagementPanel } from "./content-management-panel";
import { RosterItem } from "./roster-item";
import { DisciplineLookup } from "./discipline-panel";
import { TimeGreeting } from "@/components/time-greeting";
import { KarnamehPanel } from "./karnameh-panel";
import { ParentLinksPanel } from "./parent-links-panel";
import { AlocomLinkForm } from "./alocom-link-form";
import { ClassJoin } from "@/components/class-join";

const roleLabel: Record<string, string> = {
  student: "دانش‌آموز",
  teacher: "معلم",
  manager: "مدیر",
  parent: "ولی",
  deputy: "معاون",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { user: me } = session;

  return (
    <>
    <SiteHeader />
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
      <div className="school-card flex items-center justify-between rounded-3xl p-5">
        <div>
          <p className="role-pill w-fit">{roleLabel[me.role] ?? me.role}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {me.firstName} {me.lastName}
          </h1>
          <TimeGreeting name={me.firstName} />
        </div>
        <SignOutButton />
      </div>

      {me.role === "student" ? <StudentView studentId={me.id} grade={me.grade ?? null} /> : null}
      {me.role === "teacher" ? <TeacherView teacherId={me.id} /> : null}
      {me.role === "manager" ? <ManagerView /> : null}
      {me.role === "parent" ? <ParentView parentId={me.id} /> : null}
      {me.role === "deputy" ? <DeputyView /> : null}

      <p className="rounded-2xl border border-[#D9E7E5] bg-white px-4 py-3 text-sm leading-7">
        کلاس زنده با <strong>الوکام</strong> است. معلم لینک اتاق را می‌گذارد؛ دانش‌آموز «ورود به کلاس الوکام» را می‌زند.
      </p>
      <Link href="/" className="text-sm text-teal-800/60 underline">
        صفحه اصلی
      </Link>
    </main>
    </>
  );
}

// ---------------------------------------------------------------------------
// STUDENT
// ---------------------------------------------------------------------------
async function StudentView({
  studentId,
  grade,
  parentMode = false,
}: {
  studentId: string;
  grade: string | null;
  parentMode?: boolean;
}) {
  const allCoursesRaw = await db
    .select({
      id: courses.id,
      name: courses.name,
      description: courses.description,
      grade: courses.grade,
      teacherFirstName: user.firstName,
      teacherLastName: user.lastName,
    })
    .from(courses)
    .leftJoin(user, eq(courses.teacherId, user.id));

  // Only show courses matching the student's own grade. If their grade
  // hasn't been set yet by staff, show everything with a note instead of
  // hiding all courses (better than an empty screen for a new student).
  const allCourses = grade ? allCoursesRaw.filter((c) => c.grade === grade) : allCoursesRaw;

  const myEnrollments = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.studentId, studentId));
  const enrolledIds = new Set(myEnrollments.map((e) => e.courseId));

  const myCourseSessionsRaw = await db
    .select({
      courseId: courses.id,
      courseName: courses.name,
      meetingUrl: courses.meetingUrl,
      roomId: classSessions.roomId,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(classSessions, eq(classSessions.courseId, courses.id))
    .where(eq(enrollments.studentId, studentId));
  const seen = new Set<number>();
  const myCourseSessions = myCourseSessionsRaw.filter((s) => {
    if (seen.has(s.courseId)) return false;
    seen.add(s.courseId);
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      <ProfileBanner />
      {parentMode ? null : (
        <>
          <p className="text-sm">
            <a href="/profile" className="underline">
              تکمیل / به‌روزرسانی پرونده و عکس
            </a>
          </p>
          <AvatarPicker />
        </>
      )}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <a href="#class-today" className="school-card-mint rounded-2xl p-4 font-extrabold">
          کلاس امروز
        </a>
        <a href="#homework" className="school-card-sun rounded-2xl p-4 font-extrabold">
          تکالیف
        </a>
        <a href="#news" className="school-card rounded-2xl p-4 font-extrabold">
          اطلاعیه‌ها
        </a>
        <a href="#attend" className="school-card rounded-2xl p-4 font-extrabold">
          حضور
        </a>
        <a href="/calendar" className="school-card rounded-2xl p-4 font-medium">
          تقویم
        </a>
        <a href="/exams" className="school-card rounded-2xl p-4 font-medium">
          امتحانات
        </a>
        <a href="/card" className="school-card rounded-2xl p-4 font-medium">
          کارت دانش‌آموزی
        </a>
        <a href="/tuition" className="school-card rounded-2xl p-4 font-medium">
          وضعیت شهریه (تومان)
        </a>
        <a href="#karnameh" className="school-card rounded-2xl p-4 font-medium">
          کارنامه
        </a>
      </div>
      <div id="news">
      <AnnouncementsPanel canSend={false} canSendSchoolWide={false} courses={[]} />
      </div>
      <section id="class-today" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">دوره‌های من</h2>

        {myCourseSessions.length === 0 ? (
          <p className="empty">هنوز دوره‌ای نیست — از معلم یا مدیر بخواهید شما را ثبت‌نام کنند.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {myCourseSessions.map((s) => (
              <li
                key={s.courseId}
                className="flex items-center justify-between rounded-lg border border-[#D9E7E5] p-3 text-sm"
              >
                <span>{s.courseName}</span>
                {parentMode ? <span className="empty">کلاس زنده برای ولی نیست</span> : <ClassJoin meetingUrl={s.meetingUrl} roomId={s.roomId} />}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section id="attend" className="school-card">
        <h2 className="text-lg font-semibold">حضور</h2>
        <p className="empty">حضور را معلم در کلاس می‌زند. نتیجه برای شما و دفتر اینجا جمع می‌شود.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">مشاهده دوره‌ها {grade ? `(پایه ${grade})` : ""}</h2>
        {!grade ? (
          <p className="text-sm text-teal-800/60">
            پایه تحصیلی شما هنوز مشخص نشده — همه دوره‌ها نمایش داده می‌شود. لطفاً با معلم یا مدیر
            هماهنگ کنید.
          </p>
        ) : null}
        <ul className="flex flex-col gap-2">
          {allCourses.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-teal-100 p-3 text-sm "
            >
              <div>
                <p className="font-medium">
                  {c.name} {c.grade ? <span className="text-xs text-teal-700/50">({c.grade})</span> : null}
                </p>
                <p className="text-teal-800/60">
                  {c.teacherFirstName} {c.teacherLastName}
                  {c.description ? ` · ${c.description}` : ""}
                </p>
              </div>
              {enrolledIds.has(c.id) ? (
                <span className="text-xs text-muted">ثبت‌نام شده</span>
              ) : parentMode ? null : (
                <EnrollButton courseId={c.id} />
              )}
            </li>
          ))}
        </ul>
      </section>
      <div id="homework">
        <HomeworkPanel canCreate={false} courses={allCourses.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
      <GradesPanel canEdit={false} courses={[]} students={[]} />
      <div id="karnameh">
        <KarnamehPanel studentId={studentId} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TEACHER
// ---------------------------------------------------------------------------
async function TeacherView({ teacherId }: { teacherId: string }) {
  const myCourses = await db.select().from(courses).where(eq(courses.teacherId, teacherId));

  const rosterByCourse: Record<number, { id: string; firstName: string; lastName: string }[]> = {};
  const sessionByCourse: Record<number, { roomId: string; sessionId: number }> = {};

  for (const course of myCourses) {
    const roster = await db
      .select({ id: user.id, firstName: user.firstName, lastName: user.lastName })
      .from(enrollments)
      .innerJoin(user, eq(enrollments.studentId, user.id))
      .where(eq(enrollments.courseId, course.id));
    rosterByCourse[course.id] = roster;

    const [firstSession] = await db
      .select({ roomId: classSessions.roomId, id: classSessions.id })
      .from(classSessions)
      .where(eq(classSessions.courseId, course.id));
    if (firstSession) sessionByCourse[course.id] = { roomId: firstSession.roomId, sessionId: firstSession.id };
  }

  const allCoursesForPanel = myCourses.map((c) => ({ id: c.id, name: c.name, grade: c.grade }));
  const attendanceCourses = myCourses.map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    sessionId: sessionByCourse[c.id]?.sessionId ?? null,
    roster: rosterByCourse[c.id] ?? [],
  }));

  return (
    <div className="flex flex-col gap-8">
      <p className="empty">امروز: حضور را بزنید، تکالیف را نمره دهید، بعد دوره بسازید.</p>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">دوره‌های من</h2>
        {myCourses.length === 0 ? (
          <p className="text-sm text-teal-800/60">شما هنوز دوره‌ای نساخته‌اید.</p>
        ) : (
          myCourses.map((c) => (
            <div key={c.id} className="rounded-xl border border-teal-100 p-4 ">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {c.name} <span className="text-xs text-muted">({c.grade})</span>
                </p>
                <ClassJoin meetingUrl={c.meetingUrl} roomId={sessionByCourse[c.id]?.roomId} />
              </div>
              <p className="mt-2 text-sm text-teal-800/60">
                {rosterByCourse[c.id].length} دانش‌آموز
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {rosterByCourse[c.id].map((s, i) => (
                  <RosterItem key={s.id ?? i} id={s.id} name={`${s.firstName} ${s.lastName}`} />
                ))}
              </ul>
              <AlocomLinkForm courseId={c.id} initial={c.meetingUrl ?? null} />
            </div>
          ))
        )}
      </section>

      <TeacherAttendancePanel courses={attendanceCourses} />
      <HomeworkPanel canCreate courses={allCoursesForPanel} />
      <GradesPanel
        canEdit
        courses={allCoursesForPanel}
        students={Object.values(rosterByCourse).flat()}
      />
      <AnnouncementsPanel canSend canSendSchoolWide={false} courses={allCoursesForPanel} />
      <UnenrolledStudentsPanel courses={allCoursesForPanel} />
      <CreateCourseForm role="teacher" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// MANAGER
// ---------------------------------------------------------------------------
async function ManagerView() {
  const allCourses = await db.select().from(courses);
  const invites = await db.select().from(staffInvites).orderBy(staffInvites.createdAt);
  const allCoursesForPanel = allCourses.map((c) => ({ id: c.id, name: c.name, grade: c.grade }));
  const sessions = await db.select().from(classSessions);
  const sessionByCourse: Record<number, string> = {};
  for (const s of sessions) {
    if (!sessionByCourse[s.courseId]) sessionByCourse[s.courseId] = s.roomId;
  }
  const students = await db
    .select({ id: user.id, firstName: user.firstName, lastName: user.lastName })
    .from(user)
    .where(eq(user.role, "student"));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="school-card p-4">دوره‌ها: {allCourses.length}</div>
        <div className="school-card p-4">دانش‌آموزان: {students.length}</div>
      </div>
      <KarnamehPanel canUpload students={students} />
      <CreateInviteForm />

      <CreateCourseForm role="manager" />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">همه دوره‌ها ({allCourses.length})</h2>
        <ul className="flex flex-col gap-2">
          {allCourses.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg border border-teal-100 p-3 text-sm ">
              <span>
                {c.name} <span className="text-xs text-muted">({c.grade})</span>
              </span>
              <ClassJoin meetingUrl={c.meetingUrl} roomId={sessionByCourse[c.id]} />
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">کدهای دعوت</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {invites.map((i) => (
            <li key={i.id} className="flex justify-between rounded-lg border border-teal-100 p-3 ">
              <span className="font-mono">{i.code}</span>
              <span>{{ teacher: "معلم", manager: "مدیر", deputy: "معاون" }[i.role] ?? i.role}</span>
              <span>{i.used ? "استفاده شده" : "استفاده نشده"}</span>
            </li>
          ))}
        </ul>
      </section>

      <ManagerAttendancePanel />
      <IncompletePanel />
      <OfficePanel />
      <HomeworkPanel canCreate courses={allCoursesForPanel} />
      <AnnouncementsPanel canSend canSendSchoolWide courses={allCoursesForPanel} />
      <UnenrolledStudentsPanel courses={allCoursesForPanel} />
      <DisciplineLookup />
      <ParentLinksPanel />
      <ContentManagementPanel />
      <p className="text-sm">
        <Link href="/print/attendance" className="underline">چاپ حضور و غیاب</Link>
        {" · "}
        <Link href="/print/roster" className="underline">چاپ لیست کلاس</Link>
      </p>
    </div>
  );
}

async function ParentView({ parentId }: { parentId: string }) {
  const links = await db
    .select()
    .from(parentLinks)
    .where(and(eq(parentLinks.parentId, parentId), eq(parentLinks.status, "approved")));
  const child = links[0];
  if (!child) {
    return (
      <p className="empty">هنوز فرزندی تأیید نشده. کد ملی دانش‌آموز را به دفتر بدهید.</p>
    );
  }
  const stu = await db.query.user.findFirst({ where: eq(user.id, child.studentId) });
  return (
    <div className="flex flex-col gap-6">
      <p className="empty">نمای دانش‌آموز برای فرزند تأییدشده. کلاس زنده برای ولی باز نیست.</p>
      <StudentView studentId={child.studentId} grade={stu?.grade ?? null} parentMode />
    </div>
  );
}

async function DeputyView() {
  const students = await db
    .select({ id: user.id, firstName: user.firstName, lastName: user.lastName })
    .from(user)
    .where(eq(user.role, "student"));
  return (
    <div className="flex flex-col gap-8">
      <p className="empty">پنل معاون: حضور و غیاب، پرونده ناقص، کارنامه، پیوند ولی.</p>
      <IncompletePanel />
      <ManagerAttendancePanel />
      <KarnamehPanel canUpload students={students} />
      <AnnouncementsPanel canSend canSendSchoolWide courses={[]} />
      <DisciplineLookup />
      <ParentLinksPanel />
      <p className="text-sm">
        <Link href="/print/attendance" className="underline">چاپ حضور و غیاب</Link>
      </p>
    </div>
  );
}
