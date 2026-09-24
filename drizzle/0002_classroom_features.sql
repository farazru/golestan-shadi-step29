ALTER TABLE `class_sessions` ADD `status` text DEFAULT 'scheduled' NOT NULL;
--> statement-breakpoint
ALTER TABLE `messages` ADD `title` text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `enrollments_student_course_uniq` ON `enrollments` (`student_id`,`course_id`);
