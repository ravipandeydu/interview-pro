'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { CheckCircle, Code, Users, VideoIcon, ClipboardCheck, Brain, Shield, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'
import Link from 'next/link'

export default function Home() {
  const { enableAuth, enableChat } = useStore()

  const features = [
    {
      icon: <VideoIcon className="h-6 w-6" />,
      title: 'Virtual Interviews',
      description: 'Conduct seamless video interviews with candidates from anywhere in the world'
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Technical Assessments',
      description: 'Evaluate coding skills with real-time collaborative coding environments'
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: 'Structured Evaluation',
      description: 'Standardized scoring and feedback templates for objective candidate assessment'
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI-Powered Insights',
      description: 'Get intelligent analysis and recommendations for candidate performance'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with role-based access control and data protection'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Collaborative Hiring',
      description: 'Involve multiple team members in the interview process with shared feedback'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            InterviewPro
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            A comprehensive platform for managing technical recruitment interviews, coding assessments, and candidate evaluations
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">Video Interviews</Badge>
          <Badge variant="secondary">Technical Assessments</Badge>
          <Badge variant="secondary">Candidate Tracking</Badge>
          <Badge variant="secondary">AI Analysis</Badge>
          <Badge variant="secondary">Collaborative Hiring</Badge>
          <Badge variant="secondary">Secure & Compliant</Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {enableAuth ? (
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Platform Status</CardTitle>
            <CardDescription>
              Current feature availability and system status
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
                  AI Assistant: {enableChat ? 'Enabled' : 'Disabled'}
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

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Streamline your technical recruitment process in three simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Create Interviews</h4>
            <p className="text-sm text-muted-foreground">
              Set up structured interviews with customized questions, coding challenges, and evaluation criteria
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">2. Conduct Assessments</h4>
            <p className="text-sm text-muted-foreground">
              Host video interviews with integrated coding environments and real-time collaboration tools
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">3. Evaluate Candidates</h4>
            <p className="text-sm text-muted-foreground">
              Review performance, generate AI-powered insights, and make data-driven hiring decisions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
