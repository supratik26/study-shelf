import { and, asc, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertNote, InsertUser, notes, users } from "../drizzle/schema";
import type { NoteFileType } from "../shared/notes";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export type NoteSearchInput = {
  query?: string;
  fileType?: NoteFileType;
  sort: "recent" | "title" | "downloads";
  page: number;
  pageSize: number;
};

export type NoteMetadataUpdate = Pick<InsertNote, "title" | "course" | "term" | "description" | "tags">;

async function getRequiredDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db;
}

export async function createNote(input: InsertNote) {
  const db = await getRequiredDb();
  await db.insert(notes).values(input);
  return getNoteByStorageKey(input.storageKey);
}

export async function getNoteByStorageKey(storageKey: string) {
  const db = await getRequiredDb();
  const result = await db.select().from(notes).where(eq(notes.storageKey, storageKey)).limit(1);
  return result[0];
}

export async function getNoteById(noteId: number) {
  const db = await getRequiredDb();
  const result = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
  return result[0];
}

export async function getNoteWithOwner(noteId: number) {
  const db = await getRequiredDb();
  const result = await db
    .select({ note: notes, ownerName: users.name })
    .from(notes)
    .innerJoin(users, eq(notes.ownerId, users.id))
    .where(eq(notes.id, noteId))
    .limit(1);
  return result[0];
}

export async function searchNotes(input: NoteSearchInput) {
  const db = await getRequiredDb();
  const conditions: SQL[] = [];
  const query = input.query?.trim().slice(0, 120) ?? "";

  if (query) {
    const pattern = `%${query}%`;
    const searchCondition = or(
      like(notes.title, pattern),
      like(notes.course, pattern),
      like(notes.description, pattern),
      like(notes.tags, pattern),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  if (input.fileType) conditions.push(eq(notes.fileType, input.fileType));

  const whereClause = conditions.length ? and(...conditions) : undefined;
  const orderBy =
    input.sort === "downloads"
      ? [desc(notes.downloadCount), desc(notes.createdAt)]
      : input.sort === "title"
        ? [asc(notes.title)]
        : [desc(notes.createdAt)];

  const rows = await db
    .select({
      id: notes.id,
      title: notes.title,
      course: notes.course,
      term: notes.term,
      tags: notes.tags,
      fileType: notes.fileType,
      downloadCount: notes.downloadCount,
      createdAt: notes.createdAt,
      ownerName: users.name,
    })
    .from(notes)
    .innerJoin(users, eq(notes.ownerId, users.id))
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(input.pageSize)
    .offset((input.page - 1) * input.pageSize);

  return rows;
}

export async function listNotesByOwner(ownerId: number) {
  const db = await getRequiredDb();
  return db
    .select()
    .from(notes)
    .where(eq(notes.ownerId, ownerId))
    .orderBy(desc(notes.createdAt));
}

export async function updateNoteMetadata(noteId: number, input: NoteMetadataUpdate) {
  const db = await getRequiredDb();
  await db.update(notes).set(input).where(eq(notes.id, noteId));
  return getNoteById(noteId);
}

export async function removeNote(noteId: number) {
  const db = await getRequiredDb();
  await db.delete(notes).where(eq(notes.id, noteId));
}

export async function incrementNoteDownloadCount(noteId: number) {
  const db = await getRequiredDb();
  await db
    .update(notes)
    .set({ downloadCount: sql`${notes.downloadCount} + 1` })
    .where(eq(notes.id, noteId));
  return getNoteById(noteId);
}
