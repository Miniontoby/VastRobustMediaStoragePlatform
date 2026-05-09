ALTER TABLE `session` ADD `impersonated_by` text;--> statement-breakpoint
ALTER TABLE `user` ADD `role` text;--> statement-breakpoint
ALTER TABLE `user` ADD `banned` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_expires` timestamp(3);

CREATE TABLE `video_access` (
	`user_id` varchar(255) NOT NULL,
	`video_id` varchar(36) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `video_access` ADD CONSTRAINT `video_access_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_access` ADD CONSTRAINT `video_access_video_id_video_id_fk` FOREIGN KEY (`video_id`) REFERENCES `video`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `videoAccess_user_video_idx` ON `video_access` (`user_id`,`video_id`);