ALTER TABLE `class_sessions` ADD `status` text DEFAULT 'live' NOT NULL;
ALTER TABLE `messages` ADD `title` text;
CREATE UNIQUE INDEX IF NOT EXISTS `enrollments_student_course_uniq` ON `enrollments` (`student_id`,`course_id`);
