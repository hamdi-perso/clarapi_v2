"use client";

import { useState } from "react";
import { TopBar } from "./top-bar";
import { ResizablePanel } from "./resizable-panel";
import { ImportModal } from "@/components/api/import-modal";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <ResizablePanel
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        onImportClick={() => setImportModalOpen(true)}
      >
        {children}
      </ResizablePanel>

      {/* Import Modal - Full page overlay */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
    </div>
  );
}
