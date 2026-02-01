# API Documentation

## Base URL

```
Development: http://localhost:3000
Production: https://api.yourcompany.com
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication Endpoints

### Login with GitHub

```http
GET /api/auth/github
```

Redirects to GitHub OAuth authorization page.

**Response**: Redirect to GitHub

---

### GitHub OAuth Callback

```http
GET /api/auth/github/callback?code=<auth_code>
```

Handles GitHub OAuth callback and creates/updates user.

**Query Parameters**:
- `code` (string, required): Authorization code from GitHub

**Response**: Redirect to frontend with token

```
http://localhost:3001/auth/callback?token=<jwt_token>&refresh=<refresh_token>
```

---

### Get Current User

```http
GET /api/auth/me
```

Returns the currently authenticated user.

**Headers**:
- `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "github_id": 12345,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "developer",
    "avatar_url": "https://github.com/...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Logout

```http
POST /api/auth/logout
```

Logs out the current user and invalidates tokens.

**Headers**:
- `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Repository Endpoints

### List User Repositories

```http
GET /api/repos
```

Returns all repositories accessible by the user.

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `active` (boolean, optional): Filter by active status

**Response**:
```json
{
  "success": true,
  "data": {
    "repositories": [
      {
        "id": "uuid",
        "github_repo_id": 123456,
        "owner": "johndoe",
        "name": "my-repo",
        "full_name": "johndoe/my-repo",
        "description": "My awesome repository",
        "private": false,
        "is_active": true,
        "settings": {
          "autoReview": true,
          "minQualityScore": 70,
          "severityThreshold": "medium"
        },
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

### Get Repository Details

```http
GET /api/repos/:id
```

Returns details of a specific repository.

**Headers**:
- `Authorization: Bearer <token>`

**URL Parameters**:
- `id` (uuid, required): Repository ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "github_repo_id": 123456,
    "owner": "johndoe",
    "name": "my-repo",
    "full_name": "johndoe/my-repo",
    "description": "My awesome repository",
    "private": false,
    "is_active": true,
    "webhook_id": 987654,
    "settings": { ... },
    "stats": {
      "total_prs": 150,
      "avg_quality_score": 82.5,
      "total_issues": 450
    }
  }
}
```

---

### Activate Repository

```http
POST /api/repos/:id/activate
```

Activates code review for a repository by creating a GitHub webhook.

**Headers**:
- `Authorization: Bearer <token>`

**URL Parameters**:
- `id` (uuid, required): Repository ID

**Response**:
```json
{
  "success": true,
  "data": {
    "webhook_id": 987654,
    "webhook_url": "https://api.yourcompany.com/api/webhooks/github",
    "events": ["pull_request"]
  }
}
```

---

### Deactivate Repository

```http
DELETE /api/repos/:id/deactivate
```

Deactivates code review and removes the GitHub webhook.

**Headers**:
- `Authorization: Bearer <token>`

**URL Parameters**:
- `id` (uuid, required): Repository ID

**Response**:
```json
{
  "success": true,
  "message": "Repository deactivated successfully"
}
```

---

### Update Repository Settings

```http
PATCH /api/repos/:id/settings
```

Updates repository-specific settings.

**Headers**:
- `Authorization: Bearer <token>`

**URL Parameters**:
- `id` (uuid, required): Repository ID

**Request Body**:
```json
{
  "autoReview": true,
  "minQualityScore": 75,
  "severityThreshold": "high",
  "languages": ["javascript", "python"],
  "excludePatterns": ["*.min.js", "dist/*"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "settings": { ... }
  }
}
```

---

## Review Endpoints

### List Reviews

```http
GET /api/reviews
```

Returns all code reviews.

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `repository_id` (uuid, optional): Filter by repository
- `status` (string, optional): Filter by status (pending, in_progress, completed, failed)
- `sort` (string, optional): Sort field (created_at, quality_score)
- `order` (string, optional): Sort order (asc, desc)

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "pull_request": {
          "id": "uuid",
          "pr_number": 123,
          "title": "Add new feature",
          "author_username": "johndoe",
          "state": "open"
        },
        "repository": {
          "id": "uuid",
          "full_name": "johndoe/my-repo"
        },
        "status": "completed",
        "quality_score": 85.5,
        "total_issues": 5,
        "critical_issues": 0,
        "high_issues": 1,
        "medium_issues": 3,
        "low_issues": 1,
        "created_at": "2024-01-01T00:00:00Z",
        "completed_at": "2024-01-01T00:05:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Get Review Details

```http
GET /api/reviews/:id
```

Returns detailed information about a specific review.

**Headers**:
- `Authorization: Bearer <token>`

**URL Parameters**:
- `id` (uuid, required): Review ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "pull_request": { ... },
    "repository": { ... },
    "status": "completed",
    "quality_score": 85.5,
    "total_issues": 5,
    "critical_issues": 0,
    "high_issues": 1,
    "medium_issues": 3,
    "low_issues": 1,
    "files_analyzed": 8,
    "lines_analyzed": 450,
    "analysis_duration_ms": 12500,
    "ai_tokens_used": 3500,
    "created_at": "2024-01-01T00:00:00Z",
    "completed_at": "2024-01-01T00:05:00Z"
  }
}
```

---

### Get Review Issues

```http
GET /api/reviews/:id/issues
```

Returns all issues found in a review.

**Headers**:
- `Authorization: Bearer <token>`

**URL Parameters**:
- `id` (uuid, required): Review ID

**Query Parameters**:
- `severity` (string, optional): Filter by severity
- `category` (string, optional): Filter by category
- `file_path` (string, optional): Filter by file

**Response**:
```json
{
  "success": true,
  "data": {
    "issues": [
      {
        "id": "uuid",
        "file_path": "src/utils/helper.js",
        "line_number": 42,
        "category": "bug",
        "severity": "high",
        "title": "Potential null pointer exception",
        "description": "The variable 'user' may be null at this point...",
        "suggested_fix": "Add null check: if (user) { ... }",
        "code_snippet": "const name = user.name;",
        "language": "javascript",
        "github_comment_id": 123456789,
        "is_resolved": false,
        "created_at": "2024-01-01T00:05:00Z"
      }
    ],
    "summary": {
      "total": 5,
      "by_severity": {
        "critical": 0,
        "high": 1,
        "medium": 3,
        "low": 1
      },
      "by_category": {
        "bug": 2,
        "security": 1,
        "performance": 1,
        "best-practice": 1
      }
    }
  }
}
```

---

## Analytics Endpoints

### Developer Dashboard

```http
GET /api/analytics/developer
```

Returns analytics for the current developer.

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `period` (string, optional): Time period (day, week, month, year)
- `start_date` (string, optional): Start date (ISO 8601)
- `end_date` (string, optional): End date (ISO 8601)

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_prs": 45,
      "avg_quality_score": 82.5,
      "total_issues": 180,
      "critical_issues": 2,
      "improvement_trend": 5.2
    },
    "quality_trend": [
      {
        "date": "2024-01-01",
        "quality_score": 80.0,
        "pr_count": 5
      }
    ],
    "issue_distribution": {
      "bug": 45,
      "security": 20,
      "performance": 35,
      "style": 50,
      "best-practice": 30
    },
    "top_issues": [
      {
        "category": "bug",
        "title": "Null pointer exception",
        "count": 12
      }
    ]
  }
}
```

---

### Manager Dashboard

```http
GET /api/analytics/manager
```

Returns team-level analytics for managers.

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `period` (string, optional): Time period
- `team_id` (uuid, optional): Filter by team

**Response**:
```json
{
  "success": true,
  "data": {
    "team_overview": {
      "total_prs": 450,
      "avg_quality_score": 78.5,
      "security_risks": 15,
      "total_developers": 12
    },
    "top_contributors": [
      {
        "user_id": "uuid",
        "username": "johndoe",
        "quality_score": 92.0,
        "pr_count": 45
      }
    ],
    "hotspot_repositories": [
      {
        "repository_id": "uuid",
        "full_name": "company/critical-service",
        "issue_count": 85,
        "avg_quality_score": 65.0
      }
    ],
    "quality_trends": [ ... ]
  }
}
```

---

## Webhook Endpoints

### GitHub Webhook Receiver

```http
POST /api/webhooks/github
```

Receives GitHub webhook events.

**Headers**:
- `X-GitHub-Event`: Event type (e.g., "pull_request")
- `X-Hub-Signature-256`: HMAC signature for verification
- `Content-Type`: application/json

**Request Body**: GitHub webhook payload

**Response**:
```json
{
  "success": true,
  "message": "Webhook received and queued for processing"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests (Rate Limited) |
| 500 | Internal Server Error |

---

## Rate Limits

- **Global**: 100 requests per hour per IP
- **Authenticated**: 100 requests per hour per user
- **Webhooks**: 100 webhooks per minute
- **Repository Analysis**: 50 PR analyses per day per repository

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response**:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Filtering & Sorting

Most list endpoints support filtering and sorting:

**Query Parameters**:
- `sort`: Field to sort by
- `order`: Sort order (`asc` or `desc`)
- Additional filters specific to each endpoint

---

## Webhooks

The platform can send webhooks for various events:

### Events
- `review.completed`: When a code review is completed
- `issue.created`: When a new issue is found
- `repository.activated`: When a repository is activated

### Webhook Payload
```json
{
  "event": "review.completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "review_id": "uuid",
    "repository": "johndoe/my-repo",
    "pr_number": 123,
    "quality_score": 85.5,
    "total_issues": 5
  }
}
```

---

For more information, see the [Architecture Documentation](./ARCHITECTURE.md).
