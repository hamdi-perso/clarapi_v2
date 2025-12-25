import { openDB, type ApiSpecRecord } from './schema';
import { getCurrentUserId } from '@/lib/auth/user-utils';

export async function getAllApiSpecs(): Promise<ApiSpecRecord[]> {
  const userId = await getCurrentUserId();
  const db = await openDB(userId);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['apiSpecs'], 'readonly');
    const store = transaction.objectStore('apiSpecs');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getApiSpecById(id: string): Promise<ApiSpecRecord | null> {
  const userId = await getCurrentUserId();
  const db = await openDB(userId);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['apiSpecs'], 'readonly');
    const store = transaction.objectStore('apiSpecs');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveApiSpec(record: ApiSpecRecord): Promise<void> {
  const userId = await getCurrentUserId();
  const db = await openDB(userId);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['apiSpecs'], 'readwrite');
    const store = transaction.objectStore('apiSpecs');
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteApiSpec(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const db = await openDB(userId);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['apiSpecs'], 'readwrite');
    const store = transaction.objectStore('apiSpecs');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateSyncStatus(
  id: string,
  status: ApiSpecRecord['syncStatus'],
  lastSyncedAt?: number
): Promise<void> {
  const record = await getApiSpecById(id);
  if (!record) return;

  record.syncStatus = status;
  if (lastSyncedAt) {
    record.lastSyncedAt = lastSyncedAt;
  }

  await saveApiSpec(record);
}
