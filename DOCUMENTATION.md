# AI-Augmented Recruitment Interview Platform

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [User Guide](#user-guide)
  - [Admin Users](#admin-users)
  - [Recruiters](#recruiters)
  - [Candidates](#candidates)
- [Technical Details](#technical-details)
  - [Authentication System](#authentication-system)
  - [Interview Process](#interview-process)
  - [AI Code Assessment](#ai-code-assessment)
  - [Video Interview](#video-interview)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

The AI-Augmented Recruitment Interview Platform is a modern solution that combines video interviews with AI-powered code assessment and analysis to streamline the technical hiring process. It provides a comprehensive environment for managing candidates, conducting interviews, and evaluating technical skills with the help of artificial intelligence.

## Features

### Core Features

- **Video Interview Platform**: Conduct real-time video interviews with WebRTC technology
- **Code Assessment**: Interactive code editor with Monaco Editor for technical evaluations
- **AI-Powered Analysis**: Automated code review and candidate response analysis
- **Secure Authentication**: Role-based access control with JWT authentication
- **Candidate Management**: Complete candidate lifecycle management
- **Interview Scheduling**: Flexible interview scheduling and management
- **Email Notifications**: Automated email invitations and reminders
- **Comprehensive Reporting**: Detailed interview reports and analytics
- **PDF Report Generation**: Generate downloadable interview summary reports

### User Experience

- Modern, responsive UI built with Next.js and Tailwind CSS
- Dark/light theme support
- Mobile-friendly design
- Real-time notifications
- Intuitive navigation

## Project Structure

The project follows a monorepo structure with separate backend and frontend applications:

```
├── frontend/                # Next.js frontend application
│   ├── src/                 # Source code
│   │   ├── app/             # Next.js app directory
│   │   │   ├── (auth)/      # Authentication pages
│   │   │   ├── interview/   # Interview pages
│   │   │   └── candidates/  # Candidate management pages
│   │   ├── components/      # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── interviews/  # Interview-related components
│   │   │   └── candidates/  # Candidate-related components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   └── store/           # Zustand state management
│   ├── public/              # Static assets
│   └── tailwind.config.js   # Tailwind CSS configuration
├── backend/                 # Express backend application
│   ├── src/                 # Source code
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── templates/       # Email templates
│   │   └── utils/           # Utility functions
│   └── prisma/              # Prisma ORM configuration
│       └── schema.prisma    # Database schema
└── docker-compose.yml       # Docker Compose configuration
```

## User Roles

The platform supports three main user roles:

1. **Admin**: Full access to all platform features, user management, and system configuration
2. **Recruiter**: Manage candidates, create and conduct interviews, review results
3. **Candidate**: Access interviews via secure tokens, participate in video interviews, complete coding assessments

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL 14 or higher
- Redis 7 or higher

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/recruitment-interview-platform.git
   cd recruitment-interview-platform
   ```

2. Install dependencies
   ```bash
   npm install
   npm run install:all
   ```

### Environment Setup

1. Set up environment variables
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your configuration
   ```

2. Configure the following services:
   - PostgreSQL database connection
   - Redis connection
   - Email service (Resend)
   - Cloudflare R2 for file storage
   - OpenAI API for AI features

3. Set up the database
   ```bash
   cd backend
   npx prisma migrate dev
   ```

### Running the Application

#### Development Mode

```bash
# From the root directory
npm run dev
```

This will start both the frontend and backend in development mode.

#### Production Mode

Using Docker:

```bash
docker-compose up -d
```

Or manually:

```bash
# Build and start the backend
cd backend
npm run build
npm start

# In another terminal, build and start the frontend
cd frontend
npm run build
npm start
```

## User Guide

### Admin Users

As an admin, you have access to all platform features:

1. **User Management**:
   - Create, edit, and deactivate user accounts
   - Assign roles (Admin, Recruiter)
   - Monitor user activity

2. **System Configuration**:
   - Configure email templates
   - Set up integration with external services
   - Manage global settings

3. **Analytics Dashboard**:
   - View platform usage statistics
   - Monitor interview completion rates
   - Track candidate performance metrics

### Recruiters

As a recruiter, you can manage the recruitment process:

1. **Candidate Management**:
   - Add and edit candidate profiles
   - Upload and manage candidate documents
   - Track candidate status

2. **Interview Management**:
   - Create interview templates
   - Schedule interviews
   - Send interview invitations
   - Conduct live interviews
   - Review recorded interviews

3. **Assessment Review**:
   - Review candidate responses
   - Analyze AI-generated assessments
   - Add notes and feedback
   - Generate PDF reports

### Candidates

As a candidate, you can participate in interviews:

1. **Interview Access**:
   - Receive email invitation with secure access link
   - Access the interview platform using the provided token
   - Complete the interview within the specified timeframe

2. **Interview Process**:
   - Join video interviews at the scheduled time
   - Complete coding assessments in the integrated code editor
   - Submit responses to interview questions
   - Track progress through multi-step interviews

## Technical Details

### Authentication System

The platform uses JWT (JSON Web Tokens) for authentication with the following features:

- Secure token-based authentication
- Role-based access control
- Password hashing with bcryptjs
- Token refresh mechanism
- Session management

### Interview Process

The interview process consists of the following steps:

1. **Creation**: Recruiter creates an interview with questions and settings
2. **Invitation**: System generates a secure access token and sends an email invitation
3. **Access**: Candidate uses the token to access the interview
4. **Participation**: Candidate completes the interview questions and coding assessments
5. **Submission**: Responses are submitted and stored
6. **Analysis**: AI analyzes code submissions and provides insights
7. **Review**: Recruiter reviews the results and AI analysis
8. **Feedback**: Recruiter provides feedback and makes hiring decisions

### AI Code Assessment

The platform leverages AI for code assessment with the following capabilities:

- Automated code review and quality analysis
- Execution and testing of code submissions
- Performance evaluation
- Code style and best practices assessment
- Plagiarism detection
- Skill level estimation

### Video Interview

The video interview feature uses WebRTC technology for real-time communication:

- Peer-to-peer video and audio streaming
- Screen sharing capability
- Recording of interview sessions
- Transcription of spoken content
- Secure and encrypted communication

## Deployment

### Docker Deployment

The recommended deployment method is using Docker and Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Manual Deployment

For manual deployment:

1. Set up a production PostgreSQL database
2. Set up a production Redis instance
3. Configure environment variables for production
4. Build and deploy the backend:
   ```bash
   cd backend
   npm run build
   npm start
   ```
5. Build and deploy the frontend:
   ```bash
   cd frontend
   npm run build
   npm start
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify PostgreSQL is running
   - Check database credentials in .env file
   - Ensure database schema is up to date with `npx prisma migrate dev`

2. **Email Sending Failures**:
   - Verify Resend API key is correct
   - Check email templates for errors
   - Ensure email service is properly configured

3. **Video Interview Issues**:
   - Check browser compatibility (WebRTC requires modern browsers)
   - Verify camera and microphone permissions
   - Ensure stable internet connection

4. **AI Analysis Not Working**:
   - Verify OpenAI API key is correct
   - Check API rate limits
   - Ensure code submissions are in supported languages

### Getting Help

If you encounter issues not covered in this documentation:

1. Check the issue tracker on GitHub
2. Consult the API documentation
3. Contact the development team

---

© 2023 AI-Augmented Recruitment Interview Platform. All rights reserved.