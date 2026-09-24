ALTER TABLE `user` ADD `username` text;
--> statement-breakpoint
ALTER TABLE `user` ADD `display_username` text;
--> statement-breakpoint
ALTER TABLE `user` ADD `first_name` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `user` ADD `last_name` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `user` ADD `grade` text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `user_username_unique` ON `user` (`username`);
--> statement-breakpoint
ALTER TABLE `account` ADD `issuer` text;
--> statement-breakpoint
ALTER TABLE `courses` ADD `grade` text DEFAULT 'نامشخص' NOT NULL;
--> statement-breakpoint
ALTER TABLE `courses` ADD `meeting_url` text;
--> statement-breakpoint
ALTER TABLE `parent_links` ADD `status` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `parent_student_uniq` ON `parent_links` (`parent_id`, `student_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `student_codes_code_unique` ON `student_codes` (`code`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `attendance_session_student` ON `attendance` (`class_session_id`, `student_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `discipline` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `student_id` text NOT NULL,
  `actor_id` text NOT NULL,
  `note` text NOT NULL,
  `kind` text DEFAULT 'warning' NOT NULL,
  `created_at` text DEFAULT (current_timestamp),
  FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `calendar_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `day` text NOT NULL,
  `kind` text DEFAULT 'event' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `exams` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `course_id` integer,
  `title` text NOT NULL,
  `day` text NOT NULL,
  `note` text,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `gallery_items` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text,
  `image_url` text NOT NULL,
  `created_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `public_news` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `body` text,
  `link` text,
  `created_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `class_chat` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `course_id` integer NOT NULL,
  `user_id` text NOT NULL,
  `body` text NOT NULL,
  `created_at` text DEFAULT (current_timestamp),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `preregister` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `child_name` text NOT NULL,
  `parent_name` text,
  `phone` text NOT NULL,
  `grade` text,
  `note` text,
  `created_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `language_leads` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `phone` text NOT NULL,
  `note` text,
  `created_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tuition_accounts` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `student_id` text,
  `full_name` text NOT NULL,
  `class_group` text NOT NULL,
  `fee_toman` integer NOT NULL,
  `note` text,
  `created_at` text DEFAULT (current_timestamp),
  FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tuition_payments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `account_id` integer NOT NULL,
  `month_key` text NOT NULL,
  `amount_toman` integer NOT NULL,
  `receipt` text,
  `created_at` text DEFAULT (current_timestamp),
  FOREIGN KEY (`account_id`) REFERENCES `tuition_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `tuition_pay_month_uniq` ON `tuition_payments` (`account_id`, `month_key`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `report_cards` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `student_id` text NOT NULL,
  `title` text NOT NULL,
  `file_url` text NOT NULL,
  `file_name` text,
  `uploaded_by` text NOT NULL,
  `created_at` text DEFAULT (current_timestamp),
  FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `student_profiles` (
  `id` text PRIMARY KEY NOT NULL,
  `student_id` text NOT NULL,
  `date_of_birth` text,
  `address` text,
  `student_phone` text,
  `father_name` text,
  `father_phone` text,
  `mother_name` text,
  `mother_phone` text,
  `notes` text,
  `complete` integer DEFAULT 0 NOT NULL,
  `updated_at` text DEFAULT (current_timestamp),
  FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `student_profiles_student_id_unique` ON `student_profiles` (`student_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `staff_invites` (
  `id` text PRIMARY KEY NOT NULL,
  `code` text NOT NULL,
  `role` text NOT NULL,
  `created_by_user_id` text,
  `used` integer DEFAULT 0 NOT NULL,
  `used_by_user_id` text,
  `created_at` text DEFAULT (current_timestamp),
  `used_at` text,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`used_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `staff_invites_code_unique` ON `staff_invites` (`code`);
