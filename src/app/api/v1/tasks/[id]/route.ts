import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { authenticateApiRequest } from '@/lib/api-auth'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// GET /api/v1/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
        { status: 429 }
      )
    }

    // Get the specific task for this company
    const supabase = await createClient()
    const { data: task, error } = await supabase
      .from('tasks')
      .select('id, title, description, completed, created_at')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (error || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task,
      meta: {
        company: company.name,
        rateLimitRemaining: rateLimitResult.remaining
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

// PUT /api/v1/tasks/[id] - Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Build update object
    const updateData: any = {}
    if (body.title !== undefined) {
      if (!body.title?.trim()) {
        return NextResponse.json(
          { error: 'Title cannot be empty' },
          { status: 400 }
        )
      }
      updateData.title = body.title.trim()
    }
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }
    if (body.completed !== undefined) {
      updateData.completed = Boolean(body.completed)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the task (only if it belongs to this company)
    const supabase = await createClient()
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', company.id)
      .select('id, title, description, completed, created_at')
      .single()

    if (error || !task) {
      return NextResponse.json(
        { error: 'Task not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task,
      meta: {
        company: company.name,
        rateLimitRemaining: rateLimitResult.remaining
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

// DELETE /api/v1/tasks/[id] - Delete a specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
        { status: 429 }
      )
    }

    // Delete the task (only if it belongs to this company)
    const supabase = await createClient()
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('company_id', company.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Task not found or deletion failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
      meta: {
        company: company.name,
        rateLimitRemaining: rateLimitResult.remaining
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
