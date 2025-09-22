# Todo API Documentation

## Overview

The Todo API is a multi-tenant REST API that allows companies to integrate todo functionality into their CRM systems. Each company gets isolated data access through unique API keys.

## Base URL
```
Production: https://your-app.vercel.app/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All API requests require authentication using an API key. Include your API key in the request headers:

```http
x-api-key: your_api_key_here
```

Or using Bearer token format:
```http
Authorization: Bearer your_api_key_here
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Standard endpoints**: 100 requests per minute
- **Write operations**: 50 requests per minute  
- **Admin endpoints**: 10 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: When the rate limit resets (ISO 8601 timestamp)

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "company": "Company Name",
    "rateLimitRemaining": 95
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Endpoints

### Tasks

#### Get All Tasks
```http
GET /api/v1/tasks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Complete project",
      "description": "Finish the API integration",
      "completed": false,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "meta": {
    "company": "Your Company",
    "total": 1,
    "rateLimitRemaining": 99
  }
}
```

#### Get Single Task
```http
GET /api/v1/tasks/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Complete project",
    "description": "Finish the API integration",
    "completed": false,
    "created_at": "2024-01-01T12:00:00Z"
  },
  "meta": {
    "company": "Your Company",
    "rateLimitRemaining": 98
  }
}
```

#### Create Task
```http
POST /api/v1/tasks
Content-Type: application/json

{
  "title": "New task",
  "description": "Task description (optional)",
  "completed": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "New task",
    "description": "Task description",
    "completed": false,
    "created_at": "2024-01-01T12:00:00Z"
  },
  "meta": {
    "company": "Your Company",
    "rateLimitRemaining": 49
  }
}
```

#### Update Task
```http
PUT /api/v1/tasks/{id}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

**Response:** Same as Create Task

#### Delete Task
```http
DELETE /api/v1/tasks/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "meta": {
    "company": "Your Company",
    "rateLimitRemaining": 48
  }
}
```

### System

#### API Status
```http
GET /api/v1/status
```

**Response:**
```json
{
  "success": true,
  "status": "operational",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": "45ms"
    },
    "api": {
      "status": "healthy",
      "responseTime": "45ms"
    }
  },
  "endpoints": {
    "tasks": "/api/v1/tasks",
    "companies": "/api/v1/companies",
    "documentation": "/api/v1/docs"
  },
  "rateLimit": {
    "standard": "100 requests per minute",
    "write": "50 requests per minute",
    "admin": "10 requests per minute"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid request data |
| 401  | Unauthorized - Invalid or missing API key |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Resource already exists |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error |

## Example Usage

### JavaScript/Node.js
```javascript
const apiKey = 'your_api_key_here';
const baseUrl = 'https://your-app.vercel.app/api/v1';

// Get all tasks
const response = await fetch(`${baseUrl}/tasks`, {
  headers: {
    'x-api-key': apiKey
  }
});
const data = await response.json();

// Create a task
const newTask = await fetch(`${baseUrl}/tasks`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  },
  body: JSON.stringify({
    title: 'New task from API',
    description: 'Created via API integration'
  })
});
```

### Python
```python
import requests

API_KEY = 'your_api_key_here'
BASE_URL = 'https://your-app.vercel.app/api/v1'

headers = {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
}

# Get all tasks
response = requests.get(f'{BASE_URL}/tasks', headers=headers)
tasks = response.json()

# Create a task
new_task = {
    'title': 'New task from Python',
    'description': 'Created via Python integration'
}
response = requests.post(f'{BASE_URL}/tasks', json=new_task, headers=headers)
```

### cURL
```bash
# Get all tasks
curl -X GET "https://your-app.vercel.app/api/v1/tasks" \
  -H "x-api-key: your_api_key_here"

# Create a task
curl -X POST "https://your-app.vercel.app/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "title": "New task",
    "description": "Created via cURL"
  }'
```

## Getting Started

1. **Contact Admin** to get your company API key
2. **Test Connection** using the `/api/v1/status` endpoint
3. **Start Integration** with the tasks endpoints
4. **Monitor Usage** through rate limit headers

## Support

For API support, integration help, or to request a new company API key, please contact our development team.

## Changelog

### v1.0.0
- Initial API release
- Task CRUD operations
- Multi-tenant isolation
- Rate limiting
- API key authentication
