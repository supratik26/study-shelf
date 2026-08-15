CREATE TABLE `notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`course` varchar(180) NOT NULL,
	`term` varchar(100),
	`tags` text NOT NULL,
	`originalFileName` varchar(255) NOT NULL,
	`fileType` enum('pdf','docx','pptx','txt','md') NOT NULL,
	`mimeType` varchar(160) NOT NULL,
	`fileSize` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(640) NOT NULL,
	`downloadCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `notes_storageKey_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
ALTER TABLE `notes` ADD CONSTRAINT `notes_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `notes_owner_idx` ON `notes` (`ownerId`);--> statement-breakpoint
CREATE INDEX `notes_course_idx` ON `notes` (`course`);--> statement-breakpoint
CREATE INDEX `notes_file_type_idx` ON `notes` (`fileType`);--> statement-breakpoint
CREATE INDEX `notes_created_at_idx` ON `notes` (`createdAt`);