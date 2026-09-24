// This file defines every table in our database.
// Think of each `sqliteTable(...)` block below as one spreadsheet,
// and each field inside it as one column in that spreadsheet.
//
// Auth tables (user, session, account, verification) follow Better Auth's
// required shape. School tables (courses, enrollments, etc.) stay ours.

import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// USER — Better Auth's account record (student / teacher / manager)
// id is a string (not an auto-increment number) because Better Auth issues
// its own IDs. The real password is NEVER stored here.
// ---------------------------------------------------------------------------
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  // School role — lives on the user so every session can carry it.
  role: text("role", { enum: ["student", "teacher", "manager", "parent", "deputy"] })
    .default("student")
    .notNull(),
  // Login identity — people log in with an ID Number, not an email.
  // "username" here IS the ID Number. "email" above still exists only
  // because Better Auth requires it internally; it's a hidden placeholder
  // like "10432@school.internal" that nobody ever sees or types.
  username: text("username").unique(),
  displayUsername: text("display_username"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  // Only meaningful for students — which grade they're in (e.g. "دهم").
  // Filters which courses they can see/enroll in. Set by a teacher/manager.
  grade: text("grade"),
});

// ---------------------------------------------------------------------------
// SESSION — a database-backed "ticket" that says this browser is logged in.
// Unlike a JWT, we can delete this row and the user is logged out immediately
// (for example if a student is suspended).
// ---------------------------------------------------------------------------
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// ---------------------------------------------------------------------------
// ACCOUNT — how this user can log in.
// For email/password, Better Auth stores the HASHED password in `password`.
// Later, Google/GitHub logins would get their own rows here too.
// ---------------------------------------------------------------------------
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp_ms",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp_ms",
  }),
  scope: text("scope"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

// ---------------------------------------------------------------------------
// VERIFICATION — short-lived codes for email verify / password reset.
// ---------------------------------------------------------------------------
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

// ---------------------------------------------------------------------------
// STAFF INVITES — a one-time code that promotes a student to teacher/manager.
// A manager (or the first-time seed script) creates a code; whoever redeems
// it during/after signup gets that role, and the code is marked used.
// ---------------------------------------------------------------------------
export const staffInvites = sqliteTable("staff_invites", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  role: text("role", { enum: ["teacher", "manager", "deputy"] }).notNull(),
  createdByUserId: text("created_by_user_id").references(() => user.id),
  used: integer("used", { mode: "boolean" }).default(false).notNull(),
  usedByUserId: text("used_by_user_id").references(() => user.id),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
  usedAt: text("used_at"),
});

// ---------------------------------------------------------------------------
// STUDENT PROFILES — extra info about a child that isn't part of login:
// date of birth, address, and separate mother/father contact details.
// One row per student. Filled in/edited by a teacher or manager, since
// students (children) don't fill this in themselves.
// ---------------------------------------------------------------------------
export const studentProfiles = sqliteTable("student_profiles", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().unique().references(() => user.id),
  dateOfBirth: text("date_of_birth"), // stored as YYYY-MM-DD
  address: text("address"),
  studentPhone: text("student_phone"),
  fatherName: text("father_name"),
  fatherPhone: text("father_phone"),
  motherName: text("mother_name"),
  motherPhone: text("mother_phone"),
  notes: text("notes"),
  complete: integer("complete", { mode: "boolean" }).default(false).notNull(),
  updatedAt: text("updated_at").default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// COURSES — a class subject, run by one teacher
// ---------------------------------------------------------------------------
export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  // Grade level this course belongs to (e.g. "دهم", "پایه هفتم").
  // Only the teacher who made it and students in the same grade see it.
  grade: text("grade").notNull(),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => user.id),
  meetingUrl: text("meeting_url"),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// ENROLLMENTS — which students are signed up for which courses
// ---------------------------------------------------------------------------
export const enrollments = sqliteTable(
  "enrollments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studentId: text("student_id")
      .notNull()
      .references(() => user.id),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    enrolledAt: text("enrolled_at").default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("enrollments_student_course_uniq").on(table.studentId, table.courseId),
  ],
);

// ---------------------------------------------------------------------------
// CLASS SESSIONS — one specific live meeting of a course
// ---------------------------------------------------------------------------
export const classSessions = sqliteTable("class_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  scheduledAt: text("scheduled_at").notNull(),
  roomId: text("room_id").notNull().unique(),
  status: text("status", { enum: ["scheduled", "live", "ended"] })
    .default("scheduled")
    .notNull(),
  whiteboardJson: text("whiteboard_json"),
  recording: integer("recording", { mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// ATTENDANCE — one present/absent record for one student, one class session
// ---------------------------------------------------------------------------
export const attendance = sqliteTable(
  "attendance",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    classSessionId: integer("class_session_id")
      .notNull()
      .references(() => classSessions.id),
    studentId: text("student_id")
      .notNull()
      .references(() => user.id),
    status: text("status", { enum: ["present", "absent", "late"] }).notNull(),
    recordedAt: text("recorded_at").default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("attendance_session_student").on(table.classSessionId, table.studentId)],
);

// ---------------------------------------------------------------------------
// MESSAGES — announcements sent by a teacher/manager
// If courseId is empty, it's a school-wide announcement.
// ---------------------------------------------------------------------------
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id),
  courseId: integer("course_id").references(() => courses.id),
  title: text("title"),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const parentLinks = sqliteTable(
  "parent_links",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id")
      .notNull()
      .references(() => user.id),
    studentId: text("student_id")
      .notNull()
      .references(() => user.id),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .default("pending")
      .notNull(),
  },
  (table) => [uniqueIndex("parent_student_uniq").on(table.parentId, table.studentId)],
);

export const schoolSettings = sqliteTable("school_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const studentCodes = sqliteTable("student_codes", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  grade: text("grade"),
  used: integer("used", { mode: "boolean" }).default(false).notNull(),
  usedByUserId: text("used_by_user_id").references(() => user.id),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const assignments = sqliteTable("assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  title: text("title").notNull(),
  instructions: text("instructions"),
  dueAt: text("due_at"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assignmentId: integer("assignment_id")
    .notNull()
    .references(() => assignments.id),
  studentId: text("student_id")
    .notNull()
    .references(() => user.id),
  note: text("note"),
  fileName: text("file_name"),
  fileUrl: text("file_url"),
  submittedAt: text("submitted_at").default(sql`(current_timestamp)`),
});

export const grades = sqliteTable("grades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  studentId: text("student_id")
    .notNull()
    .references(() => user.id),
  kind: text("kind", { enum: ["continuous", "midterm", "final"] }).notNull(),
  score: text("score").notNull(),
  note: text("note"),
  recordedBy: text("recorded_by").notNull(),
  recordedAt: text("recorded_at").default(sql`(current_timestamp)`),
});

export const timetableSlots = sqliteTable("timetable_slots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  weekday: integer("weekday").notNull(),
  period: integer("period").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  detail: text("detail"),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const discipline = sqliteTable("discipline", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: text("student_id").notNull().references(() => user.id),
  actorId: text("actor_id").notNull(),
  note: text("note").notNull(),
  kind: text("kind").default("warning").notNull(),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const calendarEvents = sqliteTable("calendar_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  day: text("day").notNull(),
  kind: text("kind").default("event").notNull(),
});

export const exams = sqliteTable("exams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").references(() => courses.id),
  title: text("title").notNull(),
  day: text("day").notNull(),
  note: text("note"),
});

export const galleryItems = sqliteTable("gallery_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  imageUrl: text("image_url").notNull(),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const publicNews = sqliteTable("public_news", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body"),
  link: text("link"),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const classChat = sqliteTable("class_chat", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id),
  userId: text("user_id").notNull().references(() => user.id),
  body: text("body").notNull(),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const preregister = sqliteTable("preregister", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  childName: text("child_name").notNull(),
  parentName: text("parent_name"),
  phone: text("phone").notNull(),
  grade: text("grade"),
  note: text("note"),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const languageLeads = sqliteTable("language_leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  note: text("note"),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const tuitionAccounts = sqliteTable("tuition_accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: text("student_id").references(() => user.id),
  fullName: text("full_name").notNull(),
  classGroup: text("class_group").notNull(),
  feeToman: integer("fee_toman").notNull(),
  note: text("note"),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const tuitionPayments = sqliteTable(
  "tuition_payments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accountId: integer("account_id")
      .notNull()
      .references(() => tuitionAccounts.id),
    monthKey: text("month_key").notNull(),
    amountToman: integer("amount_toman").notNull(),
    receipt: text("receipt"),
    createdAt: text("created_at").default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("tuition_pay_month_uniq").on(table.accountId, table.monthKey)],
);

export const reportCards = sqliteTable("report_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: text("student_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

