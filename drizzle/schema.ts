import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const notes = mysqlTable(
  "notes",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    course: varchar("course", { length: 180 }).notNull(),
    term: varchar("term", { length: 100 }),
    tags: text("tags").notNull(),
    originalFileName: varchar("originalFileName", { length: 255 }).notNull(),
    fileType: mysqlEnum("fileType", ["pdf", "docx", "pptx", "txt", "md"]).notNull(),
    mimeType: varchar("mimeType", { length: 160 }).notNull(),
    fileSize: int("fileSize").notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
    storageUrl: varchar("storageUrl", { length: 640 }).notNull(),
    downloadCount: int("downloadCount").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("notes_owner_idx").on(table.ownerId),
    index("notes_title_idx").on(table.title),
    index("notes_course_idx").on(table.course),
    index("notes_file_type_idx").on(table.fileType),
    index("notes_created_at_idx").on(table.createdAt),
  ],
);

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;
