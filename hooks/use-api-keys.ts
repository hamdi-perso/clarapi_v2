"use client";

import { useState, useEffect, useCallback } from 'react';
import * as syncService from '@/lib/sync/api-keys-sync';
import * as localDB from '@/lib/db/api-keys';
import { maskApiKey } from '@/lib/crypto/encryption';
import type { Provider, ApiKeyRecord } from '@/lib/db/schema';

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load API keys from IndexedDB
  const loadKeys = useCallback(async () => {
    try {
      setLoading(true);
      const allKeys = await localDB.getAllApiKeys();
      setKeys(allKeys);
    } catch (error) {
      console.error('[useApiKeys] Failed to load keys:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual sync (defined before useEffect that uses it)
  const sync = useCallback(async () => {
    try {
      setSyncing(true);
      await syncService.fullSync();
      await loadKeys();
    } catch (error) {
      console.error('[useApiKeys] Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [loadKeys]);

  // Save API key
  const saveKey = useCallback(async (provider: Provider, apiKey: string) => {
    try {
      await syncService.saveApiKey(provider, apiKey);
      await loadKeys();
    } catch (error) {
      console.error(`[useApiKeys] Failed to save key for ${provider}:`, error);
      throw error;
    }
  }, [loadKeys]);

  // Delete API key
  const deleteKey = useCallback(async (provider: Provider) => {
    try {
      await syncService.deleteApiKey(provider);
      await loadKeys();
    } catch (error) {
      console.error(`[useApiKeys] Failed to delete key for ${provider}:`, error);
      throw error;
    }
  }, [loadKeys]);

  // Get decrypted API key
  const getDecryptedKey = useCallback(async (provider: Provider): Promise<string | null> => {
    try {
      return await syncService.getDecryptedApiKey(provider);
    } catch (error) {
      console.error(`[useApiKeys] Failed to decrypt key for ${provider}:`, error);
      return null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  // Auto-sync on mount and when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      console.log('[useApiKeys] Back online, syncing...');
      await sync();
    };

    window.addEventListener('online', handleOnline);

    // Initial sync
    console.log('[useApiKeys] Component mounted, checking online status:', navigator.onLine);
    if (navigator.onLine) {
      console.log('[useApiKeys] Starting initial sync...');
      sync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [sync]);

  // Get key by provider
  const getKey = useCallback((provider: Provider): ApiKeyRecord | undefined => {
    return keys.find(k => k.provider === provider);
  }, [keys]);

  // Get masked key for display
  const getMaskedKey = useCallback((provider: Provider): string => {
    const key = getKey(provider);
    if (!key) return 'Not set';

    // The key is encrypted, so we can't mask it properly
    // Just show sync status
    return key.syncStatus === 'synced' ? '••••••••' : '••••••••';
  }, [getKey]);

  return {
    keys,
    loading,
    syncing,
    saveKey,
    deleteKey,
    getKey,
    getMaskedKey,
    getDecryptedKey,
    sync,
  };
}
