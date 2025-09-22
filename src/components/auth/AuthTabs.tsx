'use client'

import { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ConnectionTest from './ConnectionTest'

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'login'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'signup'
                ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <ConnectionTest />
        </div>
      </div>
    </div>
  )
}
