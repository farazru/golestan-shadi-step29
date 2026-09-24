// Run this AFTER you've already run seed-first-manager-invite.ts at least
// once (the database needs to exist). This creates ready-to-use demo
// data so you can test the site in a real browser — no curl needed:
// one teacher, one course per elementary grade (اول تا ششم ابتدایی) with
// real subject names, and one demo student enrolled in the اول ابتدایی course.
//
//   npx tsx scripts/seed-demo-classroom.ts

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "../src/lib/auth";
import { db } from "../src/db";
import { user, courses, classSessions, enrollments, studentProfiles } from "../src/db/schema";

// The six elementary grades, each with a real subject name so the demo
// data actually looks like a school instead of "Test Course".
const GRADE_COURSES: { grade: string; subject: string }[] = [
  { grade: "اول ابتدایی", subject: "فارسی" },
  { grade: "دوم ابتدایی", subject: "ریاضی" },
  { grade: "سوم ابتدایی", subject: "علوم" },
  { grade: "چهارم ابتدایی", subject: "مطالعات اجتماعی" },
  { grade: "پنجم ابتدایی", subject: "قرآن" },
  { grade: "ششم ابتدایی", subject: "هدیه‌های آسمان" },
];

async function createAccount(idNumber: string, firstName: string, lastName: string, password: string) {
  const existing = await db.query.user.findFirst({ where: eq(user.username, idNumber) });
  if (existing) return existing;

  await auth.api.signUpEmail({
    body: {
      email: `${idNumber}@school.internal`,
      password,
      name: `${firstName} ${lastName}`,
      username: idNumber,
      displayUsername: idNumber,
      firstName,
      lastName,
    },
  });
  const created = await db.query.user.findFirst({ where: eq(user.username, idNumber) });
  if (!created) throw new Error(`Failed to create ${idNumber}`);
  return created;
}

async function main() {
  const teacher = await createAccount("9001", "معلم", "نمونه", "demo12345");
  await db.update(user).set({ role: "teacher" }).where(eq(user.id, teacher.id));

  const student = await createAccount("9002", "دانش‌آموز", "نمونه", "demo12345");
  // Student's own grade — determines which courses they see by default.
  await db.update(user).set({ role: "student", grade: "اول ابتدایی" }).where(eq(user.id, student.id));

  const createdCourses: { grade: string; name: string; roomId: string; courseId: number }[] = [];

  for (const { grade, subject } of GRADE_COURSES) {
    const courseName = `${subject} ${grade}`;
    let course = await db.query.courses.findFirst({ where: eq(courses.name, courseName) });
    if (!course) {
      [course] = await db
        .insert(courses)
        .values({
          name: courseName,
          description: `کلاس ${subject} برای پایه ${grade}`,
          grade,
          teacherId: teacher.id,
        })
        .returning();

      await db.insert(classSessions).values({
        courseId: course.id,
        scheduledAt: new Date().toISOString(),
        roomId: `room-${randomUUID()}`,
      });
    }
    const session = await db.query.classSessions.findFirst({ where: eq(classSessions.courseId, course.id) });
    createdCourses.push({ grade, name: courseName, roomId: session!.roomId, courseId: course.id });
  }

  // Enroll the demo student only in their own grade's course, matching
  // how the real "browse courses" filtering works for students.
  const ownGradeCourse = createdCourses.find((c) => c.grade === "اول ابتدایی")!;
  const existingEnrollment = await db.query.enrollments.findFirst({
    where: (e, { and, eq }) => and(eq(e.studentId, student.id), eq(e.courseId, ownGradeCourse.courseId)),
  });
  if (!existingEnrollment) {
    await db.insert(enrollments).values({ studentId: student.id, courseId: ownGradeCourse.courseId });
  }

  // Fill in a complete profile so the student doesn't get blocked by the
  // profile-completeness check when trying to join the class.
  const existingProfile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.studentId, student.id),
  });
  if (!existingProfile) {
    await db.insert(studentProfiles).values({
      id: randomUUID(),
      studentId: student.id,
      dateOfBirth: "2018-01-01",
      address: "تهران",
      studentPhone: "09120000000",
      fatherName: "پدر نمونه",
      fatherPhone: "09121111111",
      motherName: "مادر نمونه",
      motherPhone: "09122222222",
      complete: true,
    });
  }

  console.log("\n✅ Demo school data ready — one course per grade!\n");
  console.log("Teacher login  → ID Number: 9001   Password: demo12345");
  console.log("Student login  → ID Number: 9002   Password: demo12345  (پایه: اول ابتدایی)\n");
  console.log("Courses created:");
  for (const c of createdCourses) {
    console.log(`  ${c.name.padEnd(28)} → http://localhost:3000/classroom/${c.roomId}`);
  }
  console.log("\nThe demo student is enrolled in the اول ابتدایی course above.");
  console.log("How to test the live class:");
  console.log("1. Log in as the teacher in one browser (or normal window).");
  console.log("2. Log in as the student in another browser (or an incognito window).");
  console.log("3. Teacher: dashboard → پیدا کردن دوره → \"شروع کلاس\" to open the room.");
  console.log("4. Student: dashboard → دوره‌های من → click the class link.");
  console.log("5. Both should see/hear each other once LIVEKIT_API_KEY/SECRET/URL are set in .env.local.\n");
}

main().then(() => process.exit(0));
