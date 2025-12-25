"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AI_MODELS, type AIModel } from '@/lib/ai/models';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleModelSelect = (model: AIModel) => {
    onModelChange(model);
    setIsOpen(false);
  };

  // Get short name for compact display
  const getShortName = (model: AIModel) => {
    const parts = model.name.split(' ');
    if (parts.length >= 2) {
      // e.g., "Claude Sonnet 4.5" -> "Sonnet 4.5"
      // e.g., "GPT-4o" -> "GPT-4o"
      return parts.slice(1).join(' ') || model.name;
    }
    return model.name;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary/50 transition-colors text-xs border-r border-border"
        title={selectedModel.name}
      >
        <span className="font-medium text-muted-foreground truncate max-w-[80px]">
          {getShortName(selectedModel)}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="max-h-[320px] overflow-y-auto py-1">
            {AI_MODELS.map((group) => (
              <div key={group.provider}>
                {/* Group Label */}
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                  {group.label}
                </div>

                {/* Models */}
                {group.models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`
                      w-full px-2.5 py-1.5 text-left text-xs hover:bg-secondary transition-colors
                      flex items-center justify-between gap-2
                      ${selectedModel.id === model.id ? 'bg-secondary' : ''}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{model.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {(model.contextWindow / 1000).toLocaleString()}K tokens
                      </div>
                    </div>
                    {selectedModel.id === model.id && (
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
