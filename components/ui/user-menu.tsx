"use client";

import { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import Link from "next/link";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="User menu"
        >
          <User className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
            {user ? (
              // Authenticated state
              <div className="p-2">
                <div className="px-3 py-2 text-sm border-b border-border mb-2">
                  <p className="text-muted-foreground text-xs mb-1">Signed in as</p>
                  <p className="font-medium truncate">
                    {user.signInDetails?.loginId || user.username}
                  </p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2 mb-1"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              // Unauthenticated state
              <div className="p-2">
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-secondary transition-colors flex items-center gap-2 mb-1"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <div className="border-t border-border my-2"></div>
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-3 py-2 text-left text-sm rounded-md hover:bg-secondary transition-colors mb-1"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-3 py-2 text-left text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
