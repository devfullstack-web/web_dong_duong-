-- Chat system improvements: add session fields and status enum
DO $$ BEGIN
    CREATE TYPE "public"."chat_session_status" AS ENUM('active', 'resolved', 'spam');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to chat_sessions
ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "guest_email" varchar(255);
ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "guest_phone" varchar(50);
ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "status" "chat_session_status" DEFAULT 'active' NOT NULL;
ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "last_message_preview" text;
ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "unread_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "telegram_notified_at" timestamp;

-- Update sender_type to support 'system' (no constraint change needed since it's varchar)
