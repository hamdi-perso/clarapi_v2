"use client";

import { useAuthenticator } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { GeneralInfo } from '@/components/settings/general-info';
import { AIKeys } from '@/components/settings/ai-keys';

export default function SettingsPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Offline Mode Notice */}
          {!isAuthenticated && (
            <div className="p-4 border border-blue-500/20 rounded-lg bg-blue-500/10 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-500 mb-1">
                  Offline Mode
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your API keys are stored locally in your browser. They won't sync across devices.{' '}
                  <Link href="/sign-in" className="text-blue-500 hover:underline">
                    Sign in
                  </Link>{' '}
                  to enable cloud sync.
                </p>
              </div>
            </div>
          )}

          {/* General Info Section - Only for authenticated users */}
          {isAuthenticated && (
            <div className="p-6 border border-border rounded-lg bg-card">
              <GeneralInfo />
            </div>
          )}

          {/* AI Keys Section - Available for everyone */}
          <div className="p-6 border border-border rounded-lg bg-card">
            <AIKeys />
          </div>
        </div>
      </div>
    </div>
  );
}
