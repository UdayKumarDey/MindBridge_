import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const loginActivity = mysqlTable("login_activity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventType: varchar("eventType", { length: 32 }).notNull().default("sign_in"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  signedInAt: timestamp("signedInAt").defaultNow().notNull(),
});

export const checkins = mysqlTable("checkins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mood: mysqlEnum("mood", ["sunny", "partly_cloudy", "overcast", "rainy"]).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sender: mysqlEnum("sender", ["user", "companion"]).notNull(),
  content: text("content").notNull(),
  isSafetyGuidance: boolean("isSafetyGuidance").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Checkin = typeof checkins.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
