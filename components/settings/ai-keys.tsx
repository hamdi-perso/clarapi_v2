"use client";

import { useState, useEffect } from 'react';
import { useApiKeys } from '@/hooks/use-api-keys';
import { PROVIDERS, type Provider } from '@/lib/db/schema';
import { Eye, EyeOff, Save, Trash2, RefreshCw } from 'lucide-react';

const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: 'Anthropic (Claude)',
  googleai: 'Google AI (Gemini)',
  openai: 'OpenAI (GPT)',
};

export function AIKeys() {
  const {
    keys,
    loading,
    syncing,
    saveKey,
    deleteKey,
    getKey,
    getDecryptedKey,
    sync,
  } = useApiKeys();

  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<Provider>>(new Set());
  const [inputValues, setInputValues] = useState<Record<Provider, string>>({
    anthropic: '',
    googleai: '',
    openai: '',
  });
  const [savingProvider, setSavingProvider] = useState<Provider | null>(null);

  // Load decrypted keys when editing
  useEffect(() => {
    const loadKey = async () => {
      if (editingProvider) {
        const decrypted = await getDecryptedKey(editingProvider);
        if (decrypted) {
          setInputValues(prev => ({ ...prev, [editingProvider]: decrypted }));
        }
      }
    };
    loadKey();
  }, [editingProvider, getDecryptedKey]);

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setVisibleKeys(prev => new Set(prev).add(provider));
  };

  const handleCancel = (provider: Provider) => {
    setEditingProvider(null);
    setInputValues(prev => ({ ...prev, [provider]: '' }));
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(provider);
      return newSet;
    });
  };

  const handleSave = async (provider: Provider) => {
    const value = inputValues[provider];

    if (!value || value.trim() === '') {
      return;
    }

    try {
      setSavingProvider(provider);
      console.log(`[AIKeys] Saving key for ${provider}...`);
      await saveKey(provider, value.trim());
      console.log(`[AIKeys] Key saved successfully for ${provider}`);
      setEditingProvider(null);
      setInputValues(prev => ({ ...prev, [provider]: '' }));
      setVisibleKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(provider);
        return newSet;
      });
    } catch (error) {
      console.error(`[AIKeys] Error saving key for ${provider}:`, error);
      alert(`Failed to save API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingProvider(null);
    }
  };

  const handleDelete = async (provider: Provider) => {
    if (!confirm(`Delete API key for ${PROVIDER_LABELS[provider]}?`)) {
      return;
    }

    try {
      await deleteKey(provider);
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  };

  const toggleVisibility = (provider: Provider) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(provider)) {
        newSet.delete(provider);
      } else {
        newSet.add(provider);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading API keys...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AI Provider Keys</h2>
        <button
          onClick={sync}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      <div className="space-y-4">
        {PROVIDERS.map((provider) => {
          const existingKey = getKey(provider);
          const isEditing = editingProvider === provider;
          const isSaving = savingProvider === provider;
          const isVisible = visibleKeys.has(provider);

          return (
            <div
              key={provider}
              className="p-4 border border-border rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{PROVIDER_LABELS[provider]}</h3>
                {existingKey && existingKey.syncStatus !== 'synced' && (
                  <span className="text-xs text-yellow-500">Pending sync</span>
                )}
              </div>

              {isEditing ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        value={inputValues[provider]}
                        onChange={(e) =>
                          setInputValues(prev => ({
                            ...prev,
                            [provider]: e.target.value,
                          }))
                        }
                        placeholder="Enter API key"
                        className="w-full px-4 py-2 pr-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility(provider)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(provider)}
                      disabled={isSaving || !inputValues[provider].trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => handleCancel(provider)}
                      disabled={isSaving}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-muted-foreground">
                    {existingKey ? '••••••••••••' : 'Not set'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(provider)}
                      className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      {existingKey ? 'Edit' : 'Add'}
                    </button>
                    {existingKey && (
                      <button
                        onClick={() => handleDelete(provider)}
                        className="px-3 py-1.5 text-sm text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!navigator.onLine && (
        <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm">
          You are offline. Changes will be synced when you're back online.
        </div>
      )}
    </div>
  );
}
