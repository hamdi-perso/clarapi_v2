"use client";

import { useState, useEffect } from 'react';
import { getDefaultModel, findModelById, type AIModel } from '@/lib/ai/models';

const CHAT_CONFIG_KEY = 'clarapi-chat-config';

interface ChatConfig {
  selectedModelId: string;
}

/**
 * Hook to manage chat configuration (model selection, etc.)
 * Persists to localStorage
 */
export function useChatConfig() {
  const [selectedModel, setSelectedModel] = useState<AIModel>(getDefaultModel());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_CONFIG_KEY);
      if (stored) {
        const config: ChatConfig = JSON.parse(stored);
        const model = findModelById(config.selectedModelId);
        if (model) {
          setSelectedModel(model);
        }
      }
    } catch (error) {
      console.error('[ChatConfig] Failed to load config:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save config to localStorage when model changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const config: ChatConfig = {
        selectedModelId: selectedModel.id,
      };
      localStorage.setItem(CHAT_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('[ChatConfig] Failed to save config:', error);
    }
  }, [selectedModel, isLoaded]);

  return {
    selectedModel,
    setSelectedModel,
    isLoaded,
  };
}
