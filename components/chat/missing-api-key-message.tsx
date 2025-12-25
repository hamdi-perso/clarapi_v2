"use client";

import { AlertCircle, Settings } from 'lucide-react';
import Link from 'next/link';

interface MissingApiKeyMessageProps {
  provider: 'anthropic' | 'openai' | 'googleai';
  modelName: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  googleai: 'Google AI',
};

export function MissingApiKeyMessage({ provider, modelName }: MissingApiKeyMessageProps) {
  const providerLabel = PROVIDER_LABELS[provider] || provider;

  return (
    <div className="flex justify-center my-6">
      <div className="max-w-md w-full bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-yellow-500/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-500 mb-1">
              API Key Required
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              To use <span className="font-medium">{modelName}</span>, you need to configure your{' '}
              <span className="font-medium">{providerLabel}</span> API key.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
