import { createClient } from '@/lib/supabase-server'
import AuthTabs from '@/components/auth/AuthTabs'
import TaskList from '@/components/tasks/TaskList'
import LogoutButton from '@/components/auth/LogoutButton'
import SupabaseDebug from '@/components/debug/SupabaseDebug'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <span>📝</span>
              Todo App
            </h1>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-blue-100 text-sm font-medium">
                  Welcome, {user.email}
                </span>
                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user ? (
          <TaskList />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="text-center mb-12">
              <div className="text-8xl mb-6">🚀</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Todo App
              </h2>
              <p className="text-xl text-gray-600 max-w-md">
                Your personal productivity companion. Sign in or create an account to start organizing your tasks!
              </p>
            </div>
            <AuthTabs />
          </div>
        )}
      </main>
      <SupabaseDebug />
    </div>
  )
}
