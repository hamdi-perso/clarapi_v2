export interface AIModel {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'googleai';
  contextWindow: number;
}

export interface ModelGroup {
  provider: 'anthropic' | 'openai' | 'googleai';
  label: string;
  models: AIModel[];
}

export const AI_MODELS: ModelGroup[] = [
  {
    provider: 'anthropic',
    label: 'Anthropic',
    models: [
      {
        id: 'claude-opus-4-5',
        name: 'Claude Opus 4.5',
        provider: 'anthropic',
        contextWindow: 200000,
      },
      {
        id: 'claude-sonnet-4-5',
        name: 'Claude Sonnet 4.5',
        provider: 'anthropic',
        contextWindow: 200000,
      },
      {
        id: 'claude-sonnet-4',
        name: 'Claude Sonnet 4',
        provider: 'anthropic',
        contextWindow: 200000,
      },
      {
        id: 'claude-haiku-4',
        name: 'Claude Haiku 4',
        provider: 'anthropic',
        contextWindow: 200000,
      },
    ],
  },
  {
    provider: 'openai',
    label: 'OpenAI',
    models: [
      {
        id: 'gpt-5',
        name: 'GPT-5',
        provider: 'openai',
        contextWindow: 128000,
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        contextWindow: 128000,
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        contextWindow: 128000,
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        contextWindow: 8192,
      },
    ],
  },
  {
    provider: 'googleai',
    label: 'Google AI',
    models: [
      {
        id: 'gemini-3-ultra',
        name: 'Gemini 3 Ultra',
        provider: 'googleai',
        contextWindow: 1000000,
      },
      {
        id: 'gemini-2-pro',
        name: 'Gemini 2 Pro',
        provider: 'googleai',
        contextWindow: 1000000,
      },
      {
        id: 'gemini-2-flash',
        name: 'Gemini 2 Flash',
        provider: 'googleai',
        contextWindow: 1000000,
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'googleai',
        contextWindow: 2000000,
      },
    ],
  },
];

/**
 * Get default model (first model from first group)
 */
export function getDefaultModel(): AIModel {
  return AI_MODELS[0].models[0];
}

/**
 * Find model by ID
 */
export function findModelById(id: string): AIModel | undefined {
  for (const group of AI_MODELS) {
    const model = group.models.find(m => m.id === id);
    if (model) return model;
  }
  return undefined;
}
