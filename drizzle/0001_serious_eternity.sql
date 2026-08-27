CREATE TABLE `checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mood` enum('sunny','partly_cloudy','overcast','rainy') NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sender` enum('user','companion') NOT NULL,
	`content` text NOT NULL,
	`isSafetyGuidance` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` varchar(32) NOT NULL DEFAULT 'sign_in',
	`loginMethod` varchar(64),
	`signedInAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_activity_id` PRIMARY KEY(`id`)
);
