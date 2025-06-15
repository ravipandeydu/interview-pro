'use client'

import React from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-indigo-500/20 bg-background/70 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 pointer-events-none" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              InterviewPro
            </h3>
            <p className="text-sm text-muted-foreground">
              A comprehensive platform for managing technical recruitment interviews, coding assessments, and candidate evaluations.
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://linkedin.com" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="mailto:info@interviewpro.com" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/documentation" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-indigo-500/10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-center text-xs text-muted-foreground md:text-left">
            © {new Date().getFullYear()} InterviewPro. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-xs text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Accessibility
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Status
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}