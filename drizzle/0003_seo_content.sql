CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text DEFAULT '' NOT NULL,
	`cover` text,
	`cover_alt` text,
	`faq` text,
	`published` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`meta_title` text,
	`meta_description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
CREATE TABLE `redirects` (
	`from_path` text PRIMARY KEY NOT NULL,
	`to_path` text NOT NULL,
	`hits` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `brands` ADD `content` text;--> statement-breakpoint
ALTER TABLE `brands` ADD `faq` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `content` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `faq` text;