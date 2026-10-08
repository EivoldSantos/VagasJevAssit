import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import {
  CandidateProfileSchema,
  PROFILE_SCHEMA_VERSION,
  type CandidateProfile,
} from "@/lib/profile/schema";

export const DB_NAME = "vagasjevassist";
export const DB_VERSION = 1;
export const PROFILE_ID = "default";

export type StoredDocument = {
  id: string;
  kind: "pdf";
  name: string;
  extractedText: string;
  blob?: ArrayBuffer;
  updatedAt: string;
};

type ProfileRecord = CandidateProfile & { schemaVersion: number };

interface VagasDB extends DBSchema {
  profile: {
    key: string;
    value: ProfileRecord;
  };
  documents: {
    key: string;
    value: StoredDocument;
  };
}

let dbPromise: Promise<IDBPDatabase<VagasDB>> | null = null;

function getDb(): Promise<IDBPDatabase<VagasDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VagasDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("profile")) {
          db.createObjectStore("profile");
        }
        if (!db.objectStoreNames.contains("documents")) {
          db.createObjectStore("documents");
        }
      },
    });
  }
  return dbPromise;
}

export async function getProfile(): Promise<CandidateProfile | null> {
  const db = await getDb();
  const row = await db.get("profile", PROFILE_ID);
  if (!row) return null;
  const { schemaVersion: _sv, ...profile } = row;
  const parsed = CandidateProfileSchema.safeParse(profile);
  return parsed.success ? parsed.data : null;
}

export async function saveProfile(profile: CandidateProfile): Promise<void> {
  const parsed = CandidateProfileSchema.safeParse(profile);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  const record: ProfileRecord = {
    ...parsed.data,
    schemaVersion: PROFILE_SCHEMA_VERSION,
  };
  const db = await getDb();
  await db.put("profile", record, PROFILE_ID);
}

export async function getDocument(id: string): Promise<StoredDocument | null> {
  const db = await getDb();
  return (await db.get("documents", id)) ?? null;
}

export async function saveDocument(doc: StoredDocument): Promise<void> {
  const db = await getDb();
  const storable: StoredDocument = {
    ...doc,
    blob: doc.blob ? doc.blob.slice(0) : undefined,
  };
  await db.put("documents", storable, doc.id);
}

/** Internal helper for Phase 3 delete plan. */
export async function deleteAllIndexedDb(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["profile", "documents"], "readwrite");
  await tx.objectStore("profile").clear();
  await tx.objectStore("documents").clear();
  await tx.done;
}

export async function deleteProfileDatabase(): Promise<void> {
  dbPromise = null;
  await deleteAllIndexedDb();
  indexedDB.deleteDatabase(DB_NAME);
}
