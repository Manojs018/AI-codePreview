# Setup Guide

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** & **Docker Compose**
- **PostgreSQL** 15+ (or use Docker)
- **Redis** 7+ (or use Docker)
- **RabbitMQ** 3+ (or use Docker)
- **GitHub Account** (for OAuth)
- **OpenAI API Key** (for AI reviews)

## Quick Start with Docker

### 1. Clone the Repository

```bash
cd c:/Users/Manoj/OneDrive/Desktop/AI-power
```

### 2. Environment Setup

Create `.env` file in the root directory:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Webhook Secret (generate random string)
WEBHOOK_SECRET=your_webhook_secret_here

# JWT Secrets (generate random strings)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Encryption Key (generate random string)
ENCRYPTION_KEY=your_encryption_key_here

# Database
DATABASE_URL=postgresql://postgres:postgres_dev_password@postgres:5432/ai_code_review

# Redis
REDIS_URL=redis://redis:6379

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin_dev_password@rabbitmq:5672

# Frontend
FRONTEND_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

### 3. Get GitHub OAuth Credentials

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: AI Code Review Platform (Dev)
   - **Homepage URL**: http://localhost:3001
   - **Authorization callback URL**: http://localhost:3000/api/auth/github/callback
4. Copy **Client ID** and **Client Secret** to `.env`

### 4. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy to `.env` as `OPENAI_API_KEY`

### 5. Start Services with Docker

```bash
# Start all services
npm run docker:up

# This will start:
# - PostgreSQL (port 5432)
# - Redis (port 6379)
# - RabbitMQ (port 5672, management UI: 15672)
# - All microservices
# - Frontend (port 3001)
```

### 6. Verify Services

```bash
# Check if all containers are running
docker ps

# Check API Gateway health
curl http://localhost:3000/health

# Check RabbitMQ Management UI
# Open: http://localhost:15672
# Login: admin / admin_dev_password
```

### 7. Access the Application

- **Frontend**: http://localhost:3001
- **API Gateway**: http://localhost:3000
- **RabbitMQ Management**: http://localhost:15672

## Manual Setup (Without Docker)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces
```

### 2. Setup PostgreSQL

```bash
# Create database
createdb ai_code_review

# Run migrations
psql ai_code_review < scripts/init-db.sql
```

### 3. Start Services Individually

```bash
# Terminal 1: API Gateway
cd services/api-gateway
npm install
npm run dev

# Terminal 2: Auth Service
cd services/auth-service
npm install
npm run dev

# Terminal 3: GitHub Service
cd services/github-service
npm install
npm run dev

# Terminal 4: Code Analysis
cd services/code-analysis
npm install
npm run dev

# Terminal 5: AI Review
cd services/ai-review
npm install
npm run dev

# Terminal 6: Feedback Publisher
cd services/feedback-publisher
npm install
npm run dev

# Terminal 7: Analytics
cd services/analytics
npm install
npm run dev

# Terminal 8: Frontend
cd frontend
npm install
npm start
```

## Development Workflow

### Running All Services

```bash
# Start all services in development mode
npm run dev
```

### Building for Production

```bash
# Build all services
npm run build
```

### Running Tests

```bash
# Run all tests
npm test
```

### Database Migrations

```bash
# Run migrations
npm run db:migrate

# Rollback migration
npm run db:migrate:down

# Seed database
npm run db:seed
```

## Setting Up GitHub Webhook

### For Local Development (using ngrok)

1. Install ngrok: https://ngrok.com/download

2. Start ngrok tunnel:
```bash
ngrok http 3000
```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. In your GitHub repository:
   - Go to Settings → Webhooks → Add webhook
   - **Payload URL**: `https://abc123.ngrok.io/api/webhooks/github`
   - **Content type**: application/json
   - **Secret**: Your `WEBHOOK_SECRET` from `.env`
   - **Events**: Select "Pull requests"
   - Click "Add webhook"

### For Production

Use your production domain instead of ngrok URL.

## Testing the Platform

### 1. Login

1. Go to http://localhost:3001
2. Click "Login with GitHub"
3. Authorize the application

### 2. Activate a Repository

1. Go to "Repositories" page
2. Select a repository
3. Click "Activate"
4. This will create a webhook on GitHub

### 3. Create a Pull Request

1. Make changes in your GitHub repository
2. Create a pull request
3. The platform will automatically:
   - Receive webhook event
   - Fetch PR diff
   - Analyze code with AI
   - Post comments on GitHub

### 4. View Analytics

1. Go to "Dashboard"
2. View your code quality metrics
3. See issue trends and patterns

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database logs
docker logs ai-review-postgres

# Connect to database
docker exec -it ai-review-postgres psql -U postgres -d ai_code_review
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
docker exec -it ai-review-redis redis-cli ping
```

### RabbitMQ Issues

```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# Check RabbitMQ logs
docker logs ai-review-rabbitmq

# Access management UI
# http://localhost:15672
```

### Webhook Not Receiving Events

1. Check ngrok is running
2. Verify webhook URL in GitHub settings
3. Check webhook secret matches
4. View webhook deliveries in GitHub settings
5. Check API Gateway logs:
```bash
docker logs ai-review-gateway
```

### AI Review Not Working

1. Verify OpenAI API key is correct
2. Check AI service logs:
```bash
docker logs ai-review-ai
```
3. Verify you have API credits

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | Yes | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | Yes | - |
| `GITHUB_CALLBACK_URL` | OAuth callback URL | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `WEBHOOK_SECRET` | GitHub webhook secret | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes | - |
| `ENCRYPTION_KEY` | Token encryption key | Yes | - |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `RABBITMQ_URL` | RabbitMQ connection string | Yes | - |
| `FRONTEND_URL` | Frontend URL | No | http://localhost:3001 |
| `NODE_ENV` | Environment | No | development |
| `LOG_LEVEL` | Logging level | No | info |

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## API Documentation

See [API.md](./API.md) for API reference.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/ai-code-review/issues)
- Email: support@example.com

## License

MIT License - see [LICENSE](../LICENSE) for details
