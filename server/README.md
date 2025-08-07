# AutoPulse Backend

Backend API service for AutoPulse, a call management and reporting system for auto service centers.

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM for database interactions
- **Alembic**: Database migration tool
- **PostgreSQL**: Relational database
- **Pydantic**: Data validation and settings management
- **Redis**: Caching and background task queue
- **Celery**: Distributed task queue
- **Docker**: Containerization
- **AWS**: Deployment platform

## Getting Started

### Prerequisites

- Python 3.9+
- Docker and Docker Compose
- PostgreSQL 15+ (or use the provided Docker container)

### Local Development Setup

1. Clone the repository and navigate to the server directory:

```bash
cd server
```

2. Run the setup script:

```bash
chmod +x scripts/setup_local.sh
./scripts/setup_local.sh
```

This script will:
- Check Python version and required tools
- Create a virtual environment
- Install dependencies
- Configure environment variables
- Start PostgreSQL in Docker
- Run database migrations
- Seed initial data

3. Start the API server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. Access the API documentation at http://localhost:8000/docs

### Environment Variables

Key environment variables are set in `.env` file (created from `.env.example` during setup):

- `DATABASE_URL`: PostgreSQL connection string
- `ENVIRONMENT`: "development", "testing", or "production"
- `LOG_LEVEL`: Logging level (debug, info, warning, error)
- `SECRET_KEY`: Secret key for security features
- `CORS_ORIGINS`: Allowed origins for CORS

### Docker Development

Run the entire stack using Docker Compose:

```bash
docker-compose up
```

This starts:
- PostgreSQL database
- Redis cache
- API server
- PgAdmin (available at http://localhost:5050)

## Database

### Models

The main entities in the system are:

- **Organization**: Tenant organizations (auto service centers)
- **User**: System users with roles
- **Campaign**: Groups of outbound calls
- **ServiceRecord**: Customer service records
- **Call**: Call records
- **Transcript**: Call transcript segments
- **AudioFile**: Stored audio recordings
- And more...

### Migrations

Create a new migration:

```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:

```bash
alembic upgrade head
```

Rollback a migration:

```bash
alembic downgrade -1
```

## API Structure

- `/api/v1/auth`: Authentication endpoints
- `/api/v1/organizations`: Organization management
- `/api/v1/users`: User management
- `/api/v1/campaigns`: Campaign management
- `/api/v1/service-records`: Service record management
- `/api/v1/calls`: Call management and metrics

## Testing

Run the test suite:

```bash
pytest
```

## Deployment

The application is designed for deployment to AWS using:

- AWS ECS for container orchestration
- RDS PostgreSQL for database
- ElastiCache for Redis caching
- S3 for file storage
- CloudWatch for logs and monitoring

See `/plans/aws_deployment_guide.md` for detailed deployment instructions.

## Development Guidelines

- Follow PEP 8 style guidelines
- Write tests for new functionality
- Use type hints
- Run code quality tools before committing:

```bash
black .
isort .
flake8
mypy .
```

## Project Structure

```
server/
├── alembic/                # Database migrations
├── app/                    # Main application code
│   ├── api/                # API endpoints
│   │   └── v1/             # API version 1
│   ├── core/               # Core functionality
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   └── main.py             # FastAPI application
├── scripts/                # Utility scripts
├── tests/                  # Test suite
└── requirements.txt        # Python dependencies
```

## License

Proprietary - All rights reserved.