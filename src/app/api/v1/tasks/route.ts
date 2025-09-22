import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { authenticateApiRequest } from '@/lib/api-auth'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// GET /api/v1/tasks - Get all tasks for the authenticated company
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateApiRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const company = authResult.company!

    // Check rate limit
    const rateLimitResult = checkRateLimit(company.api_key, RATE_LIMITS.standard)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
          }
        }
      )
    }

    // Get tasks for this company
    const supabase = await createClient()
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, description, completed, created_at')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tasks,
      meta: {
        company: company.name,
        total: tasks.length,
        rateLimitRemaining: rateLimitResult.remaining
      }
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/tasks - Create a new task for the authenticated company
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateApiRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const company = authResult.company!

    // Check rate limit (stricter for write operations)
    const rateLimitResult = checkRateLimit(company.api_key, RATE_LIMITS.write)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
          }
        }
      )
    }

    // Parse request body
    const body = await request.json()
    
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Create task with company association
    const supabase = await createClient()
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        completed: body.completed || false,
        company_id: company.id,
        user_id: company.id // Use company.id as user_id for API-created tasks
      })
      .select('id, title, description, completed, created_at')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task,
      meta: {
        company: company.name,
        rateLimitRemaining: rateLimitResult.remaining
      }
    }, {
      status: 201,
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
