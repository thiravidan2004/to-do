import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/v1/status - API health check and status
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Test database connection
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)

    const dbStatus = dbError ? 'error' : 'healthy'
    const responseTime = Date.now() - startTime

    const status = {
      success: true,
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          responseTime: `${responseTime}ms`
        },
        api: {
          status: 'healthy',
          responseTime: `${responseTime}ms`
        }
      },
      endpoints: {
        tasks: '/api/v1/tasks',
        companies: '/api/v1/companies',
        documentation: '/api/v1/docs'
      },
      rateLimit: {
        standard: '100 requests per minute',
        write: '50 requests per minute',
        admin: '10 requests per minute'
      }
    }

    return NextResponse.json(status)

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Service unavailable',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
