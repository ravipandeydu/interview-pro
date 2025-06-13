# Project Rules - Node.js/Next.js Enterprise Starter

## Project Overview

This is a full-stack enterprise starter template consisting of:
- **Backend**: Node.js + Express + MongoDB with authentication, AI features, file uploads, and comprehensive middleware
- **Frontend**: Next.js 15.3.3 + React 19 + TypeScript + Tailwind CSS + shadcn/ui components
- **Architecture**: Monorepo structure with separate backend and frontend applications

## Technology Stack

### Backend Technologies
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs for password hashing
- **Validation**: Joi for request validation
- **Logging**: Winston logger
- **Security**: Helmet, CORS, express-rate-limit, express-mongo-sanitize
- **Documentation**: Swagger with swagger-jsdoc and swagger-ui-express
- **Testing**: Jest with supertest
- **File Storage**: Cloudflare R2 (AWS S3 compatible)
- **Email**: Resend service
- **AI Integration**: OpenAI API
- **Code Quality**: ESLint, Prettier
- **Containerization**: Docker with docker-compose

### Frontend Technologies
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui with Radix UI primitives
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack React Query (client-side) + Axios
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React + Radix UI Icons
- **Theme**: next-themes for dark/light mode
- **Notifications**: Sonner for toast notifications
- **Code Quality**: ESLint, TypeScript strict mode

## Project Structure

### Backend Structure (`/backend`)
```
src/
├── config/           # Database and environment configuration
├── controllers/      # Route handlers (auth, user, ai)
├── middlewares/      # Custom middleware (auth, error, validation, upload, logging)
├── models/          # Mongoose models
├── routes/          # Express route definitions
├── services/        # Business logic (auth, user, ai, email, cloudflare-r2)
├── tests/           # Jest test files
├── utils/           # Utility functions (logger, response, swagger, validator)
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

### Frontend Structure (`/frontend`)
```
src/
├── app/             # Next.js App Router pages
│   ├── (auth)/      # Authentication pages (login, register, etc.)
│   ├── chat/        # AI chat functionality
│   ├── profile/     # User profile management
│   └── layout.tsx   # Root layout
├── components/      # React components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Layout components (Header, Footer)
│   └── providers/   # Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries and configurations
├── services/        # API service functions
└── store/           # Zustand state management
```

## Development Guidelines

### Code Style and Standards
1. **Backend**: Use ES modules, async/await patterns, and proper error handling
2. **Frontend**: Use TypeScript strict mode, functional components with hooks
3. **Naming**: Use camelCase for variables/functions, PascalCase for components/classes
4. **File Extensions**: `.js` for backend, `.tsx/.ts` for frontend
5. **Import Order**: External libraries first, then internal modules

### Authentication Flow
1. JWT-based authentication with refresh tokens
2. Password reset via email with secure tokens
3. Email verification for new accounts
4. Protected routes using middleware (backend) and components (frontend)
5. Session management with Zustand persistence

### API Design
1. RESTful endpoints with consistent response format
2. Request validation using Joi schemas
3. Error handling with custom error middleware
4. Rate limiting and security headers
5. Swagger documentation for all endpoints

### Database Design
1. MongoDB with Mongoose for schema validation
2. User model with authentication fields
3. Proper indexing for performance
4. Data sanitization to prevent NoSQL injection

### File Upload Strategy
1. Multer middleware for handling multipart/form-data
2. Cloudflare R2 for file storage (S3-compatible)
3. File type and size validation
4. Secure file URLs with proper access control

### AI Integration
1. OpenAI API integration for chat functionality
2. Proper error handling for AI service failures
3. Rate limiting for AI endpoints
4. Conversation history management

### Frontend State Management
1. Zustand for global state (auth, theme, chat, config)
2. React Query for server state management
3. Local state with useState for component-specific data
4. Persistent storage for user preferences

### Styling Guidelines
1. Tailwind CSS utility classes
2. shadcn/ui components for consistent design
3. CSS variables for theme customization
4. Responsive design with mobile-first approach
5. Dark/light theme support

## Environment Configuration

### Backend Environment Variables
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment (development/production)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Frontend application URL
- `RESEND_API_KEY`: Email service API key
- `AI_API_KEY`: OpenAI API key
- `CLOUDFLARE_R2_*`: File storage configuration

### Frontend Environment Variables
- Next.js automatically handles environment variables with `NEXT_PUBLIC_` prefix for client-side access

## Testing Strategy

### Backend Testing
1. Unit tests for services and utilities
2. Integration tests for API endpoints
3. Test database setup with proper cleanup
4. Mock external services (email, AI, file storage)
5. Coverage reporting with Jest

### Frontend Testing
1. Component testing with React Testing Library
2. Hook testing for custom hooks
3. Integration testing for user flows
4. E2E testing considerations

## Deployment Guidelines

### Backend Deployment
1. Docker containerization with multi-stage builds
2. Environment-specific configuration
3. Health check endpoints
4. Logging and monitoring setup
5. Database migration strategies

### Frontend Deployment
1. Next.js static export or server-side rendering
2. CDN integration for static assets
3. Environment-specific builds
4. Performance optimization

## Security Best Practices

1. **Authentication**: Secure JWT implementation with proper expiration
2. **Authorization**: Role-based access control where needed
3. **Input Validation**: Comprehensive validation on both client and server
4. **Data Sanitization**: Prevent injection attacks
5. **HTTPS**: Enforce secure connections in production
6. **CORS**: Proper cross-origin resource sharing configuration
7. **Rate Limiting**: Prevent abuse and DoS attacks
8. **Error Handling**: Don't expose sensitive information in errors
9. **Dependencies**: Regular security updates and vulnerability scanning
10. **File Uploads**: Validate file types and implement virus scanning

## Performance Considerations

### Backend Performance
1. Database query optimization with proper indexing
2. Caching strategies for frequently accessed data
3. Connection pooling for database connections
4. Compression middleware for response optimization
5. Monitoring and profiling tools

### Frontend Performance
1. Code splitting and lazy loading
2. Image optimization with Next.js Image component
3. Bundle analysis and optimization
4. Caching strategies for API calls
5. Performance monitoring and Core Web Vitals

## Maintenance and Updates

1. **Dependencies**: Regular updates with security patches
2. **Documentation**: Keep API documentation up to date
3. **Testing**: Maintain test coverage above 80%
4. **Monitoring**: Implement logging and error tracking
5. **Backup**: Regular database backups
6. **Version Control**: Semantic versioning for releases

## Development Workflow

1. **Local Development**: Use provided Docker setup or local MongoDB
2. **Code Quality**: Pre-commit hooks with linting and formatting
3. **Testing**: Run tests before committing changes
4. **Documentation**: Update relevant documentation with changes
5. **Review Process**: Code review requirements for main branch
6. **CI/CD**: Automated testing and deployment pipelines

This project serves as a comprehensive foundation for building enterprise-grade full-stack applications with modern technologies and best practices.