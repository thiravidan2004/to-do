'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function ConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const supabase = createClient()

  const testConnection = async () => {
    setTesting(true)
    setResult(null)

    try {
      // Test basic connection
      console.log('Testing Supabase connection...')
      
      // Try to get the current session
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setResult(`Connection error: ${error.message}`)
      } else {
        setResult('Connection successful! Supabase is reachable.')
      }
    } catch (err) {
      console.error('Connection test error:', err)
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setResult('Network error: Cannot reach Supabase. Please check your internet connection.')
        } else {
          setResult(`Error: ${err.message}`)
        }
      } else {
        setResult('Unknown connection error')
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
      <h3 className="font-semibold text-blue-900 mb-2">Connection Test</h3>
      <button
        onClick={testConnection}
        disabled={testing}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Test Supabase Connection'}
      </button>
      
      {result && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          result.includes('successful') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {result}
        </div>
      )}
    </div>
  )
}
