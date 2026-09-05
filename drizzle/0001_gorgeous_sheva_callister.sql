ALTER TABLE "interest_submissions" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "interest_submissions" ADD COLUMN "guest_name" text;--> statement-breakpoint
ALTER TABLE "interest_submissions" ADD COLUMN "guest_email" text;