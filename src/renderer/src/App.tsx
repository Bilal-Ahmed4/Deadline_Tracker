import React from 'react'

/**
 * App.tsx — root React component.
 * Phase 4 will populate this with TaskForm, TaskList, Dashboard, FilterBar.
 * For now it just confirms the renderer is alive.
 */
function App(): React.ReactElement {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>📚 University Task &amp; Deadline Tracker</h1>
      <p>Phase 1 scaffold ✅ — UI coming in Phase 4</p>
    </div>
  )
}

export default App
