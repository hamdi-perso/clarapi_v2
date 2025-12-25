"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { useChatConfig } from "@/hooks/use-chat-config";

export function ChatArea() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { selectedModel, setSelectedModel } = useChatConfig();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    console.log("Sending message:", message, "with model:", selectedModel.id);

    // TODO: Implement actual message sending logic
    await new Promise(resolve => setTimeout(resolve, 1000));

    setMessage("");
    setIsLoading(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
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
        <div className="max-w-3xl mx-auto h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Start a conversation</p>
            <p className="text-sm mt-2">
              Type your message below to get started
            </p>
          </div>
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
