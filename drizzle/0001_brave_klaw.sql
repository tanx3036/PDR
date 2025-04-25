ALTER TABLE "pdr_ai_v2_chatHistory" ADD COLUMN "document id" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "pdr_ai_v2_chatHistory" ADD COLUMN "document title" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "pdr_ai_v2_chatHistory" ADD COLUMN "pages" integer[] NOT NULL;