CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_module" ON "audit_logs" USING btree ("module");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_target_id" ON "audit_logs" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_categories_type_id" ON "categories" USING btree ("category_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_categories_parent_id" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_categories_display_order" ON "categories" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_categories_type_parent" ON "categories" USING btree ("category_type_id","parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_categories_is_visible" ON "categories" USING btree ("is_visible");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_session_id" ON "chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_session_created_at" ON "chat_messages" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_reply_to_id" ON "chat_messages" USING btree ("reply_to_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_created_at" ON "chat_messages" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_sessions_guest_id" ON "chat_sessions" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_sessions_guest_active" ON "chat_sessions" USING btree ("guest_id","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_sessions_status" ON "chat_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_sessions_last_message_at" ON "chat_sessions" USING btree ("last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_sessions_created_at" ON "chat_sessions" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contacts_status" ON "contacts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contacts_created_at" ON "contacts" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contacts_email" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_applications_job_id" ON "job_applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_applications_status" ON "job_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_applications_email" ON "job_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_applications_created_at" ON "job_applications" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_postings_status" ON "job_postings" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_postings_employment_type" ON "job_postings" USING btree ("employment_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_postings_deadline" ON "job_postings" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_postings_created_at" ON "job_postings" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_postings_deleted_at" ON "job_postings" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_postings_status_deleted" ON "job_postings" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_file_type" ON "media" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_uploaded_at" ON "media" USING btree ("uploaded_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_modules_order" ON "modules" USING btree ("order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_modules_created_at" ON "modules" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_modules_deleted_at" ON "modules" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_status" ON "news_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_category_id" ON "news_articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_author_id" ON "news_articles" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_deleted_at" ON "news_articles" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_created_at" ON "news_articles" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_published_at" ON "news_articles" USING btree ("published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_status_deleted" ON "news_articles" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_articles_status_published" ON "news_articles" USING btree ("status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_is_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_unread_created_at" ON "notifications" USING btree ("is_read","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_permissions_role_module" ON "permissions" USING btree ("role_id","module_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_permissions_module_id" ON "permissions" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_permissions_deleted_at" ON "permissions" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_comments_product_id" ON "product_comments" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_comments_replied_by_id" ON "product_comments" USING btree ("replied_by_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_comments_is_approved" ON "product_comments" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_comments_created_at" ON "product_comments" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_comments_deleted_at" ON "product_comments" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_comments_product_approved_created_at" ON "product_comments" USING btree ("product_id","is_approved","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_status" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_category_id" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_deleted_at" ON "products" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_created_at" ON "products" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_is_featured" ON "products" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_status_deleted" ON "products" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_category_status" ON "products" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_status_featured" ON "products" USING btree ("status","is_featured");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_category_id" ON "projects" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_deleted_at" ON "projects" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_created_at" ON "projects" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_status_deleted" ON "projects" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_roles_created_at" ON "roles" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_roles_deleted_at" ON "roles" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_roles_user_id" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_roles_role_id" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_is_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_deleted_at" ON "users" USING btree ("deleted_at");
