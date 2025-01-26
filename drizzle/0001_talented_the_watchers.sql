CREATE TABLE IF NOT EXISTS "pdr_ai_v2_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"company id" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pdr_ai_v2_company" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"employerPasskey" varchar(256) NOT NULL,
	"employeePasskey" varchar(256) NOT NULL,
	"numberOfEmployees" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pdr_ai_v2_document" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(256) NOT NULL,
	"category" varchar(256) NOT NULL,
	"title" varchar(256) NOT NULL,
	"company id" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pdr_ai_v2_pdf_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"page" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pdr_ai_v2_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"userId" varchar(256) NOT NULL,
	"companyId" varchar(256) NOT NULL,
	"role" varchar(256) NOT NULL,
	"status" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "pdr_ai_v2_post" RENAME TO "pdr_ai_v2_chatHistory";--> statement-breakpoint
ALTER TABLE "pdr_ai_v2_chatHistory" RENAME COLUMN "name" TO "question";--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
ALTER TABLE "pdr_ai_v2_chatHistory" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "pdr_ai_v2_chatHistory" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "pdr_ai_v2_chatHistory" ALTER COLUMN "question" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pdr_ai_v2_chatHistory" ADD COLUMN "company id" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "pdr_ai_v2_chatHistory" ADD COLUMN "response" varchar(1024) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pdr_ai_v2_pdf_chunks" ADD CONSTRAINT "pdr_ai_v2_pdf_chunks_document_id_pdr_ai_v2_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."pdr_ai_v2_document"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
