'use client'

import { useEffect, useState, useCallback } from 'react'
import { Task, TaskFormData } from '@/types/task'
import TaskItem from './TaskItem'
import TaskForm from './TaskForm'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        if (response.status === 401) {
          // Authentication error - user session expired, redirect to login
          setError('Session expired. Please sign in again.')
          return
        }
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTasks()

    // Only set up real-time subscription if user is authenticated
    if (!user) return

    // Set up real-time subscription
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          console.log('Real-time update:', payload)
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as Task, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new as Task : task
            ))
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks, supabase, user])

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      // Real-time subscription will handle adding the task to the list
      await response.json()
    } catch (err) {
      console.error('Error creating task:', err)
      throw err
    }
  }

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      console.log('Updating task:', id, updates)
      
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      console.log('Update response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Update failed:', errorData)
        
        if (response.status === 401) {
          // Authentication error - user session expired
          setError('Session expired. Please sign in again.')
          return
        }
        
        throw new Error(errorData.error || 'Failed to update task')
      }

      // Real-time subscription will handle updating the task in the list
      const updatedTask = await response.json()
      console.log('Task updated successfully:', updatedTask)
    } catch (err) {
      console.error('Error updating task:', err)
      // Show error to user
      setError(err instanceof Error ? err.message : 'Failed to update task')
      throw err
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      // Real-time subscription will handle removing the task from the list
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => {
            setError(null)
            setLoading(true)
            fetchTasks()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    )
  }

  const completedTasks = tasks.filter(task => task.completed)
  const incompleteTasks = tasks.filter(task => !task.completed)

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="text-red-800 font-medium">{error}</div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 text-sm underline mt-2 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-gray-100 hover:shadow-md transition-shadow duration-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Add New Task</h2>
        <TaskForm onSubmit={handleCreateTask} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">📋 Your Tasks</h2>
          <div className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-700">
            {incompleteTasks.length} pending • {completedTasks.length} completed
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg font-medium">No tasks yet!</p>
            <p className="text-sm">Create your first task above to get started.</p>
          </div>
        ) : (
          <>
            {incompleteTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-yellow-500">⏳</span>
                  Pending Tasks
                </h3>
                {incompleteTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  Completed Tasks
                </h3>
                {completedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
