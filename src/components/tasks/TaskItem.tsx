'use client'

import { useState } from 'react'
import { Task, TaskFormData } from '@/types/task'
import TaskForm from './TaskForm'

interface TaskItemProps {
  task: Task
  onUpdate: (id: string, data: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggleComplete = async () => {
    setLoading(true)
    try {
      await onUpdate(task.id, { completed: !task.completed })
    } catch (error) {
      console.error('Error toggling task completion:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (data: TaskFormData) => {
    await onUpdate(task.id, data)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <TaskForm
          onSubmit={handleEdit}
          initialData={{ title: task.title, description: task.description || undefined }}
          isEditing
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className={`bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${task.completed ? 'opacity-75 bg-gray-50' : 'hover:border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white shadow-sm'
              : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
          } disabled:opacity-50`}
        >
          {task.completed && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          
          <p className="mt-2 text-xs text-gray-400">
            Created: {formatDate(task.created_at)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-sm font-medium focus:outline-none rounded-md transition-colors duration-200"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 text-sm font-medium focus:outline-none rounded-md transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
