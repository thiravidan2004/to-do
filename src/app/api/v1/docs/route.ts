import { NextRequest, NextResponse } from 'next/server'

// GET /api/v1/docs - API Documentation
export async function GET(request: NextRequest) {
  const documentation = {
    title: "Todo API Documentation",
    version: "1.0.0",
    description: "Multi-tenant Todo API for CRM integration",
    baseUrl: {
      production: "https://your-app.vercel.app/api/v1",
      development: "http://localhost:3000/api/v1"
    },
    authentication: {
      type: "API Key",
      header: "x-api-key",
      alternative: "Authorization: Bearer <api_key>"
    },
    rateLimit: {
      standard: "100 requests per minute",
      write: "50 requests per minute",
      admin: "10 requests per minute"
    },
    endpoints: {
      tasks: {
        "GET /tasks": "Get all tasks for your company",
        "POST /tasks": "Create a new task",
        "GET /tasks/{id}": "Get a specific task",
        "PUT /tasks/{id}": "Update a specific task",
        "DELETE /tasks/{id}": "Delete a specific task"
      },
      system: {
        "GET /status": "API health check and status",
        "GET /docs": "This documentation endpoint"
      },
      admin: {
        "POST /companies": "Create a new company (admin only)",
        "GET /companies": "List all companies (admin only)"
      }
    },
    examples: {
      createTask: {
        method: "POST",
        url: "/api/v1/tasks",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "your_api_key_here"
        },
        body: {
          title: "Complete integration",
          description: "Integrate Todo API with CRM",
          completed: false
        }
      },
      getAllTasks: {
        method: "GET",
        url: "/api/v1/tasks",
        headers: {
          "x-api-key": "your_api_key_here"
        }
      }
    },
    errorCodes: {
      400: "Bad Request - Invalid request data",
      401: "Unauthorized - Invalid or missing API key",
      403: "Forbidden - Insufficient permissions",
      404: "Not Found - Resource doesn't exist",
      409: "Conflict - Resource already exists",
      429: "Too Many Requests - Rate limit exceeded",
      500: "Internal Server Error - Server error"
    },
    responseFormat: {
      success: {
        success: true,
        data: "Response data",
        meta: {
          company: "Company name",
          rateLimitRemaining: "Number"
        }
      },
      error: {
        success: false,
        error: "Error message"
      }
    },
    gettingStarted: [
      "1. Contact admin to get your company API key",
      "2. Test connection using /api/v1/status endpoint",
      "3. Start integration with tasks endpoints",
      "4. Monitor usage through rate limit headers"
    ]
  }

  return NextResponse.json(documentation, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  })
}
