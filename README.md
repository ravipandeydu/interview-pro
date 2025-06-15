# AI-Augmented Recruitment Interview Platform

A modern recruitment platform that combines video interviews with AI-powered code assessment and analysis to streamline the technical hiring process.

## Project Description

The AI-Augmented Recruitment Interview Platform is a comprehensive solution designed to modernize the technical hiring process. It integrates real-time video interviews with collaborative coding environments and AI-powered assessment tools to provide a seamless experience for both recruiters and candidates. The platform helps organizations evaluate technical talent more effectively by combining human judgment with artificial intelligence analysis.

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

### User Experience Features

- **Collaborative Code Editor**: Real-time collaborative coding environment
- **Shared Note-Taking**: Collaborative notes during interviews
- **Video Chat**: High-quality video and audio communication
- **Screen Sharing**: Share screen during technical discussions
- **Responsive Design**: Works on desktop and tablet devices

## Tech Stack

### Frontend
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS for styling
- WebRTC for video streaming
- Monaco Editor for code editing
- Y.js for real-time collaboration
- TanStack React Query for server state management
- Zustand for client state management

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- Redis for caching and session management
- JWT for authentication
- OpenAI API for code analysis
- WebSocket for real-time communication
- Resend for email delivery

## AI/ML Integration

The platform leverages AI for code assessment with the following capabilities:

- **Automated Code Review**: AI analyzes code submissions for quality, best practices, and potential issues
- **Performance Evaluation**: Assesses code efficiency and optimization opportunities
- **Code Style Assessment**: Checks adherence to coding standards and best practices
- **Plagiarism Detection**: Identifies potential code plagiarism
- **Skill Level Estimation**: Evaluates candidate's technical proficiency
- **Natural Language Processing**: Analyzes candidate responses to non-coding questions
- **AI-Generated Feedback**: Provides constructive feedback on candidate performance

The AI features are powered by OpenAI's API, which is integrated into the backend services. The `ai.service.js` module handles interactions with the OpenAI API, including prompt engineering for specific assessment tasks.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL 14 or higher
- Redis 7 or higher
- OpenAI API key

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

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database
   ```bash
   cd backend
   npx prisma migrate dev
   ```

5. Start the development servers
   ```bash
   # From the root directory
   npm run dev
   ```

## Environment Setup

### Backend Environment Variables (.env.example)

The backend requires several environment variables to be configured:

```
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/nodejs-starter

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=15*60*1000  # 15 minutes
RATE_LIMIT_MAX=100  # 100 requests per window

# Email Configuration (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Your App Name

# AI Configuration
AI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-3.5-turbo

# Cloudflare R2 Configuration
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com
```

### Frontend Environment Variables

The frontend requires the following environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_AUTH=true
```

### Docker Deployment

```bash
docker-compose up -d
```

## Deployment Links

### Frontend Deployment

The frontend application can be deployed to various platforms:

- **Vercel (Recommended)**: 
  1. Push to GitHub/GitLab/Bitbucket
  2. Connect to Vercel
  3. Configure environment variables
  4. Deploy

- **Other Platforms**:
  - **Netlify**: Configure build command as `npm run build`
  - **Railway**: Automatic deployment from Git
  - **Docker**: Dockerfile included for containerization

### Backend Deployment

The backend API can be deployed to:

- **Railway**
- **Render**
- **Heroku**
- **AWS/GCP/Azure**
- **Self-hosted with Docker**

## Project Structure

```
├── frontend/                # Next.js frontend application
│   ├── src/                 # Source code
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── tailwind.config.js   # Tailwind CSS configuration
├── backend/                 # Express backend application
│   ├── src/                 # Source code
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utility functions
│   └── prisma/              # Prisma ORM configuration
│       └── schema.prisma    # Database schema
└── docker-compose.yml       # Docker Compose configuration
```

## Development

### Running Tests

```bash
# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend

# Run all tests
npm test
```

### Linting

```bash
# Lint frontend code
npm run lint:frontend

# Lint backend code
npm run lint:backend

# Lint all code
npm run lint
```

## Demo

### Application Links

- **Frontend**: [https://interview-pro.example.com](https://interview-pro.example.com)
- **Backend API**: [https://api.interview-pro.example.com](https://api.interview-pro.example.com)
- **API Documentation**: [https://api.interview-pro.example.com/docs](https://api.interview-pro.example.com/docs)

## License

This project is licensed under the MIT License - see the LICENSE file for details.