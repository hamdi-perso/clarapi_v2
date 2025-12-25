import * as localDB from '@/lib/db/api-specs';
import * as remoteAPI from '@/lib/api/api-specs-api';
import type { ApiSpecRecord } from '@/lib/db/schema';
import { isAuthenticated } from '@/lib/auth/user-utils';

/**
 * Sync local changes to remote (upload)
 */
export async function syncToRemote(): Promise<void> {
  console.log('[Sync:ApiSpecs] Starting sync to remote...');

  try {
    const localSpecs = await localDB.getAllApiSpecs();
    const pendingSpecs = localSpecs.filter(spec => spec.syncStatus === 'pending');

    if (pendingSpecs.length === 0) {
      console.log('[Sync:ApiSpecs] No pending changes to sync');
      return;
    }

    for (const localSpec of pendingSpecs) {
      try {
        // Check if has remote ID (updating) or new (creating)
        const isTemporaryId = localSpec.id.startsWith('temp_');

        const remoteSpec = await remoteAPI.saveRemoteApiSpec(
          localSpec.name,
          localSpec.fileName,
          localSpec.content,
          localSpec.format,
          localSpec.specVersion,
          isTemporaryId ? undefined : localSpec.id
        );

        if (isTemporaryId) {
          // Delete the old temporary record
          await localDB.deleteApiSpec(localSpec.id);

          // Create new record with remote ID
          const newRecord: ApiSpecRecord = {
            ...localSpec,
            id: remoteSpec.id,
            syncStatus: 'synced',
            lastSyncedAt: Date.now(),
          };
          await localDB.saveApiSpec(newRecord);

          console.log(`[Sync:ApiSpecs] Replaced temp ID ${localSpec.id} with remote ID ${remoteSpec.id}`);
        } else {
          // Just update sync status
          await localDB.updateSyncStatus(localSpec.id, 'synced', Date.now());
        }

        console.log(`[Sync:ApiSpecs] Synced ${localSpec.name} to remote`);
      } catch (error) {
        console.error(`[Sync:ApiSpecs] Error syncing ${localSpec.name}:`, error);
        await localDB.updateSyncStatus(localSpec.id, 'error');
      }
    }

    console.log('[Sync:ApiSpecs] Sync to remote completed');
  } catch (error) {
    console.error('[Sync:ApiSpecs] Failed to sync to remote:', error);
    throw error;
  }
}

/**
 * Sync remote changes to local (download)
 */
export async function syncFromRemote(): Promise<void> {
  console.log('[Sync:ApiSpecs] Starting sync from remote...');

  try {
    const remoteSpecs = await remoteAPI.fetchRemoteApiSpecs();

    for (const remoteSpec of remoteSpecs) {
      try {
        // Check if exists locally
        const localSpec = await localDB.getApiSpecById(remoteSpec.id);

        // Compare timestamps
        const remoteTime = new Date(remoteSpec.updatedAt).getTime();
        const localTime = localSpec?.updatedAt || 0;

        // Remote is newer, update local
        if (remoteTime > localTime) {
          const record: ApiSpecRecord = {
            id: remoteSpec.id,
            name: remoteSpec.name,
            fileName: remoteSpec.fileName,
            content: remoteSpec.content,
            format: remoteSpec.format as 'json' | 'yaml',
            specVersion: remoteSpec.specVersion || undefined,
            createdAt: new Date(remoteSpec.createdAt).getTime(),
            updatedAt: remoteTime,
            syncStatus: 'synced',
            lastSyncedAt: Date.now(),
          };

          await localDB.saveApiSpec(record);
          console.log(`[Sync:ApiSpecs] Updated ${remoteSpec.name} from remote`);
        }
      } catch (error) {
        console.error(`[Sync:ApiSpecs] Error syncing ${remoteSpec.name} from remote:`, error);
      }
    }

    console.log('[Sync:ApiSpecs] Sync from remote completed');
  } catch (error) {
    console.error('[Sync:ApiSpecs] Failed to sync from remote:', error);
    throw error;
  }
}

/**
 * Full bidirectional sync
 */
export async function fullSync(): Promise<void> {
  console.log('[Sync:ApiSpecs] Starting full sync...');

  try {
    // Check if online
    if (!navigator.onLine) {
      console.log('[Sync:ApiSpecs] Offline, skipping cloud sync');
      await markAllPendingAsSynced();
      return;
    }

    // Check if authenticated
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.log('[Sync:ApiSpecs] Not authenticated, working in offline mode');
      await markAllPendingAsSynced();
      return;
    }

    // Upload local changes first
    await syncToRemote();

    // Then download remote changes
    await syncFromRemote();

    console.log('[Sync:ApiSpecs] Full sync completed');
  } catch (error) {
    console.error('[Sync:ApiSpecs] Full sync failed:', error);
    // Don't throw - allow offline mode to work
    console.log('[Sync:ApiSpecs] Continuing in offline mode');
    await markAllPendingAsSynced();
  }
}

/**
 * Mark all pending specs as synced (for offline mode)
 */
async function markAllPendingAsSynced(): Promise<void> {
  const localSpecs = await localDB.getAllApiSpecs();
  const pendingSpecs = localSpecs.filter(spec => spec.syncStatus === 'pending');

  for (const spec of pendingSpecs) {
    await localDB.updateSyncStatus(spec.id, 'synced', Date.now());
  }

  if (pendingSpecs.length > 0) {
    console.log(`[Sync:ApiSpecs] Marked ${pendingSpecs.length} specs as synced (offline mode)`);
  }
}

/**
 * Import API spec (save locally + trigger sync)
 */
export async function importApiSpec(
  name: string,
  fileName: string,
  content: string,
  format: 'json' | 'yaml',
  specVersion?: string
): Promise<string> {
  console.log(`[Sync:ApiSpecs] Importing API spec: ${name}...`);

  try {
    const now = Date.now();
    const tempId = `temp_${now}`; // Temporary ID until synced

    const record: ApiSpecRecord = {
      id: tempId,
      name,
      fileName,
      content,
      format,
      specVersion,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    };

    // Save locally
    await localDB.saveApiSpec(record);

    console.log(`[Sync:ApiSpecs] API spec ${name} saved locally`);

    // Trigger sync immediately
    try {
      await fullSync();
      console.log(`[Sync:ApiSpecs] Import sync completed successfully`);
    } catch (error) {
      console.error(`[Sync:ApiSpecs] Import sync failed, but local save succeeded:`, error);
      // Don't throw - local save succeeded, sync will retry later
    }

    // Get the potentially updated ID after sync
    const allSpecs = await localDB.getAllApiSpecs();
    const savedSpec = allSpecs.find(s => s.name === name && s.fileName === fileName);

    return savedSpec?.id || tempId;
  } catch (error) {
    console.error(`[Sync:ApiSpecs] Failed to import API spec:`, error);
    throw error;
  }
}

/**
 * Delete API spec (local + remote)
 */
export async function deleteApiSpec(id: string): Promise<void> {
  console.log(`[Sync:ApiSpecs] Deleting API spec: ${id}...`);

  try {
    // Get the record
    const existing = await localDB.getApiSpecById(id);

    if (!existing) {
      console.log(`[Sync:ApiSpecs] No API spec found with id: ${id}`);
      return;
    }

    // Delete locally
    await localDB.deleteApiSpec(id);

    // Delete remotely if synced
    const hasRemoteId = id.length > 20;
    if (hasRemoteId && navigator.onLine) {
      try {
        await remoteAPI.deleteRemoteApiSpec(id);
        console.log(`[Sync:ApiSpecs] Deleted ${existing.name} from remote`);
      } catch (error) {
        console.error(`[Sync:ApiSpecs] Failed to delete from remote:`, error);
      }
    }

    console.log(`[Sync:ApiSpecs] API spec ${existing.name} deleted`);
  } catch (error) {
    console.error(`[Sync:ApiSpecs] Failed to delete API spec:`, error);
    throw error;
  }
}
