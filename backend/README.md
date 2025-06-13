# Node.js Starter Project

A production-grade Node.js backend starter project with Express, MongoDB, and AI-powered features. This project follows industry best practices and comes pre-implemented with authentication, validation, logging, and more.

## Features

- **Modern JavaScript**: ES Modules syntax
- **Authentication**: Complete JWT-based auth flow with registration, login, and protected routes
- **Database**: MongoDB integration with Mongoose ODM
- **Validation**: Request validation using Joi
- **Documentation**: API documentation with Swagger/OpenAPI
- **Security**: Helmet, CORS, rate limiting, and other security best practices
- **Logging**: Comprehensive logging with Winston
- **Testing**: Unit and integration tests with Jest and Supertest
- **AI Features**: Chat with database and intelligent data summaries
- **Docker**: Production-ready Dockerfile and docker-compose for development
- **CI/CD**: GitHub Actions workflow for continuous integration

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- OpenAI API key (for AI features)

## Setup Instructions

### Environment Variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Required environment variables:

- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 4000)
- `JWT_SECRET`: Secret for signing JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time (e.g., "1d" for one day)
- `AI_API_KEY`: OpenAI API key for AI features
- SMTP settings (for email functionality)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## API Documentation

Swagger documentation is available at `/api/docs` when the server is running.

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

## Docker

### Development

```bash
# Start development environment with MongoDB
docker-compose up -d
```

### Production

```bash
# Build production image
docker build -t nodejs-starter .

# Run container
docker run -p 4000:4000 --env-file .env nodejs-starter
```

## AI Features

This starter includes AI-powered endpoints that allow natural language interaction with your database.

### Chat with Database

Send natural language queries to interact with your database:

```bash
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"question": "How many users registered last week?"}'
```

### Data Summaries

Get intelligent summaries of your collections:

```bash
curl -X GET http://localhost:4000/api/ai/summary/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
/src
  /config       # Configuration files
  /controllers  # Route handlers
  /models       # Mongoose schemas and models
  /routes       # Express routers
  /middlewares  # Custom middleware
  /services     # Business logic and integrations
  /utils        # Utility functions
  /tests        # Unit and integration tests
  app.js        # Express app setup
  server.js     # Entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.