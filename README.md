# Authentication System with React, Node.js, and PostgreSQL

This is a full-stack authentication system with the following features:
- User registration with username and password
- User login with username and password
- Google OAuth authentication
- JWT-based authentication
- PostgreSQL database
- Docker containerization

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Google OAuth credentials (for Google authentication)

## Setup

1. Clone the repository
2. Create a Google OAuth application in the Google Cloud Console and get your credentials
3. Update the `backend/.env` file with your Google OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## Running the Application

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - PostgreSQL: localhost:5432

## Development

### Frontend
- Built with React and Material-UI
- Located in the `frontend` directory
- Development server runs on port 3000

### Backend
- Built with Node.js and Express
- Located in the `backend` directory
- API server runs on port 5000
- Uses Sequelize ORM for database operations
- Implements JWT and Google OAuth authentication

### Database
- PostgreSQL database
- Persistent volume for data storage
- Default credentials:
  - Username: postgres
  - Password: postgres
  - Database: auth_db

## API Endpoints

- POST `/api/auth/signup` - Register a new user
- POST `/api/auth/login` - Login with username and password
- GET `/api/auth/google` - Initiate Google OAuth flow
- GET `/api/auth/google/callback` - Google OAuth callback
- GET `/api/protected` - Protected route example (requires JWT)

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is enabled for frontend-backend communication
- Environment variables for sensitive data
- Docker containerization for isolation 