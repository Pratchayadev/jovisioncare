CREATE TABLE `promotions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`highlight` text,
	`summary` text,
	`details` text DEFAULT '' NOT NULL,
	`image` text,
	`image_alt` text,
	`branches` text DEFAULT 'all' NOT NULL,
	`ends_at` integer,
	`featured` integer DEFAULT false NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
