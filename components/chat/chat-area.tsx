"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { ChatMessageBubble } from "./chat-message";
import { MissingApiKeyMessage } from "./missing-api-key-message";
import { useChatConfig } from "@/hooks/use-chat-config";
import { useApiKeys } from "@/hooks/use-api-keys";
import type { ChatMessage } from "@/lib/chat/types";

export function ChatArea() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const { selectedModel, setSelectedModel } = useChatConfig();
  const { getKey } = useApiKeys();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    console.log('[ChatArea] handleSend called');
    console.log('[ChatArea] message:', message);
    console.log('[ChatArea] isLoading:', isLoading);

    if (!message.trim() || isLoading) {
      console.log('[ChatArea] Returning early - no message or loading');
      return;
    }

    // Check if API key exists for this provider
    console.log('[ChatArea] Checking API key for provider:', selectedModel.provider);
    const apiKey = getKey(selectedModel.provider);
    console.log('[ChatArea] API key found:', !!apiKey);

    if (!apiKey) {
      console.log('[ChatArea] No API key, showing warning');
      setShowApiKeyWarning(true);
      return;
    }

    console.log('[ChatArea] API key exists, proceeding with message send');
    setShowApiKeyWarning(false);
    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // TODO: Implement actual API call here
      console.log("Sending message:", userMessage, "with model:", selectedModel.id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add assistant response (mock for now)
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `This is a mock response from ${selectedModel.name}. The actual API integration will be implemented next.`,
        timestamp: Date.now(),
        modelId: selectedModel.id,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Add error message
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Failed to send message. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter: insert new line
        return;
      } else {
        // Enter: send message
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && !showApiKeyWarning ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg">Start a conversation</p>
                <p className="text-sm mt-2">
                  Type your message below to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
              {showApiKeyWarning && (
                <MissingApiKeyMessage
                  provider={selectedModel.provider}
                  modelName={selectedModel.name}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex items-start gap-2">
            {/* Text Input with integrated Model Selector */}
            <div className="flex-1 relative flex items-stretch rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent">
              {/* Model Selector */}
              <div className="flex items-center">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-3 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-[200px]"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="h-12 w-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Enter</kbd> to send,
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-1">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
