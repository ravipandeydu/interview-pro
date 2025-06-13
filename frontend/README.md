# Next.js Starter

A production-grade Next.js 15.3.3 + React 19 frontend starter with TypeScript, ESLint, Tailwind CSS, App Router, Turbopack, and shadcn/ui.

## 🚀 Features

- **Next.js 15.3.3** with App Router and Turbopack for blazing fast development
- **React 19** with latest features and optimizations
- **TypeScript** for full type safety
- **ESLint** with modern configuration
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for beautiful, accessible components
- **TanStack React Query** for server state management
- **Zustand** for client state management
- **Axios** for HTTP requests
- **Zod** for schema validation
- **React Hook Form** for form handling
- **next-themes** for dark/light mode
- **Authentication ready** with complete auth flow
- **Chat functionality** integration ready
- **Protected routes** and permission management
- **No import aliases** for better compatibility

## 📦 Tech Stack

### Core
- Next.js 15.3.3
- React 19
- TypeScript
- ESLint

### Styling
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- next-themes for theme switching

### State Management
- TanStack React Query (server state)
- Zustand (client state)
- React Hook Form (form state)

### Utilities
- Axios (HTTP client)
- Zod (schema validation)
- js-cookie (cookie management)
- clsx & tailwind-merge (class utilities)

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-starter
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   
   > Note: Use `--legacy-peer-deps` due to React 19 peer dependency requirements

3. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_ENABLE_CHAT=true
   NEXT_PUBLIC_ENABLE_AUTH=true
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── providers/        # Context providers
│   ├── ui/              # shadcn/ui components
│   └── ProtectedRoute.tsx # Route protection
├── hooks/                # Custom React hooks
│   ├── useAuth.ts       # Authentication hooks
│   ├── useChat.ts       # Chat functionality hooks
│   ├── useConfig.ts     # Configuration hooks
│   └── useUser.ts       # User management hooks
├── lib/                  # Utility libraries
│   ├── api.ts           # Axios configuration
│   ├── utils.ts         # Utility functions
│   └── zod-schemas.ts   # Zod validation schemas
├── services/            # API service classes
│   ├── authService.ts   # Authentication API
│   ├── chatService.ts   # Chat API
│   ├── configService.ts # Configuration API
│   └── userService.ts   # User management API
└── store/               # State management
    └── useStore.ts      # Zustand store
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_ENABLE_CHAT` | Enable chat features | `true` |
| `NEXT_PUBLIC_ENABLE_AUTH` | Enable authentication | `true` |

### Feature Flags

The starter includes a configuration system that allows you to enable/disable features:

- **Authentication**: Complete auth flow with login, register, password reset
- **Chat**: Real-time chat functionality with message history
- **Protected Routes**: Route-level access control
- **Theme Switching**: Dark/light mode support

## 🎨 Styling

### Tailwind CSS
Utility-first CSS framework with custom configuration for the project.

### shadcn/ui Components
Pre-built, accessible components with consistent design:
- Button, Card, Input, Form
- Dialog, Dropdown, Navigation
- Toast notifications (Sonner)
- Theme-aware styling

### Dark Mode
Built-in dark/light mode switching with `next-themes`.

## 🔐 Authentication

Complete authentication system ready for integration:

- Login/Register flows
- Password reset/change
- Session management
- Protected routes
- User profile management
- Email verification
- Token refresh

## 💬 Chat System

Real-time chat functionality:

- Message sending/receiving
- Chat history
- Message rating
- Export functionality
- Analytics
- Streaming responses

## 🛡️ Type Safety

- **TypeScript** throughout the codebase
- **Zod schemas** for runtime validation
- **Type-safe API calls** with proper error handling
- **Form validation** with React Hook Form + Zod

## 📱 Responsive Design

- Mobile-first approach
- Responsive components
- Touch-friendly interactions
- Optimized for all screen sizes

## ⚡ Performance

- **Turbopack** for fast development builds
- **React Query** for efficient data fetching and caching
- **Code splitting** with Next.js App Router
- **Optimized bundle** with tree shaking
- **Image optimization** with Next.js Image component

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run dev:webpack  # Start development server with Webpack

# Building
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Type Checking
npm run type-check   # Run TypeScript compiler check
```

### Adding Components

Add new shadcn/ui components:
```bash
npx shadcn@latest add [component-name]
```

Remember to update import paths to remove `@/` aliases:
```typescript
// Change from:
import { cn } from "@/lib/utils"

// To:
import { cn } from "../../lib/utils"
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub/GitLab/Bitbucket
2. Connect to Vercel
3. Configure environment variables
4. Deploy

### Other Platforms
- **Netlify**: Configure build command as `npm run build`
- **Railway**: Automatic deployment from Git
- **Docker**: Dockerfile included for containerization

## 🤝 Backend Integration

This starter is designed to work with a Node.js backend. The API services are configured to handle:

- RESTful API endpoints
- Authentication tokens
- Error handling
- Request/response interceptors
- Automatic token refresh

### Expected Backend Endpoints

```
POST /auth/login
POST /auth/register
POST /auth/logout
GET  /auth/session
POST /auth/refresh

GET  /users/profile
PUT  /users/profile
POST /users/avatar

POST /chat/message
GET  /chat/history
DELETE /chat/history

GET  /config
GET  /config/features
```

## 📄 License

MIT License - feel free to use this starter for your projects.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [shadcn](https://ui.shadcn.com/) for the beautiful component library
- [Vercel](https://vercel.com/) for hosting and deployment
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
