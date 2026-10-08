CREATE TABLE IF NOT EXISTS `student_records` (
  `id` text PRIMARY KEY NOT NULL,
  `student_id` text NOT NULL,
  `payload` text DEFAULT '{}' NOT NULL,
  `signed_at` text,
  `signer_name` text,
  `updated_at` text DEFAULT (current_timestamp),
  FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS `student_records_student_id_unique` ON `student_records` (`student_id`);
