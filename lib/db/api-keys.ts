import { openDB, type ApiKeyRecord, type Provider } from './schema';

export async function getAllApiKeys(): Promise<ApiKeyRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['apiKeys'], 'readonly');
    const store = transaction.objectStore('apiKeys');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getApiKeyByProvider(provider: Provider): Promise<ApiKeyRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['apiKeys'], 'readonly');
    const store = transaction.objectStore('apiKeys');
    const index = store.index('provider');
    const request = index.get(provider);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveApiKey(record: ApiKeyRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['apiKeys'], 'readwrite');
    const store = transaction.objectStore('apiKeys');
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteApiKey(provider: Provider): Promise<void> {
  const db = await openDB();
  const record = await getApiKeyByProvider(provider);
  if (!record) return;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['apiKeys'], 'readwrite');
    const store = transaction.objectStore('apiKeys');
    const request = store.delete(record.id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateSyncStatus(
  provider: Provider,
  status: ApiKeyRecord['syncStatus'],
  lastSyncedAt?: number
): Promise<void> {
  const record = await getApiKeyByProvider(provider);
  if (!record) return;

  record.syncStatus = status;
  if (lastSyncedAt) {
    record.lastSyncedAt = lastSyncedAt;
  }

  await saveApiKey(record);
}
