"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, User, LogOut, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { useStore } from "../../store/useStore";
import { useAuth } from "../../hooks/useAuth";
import NotificationDropdown from "../notifications/NotificationDropdown";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, enableAuth } = useStore();
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              InterviewPro
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Home
            </Link>
            {enableAuth && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/interviews"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Interviews
                    </Link>
                    <Link
                      href="/questions"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Questions
                    </Link>
                    <Link
                      href="/history"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Interview History
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other components can go here */}
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {enableAuth && isAuthenticated && (
              <>
                <NotificationDropdown />
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/settings">
                    <Settings className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Settings</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/profile">
                    <User className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Profile</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Logout</span>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
