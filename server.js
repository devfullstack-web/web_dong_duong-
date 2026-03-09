"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_node_http = require("node:http");
var import_node_url = require("node:url");
var import_next = __toESM(require("next"));
var import_socket = require("socket.io");

// services/chat-stream.ts
var ChatStreamManager = class {
  get io() {
    return global.chatIo || null;
  }
  set io(val) {
    global.chatIo = val;
  }
  setIo(io) {
    this.io = io;
    console.log("Socket.io instance attached to ChatStreamManager");
  }
  broadcastMessage(message) {
    if (!this.io) {
      console.error("Socket.io not initialized in ChatStreamManager");
      return;
    }
    console.log(`Broadcasting message: ${message.id} to session ${message.session_id}`);
    this.io.to(message.session_id).emit("message", message);
    if (message.sender_type === "guest") {
      this.io.to("admins").emit("message", message);
    }
  }
  broadcastMessageUpdate(message) {
    if (!this.io) return;
    this.io.to(message.session_id).emit("message_update", message);
    this.io.to("admins").emit("message_update", message);
  }
  broadcastSessionUpdate(session) {
    if (!this.io) return;
    this.io.to(session.id).emit("session_update", session);
    this.io.to("admins").emit("session_update", session);
  }
  broadcastSessionRemoval(sessionId) {
    if (!this.io) return;
    this.io.to(sessionId).emit("session_removed", { sessionId });
    this.io.to("admins").emit("session_removed", { sessionId });
  }
  broadcastTyping(sessionId, senderType, isTyping) {
    if (!this.io) return;
    this.io.to(sessionId).emit("typing", { sessionId, senderType, isTyping });
    if (senderType === "guest") {
      this.io.to("admins").emit("typing", { sessionId, senderType, isTyping });
    }
  }
};
var chatStreamManager = new ChatStreamManager();

// db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
  authors: () => authors,
  categories: () => categories,
  categoryTypes: () => categoryTypes,
  chatMessages: () => chatMessages,
  chatSessions: () => chatSessions,
  contacts: () => contacts,
  employmentTypeEnum: () => employmentTypeEnum,
  jobApplications: () => jobApplications,
  jobPostings: () => jobPostings,
  jobStatusEnum: () => jobStatusEnum,
  media: () => media,
  modules: () => modules,
  newsArticles: () => newsArticles,
  notifications: () => notifications,
  permissions: () => permissions,
  productComments: () => productComments,
  productStatusEnum: () => productStatusEnum,
  products: () => products,
  projectStatusEnum: () => projectStatusEnum,
  projects: () => projects,
  roles: () => roles,
  statusEnum: () => statusEnum,
  user_roles: () => user_roles,
  users: () => users
});
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var statusEnum = (0, import_pg_core.pgEnum)("status", ["draft", "published"]);
var productStatusEnum = (0, import_pg_core.pgEnum)("product_status", ["active", "inactive"]);
var projectStatusEnum = (0, import_pg_core.pgEnum)("project_status", ["ongoing", "completed"]);
var jobStatusEnum = (0, import_pg_core.pgEnum)("job_status", ["open", "closed"]);
var employmentTypeEnum = (0, import_pg_core.pgEnum)("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "internship"
]);
var categoryTypes = (0, import_pg_core.pgTable)("category_types", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull().unique()
  // news, product, project
});
var categories = (0, import_pg_core.pgTable)("categories", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
  category_type_id: (0, import_pg_core.uuid)("category_type_id").references(() => categoryTypes.id, { onDelete: "restrict" }).notNull()
});
var authors = (0, import_pg_core.pgTable)("authors", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
  role: (0, import_pg_core.varchar)("role", { length: 255 })
});
var newsArticles = (0, import_pg_core.pgTable)("news_articles", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  slug: (0, import_pg_core.varchar)("slug", { length: 255 }).notNull().unique(),
  summary: (0, import_pg_core.text)("summary").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  category_id: (0, import_pg_core.uuid)("category_id").references(() => categories.id, { onDelete: "restrict" }).notNull(),
  author_id: (0, import_pg_core.uuid)("author_id").references(() => authors.id, { onDelete: "set null" }),
  status: statusEnum("status").default("draft").notNull(),
  image_url: (0, import_pg_core.varchar)("image_url", { length: 255 }),
  gallery: (0, import_pg_core.jsonb)("gallery"),
  // Array of image URLs
  published_at: (0, import_pg_core.timestamp)("published_at"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  deleted_at: (0, import_pg_core.timestamp)("deleted_at")
  // Soft delete
});
var products = (0, import_pg_core.pgTable)("products", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
  slug: (0, import_pg_core.varchar)("slug", { length: 255 }).notNull().unique(),
  description: (0, import_pg_core.text)("description").notNull(),
  price: (0, import_pg_core.decimal)("price", { precision: 12, scale: 2 }).notNull().default("0.00"),
  sku: (0, import_pg_core.varchar)("sku", { length: 100 }).notNull().unique(),
  stock: (0, import_pg_core.integer)("stock").notNull().default(0),
  category_id: (0, import_pg_core.uuid)("category_id").references(() => categories.id, { onDelete: "restrict" }).notNull(),
  status: productStatusEnum("status").default("active").notNull(),
  image_url: (0, import_pg_core.varchar)("image_url", { length: 255 }),
  // New Enhanced Fields
  is_featured: (0, import_pg_core.boolean)("is_featured").default(false).notNull(),
  tech_specs: (0, import_pg_core.jsonb)("tech_specs"),
  // JSON format for flexible specifications
  features: (0, import_pg_core.jsonb)("features"),
  // Array of highlighting features
  gallery: (0, import_pg_core.jsonb)("gallery"),
  // Array of image URLs
  tech_summary: (0, import_pg_core.text)("tech_summary"),
  catalog_url: (0, import_pg_core.varchar)("catalog_url", { length: 255 }),
  warranty: (0, import_pg_core.varchar)("warranty", { length: 100 }),
  origin: (0, import_pg_core.varchar)("origin", { length: 255 }),
  availability: (0, import_pg_core.varchar)("availability", { length: 255 }),
  delivery_info: (0, import_pg_core.varchar)("delivery_info", { length: 255 }),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  deleted_at: (0, import_pg_core.timestamp)("deleted_at")
  // Soft delete
});
var projects = (0, import_pg_core.pgTable)("projects", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
  slug: (0, import_pg_core.varchar)("slug", { length: 255 }).notNull().unique(),
  description: (0, import_pg_core.text)("description").notNull(),
  client_name: (0, import_pg_core.varchar)("client_name", { length: 255 }),
  start_date: (0, import_pg_core.timestamp)("start_date"),
  end_date: (0, import_pg_core.timestamp)("end_date"),
  category_id: (0, import_pg_core.uuid)("category_id").references(() => categories.id, { onDelete: "restrict" }).notNull(),
  status: projectStatusEnum("status").default("ongoing").notNull(),
  image_url: (0, import_pg_core.varchar)("image_url", { length: 255 }),
  gallery: (0, import_pg_core.jsonb)("gallery"),
  // Array of image URLs
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  deleted_at: (0, import_pg_core.timestamp)("deleted_at")
  // Soft delete
});
var media = (0, import_pg_core.pgTable)("media", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  file_name: (0, import_pg_core.varchar)("file_name", { length: 255 }).notNull(),
  file_url: (0, import_pg_core.varchar)("file_url", { length: 255 }).notNull(),
  file_type: (0, import_pg_core.varchar)("file_type", { length: 50 }),
  // image, document, etc.
  file_size: (0, import_pg_core.bigint)("file_size", { mode: "number" }),
  uploaded_at: (0, import_pg_core.timestamp)("uploaded_at").defaultNow().notNull()
});
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  username: (0, import_pg_core.varchar)("username", { length: 255 }).notNull().unique(),
  email: (0, import_pg_core.varchar)("email", { length: 255 }).unique(),
  password: (0, import_pg_core.text)("password").notNull(),
  full_name: (0, import_pg_core.varchar)("full_name", { length: 255 }),
  phone: (0, import_pg_core.varchar)("phone", { length: 20 }),
  is_active: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  is_locked: (0, import_pg_core.boolean)("is_locked").default(false).notNull(),
  is_super: (0, import_pg_core.boolean)("is_super").default(false).notNull(),
  avatar_url: (0, import_pg_core.varchar)("avatar_url", { length: 255 }),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  deleted_at: (0, import_pg_core.timestamp)("deleted_at")
});
var contacts = (0, import_pg_core.pgTable)("contacts", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
  email: (0, import_pg_core.varchar)("email", { length: 255 }).notNull(),
  phone: (0, import_pg_core.varchar)("phone", { length: 20 }),
  address: (0, import_pg_core.text)("address"),
  subject: (0, import_pg_core.varchar)("subject", { length: 255 }),
  message: (0, import_pg_core.text)("message").notNull(),
  status: (0, import_pg_core.varchar)("status", { length: 50 }).default("new").notNull(),
  // new, read, replied, archived
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var jobPostings = (0, import_pg_core.pgTable)("job_postings", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  slug: (0, import_pg_core.varchar)("slug", { length: 255 }).notNull().unique(),
  description: (0, import_pg_core.text)("description").notNull(),
  requirements: (0, import_pg_core.text)("requirements"),
  // Can be HTML or plain text
  benefits: (0, import_pg_core.text)("benefits"),
  // Can be HTML or plain text
  location: (0, import_pg_core.varchar)("location", { length: 255 }),
  employment_type: employmentTypeEnum("employment_type").default("full_time").notNull(),
  salary_range: (0, import_pg_core.varchar)("salary_range", { length: 100 }),
  // e.g., "15-25 triệu VND"
  experience_level: (0, import_pg_core.varchar)("experience_level", { length: 100 }),
  // e.g., "2-3 năm"
  department: (0, import_pg_core.varchar)("department", { length: 255 }),
  // e.g., "Kỹ thuật", "Kinh doanh"
  status: jobStatusEnum("status").default("open").notNull(),
  deadline: (0, import_pg_core.timestamp)("deadline"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  deleted_at: (0, import_pg_core.timestamp)("deleted_at")
  // Soft delete
});
var jobApplications = (0, import_pg_core.pgTable)("job_applications", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  job_id: (0, import_pg_core.uuid)("job_id").references(() => jobPostings.id, { onDelete: "cascade" }).notNull(),
  full_name: (0, import_pg_core.varchar)("full_name", { length: 255 }).notNull(),
  email: (0, import_pg_core.varchar)("email", { length: 255 }).notNull(),
  phone: (0, import_pg_core.varchar)("phone", { length: 50 }).notNull(),
  cv_url: (0, import_pg_core.text)("cv_url").notNull(),
  // URL to uploaded CV file
  cover_letter: (0, import_pg_core.text)("cover_letter"),
  status: (0, import_pg_core.varchar)("status", { length: 50 }).default("pending").notNull(),
  // pending, reviewed, interviewed, rejected, accepted
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var roles = (0, import_pg_core.pgTable)("roles", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  code: (0, import_pg_core.varchar)("code", { length: 50 }).notNull().unique(),
  name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
  description: (0, import_pg_core.text)("description"),
  is_super: (0, import_pg_core.boolean)("is_super").default(false).notNull(),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  deleted_at: (0, import_pg_core.timestamp)("deleted_at")
});
var modules = (0, import_pg_core.pgTable)("modules", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  code: (0, import_pg_core.varchar)("code", { length: 50 }).notNull().unique(),
  name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
  icon: (0, import_pg_core.varchar)("icon", { length: 100 }),
  // Lucide icon name
  route: (0, import_pg_core.varchar)("route", { length: 255 }),
  // Portal route path
  order: (0, import_pg_core.integer)("order").default(0).notNull(),
  // Display order in sidebar
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  deleted_at: (0, import_pg_core.timestamp)("deleted_at")
});
var permissions = (0, import_pg_core.pgTable)("permissions", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  role_id: (0, import_pg_core.uuid)("role_id").references(() => roles.id, { onDelete: "cascade" }).notNull(),
  module_id: (0, import_pg_core.uuid)("module_id").references(() => modules.id, { onDelete: "cascade" }).notNull(),
  can_view: (0, import_pg_core.boolean)("can_view").default(false).notNull(),
  can_create: (0, import_pg_core.boolean)("can_create").default(false).notNull(),
  can_update: (0, import_pg_core.boolean)("can_update").default(false).notNull(),
  can_delete: (0, import_pg_core.boolean)("can_delete").default(false).notNull(),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  deleted_at: (0, import_pg_core.timestamp)("deleted_at")
});
var user_roles = (0, import_pg_core.pgTable)(
  "user_roles",
  {
    user_id: (0, import_pg_core.uuid)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    role_id: (0, import_pg_core.uuid)("role_id").references(() => roles.id, { onDelete: "cascade" }).notNull()
  },
  (table) => ({
    pk: import_drizzle_orm.sql`PRIMARY KEY (${table.user_id}, ${table.role_id})`
  })
);
var productComments = (0, import_pg_core.pgTable)("product_comments", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  product_id: (0, import_pg_core.uuid)("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  guest_name: (0, import_pg_core.varchar)("guest_name", { length: 255 }).notNull(),
  guest_email: (0, import_pg_core.varchar)("guest_email", { length: 255 }).notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  reply_content: (0, import_pg_core.text)("reply_content"),
  replied_at: (0, import_pg_core.timestamp)("replied_at"),
  replied_by_id: (0, import_pg_core.uuid)("replied_by_id").references(() => users.id, { onDelete: "set null" }),
  is_approved: (0, import_pg_core.boolean)("is_approved").default(false).notNull(),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
  deleted_at: (0, import_pg_core.timestamp)("deleted_at")
});
var chatSessions = (0, import_pg_core.pgTable)("chat_sessions", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  guest_id: (0, import_pg_core.varchar)("guest_id", { length: 255 }).notNull(),
  // Client-side generated ID
  guest_name: (0, import_pg_core.varchar)("guest_name", { length: 255 }),
  last_message_at: (0, import_pg_core.timestamp)("last_message_at").defaultNow().notNull(),
  is_active: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  admin_last_seen_at: (0, import_pg_core.timestamp)("admin_last_seen_at"),
  guest_last_seen_at: (0, import_pg_core.timestamp)("guest_last_seen_at"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var chatMessages = (0, import_pg_core.pgTable)("chat_messages", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  session_id: (0, import_pg_core.uuid)("session_id").references(() => chatSessions.id, { onDelete: "cascade" }).notNull(),
  sender_type: (0, import_pg_core.varchar)("sender_type", { length: 20 }).notNull(),
  // 'guest' or 'admin'
  sender_id: (0, import_pg_core.uuid)("sender_id"),
  // User ID if admin, null if guest
  content: (0, import_pg_core.text)("content").notNull(),
  reply_to_id: (0, import_pg_core.uuid)("reply_to_id"),
  // Self-reference for replies
  is_deleted: (0, import_pg_core.boolean)("is_deleted").default(false).notNull(),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var notifications = (0, import_pg_core.pgTable)("notifications", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  type: (0, import_pg_core.varchar)("type", { length: 50 }).notNull(),
  // 'comment', 'contact', 'application'
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  link: (0, import_pg_core.varchar)("link", { length: 255 }),
  is_read: (0, import_pg_core.boolean)("is_read").default(false).notNull(),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var auditLogs = (0, import_pg_core.pgTable)("audit_logs", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  user_id: (0, import_pg_core.uuid)("user_id").references(() => users.id, { onDelete: "set null" }),
  action: (0, import_pg_core.varchar)("action", { length: 50 }).notNull(),
  // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc.
  module: (0, import_pg_core.varchar)("module", { length: 50 }).notNull(),
  // 'USERS', 'ROLES', 'NEWS', etc.
  target_id: (0, import_pg_core.varchar)("target_id", { length: 255 }),
  // ID of the affected record
  description: (0, import_pg_core.text)("description"),
  changes: (0, import_pg_core.jsonb)("changes"),
  // { old: {}, new: {} }
  ip_address: (0, import_pg_core.varchar)("ip_address", { length: 50 }),
  user_agent: (0, import_pg_core.text)("user_agent"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});

// db/index.ts
var pool = new import_pg.Pool({
  connectionString: process.env.DATABASE_URL
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// services/notification-service.ts
var NotificationService = class {
  get io() {
    return global.notificationIo || null;
  }
  set io(val) {
    global.notificationIo = val;
  }
  setIo(io) {
    this.io = io;
    console.log("[NotificationService] Socket.io instance attached");
  }
  async createNotification({ type, title, content, link }) {
    try {
      console.log(`[NotificationService] Creating ${type} notification: ${title}`);
      const [newNotification] = await db.insert(notifications).values({
        type,
        title,
        content,
        link: link || null,
        is_read: false
      }).returning();
      if (this.io) {
        const adminSockets = await this.io.in("admins").fetchSockets();
        console.log(
          `[NotificationService] Emitting to ${adminSockets.length} admins: ${title}`
        );
        this.io.to("admins").emit("new-notification", newNotification);
      } else {
        console.warn("[NotificationService] Socket.io not initialized, cannot broadcast");
      }
      return newNotification;
    } catch (error) {
      console.error("[NotificationService] Error creating notification:", error);
      throw error;
    }
  }
};
var notificationService = new NotificationService();

// services/cron-service.ts
var import_node_cron = __toESM(require("node-cron"));
var import_drizzle_orm2 = require("drizzle-orm");
var AUDIT_LOG_RETENTION_DAYS = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || "30", 10);
var CronService = class {
  constructor() {
    this.isInitialized = false;
  }
  /**
   * Initialize all cron jobs
   */
  init() {
    if (this.isInitialized) {
      console.log("[CRON] Cron service already initialized");
      return;
    }
    console.log("[CRON] Initializing cron jobs...");
    this.scheduleAuditLogCleanup();
    this.isInitialized = true;
    console.log("[CRON] Cron service initialized successfully");
  }
  /**
   * Schedule audit log cleanup job
   * Runs daily at 2:00 AM to delete logs older than configured retention period
   */
  scheduleAuditLogCleanup() {
    const cronExpression = process.env.AUDIT_CLEANUP_CRON || "0 2 * * *";
    import_node_cron.default.schedule(cronExpression, async () => {
      console.log("[CRON] Starting audit log cleanup...");
      await this.cleanupAuditLogs();
    });
    console.log(
      `[CRON] Audit log cleanup scheduled: ${cronExpression} (retention: ${AUDIT_LOG_RETENTION_DAYS} days)`
    );
  }
  /**
   * Delete audit logs older than the retention period
   */
  async cleanupAuditLogs() {
    try {
      const cutoffDate = /* @__PURE__ */ new Date();
      cutoffDate.setDate(cutoffDate.getDate() - AUDIT_LOG_RETENTION_DAYS);
      console.log(`[CRON] Deleting audit logs older than ${cutoffDate.toISOString()}`);
      const result = await db.delete(auditLogs).where((0, import_drizzle_orm2.lt)(auditLogs.created_at, cutoffDate)).returning({ id: auditLogs.id });
      const deletedCount = result.length;
      console.log(`[CRON] Audit log cleanup completed. Deleted ${deletedCount} records.`);
      if (deletedCount > 0) {
        await db.insert(auditLogs).values({
          action: "CLEANUP",
          module: "AUDIT_LOGS",
          description: `T\u1EF1 \u0111\u1ED9ng x\xF3a ${deletedCount} b\u1EA3n ghi audit log c\u0169 h\u01A1n ${AUDIT_LOG_RETENTION_DAYS} ng\xE0y`,
          changes: {
            deletedCount,
            retentionDays: AUDIT_LOG_RETENTION_DAYS,
            cutoffDate: cutoffDate.toISOString()
          }
        });
      }
      return { deletedCount };
    } catch (error) {
      console.error("[CRON] Error during audit log cleanup:", error);
      throw error;
    }
  }
  /**
   * Get cleanup statistics
   */
  async getCleanupStats() {
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - AUDIT_LOG_RETENTION_DAYS);
    const [totalResult] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(auditLogs);
    const [toDeleteResult] = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(auditLogs).where((0, import_drizzle_orm2.lt)(auditLogs.created_at, cutoffDate));
    const [oldestLog] = await db.select({ created_at: auditLogs.created_at }).from(auditLogs).orderBy(auditLogs.created_at).limit(1);
    return {
      totalLogs: Number(totalResult.count),
      logsToDelete: Number(toDeleteResult.count),
      retentionDays: AUDIT_LOG_RETENTION_DAYS,
      oldestLogDate: oldestLog?.created_at || null
    };
  }
  /**
   * Manually trigger cleanup (for admin use)
   */
  async triggerManualCleanup() {
    console.log("[CRON] Manual audit log cleanup triggered");
    return this.cleanupAuditLogs();
  }
};
var cronService = new CronService();

// server.ts
var dev = process.env.NODE_ENV !== "production";
var hostname = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
var port = parseInt(process.env.PORT || "3000", 10);
var app = (0, import_next.default)({ dev, hostname, port });
var handle = app.getRequestHandler();
app.prepare().then(() => {
  const httpServer = (0, import_node_http.createServer)((req, res) => {
    try {
      const parsedUrl = (0, import_node_url.parse)(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });
  const io = new import_socket.Server(httpServer, {
    cors: {}
  });
  chatStreamManager.setIo(io);
  notificationService.setIo(io);
  io.on("connection", (socket) => {
    const sessionId = socket.handshake.query.sessionId;
    if (sessionId) {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined room ${sessionId}`);
    }
    const isAdmin = socket.handshake.query.isAdmin === "true";
    console.log(`[Socket] New connection: ${socket.id}, isAdmin: ${isAdmin}`);
    if (isAdmin) {
      socket.join("admins");
      console.log(`[Socket] Socket ${socket.id} successfully joined 'admins' room`);
    }
    socket.on(
      "typing",
      (data) => {
        chatStreamManager.broadcastTyping(data.sessionId, data.senderType, data.isTyping);
      }
    );
    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });
  httpServer.once("error", (err) => {
    console.error(err);
    process.exit(1);
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    cronService.init();
  });
});
