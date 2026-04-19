# Jalyuzi LionToshkent API

Production-grade FastAPI backend for mobile app with Supabase PostgreSQL integration.

## Architecture

```
backend/
├── app/
│   ├── core/           # Config, logging, security
│   ├── db/             # Database connection & repository
│   ├── schemas/        # Pydantic models
│   ├── services/       # Business logic
│   ├── routers/        # API endpoints
│   ├── deps/           # Dependencies (auth)
│   ├── utils/          # Cache, Supabase storage
│   └── main.py         # Application entry
├── migrations/         # Alembic migrations
├── deploy/             # Docker files
└── requirements.txt
```

## Features

- **Modular Architecture**: Clean separation of concerns
- **Supabase Integration**: PostgreSQL with connection pooling
- **Cloud Storage**: Supabase Storage for file uploads
- **Security**: JWT auth, bcrypt passwords, role-based access
- **Caching**: In-memory cache (Redis-ready)
- **Performance**: DB indexes, optimized queries
- **Migrations**: Alembic for schema management
- **Health Checks**: `/api/health` endpoint
- **Excel Export**: Order reports

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_BUCKET=uploads
JWT_SECRET=your-secret-key

# Optional
ADMIN_EMAIL=admin@curtain.uz
ADMIN_PASSWORD=admin123
LOG_LEVEL=INFO
```

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

## API Endpoints

All endpoints under `/api/`:

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `PUT /api/auth/profile` - Update profile

### Dealers
- `POST /api/dealers` - Create dealer (admin)
- `GET /api/dealers` - List dealers (admin)
- `PUT /api/dealers/{id}` - Update dealer (admin)
- `DELETE /api/dealers/{id}` - Delete dealer (admin)
- `POST /api/dealers/{id}/payment` - Add payment (admin)
- `GET /api/dealers/{id}/payments` - Get payments (admin)

### Workers
- `POST /api/workers` - Create worker (admin)
- `GET /api/workers` - List workers (admin)
- `DELETE /api/workers/{id}` - Delete worker (admin)

### Categories
- `POST /api/categories` - Create (admin)
- `GET /api/categories` - List all
- `PUT /api/categories/{id}` - Update (admin)
- `DELETE /api/categories/{id}` - Delete (admin)

### Materials
- `POST /api/materials` - Create (admin)
- `GET /api/materials` - List all
- `GET /api/materials/by-category/{id}` - By category
- `PUT /api/materials/{id}` - Update (admin)
- `DELETE /api/materials/{id}` - Delete (admin)

### Orders
- `POST /api/orders` - Create (dealer)
- `GET /api/orders` - List
- `GET /api/orders/{id}` - Get one
- `PUT /api/orders/{id}/status` - Update status (admin)
- `PUT /api/orders/{id}/items/{idx}/assign` - Assign worker (admin)
- `PUT /api/orders/{id}/delivery` - Add delivery (admin)
- `PUT /api/orders/{id}/confirm-delivery` - Confirm delivery (admin)

### Worker Tasks
- `GET /api/orders/worker/tasks` - Get tasks (worker)
- `PUT /api/orders/worker/tasks/{oid}/{idx}/complete` - Complete (worker)

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/{partner_id}` - Get conversation
- `GET /api/chat/partners` - Chat partners

### Other
- `GET /api/exchange-rate` - USD/UZS rate
- `GET /api/statistics` - Dashboard stats (admin)
- `GET /api/reports` - Detailed reports (admin)
- `GET /api/alerts/low-stock` - Low stock alerts (admin)
- `GET /api/reports/export-orders` - Excel export (admin)
- `POST /api/upload-image` - Upload to Supabase (admin)
- `GET /api/health` - Health check

## Deployment

### Railway/Render

1. Set environment variables in dashboard
2. Deploy with:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Docker

```bash
cd deploy
docker-compose up -d
```

## Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Improvements Made

1. ✅ Modular architecture (app/core, db, schemas, services, routers)
2. ✅ Supabase PostgreSQL with SSL
3. ✅ Connection pooling optimized
4. ✅ Database indexes for performance
5. ✅ Alembic migrations
6. ✅ JWT with expiration handling
7. ✅ Supabase Storage for files
8. ✅ Caching layer (Redis-ready)
9. ✅ Centralized error handling
10. ✅ Health check endpoint
11. ✅ Structured logging
12. ✅ Input validation with Pydantic
13. ✅ Docker deployment ready
