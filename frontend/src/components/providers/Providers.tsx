'use client'

import React from 'react'
import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'
import { Toaster } from '../ui/sonner'
import dynamic from "next/dynamic";

const NotificationProvider = dynamic(
  () => import("../../contexts/NotificationContext").then(mod => mod.NotificationProvider),
  { ssr: false }
);
// import { NotificationProvider } from '../../contexts/NotificationContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <NotificationProvider>
          {children}
          <Toaster />
        </NotificationProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}