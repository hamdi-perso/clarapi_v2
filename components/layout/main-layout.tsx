"use client";

import { useState } from "react";
import { TopBar } from "./top-bar";
import { ResizablePanel } from "./resizable-panel";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <ResizablePanel
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      >
        {children}
      </ResizablePanel>
    </div>
  );
}
