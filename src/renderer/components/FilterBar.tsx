/**
 * src/renderer/components/FilterBar.tsx
 * Filter and search controls for courses, task types, and completion status.
 */

import React from 'react'
import type { TaskFilters } from './types'

interface FilterBarProps {
  filters: TaskFilters
  onFilterChange: (filters: TaskFilters) => void
  availableCourses: string[]
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableCourses
}) => {
  const handleChange = (field: keyof TaskFilters, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value
    })
  }

  const handleReset = () => {
    onFilterChange({
      course: 'all',
      type: 'all',
      status: 'all',
      searchQuery: ''
    })
  }

  const hasActiveFilters =
    filters.course !== 'all' ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.searchQuery.trim() !== ''

  return (
    <div className="filter-bar">
      <input
        type="text"
        className="form-control search-input"
        placeholder="🔍 Search tasks by title or notes..."
        value={filters.searchQuery}
        onChange={(e) => handleChange('searchQuery', e.target.value)}
      />

      <select
        className="form-control"
        value={filters.course}
        onChange={(e) => handleChange('course', e.target.value)}
      >
        <option value="all">All Courses</option>
        {availableCourses.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className="form-control"
        value={filters.type}
        onChange={(e) => handleChange('type', e.target.value)}
      >
        <option value="all">All Types</option>
        <option value="assignment">Assignments</option>
        <option value="quiz">Quizzes</option>
        <option value="lab">Labs</option>
        <option value="exam">Exams</option>
        <option value="other">Other</option>
      </select>

      <select
        className="form-control"
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="done">Completed</option>
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
          style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
        >
          Reset Filters
        </button>
      )}
    </div>
  )
}
