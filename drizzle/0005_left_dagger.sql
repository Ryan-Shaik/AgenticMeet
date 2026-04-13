CREATE TABLE "summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_id" text NOT NULL,
	"executive_summary" text,
	"topics" jsonb,
	"action_items" jsonb,
	"decisions" jsonb,
	"sentiment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meetings" DROP CONSTRAINT "meetings_host_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "host_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "updated_at";