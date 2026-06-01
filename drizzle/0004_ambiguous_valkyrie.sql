DROP TABLE "chat_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "chat_messages" CASCADE;--> statement-breakpoint
DELETE FROM "permissions" WHERE "module_id" IN (SELECT "id" FROM "modules" WHERE "code" = 'CHAT');--> statement-breakpoint
DELETE FROM "modules" WHERE "code" = 'CHAT';