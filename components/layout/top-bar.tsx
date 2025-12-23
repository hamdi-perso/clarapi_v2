"use client";

import Image from "next/image";
import { Menu, User } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4 gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Image
            src="/logo_clarapi.png"
            alt="Clarapi Logo"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="User profile"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
