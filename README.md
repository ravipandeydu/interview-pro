# AI-Augmented Recruitment Interview Platform

A modern recruitment platform that combines video interviews with AI-powered code assessment and analysis to streamline the technical hiring process.

## Features

- Video interview platform with real-time code editor
- AI-powered code assessment and analysis
- Secure authentication and authorization
- Comprehensive reporting and analytics
- Integration with popular calendar and communication services

## Tech Stack

### Frontend
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS for styling
- WebRTC for video streaming
- Monaco Editor for code editing

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- Redis for caching and session management
- JWT for authentication
- OpenAI API for code analysis

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

### Docker Deployment

```bash
docker-compose up -d
```

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.