"use client";

import { User, Bot } from 'lucide-react';
import type { ChatMessage } from '@/lib/chat/types';
import { findModelById } from '@/lib/ai/models';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  // Format timestamp
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Get model name for assistant messages
  const model = message.modelId ? findModelById(message.modelId) : null;

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 rounded-lg bg-muted/50 text-xs text-muted-foreground max-w-md text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
        `}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Header */}
        <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs font-medium">
            {isUser ? 'You' : model?.name || 'Assistant'}
          </span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>

        {/* Content */}
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words
            ${
              isUser
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-muted text-foreground rounded-tl-sm'
            }
          `}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
