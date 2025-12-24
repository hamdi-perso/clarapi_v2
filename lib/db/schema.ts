const DB_NAME = 'clarapi-db';
const DB_VERSION = 3;

export interface ApiKeyRecord {
  id: string;
  provider: 'anthropic' | 'googleai' | 'openai';
  apiKey: string; // Will be encrypted
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'error';
  lastSyncedAt?: number;
}

export const PROVIDERS = ['anthropic', 'googleai', 'openai'] as const;
export type Provider = typeof PROVIDERS[number];

async function deleteDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('[IndexedDB] Deleting database...');
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      console.log('[IndexedDB] Database deleted successfully');
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function openDB(): Promise<IDBDatabase> {
  // First, try to open and check if store exists
  try {
    const testDb = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Check if apiKeys store exists
    if (!testDb.objectStoreNames.contains('apiKeys')) {
      console.log('[IndexedDB] Store not found, deleting and recreating DB...');
      testDb.close();
      await deleteDB();
    } else {
      testDb.close();
    }
  } catch (error) {
    console.log('[IndexedDB] Error checking DB, will recreate:', error);
  }

  // Now open with version upgrade
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      console.log('[IndexedDB] Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Delete old store if exists (clean slate)
      if (db.objectStoreNames.contains('apiKeys')) {
        db.deleteObjectStore('apiKeys');
      }

      // Create apiKeys store
      const store = db.createObjectStore('apiKeys', { keyPath: 'id' });
      store.createIndex('provider', 'provider', { unique: true });
      store.createIndex('syncStatus', 'syncStatus', { unique: false });

      console.log('[IndexedDB] Database upgraded to version', DB_VERSION);
    };
  });
}
