'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { CheckCircle, Code, Database, Palette, Shield, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Home() {
  const { enableAuth, enableChat } = useStore()

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Next.js 15.3.3 + React 19',
      description: 'Latest Next.js with App Router and Turbopack for blazing fast development'
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'TypeScript + ESLint',
      description: 'Full type safety with modern linting and code formatting'
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: 'Tailwind CSS + shadcn/ui',
      description: 'Beautiful, accessible components with utility-first CSS'
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'TanStack Query + Zustand',
      description: 'Powerful state management and server state synchronization'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Authentication Ready',
      description: 'Complete auth flow with protected routes and user management'
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Production Ready',
      description: 'Best practices, error handling, and performance optimizations'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Next.js Starter
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Production-grade Next.js 15.3.3 + React 19 frontend starter with TypeScript, ESLint, Tailwind CSS, and shadcn/ui
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">Next.js 15.3.3</Badge>
          <Badge variant="secondary">React 19</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">Tailwind CSS</Badge>
          <Badge variant="secondary">shadcn/ui</Badge>
          <Badge variant="secondary">TanStack Query</Badge>
          <Badge variant="secondary">Zustand</Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            View Documentation
          </Button>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
            <CardDescription>
              Current feature flags and environment configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-5 w-5 ${enableAuth ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={enableAuth ? 'text-foreground' : 'text-muted-foreground'}>
                  Authentication: {enableAuth ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-5 w-5 ${enableChat ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={enableChat ? 'text-foreground' : 'text-muted-foreground'}>
                  Chat Features: {enableChat ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Get up and running with this starter template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Environment Setup</h4>
            <p className="text-sm text-muted-foreground">
              Configure your environment variables in <code className="bg-muted px-1 py-0.5 rounded">.env.local</code>
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">2. Install Dependencies</h4>
            <p className="text-sm text-muted-foreground">
              Run <code className="bg-muted px-1 py-0.5 rounded">npm install --legacy-peer-deps</code> to install all dependencies
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">3. Start Development</h4>
            <p className="text-sm text-muted-foreground">
              Run <code className="bg-muted px-1 py-0.5 rounded">npm run dev</code> to start the development server
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
