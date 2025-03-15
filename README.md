# Budget Buddy - Personal Expense Tracker

A modern, full-stack expense tracking application with authentication and real-time analytics. Built with React, Node.js, and PostgreSQL.

## Features

### Authentication
- Secure user registration with username, email, and password
- User login with username/password
- Google OAuth integration
- JWT-based authentication
- Persistent session management

### Expense Tracking
- Create and manage expense categories
- Add transactions with amounts and categories
- View transactions by category
- Filter transactions by date range
- Real-time expense statistics
- Daily average calculations

### Modern UI/UX
- Dark theme with violet accents
- Responsive design for all screen sizes
- Interactive data visualizations
- Smooth animations and transitions
- Loading states and skeletons
- Clean and intuitive interface

## Tech Stack

### Frontend
- React.js with hooks
- Material-UI (MUI) components
- React Router for navigation
- Axios for API requests
- Modern ES6+ JavaScript
- Responsive CSS with MUI styling

### Backend
- Node.js and Express
- PostgreSQL database
- Sequelize ORM
- JWT authentication
- Google OAuth2
- RESTful API design

### DevOps
- Docker containerization
- Docker Compose for services
- Environment configuration
- Persistent data storage

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Google OAuth credentials (for Google authentication)
- PostgreSQL (local or containerized)

## Setup

1. Clone the repository
2. Configure environment variables:
   ```bash
   # backend/.env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   JWT_SECRET=your-jwt-secret
   DATABASE_URL=postgresql://postgres:postgres@db:5432/budget_buddy
   ```

## Running the Application

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/google` - Google OAuth login
- GET `/api/auth/google/callback` - OAuth callback
- GET `/api/protected` - Verify authentication

### Transactions
- GET `/api/sections/:section/transactions` - Get transactions by category
- POST `/api/transactions` - Create new transaction
- GET `/api/transactions` - Get all transactions
- GET `/api/transactions/stats` - Get transaction statistics

### Categories
- GET `/api/sections` - Get all categories
- POST `/api/sections` - Create new category
- PUT `/api/sections/:id` - Update category
- DELETE `/api/sections/:id` - Delete category

## Security Features

- Secure password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- CORS configuration
- Environment variable protection
- SQL injection prevention
- XSS protection
- Rate limiting

## Development

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Database
- PostgreSQL with Sequelize ORM
- Automatic migrations
- Data persistence
- Default credentials:
  - Username: postgres
  - Password: postgres
  - Database: budget_buddy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 