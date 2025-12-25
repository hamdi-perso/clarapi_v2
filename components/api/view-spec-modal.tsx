"use client";

import { X, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ViewSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  spec: {
    name: string;
    content: string;
    format: 'json' | 'yaml';
  } | null;
}

export function ViewSpecModal({ isOpen, onClose, spec }: ViewSpecModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !spec || !mounted) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(spec.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modal = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">{spec.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {spec.format.toUpperCase()} Format
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto">
            <code>{spec.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
