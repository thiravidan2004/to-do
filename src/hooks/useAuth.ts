'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Create stable supabase client instance
  const supabase = createClient()

  // Memoize the refresh function to prevent unnecessary re-renders
  const refreshApp = useCallback(() => {
    router.refresh()
  }, [router])

  useEffect(() => {
    let isMounted = true
    let hasInitialized = false

    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      }
      if (isMounted) {
        setUser(session?.user ?? null)
        setLoading(false)
        hasInitialized = true
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        if (isMounted) {
          setUser(session?.user ?? null)
          setLoading(false)
          
          // Only handle actual auth events after initialization
          // Avoid triggering on INITIAL_SESSION or TOKEN_REFRESHED
          if (hasInitialized && (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
            // Use router.refresh() instead of window.location.reload()
            // This is more efficient and doesn't cause a full page reload
            refreshApp()
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, []) // Empty dependency array to prevent re-running

  return { user, loading, supabase }
}
