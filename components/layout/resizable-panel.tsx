"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "./sidebar";

interface ResizablePanelProps {
  children: React.ReactNode;
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
  onImportClick: () => void;
}

export function ResizablePanel({
  children,
  isMobileMenuOpen,
  onMobileMenuClose,
  onImportClick,
}: ResizablePanelProps) {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const MIN_WIDTH = 200;
  const MAX_WIDTH = 500;

  useEffect(() => {
    const savedWidth = localStorage.getItem("sidebarWidth");
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth));
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
        localStorage.setItem("sidebarWidth", String(newWidth));
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Desktop Sidebar with custom width */}
      <div
        ref={sidebarRef}
        className="hidden lg:block relative h-full"
        style={{ width: `${sidebarWidth}px` }}
      >
        <Sidebar isOpen={false} onClose={onMobileMenuClose} onImportClick={onImportClick} />

        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`
            absolute top-0 right-0 w-1 h-full cursor-col-resize
            hover:bg-primary transition-colors
            ${isResizing ? "bg-primary" : "bg-transparent"}
          `}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={isMobileMenuOpen} onClose={onMobileMenuClose} onImportClick={onImportClick} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
