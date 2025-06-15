'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Users, Building, Globe, Award, Sparkles, ArrowRight, CheckCircle2, Briefcase, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former tech recruiter with 10+ years of experience in building hiring solutions for enterprise companies.',
      avatar: '👨‍💼'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO & Co-Founder',
      bio: 'Full-stack engineer with expertise in building scalable video and collaboration platforms.',
      avatar: '👩‍💻'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Product',
      bio: 'Product leader focused on creating intuitive user experiences for technical assessment tools.',
      avatar: '👨‍🔧'
    },
    {
      name: 'Priya Patel',
      role: 'Lead AI Engineer',
      bio: 'AI/ML specialist with a background in natural language processing and candidate evaluation systems.',
      avatar: '👩‍🔬'
    },
  ]

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'InterviewPro was established with a mission to transform technical hiring.'
    },
    {
      year: '2021',
      title: 'Seed Funding',
      description: '$2.5M raised to build the core platform and expand the engineering team.'
    },
    {
      year: '2022',
      title: 'Platform Launch',
      description: 'Official launch of the InterviewPro platform with video interviews and coding assessments.'
    },
    {
      year: '2023',
      title: 'AI Integration',
      description: 'Introduction of AI-powered candidate insights and automated evaluation features.'
    },
    {
      year: '2024',
      title: 'Enterprise Expansion',
      description: 'Expanded to serve 500+ companies with enhanced security and compliance features.'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20 dark:from-indigo-950/50 dark:via-background dark:to-violet-950/40 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <Badge variant="outline" className="px-4 py-1 backdrop-blur-sm bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-medium">
              About InterviewPro
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
              Our Mission & Story
            </h1>
            <p className="mx-auto max-w-[700px] text-xl text-foreground/80 leading-relaxed">
              We're transforming technical recruitment with intelligent tools that make hiring more efficient, objective, and enjoyable for everyone involved.
            </p>
          </div>
        </div>

        {/* Our Mission */}
        <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden mb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-semibold text-indigo-950 dark:text-indigo-100">Our Mission</CardTitle>
            <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
              Why we built InterviewPro
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6">
            <p className="text-lg text-foreground/80 leading-relaxed">
              At InterviewPro, we believe technical hiring should be based on skills and potential, not just resumes and credentials. Our platform was built to create a more equitable, efficient, and insightful recruitment process for technical roles.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl backdrop-blur-sm border border-indigo-500/30">
                  <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Objective Evaluation</h3>
                  <p className="text-foreground/70">Standardized assessments that focus on real-world skills and problem-solving abilities.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-500/10 rounded-xl backdrop-blur-sm border border-purple-500/30">
                  <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Inclusive Hiring</h3>
                  <p className="text-foreground/70">Tools designed to reduce bias and create opportunities for candidates from diverse backgrounds.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-violet-500/10 rounded-xl backdrop-blur-sm border border-violet-500/30">
                  <CheckCircle2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Data-Driven Decisions</h3>
                  <p className="text-foreground/70">AI-powered insights that help teams make better, more informed hiring choices.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl backdrop-blur-sm border border-emerald-500/30">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Candidate Experience</h3>
                  <p className="text-foreground/70">A respectful, transparent process that values candidates' time and showcases their abilities.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Journey */}
        <Card className="backdrop-blur-md bg-background/40 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden mb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-semibold text-purple-950 dark:text-purple-100">Our Journey</CardTitle>
            <CardDescription className="text-purple-700/70 dark:text-purple-300/70">
              Key milestones in our company history
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-8 relative">
              {/* Timeline line */}
              <div className="absolute left-[22px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-violet-500/50 dark:from-indigo-400/50 dark:via-purple-400/50 dark:to-violet-400/50" />
              
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 z-20 relative">
                      {milestone.year.substring(2)}
                    </div>
                  </div>
                  <div className="space-y-1 pt-2">
                    <h3 className="font-semibold text-lg text-purple-800 dark:text-purple-300">{milestone.title}</h3>
                    <p className="text-foreground/70">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Our Team */}
        <Card className="backdrop-blur-md bg-background/40 border border-violet-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden mb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-semibold text-violet-950 dark:text-violet-100">Our Team</CardTitle>
            <CardDescription className="text-violet-700/70 dark:text-violet-300/70">
              The people behind InterviewPro
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="backdrop-blur-sm bg-background/30 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-4xl">
                        {member.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">{member.role}</p>
                      </div>
                      <p className="text-sm text-foreground/70">{member.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-6 mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
            Ready to transform your technical hiring?
          </h2>
          <p className="mx-auto max-w-[600px] text-lg text-foreground/80">
            Join hundreds of companies using InterviewPro to find and hire the best technical talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/register" className="flex items-center gap-2">Get Started <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}