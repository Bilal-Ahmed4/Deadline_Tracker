import React, { useEffect, useState } from 'react'
import type { Task } from '../../main/db'

/**
 * App.tsx — root React component.
 * Demonstrates the IPC bridge in Phase 3 by calling window.api.getAllTasks().
 * Phase 4 will replace this with full TaskForm, TaskList, Dashboard, FilterBar.
 */
function App(): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Phase 3 verification: verify renderer can call window.api.getAllTasks()
    if (window.api && typeof window.api.getAllTasks === 'function') {
      window.api
        .getAllTasks()
        .then((data) => {
          console.log('[Renderer IPC Test] Successfully fetched tasks via window.api:', data)
          setTasks(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error('[Renderer IPC Test] Error fetching tasks via window.api:', err)
          setError(String(err))
          setLoading(false)
        })
    } else {
      setLoading(false)
      setError('window.api is not defined in renderer context')
    }
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>📚 University Task &amp; Deadline Tracker</h1>
      <p style={{ color: '#2e7d32', fontWeight: 'bold' }}>
        Phase 3: IPC Bridge Connected ✅
      </p>
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem 2rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          display: 'inline-block'
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Renderer ↔ Main IPC Status</h3>
        {loading && <p>Connecting to database via IPC...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && (
          <p style={{ margin: 0 }}>
            Successfully queried SQLite via <code>window.api.getAllTasks()</code>!
            <br />
            Current task count in DB: <strong>{tasks.length}</strong>
          </p>
        )}
      </div>
      <p style={{ marginTop: '2rem', color: '#666' }}>Next: Phase 4 — Core UI</p>
    </div>
  )
}

export default App
