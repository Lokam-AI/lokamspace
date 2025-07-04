# AutoPulse - Backend

This is the backend service for AutoPulse, built with FastAPI, Alembic, and PostgreSQL. The system manages customer service records, feedback collection, and analytics for automotive service centers.

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Alembic**: Database migration tool
- **PostgreSQL**: Primary database
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation and settings management
- **JWT**: Authentication and authorization
- **Uvicorn**: ASGI server

## Project Structure

```
server/
├── src/
│   ├── api/                 # API endpoints and routing
│   │   ├── routes/         # API route handlers
│   │   │   ├── auth.py     # Authentication endpoints
│   │   │   ├── dashboard.py # Dashboard analytics
│   │   │   ├── customers.py # Customer management
│   │   │   ├── service_records.py # Service record management
│   │   │   └── survey.py   # Survey and feedback endpoints
│   │   └── dependencies.py # Shared API dependencies
│   ├── core/               # Core functionality
│   │   ├── config.py       # Application configuration
│   │   └── security.py     # Security utilities
│   ├── db/                 # Database related code
│   │   ├── base.py        # Database models
│   │   ├── session.py     # Database session management
│   │   └── migrations/    # Alembic migrations
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   └── services/          # Business logic services
├── alembic.ini            # Alembic configuration
├── requirements.txt       # Python dependencies
└── Dockerfile            # Docker configuration
```

## Key Features

1. **Authentication System**
   - User registration with organization creation
   - JWT-based authentication
   - Role-based access control (Admin/User)

2. **Customer Management**
   - Customer profile management
   - Service history tracking
   - Vehicle information management

3. **Service Records**
   - Service appointment tracking
   - Service completion status
   - Service feedback collection

4. **Dashboard Analytics**
   - Service performance metrics
   - Customer satisfaction scores
   - Call tracking and management
   - Ready-for-call customer list

5. **Survey System**
   - Automated feedback collection
   - Service quality metrics
   - NPS scoring

## Getting Started

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd server

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

#DAtabase
Create database autopulse
python3 init_database.py
```

### 2. PostgreSQL Setup
```bash
# Install PostgreSQL (if not already installed)
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download and install from https://www.postgresql.org/download/windows/

# Start PostgreSQL service
# Ubuntu/Debian
sudo service postgresql start

# macOS
brew services start postgresql

# Windows
# PostgreSQL service should start automatically
```

### 3. Database Creation
```bash
# Login to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE autopulse;
CREATE USER autopulse_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE autopulse TO autopulse_user;

# Exit psql
\q
```

### 4. Environment Configuration
```bash
# Create .env file in the server directory
touch .env

# Add the following content to .env
DATABASE_URL=postgresql://autopulse_user:your_password@localhost:5432/autopulse
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000"]
```

### 5. Database Migrations
```bash
# Initialize Alembic (if not already done)
alembic init migrations

# Update alembic.ini with your database URL
# Find the line with sqlalchemy.url and update it:
# sqlalchemy.url = postgresql://autopulse_user:your_password@localhost:5432/autopulse

# Create initial migration
alembic revision --autogenerate -m "initial migration"

# Apply migrations
alembic upgrade head
```

### 6. Seed Database (Optional)
```bash
# Run the database seeder
python -m src.db.seed

# This will create:
# - Initial admin user
# - Sample organizations
# - Test data
```

### 7. Run the Application
```bash
# Development mode with auto-reload
uvicorn src.main:app --reload --port 8000

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### 8. Verify Installation
- Open your browser and navigate to:
  - API Documentation: http://localhost:8000/docs
  - Alternative Documentation: http://localhost:8000/redoc

### 9. Test the API
```bash
# Using curl to test the health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy"}
```

### 10. Common Development Tasks

#### Create a New Migration
```bash
# After making changes to models
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

#### Reset Database (Development)
```bash
# Drop and recreate database
dropdb autopulse
createdb autopulse

# Reapply migrations
alembic upgrade head

# Reseed data
python -m src.db.seed
```

#### Run Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=src
```

## API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## FastAPI Features

1. **Dependency Injection**
   - Database session management
   - Authentication middleware
   - Request validation

2. **Pydantic Models**
   - Request/Response schemas
   - Data validation
   - Automatic documentation

3. **Background Tasks**
   - Async operations
   - Task scheduling
   - Event handling

## Database Management

1. **Alembic Migrations**
   ```bash
   # Create new migration
   alembic revision --autogenerate -m "add new table"

   # Apply migrations
   alembic upgrade head

   # View migration history
   alembic history
   ```

2. **SQLAlchemy Models**
   - Base model inheritance
   - Relationship management
   - Query optimization

## Development Guidelines

1. **Code Style**
   - Follow PEP 8 guidelines
   - Use type hints
   - Document functions and classes

2. **Database**
   - Use SQLAlchemy ORM
   - Follow naming conventions
   - Implement proper indexing
   - Write migrations for all schema changes

3. **API Design**
   - RESTful principles
   - Proper error handling
   - Input validation using Pydantic
   - Use FastAPI dependency injection

4. **Security**
   - JWT authentication
   - Password hashing
   - Input sanitization
   - CORS configuration

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_auth.py
```

## Deployment

1. **Docker Deployment**
   ```bash
   # Build image
   docker build -t autopulse-backend .

   # Run container
   docker run -p 8000:8000 autopulse-backend
   ```

2. **Environment Variables**
   Required environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SECRET_KEY`: JWT secret key
   - `ENVIRONMENT`: development/production
   - `CORS_ORIGINS`: Allowed origins for CORS

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Create database migrations if needed
5. Submit a pull request

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**
   - Check DATABASE_URL in .env
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Migration Issues**
   - Ensure all models are imported in env.py
   - Check for conflicting migrations
   - Verify database state

3. **Dependency Conflicts**
   - Use virtual environment
   - Check requirements.txt versions
   - Update pip and setuptools

4. **Authentication Issues**
   - Verify SECRET_KEY
   - Check token expiration
   - Validate JWT configuration

## Support

For support, please contact the development team or create an issue in the repository.