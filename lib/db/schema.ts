const DB_VERSION = 4; // Incremented for new store

/**
 * Get database name scoped to user
 */
function getDBName(userId: string): string {
  return `clarapi-db-${userId}`;
}

export interface ApiKeyRecord {
  id: string;
  provider: 'anthropic' | 'googleai' | 'openai';
  apiKey: string; // Will be encrypted
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'error';
  lastSyncedAt?: number;
}

export interface ApiSpecRecord {
  id: string;
  name: string;
  fileName: string;
  content: string; // Raw OpenAPI/Swagger content
  format: 'json' | 'yaml';
  specVersion?: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'error';
  lastSyncedAt?: number;
}

export const PROVIDERS = ['anthropic', 'googleai', 'openai'] as const;
export type Provider = typeof PROVIDERS[number];

async function deleteDB(userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dbName = getDBName(userId);
    console.log(`[IndexedDB] Deleting database: ${dbName}...`);
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => {
      console.log(`[IndexedDB] Database ${dbName} deleted successfully`);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function openDB(userId: string): Promise<IDBDatabase> {
  const dbName = getDBName(userId);

  // First, try to open and check if store exists
  try {
    const testDb = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Check if apiKeys store exists
    if (!testDb.objectStoreNames.contains('apiKeys')) {
      console.log(`[IndexedDB] Store not found in ${dbName}, deleting and recreating DB...`);
      testDb.close();
      await deleteDB(userId);
    } else {
      testDb.close();
    }
  } catch (error) {
    console.log(`[IndexedDB] Error checking ${dbName}, will recreate:`, error);
  }

  // Now open with version upgrade
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      console.log(`[IndexedDB] Database ${dbName} opened successfully`);
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = (event as IDBVersionChangeEvent).oldVersion;

      console.log(`[IndexedDB] Upgrading ${dbName} from version ${oldVersion} to ${DB_VERSION}`);

      // Create or recreate apiKeys store
      if (db.objectStoreNames.contains('apiKeys')) {
        db.deleteObjectStore('apiKeys');
      }
      const apiKeysStore = db.createObjectStore('apiKeys', { keyPath: 'id' });
      apiKeysStore.createIndex('provider', 'provider', { unique: true });
      apiKeysStore.createIndex('syncStatus', 'syncStatus', { unique: false });

      // Create apiSpecs store
      if (!db.objectStoreNames.contains('apiSpecs')) {
        const apiSpecsStore = db.createObjectStore('apiSpecs', { keyPath: 'id' });
        apiSpecsStore.createIndex('name', 'name', { unique: false });
        apiSpecsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        apiSpecsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      console.log(`[IndexedDB] Database ${dbName} upgraded to version`, DB_VERSION);
    };
  });
}

/**
 * Delete all data for a specific user
 */
export async function clearUserData(userId: string): Promise<void> {
  await deleteDB(userId);
  console.log(`[IndexedDB] Cleared all data for user: ${userId}`);
}
