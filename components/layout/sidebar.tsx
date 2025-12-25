"use client";

import { Upload, Database, MessageSquare } from "lucide-react";
import { useEffect } from "react";
import { ApiList } from "@/components/api/api-list";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onImportClick: () => void;
}

export function Sidebar({ isOpen, onClose, onImportClick }: SidebarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-16 lg:top-0 bottom-0 lg:bottom-auto left-0 z-40
          w-72 lg:w-full lg:h-full bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full p-4 gap-6 overflow-y-auto">
          {/* Import Section */}
          <div className="space-y-2">
            <button
              onClick={onImportClick}
              className="w-full h-10 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
          </div>

          {/* APIs Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground">
              <Database className="h-4 w-4" />
              APIs
            </div>
            <ApiList />
          </div>

          {/* Chat Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              Chat
            </div>
            <div className="px-2 py-8 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
