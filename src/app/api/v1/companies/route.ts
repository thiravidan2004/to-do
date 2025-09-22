import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateApiKey } from '@/lib/api-auth'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// POST /api/v1/companies - Create a new company (admin only)
export async function POST(request: NextRequest) {
  try {
    // For now, we'll use a simple admin key check
    // In production, you might want proper admin authentication
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check rate limit for admin operations
    const rateLimitResult = checkRateLimit(`admin:${adminKey}`, RATE_LIMITS.admin)
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
    
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Generate API key
    const apiKey = generateApiKey()

    // Create company
    const supabase = await createClient()
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name: body.name.trim(),
        api_key: apiKey
      })
      .select('id, name, api_key, created_at')
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Company name already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Company created successfully. Save the API key securely - it cannot be retrieved again.'
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/v1/companies - List all companies (admin only)
export async function GET(request: NextRequest) {
  try {
    // Admin authentication
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(`admin:${adminKey}`, RATE_LIMITS.admin)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        },
        { status: 429 }
      )
    }

    // Get all companies (without API keys for security)
    const supabase = await createClient()
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: companies,
      meta: {
        total: companies.length
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
