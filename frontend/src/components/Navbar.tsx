"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
      <Link href="/" className="flex items-center gap-2">
        <img src="/favicon.ico" alt="Typeform Logo" className="w-6 h-6" />
        <span className="font-bold text-xl text-foreground">Typeform</span>
      </Link>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-md hover:bg-muted focus-ring transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-foreground" />
        ) : (
          <Moon className="h-5 w-5 text-foreground" />
        )}
      </button>
    </nav>
  );
}
