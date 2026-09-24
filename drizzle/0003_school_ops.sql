ALTER TABLE `user` ADD `role` text DEFAULT 'student';
ALTER TABLE `class_sessions` ADD `whiteboard_json` text;
ALTER TABLE `class_sessions` ADD `recording` integer DEFAULT 0;
CREATE TABLE IF NOT EXISTS `parent_links` (
  `id` text PRIMARY KEY,
  `parent_id` text NOT NULL,
  `student_id` text NOT NULL
);
CREATE TABLE IF NOT EXISTS `school_settings` (`key` text PRIMARY KEY, `value` text NOT NULL);
CREATE TABLE IF NOT EXISTS `student_codes` (
  `id` text PRIMARY KEY,
  `code` text NOT NULL,
  `grade` text,
  `used` integer DEFAULT 0 NOT NULL,
  `used_by_user_id` text,
  `created_at` text
);
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `course_id` integer NOT NULL,
  `title` text NOT NULL,
  `instructions` text,
  `due_at` text,
  `created_by` text NOT NULL,
  `created_at` text
);
CREATE TABLE IF NOT EXISTS `submissions` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `assignment_id` integer NOT NULL,
  `student_id` text NOT NULL,
  `note` text,
  `file_name` text,
  `file_url` text,
  `submitted_at` text
);
CREATE TABLE IF NOT EXISTS `grades` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `course_id` integer NOT NULL,
  `student_id` text NOT NULL,
  `kind` text NOT NULL,
  `score` text NOT NULL,
  `note` text,
  `recorded_by` text NOT NULL,
  `recorded_at` text
);
CREATE TABLE IF NOT EXISTS `timetable_slots` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `course_id` integer NOT NULL,
  `weekday` integer NOT NULL,
  `period` integer NOT NULL,
  `start_time` text NOT NULL,
  `end_time` text NOT NULL
);
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `actor_id` text,
  `action` text NOT NULL,
  `detail` text,
  `created_at` text
);
