CREATE TABLE "system_settings" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "idx_permissions_role_module";--> statement-breakpoint
DROP INDEX "idx_user_roles_user_id";--> statement-breakpoint
DROP INDEX "idx_user_roles_role_id";--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_permissions_role_module_unique" ON "permissions" USING btree ("role_id","module_id");