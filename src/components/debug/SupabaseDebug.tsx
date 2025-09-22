'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function SupabaseDebug() {
  const [debug, setDebug] = useState<any>({})
  const supabase = createClient()

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        // Check if environment variables are loaded
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        // Try to get session
        const { data: session, error: sessionError } = await supabase.auth.getSession()
        
        // Try to get user
        const { data: user, error: userError } = await supabase.auth.getUser()

        setDebug({
          hasUrl,
          hasKey,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
          session: !!session.session,
          user: !!user.user,
          sessionError: sessionError?.message,
          userError: userError?.message,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        setDebug({
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }
    }

    checkSupabase()
  }, [supabase])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Supabase Debug</h3>
      <pre className="whitespace-pre-wrap">{JSON.stringify(debug, null, 2)}</pre>
    </div>
  )
}
