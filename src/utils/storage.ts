import type { DocumentMeta, StoredDocument } from '../types/document';

const DB_NAME = 'DocumentFinderDB';
const DB_VERSION = 1;
const STORE_META = 'documents';
const STORE_BLOBS = 'blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_META)) {
        const store = db.createObjectStore(STORE_META, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
      }
    };
  });
}

export async function saveDocument(
  meta: DocumentMeta,
  blob: Blob
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META, STORE_BLOBS], 'readwrite');
    tx.objectStore(STORE_META).put(meta);
    tx.objectStore(STORE_BLOBS).put({ id: meta.id, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllDocuments(): Promise<DocumentMeta[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readonly');
    const request = tx.objectStore(STORE_META).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getDocumentBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BLOBS, 'readonly');
    const request = tx.objectStore(STORE_BLOBS).get(id);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.blob : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META, STORE_BLOBS], 'readwrite');
    tx.objectStore(STORE_META).delete(id);
    tx.objectStore(STORE_BLOBS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateDocumentMeta(meta: DocumentMeta): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readwrite');
    tx.objectStore(STORE_META).put(meta);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Simple in-memory fallback if IndexedDB fails (rare) */
let memoryStore: Map<string, { meta: DocumentMeta; blob: Blob }> = new Map();

export async function saveDocumentSafe(meta: DocumentMeta, blob: Blob) {
  try {
    await saveDocument(meta, blob);
  } catch {
    memoryStore.set(meta.id, { meta, blob });
  }
}

export async function getAllDocumentsSafe(): Promise<DocumentMeta[]> {
  try {
    return await getAllDocuments();
  } catch {
    return Array.from(memoryStore.values()).map((v) => v.meta);
  }
}

export async function getDocumentBlobSafe(id: string): Promise<Blob | null> {
  try {
    return await getDocumentBlob(id);
  } catch {
    return memoryStore.get(id)?.blob ?? null;
  }
}

export async function deleteDocumentSafe(id: string) {
  try {
    await deleteDocument(id);
  } catch {
    memoryStore.delete(id);
  }
}
