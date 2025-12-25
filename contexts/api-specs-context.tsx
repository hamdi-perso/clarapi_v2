"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as syncService from '@/lib/sync/api-specs-sync';
import * as localDB from '@/lib/db/api-specs';
import type { ApiSpecRecord } from '@/lib/db/schema';
import { Hub } from 'aws-amplify/utils';

interface ApiSpecsContextType {
  specs: ApiSpecRecord[];
  loading: boolean;
  syncing: boolean;
  importSpec: (
    name: string,
    fileName: string,
    content: string,
    format: 'json' | 'yaml',
    specVersion?: string
  ) => Promise<void>;
  deleteSpec: (id: string) => Promise<void>;
  getSpec: (id: string) => ApiSpecRecord | undefined;
  sync: () => Promise<void>;
}

const ApiSpecsContext = createContext<ApiSpecsContextType | undefined>(undefined);

export function ApiSpecsProvider({ children }: { children: ReactNode }) {
  const [specs, setSpecs] = useState<ApiSpecRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load API specs from IndexedDB
  const loadSpecs = useCallback(async () => {
    try {
      setLoading(true);
      const allSpecs = await localDB.getAllApiSpecs();
      console.log('[ApiSpecsContext] Loaded specs from DB:', allSpecs.length, allSpecs.map(s => s.id));
      // Sort by creation date (newest first)
      allSpecs.sort((a, b) => b.createdAt - a.createdAt);
      setSpecs(allSpecs);
    } catch (error) {
      console.error('[ApiSpecsContext] Failed to load specs:', error);
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
      console.error('[ApiSpecsContext] Sync failed:', error);
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
      console.error(`[ApiSpecsContext] Failed to import spec:`, error);
      throw error;
    }
  }, [loadSpecs]);

  // Delete API spec
  const deleteSpec = useCallback(async (id: string) => {
    try {
      await syncService.deleteApiSpec(id);
      await loadSpecs();
    } catch (error) {
      console.error(`[ApiSpecsContext] Failed to delete spec:`, error);
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
      console.log('[ApiSpecsContext] Back online, syncing...');
      await sync();
    };

    window.addEventListener('online', handleOnline);

    // Initial sync
    console.log('[ApiSpecsContext] Component mounted, checking online status:', navigator.onLine);
    if (navigator.onLine) {
      console.log('[ApiSpecsContext] Starting initial sync...');
      sync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [sync]);

  // Listen to auth state changes and reload data
  useEffect(() => {
    const hubListenerCancelToken = Hub.listen('auth', async ({ payload }) => {
      console.log('[ApiSpecsContext] Auth event:', payload.event);

      switch (payload.event) {
        case 'signedIn':
          console.log('[ApiSpecsContext] User signed in, reloading specs...');
          await loadSpecs();
          if (navigator.onLine) {
            await sync();
          }
          break;
        case 'signedOut':
          console.log('[ApiSpecsContext] User signed out, switching to anonymous database...');
          // Clear current specs and reload from anonymous database
          setSpecs([]);
          await loadSpecs();
          break;
        case 'tokenRefresh':
          // Silent token refresh, no need to reload
          break;
      }
    });

    return () => hubListenerCancelToken();
  }, [loadSpecs, sync]);

  return (
    <ApiSpecsContext.Provider
      value={{
        specs,
        loading,
        syncing,
        importSpec,
        deleteSpec,
        getSpec,
        sync,
      }}
    >
      {children}
    </ApiSpecsContext.Provider>
  );
}

export function useApiSpecs() {
  const context = useContext(ApiSpecsContext);
  if (context === undefined) {
    throw new Error('useApiSpecs must be used within ApiSpecsProvider');
  }
  return context;
}
