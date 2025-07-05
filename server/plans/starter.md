# AutoPulse Starter Guide

This guide provides step-by-step instructions for setting up the AutoPulse project after cloning the repository.

## Project Overview

AutoPulse is a call management and reporting system for auto service centers, built with:

- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- **Frontend**: React with TypeScript, Tailwind CSS

## Prerequisites

Before starting, ensure you have the following installed:

- Python 3.9+
- Node.js 16+
- Docker and Docker Compose
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lokamspace
```

### 2. Backend Setup

#### Using the Setup Script (Recommended)

The project includes a setup script that automates the backend setup process:

```bash
cd server
bash scripts/setup_local.sh
```

This script will:
- Create a Python virtual environment
- Install dependencies
- Set up environment variables
- Initialize the database
- Run migrations
- Seed initial data

> **Note:** If you encounter port conflicts with PostgreSQL (port 5432 already in use), the script is configured to use port 5433 instead.

#### Manual Setup

If you prefer to set up manually:

1. **Create a virtual environment**:

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:

```bash
pip install -r requirements.txt
```

3. **Set up environment variables**:

Create a `.env` file with the following content:

```
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5433  # Using 5433 to avoid conflicts with existing PostgreSQL
POSTGRES_USER=autopulse
POSTGRES_PASSWORD=autopulse
POSTGRES_DB=autopulse

# Application Settings
ENVIRONMENT=development
LOG_LEVEL=debug

# Security
SECRET_KEY=dev_secret_key_replace_in_production
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# JWT Authentication
JWT_SECRET=dev_jwt_secret_replace_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400
```

4. **Start the database using Docker**:

```bash
docker-compose up -d db
```

5. **Test the database connection**:

```bash
python scripts/test_db_connection.py
```

6. **Run database migrations**:

```bash
alembic upgrade head
```

7. **Seed initial data** (optional):

```bash
python scripts/seed_data.py
```

### 3. Database Initialization and Migrations

The database setup involves several steps:

1. **Initial Database Connection**:
   - The database container is created with the credentials specified in `docker-compose.yml`
   - The database connection is tested using `test_db_connection.py`

2. **Schema Migrations**:
   - Alembic manages database migrations
   - Migrations are stored in `alembic/versions/`
   - Running `alembic upgrade head` applies all migrations

3. **Missing Tables?**
   If you don't see all expected tables in the database:
   
   - Check if all models are imported in `app/models/__init__.py`
   - Generate new migrations for missing models:
   
   ```bash
   alembic revision --autogenerate -m "Add missing models"
   alembic upgrade head
   ```

4. **Manual Table Creation**:
   If migrations aren't working correctly, you can force table creation:
   
   ```python
   # In a Python script or shell
   from app.models.base import Base
   from app.core.database import engine
   # Import all models here
   
   Base.metadata.create_all(bind=engine)
   ```

### 4. Running the Backend

#### Using Docker Compose

```bash
docker-compose up
```

This will start both the API and PostgreSQL database.

#### Running Locally

```bash
cd server
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000.

API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 5. Frontend Setup

```bash
cd client
npm install
```

### 6. Running the Frontend

```bash
cd client
npm run dev
```

The frontend will be available at http://localhost:5173.

## Project Structure

### Backend Structure

```
server/
├── alembic/                # Database migrations
│   ├── versions/           # Migration versions
│   ├── env.py              # Alembic environment
│   └── alembic.ini         # Alembic configuration
├── app/                    # Main application code
│   ├── api/                # API endpoints
│   │   ├── v1/             # API version 1
│   │   │   ├── endpoints/  # Endpoint modules
│   │   │   └── router.py   # Main router
│   ├── core/               # Core functionality
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database session
│   │   ├── exceptions.py   # Exception handling
│   │   ├── middleware.py   # Middleware components
│   │   └── security.py     # Auth & security
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   └── main.py             # FastAPI application
├── scripts/                # Utility scripts
│   ├── seed_data.py        # Database seeding
│   ├── init_db.py          # Database initialization
│   ├── test_db_connection.py # Test database connection
│   └── setup_local.sh      # Local setup script
├── plans/                  # Project documentation
├── tests/                  # Test suite
├── Dockerfile              # Production Docker build
└── docker-compose.yml      # Local development containers
```

### Database Models

The system includes the following core models:

- **Organization**: Represents a tenant in the multi-tenant system
- **User**: System users with different roles
- **Campaign**: Marketing campaigns for outreach
- **Call**: Phone call records
- **Service Record**: Auto service records
- **Transcript**: Call transcripts
- **Setting**: Application settings
- **Booking**: Service appointments
- **Inquiry**: Customer inquiries
- **Tag**: Metadata tags for various entities

### API Endpoints

The API is organized into the following endpoints:

- `/api/v1/auth`: Authentication endpoints
  - `POST /login`: User login
  - `GET /me`: Get current user info
  - `POST /password-change`: Change password

- `/api/v1/organizations`: Organization management
  - `GET /`: List organizations
  - `POST /`: Create organization
  - `GET /{id}`: Get organization details
  - `PUT /{id}`: Update organization
  - `DELETE /{id}`: Delete organization

- `/api/v1/users`: User management
  - `GET /`: List users
  - `POST /`: Create user
  - `GET /{id}`: Get user details
  - `PUT /{id}`: Update user
  - `DELETE /{id}`: Delete user

- `/api/v1/campaigns`: Campaign management
  - `GET /`: List campaigns
  - `POST /`: Create campaign
  - `GET /{id}`: Get campaign details
  - `PUT /{id}`: Update campaign
  - `DELETE /{id}`: Delete campaign
  - `GET /{id}/stats`: Get campaign statistics

- `/api/v1/service-records`: Service record management
  - `GET /`: List service records
  - `POST /`: Create service record
  - `GET /{id}`: Get service record details
  - `PUT /{id}`: Update service record
  - `DELETE /{id}`: Delete service record

- `/api/v1/calls`: Call management
  - `GET /`: List calls
  - `POST /`: Create call
  - `GET /{id}`: Get call details
  - `PUT /{id}`: Update call
  - `DELETE /{id}`: Delete call
  - `POST /{id}/schedule`: Schedule a call

- `/api/v1/transcripts`: Transcript management
  - `GET /`: List transcripts
  - `POST /`: Create transcript
  - `GET /{id}`: Get transcript details
  - `PUT /{id}`: Update transcript
  - `DELETE /{id}`: Delete transcript
  - `GET /{id}/analysis`: Get transcript analysis

- `/api/v1/analytics`: Analytics and reporting
  - `GET /dashboard`: Get dashboard metrics
  - `GET /calls`: Get call metrics
  - `GET /service-records`: Get service record metrics
  - `GET /campaigns/{id}`: Get campaign analytics
  - `GET /trends`: Get trend analysis

- `/api/v1/settings`: Application settings
  - `GET /`: List settings
  - `GET /by-category`: Get settings organized by category
  - `POST /`: Create setting
  - `GET /{id}`: Get setting details
  - `PUT /{id}`: Update setting
  - `DELETE /{id}`: Delete setting
  - `PUT /by-key/{key}`: Update setting by key

### Multi-tenancy

AutoPulse is designed as a multi-tenant application where each organization's data is isolated. The system uses:

1. **Organization-scoped models**: Most models include an `organization_id` field
2. **Tenant middleware**: Extracts tenant context from JWT tokens
3. **Data isolation**: Database queries are automatically filtered by organization

### Authentication and Authorization

The system uses JWT-based authentication:

1. **Login**: Exchange credentials for a JWT token
2. **Token validation**: Middleware validates tokens on protected endpoints
3. **Role-based access**: Different endpoints require different user roles

## Development Workflow

### Database Migrations

When making changes to database models:

1. Update the SQLAlchemy models in `app/models/`
2. Make sure all models are imported in `app/models/__init__.py`
3. Generate a new migration:

```bash
alembic revision --autogenerate -m "Description of changes"
```

4. Review the generated migration in `alembic/versions/`
5. Apply the migration:

```bash
alembic upgrade head
```

### Running Tests

```bash
cd server
pytest
```

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Ensure PostgreSQL is running: `docker ps` should show the container
   - Check database credentials in `.env`
   - Try connecting manually: `psql -h localhost -p 5433 -U autopulse -d autopulse`
   - Run the test connection script: `python scripts/test_db_connection.py`

2. **Port conflicts**:
   - If port 5432 is already in use, the setup uses port 5433
   - Update `.env` and `docker-compose.yml` if you need to use a different port

3. **Migration errors**:
   - Try running `alembic downgrade -1` and then `alembic upgrade head`
   - Check if all models are imported in `app/models/__init__.py`
   - Create a new migration: `alembic revision --autogenerate -m "Recreate schema"`

4. **Missing tables**:
   - Ensure all models are imported in `app/models/__init__.py`
   - Generate new migrations: `alembic revision --autogenerate -m "Add missing models"`
   - Apply migrations: `alembic upgrade head`

5. **Dependency issues**:
   - Ensure you're using the correct Python version
   - Try reinstalling dependencies: `pip install -r requirements.txt`

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the project documentation in the `plans/` directory
2. Review the implementation plan in `plans/autopulse_implementation_plan.md`
3. Contact the development team

## Next Steps

After setting up the project, we recommend:

1. Exploring the API documentation at `/docs`
2. Reviewing the implementation plan to understand the project roadmap
3. Setting up your IDE with proper linting and formatting tools