"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, User, LogOut, Settings, Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { useStore } from "../../store/useStore";
import { useAuth } from "../../hooks/useAuth";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, enableAuth } = useStore();
  const { logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-500/20 bg-background/70 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
      <div className="container mx-auto flex h-16 items-center justify-between relative z-10">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              InterviewPro
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80"
            >
              Home
            </Link>
            {enableAuth && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/interviews"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80"
                    >
                      Interviews
                    </Link>
                    <Link
                      href="/questions"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80"
                    >
                      Questions
                    </Link>
                    <Link
                      href="/candidates"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80"
                    >
                      Candidates
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80"
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
            <Link
              href="/about"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80"
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {enableAuth && isAuthenticated && (
            <>
              <NotificationDropdown />
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-full hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Link href="/settings">
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Settings</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-full hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
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
                className="rounded-full hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <LogOut className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Logout</span>
              </Button>
            </>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Menu className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-background/95 backdrop-blur-lg border-b border-indigo-500/20 shadow-lg z-40 animate-in fade-in slide-in-from-top-5 duration-300">
          <nav className="container mx-auto py-4 flex flex-col space-y-3 px-4">
            <Link
              href="/"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80 py-2"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            {enableAuth && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80 py-2"
                      onClick={toggleMobileMenu}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/interviews"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80 py-2"
                      onClick={toggleMobileMenu}
                    >
                      Interviews
                    </Link>
                    <Link
                      href="/questions"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80 py-2"
                      onClick={toggleMobileMenu}
                    >
                      Questions
                    </Link>
                    <Link
                      href="/history"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80 py-2"
                      onClick={toggleMobileMenu}
                    >
                      Interview History
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80 py-2"
                      onClick={toggleMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80 py-2"
                      onClick={toggleMobileMenu}
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
            <Link
              href="/about"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80 py-2"
              onClick={toggleMobileMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80 py-2"
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
