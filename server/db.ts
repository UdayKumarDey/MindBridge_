import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  checkins,
  conversations,
  InsertUser,
  loginActivity,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      const value = user[field] ?? null;
      values[field] = value;
      updateSet[field] = value;
    }
  });

  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function recordLoginActivity(userId: number, loginMethod?: string | null) {
  const db = await getDb();
  if (!db) return;
  await db.insert(loginActivity).values({
    userId,
    eventType: "sign_in",
    loginMethod: loginMethod ?? null,
    signedInAt: new Date(),
  });
}

export async function listLoginActivity(userId: number, limit = 6) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(loginActivity)
    .where(eq(loginActivity.userId, userId))
    .orderBy(desc(loginActivity.signedInAt))
    .limit(limit);
}

export async function createCheckin(
  userId: number,
  mood: "sunny" | "partly_cloudy" | "overcast" | "rainy",
  note?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(checkins).values({ userId, mood, note: note || null });
  return { id: result[0].insertId };
}

export async function listCheckins(userId: number, limit = 14) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(checkins)
    .where(eq(checkins.userId, userId))
    .orderBy(desc(checkins.createdAt))
    .limit(limit);
}

export async function createConversationMessage(
  userId: number,
  sender: "user" | "companion",
  content: string,
  isSafetyGuidance = false
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(conversations).values({
    userId,
    sender,
    content,
    isSafetyGuidance,
  });
  return { id: result[0].insertId };
}

export async function listConversation(userId: number, limit = 80) {
  const db = await getDb();
  if (!db) return [];
  const results = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt))
    .limit(limit);
  return results.reverse();
}
