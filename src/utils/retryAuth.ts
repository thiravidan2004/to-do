import { createClient } from '@/lib/supabase-client'

export async function retryAuthOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      console.log(`Auth operation failed (attempt ${i + 1}/${maxRetries}):`, lastError.message)
      
      // Don't retry on certain errors
      if (lastError.message.includes('Invalid login credentials') ||
          lastError.message.includes('Email already registered') ||
          lastError.message.includes('Password')) {
        throw lastError
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded')
}

export async function signInWithRetry(email: string, password: string) {
  const supabase = createClient()
  
  return retryAuthOperation(async () => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (result.error) {
      throw new Error(result.error.message)
    }
    
    return result
  })
}

export async function signUpWithRetry(email: string, password: string) {
  const supabase = createClient()
  
  return retryAuthOperation(async () => {
    const result = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (result.error) {
      throw new Error(result.error.message)
    }
    
    return result
  })
}
