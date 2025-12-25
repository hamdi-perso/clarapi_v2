"use client";

import { useState, useEffect, useCallback } from 'react';
import * as syncService from '@/lib/sync/api-specs-sync';
import * as localDB from '@/lib/db/api-specs';
import type { ApiSpecRecord } from '@/lib/db/schema';

export function useApiSpecs() {
  const [specs, setSpecs] = useState<ApiSpecRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load API specs from IndexedDB
  const loadSpecs = useCallback(async () => {
    try {
      setLoading(true);
      const allSpecs = await localDB.getAllApiSpecs();
      // Sort by creation date (newest first)
      allSpecs.sort((a, b) => b.createdAt - a.createdAt);
      setSpecs(allSpecs);
    } catch (error) {
      console.error('[useApiSpecs] Failed to load specs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual sync
  const sync = useCallback(async () => {
    try {
      setSyncing(true);
      await syncService.fullSync();
      await loadSpecs();
    } catch (error) {
      console.error('[useApiSpecs] Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [loadSpecs]);

  // Import API spec
  const importSpec = useCallback(async (
    name: string,
    fileName: string,
    content: string,
    format: 'json' | 'yaml',
    specVersion?: string
  ) => {
    try {
      await syncService.importApiSpec(name, fileName, content, format, specVersion);
      await loadSpecs();
    } catch (error) {
      console.error(`[useApiSpecs] Failed to import spec:`, error);
      throw error;
    }
  }, [loadSpecs]);

  // Delete API spec
  const deleteSpec = useCallback(async (id: string) => {
    try {
      await syncService.deleteApiSpec(id);
      await loadSpecs();
    } catch (error) {
      console.error(`[useApiSpecs] Failed to delete spec:`, error);
      throw error;
    }
  }, [loadSpecs]);

  // Get spec by ID
  const getSpec = useCallback((id: string): ApiSpecRecord | undefined => {
    return specs.find(s => s.id === id);
  }, [specs]);

  // Initial load
  useEffect(() => {
    loadSpecs();
  }, [loadSpecs]);

  // Auto-sync on mount and when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      console.log('[useApiSpecs] Back online, syncing...');
      await sync();
    };

    window.addEventListener('online', handleOnline);

    // Initial sync
    console.log('[useApiSpecs] Component mounted, checking online status:', navigator.onLine);
    if (navigator.onLine) {
      console.log('[useApiSpecs] Starting initial sync...');
      sync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [sync]);

  return {
    specs,
    loading,
    syncing,
    importSpec,
    deleteSpec,
    getSpec,
    sync,
  };
}
