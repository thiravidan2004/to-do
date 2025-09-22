import { createClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

export interface Company {
  id: string
  name: string
  api_key: string
  created_at: string
  updated_at: string
}

export interface ApiAuthResult {
  success: boolean
  company?: Company
  error?: string
}

/**
 * Validate API key and return company information
 */
export async function validateApiKey(apiKey: string): Promise<ApiAuthResult> {
  if (!apiKey) {
    return { success: false, error: 'API key is required' }
  }

  try {
    const supabase = await createClient()
    
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('api_key', apiKey)
      .single()

    if (error || !company) {
      return { success: false, error: 'Invalid API key' }
    }

    return { success: true, company }
  } catch (error) {
    console.error('API key validation error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Extract API key from request headers
 */
export function getApiKeyFromRequest(request: NextRequest): string | null {
  // Check x-api-key header (most common)
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) return apiKey

  // Check Authorization header (Bearer token format)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  return `tk_${crypto.randomBytes(32).toString('hex')}`
}

/**
 * Middleware function to authenticate API requests
 */
export async function authenticateApiRequest(request: NextRequest): Promise<ApiAuthResult> {
  const apiKey = getApiKeyFromRequest(request)
  
  if (!apiKey) {
    return { 
      success: false, 
      error: 'API key required. Include x-api-key header or Authorization: Bearer <key>' 
    }
  }

  return await validateApiKey(apiKey)
}
