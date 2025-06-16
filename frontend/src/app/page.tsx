"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  CheckCircle,
  Code,
  Users,
  VideoIcon,
  ClipboardCheck,
  Brain,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useStore } from "../store/useStore";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { enableAuth, enableChat } = useStore();

  const features = [
    {
      icon: <VideoIcon className="h-6 w-6" />,
      title: "Virtual Interviews",
      description:
        "Conduct seamless video interviews with candidates from anywhere in the world",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Technical Assessments",
      description:
        "Evaluate coding skills with real-time collaborative coding environments",
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Structured Evaluation",
      description:
        "Standardized scoring and feedback templates for objective candidate assessment",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description:
        "Get intelligent analysis and recommendations for candidate performance",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Compliant",
      description:
        "Enterprise-grade security with role-based access control and data protection",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaborative Hiring",
      description:
        "Involve multiple team members in the interview process with shared feedback",
    },
  ];

  // Feature card colors
  const featureColors = [
    {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      icon: "text-purple-500",
    },
    {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      icon: "text-blue-500",
    },
    {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      icon: "text-emerald-500",
    },
    {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      icon: "text-amber-500",
    },
    {
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      icon: "text-rose-500",
    },
    {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      icon: "text-cyan-500",
    },
  ];

  // Badge colors
  const badgeColors = [
    "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
    "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30",
    "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
    "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30",
    "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20 dark:from-indigo-950/50 dark:via-background dark:to-violet-950/40 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-3xl opacity-30" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="px-4 py-1 backdrop-blur-sm bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-medium"
            >
              Next-Gen Technical Recruitment Platform
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
              InterviewPro
            </h1>
            <p className="mx-auto max-w-[700px] text-xl text-foreground/80 leading-relaxed">
              A comprehensive platform for managing technical recruitment
              interviews, coding assessments, and candidate evaluations
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Video Interviews",
              "Technical Assessments",
              "Candidate Tracking",
              "AI Analysis",
              "Collaborative Hiring",
              "Secure & Compliant",
            ].map((label, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={`px-3 py-1 backdrop-blur-sm border ${
                  badgeColors[index % badgeColors.length]
                }`}
              >
                {label}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {enableAuth ? (
              <Button
                size="lg"
                className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/register" className="flex items-center gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Configuration Status */}
        {/* <div className="mb-16">
          <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-semibold text-indigo-950 dark:text-indigo-100">Platform Status</CardTitle>
              <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
                Current feature availability and system status
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 rounded-lg backdrop-blur-sm bg-background/30 border border-indigo-500/20 shadow-sm">
                  <div className={`p-2 rounded-full ${enableAuth ? 'bg-emerald-500/20' : 'bg-gray-200/20'}`}>
                    <CheckCircle className={`h-5 w-5 ${enableAuth ? 'text-emerald-500' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-medium ${enableAuth ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                    Authentication: {enableAuth ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg backdrop-blur-sm bg-background/30 border border-indigo-500/20 shadow-sm">
                  <div className={`p-2 rounded-full ${enableChat ? 'bg-emerald-500/20' : 'bg-gray-200/20'}`}>
                    <CheckCircle className={`h-5 w-5 ${enableChat ? 'text-emerald-500' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-medium ${enableChat ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                    AI Assistant: {enableChat ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`h-full backdrop-blur-md bg-background/40 border ${
                featureColors[index % featureColors.length].border
              } shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] overflow-hidden`}
            >
              <div
                className={`absolute inset-0 ${
                  featureColors[index % featureColors.length].bg
                } opacity-30 pointer-events-none`}
              />
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 ${
                      featureColors[index % featureColors.length].bg
                    } rounded-xl backdrop-blur-sm border ${
                      featureColors[index % featureColors.length].border
                    }`}
                  >
                    <div
                      className={
                        featureColors[index % featureColors.length].icon
                      }
                    >
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-foreground/70">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-semibold text-indigo-950 dark:text-indigo-100">
              How It Works
            </CardTitle>
            <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
              Streamline your technical recruitment process in three simple
              steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 p-5 rounded-xl backdrop-blur-sm bg-background/30 border border-indigo-500/20 shadow-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                    1
                  </div>
                  <h4 className="font-semibold text-lg text-indigo-950 dark:text-indigo-100">
                    Create Interviews
                  </h4>
                </div>
                <p className="text-indigo-700/70 dark:text-indigo-300/70 relative z-10">
                  Set up structured interviews with customized questions, coding
                  challenges, and evaluation criteria
                </p>
              </div>
              <div className="space-y-3 p-5 rounded-xl backdrop-blur-sm bg-background/30 border border-purple-500/20 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold">
                    2
                  </div>
                  <h4 className="font-semibold text-lg text-purple-950 dark:text-purple-100">
                    Conduct Assessments
                  </h4>
                </div>
                <p className="text-purple-700/70 dark:text-purple-300/70 relative z-10">
                  Host video interviews with integrated coding environments and
                  real-time collaboration tools
                </p>
              </div>
              <div className="space-y-3 p-5 rounded-xl backdrop-blur-sm bg-background/30 border border-violet-500/20 shadow-sm relative overflow-hidden group hover:border-violet-500/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-300 font-bold">
                    3
                  </div>
                  <h4 className="font-semibold text-lg text-violet-950 dark:text-violet-100">
                    Evaluate Candidates
                  </h4>
                </div>
                <p className="text-violet-700/70 dark:text-violet-300/70 relative z-10">
                  Review performance, generate AI-powered insights, and make
                  data-driven hiring decisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
