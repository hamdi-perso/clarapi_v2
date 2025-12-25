import * as localDB from '@/lib/db/api-keys';
import * as remoteAPI from '@/lib/api/api-keys-api';
import { encryptApiKey, decryptApiKey } from '@/lib/crypto/encryption';
import type { ApiKeyRecord, Provider } from '@/lib/db/schema';
import { getCurrentUserId } from '@/lib/auth/user-utils';

/**
 * Get current user ID for encryption
 * Throws if user is not authenticated
 */
async function getUserId(): Promise<string> {
  const userId = await getCurrentUserId();

  if (userId === 'anonymous') {
    throw new Error('User not authenticated');
  }

  return userId;
}

/**
 * Sync local changes to remote (upload)
 */
export async function syncToRemote(): Promise<void> {
  console.log('[Sync] Starting sync to remote...');

  try {
    const localKeys = await localDB.getAllApiKeys();
    const pendingKeys = localKeys.filter(key => key.syncStatus === 'pending');

    if (pendingKeys.length === 0) {
      console.log('[Sync] No pending changes to sync');
      return;
    }

    for (const localKey of pendingKeys) {
      try {
        // Save to remote (already encrypted)
        await remoteAPI.saveRemoteApiKey(
          localKey.provider,
          localKey.apiKey,
          localKey.id !== localKey.provider ? localKey.id : undefined
        );

        // Update sync status
        await localDB.updateSyncStatus(
          localKey.provider as Provider,
          'synced',
          Date.now()
        );

        console.log(`[Sync] Synced ${localKey.provider} to remote`);
      } catch (error) {
        console.error(`[Sync] Error syncing ${localKey.provider}:`, error);
        await localDB.updateSyncStatus(localKey.provider as Provider, 'error');
      }
    }

    console.log('[Sync] Sync to remote completed');
  } catch (error) {
    console.error('[Sync] Failed to sync to remote:', error);
    throw error;
  }
}

/**
 * Sync remote changes to local (download)
 */
export async function syncFromRemote(): Promise<void> {
  console.log('[Sync] Starting sync from remote...');

  try {
    const userId = await getUserId();
    const remoteKeys = await remoteAPI.fetchRemoteApiKeys();

    for (const remoteKey of remoteKeys) {
      try {
        // Check if exists locally
        const localKey = await localDB.getApiKeyByProvider(remoteKey.provider as Provider);

        // Compare timestamps
        const remoteTime = new Date(remoteKey.updatedAt).getTime();
        const localTime = localKey?.updatedAt || 0;

        // Remote is newer, update local
        if (remoteTime > localTime) {
          const record: ApiKeyRecord = {
            id: remoteKey.id,
            provider: remoteKey.provider as Provider,
            apiKey: remoteKey.apiKey, // Already encrypted
            updatedAt: remoteTime,
            syncStatus: 'synced',
            lastSyncedAt: Date.now(),
          };

          await localDB.saveApiKey(record);
          console.log(`[Sync] Updated ${remoteKey.provider} from remote`);
        }
      } catch (error) {
        console.error(`[Sync] Error syncing ${remoteKey.provider} from remote:`, error);
      }
    }

    console.log('[Sync] Sync from remote completed');
  } catch (error) {
    console.error('[Sync] Failed to sync from remote:', error);
    throw error;
  }
}

/**
 * Full bidirectional sync
 */
export async function fullSync(): Promise<void> {
  console.log('[Sync] Starting full sync...');

  try {
    // Check if online
    if (!navigator.onLine) {
      console.log('[Sync] Offline, skipping sync');
      return;
    }

    // Upload local changes first
    await syncToRemote();

    // Then download remote changes
    await syncFromRemote();

    console.log('[Sync] Full sync completed');
  } catch (error) {
    console.error('[Sync] Full sync failed:', error);
    throw error;
  }
}

/**
 * Save API key (local + trigger sync)
 */
export async function saveApiKey(provider: Provider, apiKey: string): Promise<void> {
  console.log(`[Sync] Saving API key for ${provider}...`);

  try {
    // Get user ID (will be 'anonymous' if not authenticated)
    const currentUserId = await getCurrentUserId();
    const isAnonymous = currentUserId === 'anonymous';

    // Encrypt the API key
    const encryptedKey = await encryptApiKey(apiKey, currentUserId);

    // Check if exists
    const existing = await localDB.getApiKeyByProvider(provider);

    const record: ApiKeyRecord = {
      id: existing?.id || provider, // Use provider as temporary ID
      provider,
      apiKey: encryptedKey,
      updatedAt: Date.now(),
      syncStatus: isAnonymous ? 'synced' : 'pending', // Mark as synced for anonymous (no cloud sync)
    };

    // Save locally
    await localDB.saveApiKey(record);

    console.log(`[Sync] API key for ${provider} saved locally (${isAnonymous ? 'offline mode' : 'will sync'})`);

    // Trigger background sync only if authenticated
    if (!isAnonymous) {
      setTimeout(() => fullSync(), 100);
    }
  } catch (error) {
    console.error(`[Sync] Failed to save API key for ${provider}:`, error);
    throw error;
  }
}

/**
 * Delete API key (local + trigger sync)
 */
export async function deleteApiKey(provider: Provider): Promise<void> {
  console.log(`[Sync] Deleting API key for ${provider}...`);

  try {
    // Get the record to get remote ID
    const existing = await localDB.getApiKeyByProvider(provider);

    if (!existing) {
      console.log(`[Sync] No API key found for ${provider}`);
      return;
    }

    // Delete locally
    await localDB.deleteApiKey(provider);

    // Delete remotely if synced
    if (existing.id !== provider && navigator.onLine) {
      try {
        await remoteAPI.deleteRemoteApiKey(existing.id);
        console.log(`[Sync] Deleted ${provider} from remote`);
      } catch (error) {
        console.error(`[Sync] Failed to delete from remote:`, error);
      }
    }

    console.log(`[Sync] API key for ${provider} deleted`);
  } catch (error) {
    console.error(`[Sync] Failed to delete API key for ${provider}:`, error);
    throw error;
  }
}

/**
 * Get decrypted API key
 */
export async function getDecryptedApiKey(provider: Provider): Promise<string | null> {
  try {
    // Get user ID (will be 'anonymous' if not authenticated)
    const currentUserId = await getCurrentUserId();
    const record = await localDB.getApiKeyByProvider(provider);

    if (!record) return null;

    return await decryptApiKey(record.apiKey, currentUserId);
  } catch (error) {
    console.error(`[Sync] Failed to decrypt API key for ${provider}:`, error);
    return null;
  }
}
