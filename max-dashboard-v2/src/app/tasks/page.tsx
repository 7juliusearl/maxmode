'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  category: string
  priority: 'high' | 'medium' | 'low'
  assignee: 'julius' | 'max'
  stageId: string
  dueDate?: string
  notes?: string
  updatedAt: string
}

const STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .task-page { min-height: 100vh; background: #0D1117; color: #E6EDF3; }
  .task-container { max-width: 900px; margin: 0 auto; padding: 24px; }
  .task-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .task-title { font-size: 28px; font-weight: 600; color: #FFFFFF; margin: 0; }
  .add-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: #238636; color: #FFFFFF; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
  .add-btn:hover { background: #2EA043; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 14px; font-weight: 500; color: #8B949E; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
  .task-list { display: flex; flex-direction: column; gap: 8px; }
  .task-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #161B22; border: 1px solid #30363D; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .task-card:hover { border-color: #484F58; background: #1C2128; }
  .task-checkbox { width: 20px; height: 20px; border: 2px solid #484F58; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .task-checkbox.checked { background: #238636; border-color: #238636; }
  .task-checkbox svg { width: 14px; height: 14px; color: #FFFFFF; opacity: 0; }
  .task-checkbox.checked svg { opacity: 1; }
  .task-content { flex: 1; min-width: 0; }
  .task-name { font-size: 15px; color: #E6EDF3; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .task-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .task-tag { padding: 2px 8px; background: #21262D; border-radius: 12px; color: #8B949E; }
  .task-tag.wedding { color: #F778BA; background: rgba(247, 138, 186, 0.15); }
  .task-tag.marketing { color: #58A6FF; background: rgba(88, 166, 255, 0.15); }
  .task-tag.business { color: #79C0FF; background: rgba(121, 192, 255, 0.15); }
  .task-tag.personal { color: #A371F7; background: rgba(163, 113, 247, 0.15); }
  .task-tag.research { color: #7EE787; background: rgba(126, 231, 135, 0.15); }
  .task-tag.general { color: #8B949E; background: rgba(139, 148, 158, 0.15); }
  .priority-dot { width: 6px; height: 6px; border-radius: 50%; }
  .priority-high { background: #F85149; }
  .priority-medium { background: #F0B90B; }
  .priority-low { background: #3FB950; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
  .avatar.max { background: #0D9488; color: #FFFFFF; }
  .avatar.julius { background: #7C3AED; color: #FFFFFF; }
  .empty-state { text-align: center; padding: 40px 20px; color: #8B949E; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal { background: #161B22; border: 1px solid #30363D; border-radius: 12px; padding: 24px; width: 100%; max-width: 500px; }
  .modal-title { font-size: 18px; font-weight: 600; color: #FFFFFF; margin-bottom: 20px; }
  .modal-input { width: 100%; padding: 12px 14px; background: #0D1117; border: 1px solid #30363D; border-radius: 8px; color: #E6EDF3; font-size: 15px; margin-bottom: 16px; }
  .modal-input:focus { outline: none; border-color: #58A6FF; }
  .modal-textarea { min-height: 100px; resize: vertical; }
  .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
  .modal-btn { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; }
  .modal-btn.cancel { background: #21262D; color: #E6EDF3; }
  .modal-btn.cancel:hover { background: #30363D; }
  .modal-btn.submit { background: #238636; color: #FFFFFF; }
  .modal-btn.submit:hover { background: #2EA043; }
`

// Sample tasks matching the screenshot vibe
const SAMPLE_TASKS: Task[] = [
  { id: '1', title: 'Post Ugly Ad for Wedding Biz', category: 'Wedding', priority: 'high', assignee: 'julius', stageId: 'todo', updatedAt: '2026-02-05T23:58:59.923Z' },
  { id: '2', title: 'Follow up 5 pending leads', category: 'Wedding', priority: 'medium', assignee: 'julius', stageId: 'todo', updatedAt: '2026-02-05T23:58:59.924Z' },
  { id: '3', title: 'Create graphics for Men\'s Conference Emerge', category: 'Personal', priority: 'medium', assignee: 'julius', stageId: 'this-week', updatedAt: '2026-02-05T23:58:59.924Z' },
  { id: '4', title: 'Fix Jasmine\'s name spelling in Jose\'s video', category: 'Wedding', priority: 'medium', assignee: 'julius', stageId: 'this-week', updatedAt: '2026-02-05T23:58:59.924Z' },
  { id: '5', title: 'Create promo videos for Desert Worship Collective', category: 'Marketing', priority: 'medium', assignee: 'julius', stageId: 'this-week', updatedAt: '2026-02-05T23:58:59.924Z' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', category: 'Wedding', priority: 'medium' })

  useEffect(() => {
    // Load tasks from localStorage or use sample
    const saved = localStorage.getItem('maxmode-tasks')
    if (saved) {
      setTasks(JSON.parse(saved))
    } else {
      setTasks(SAMPLE_TASKS)
    }
  }, [])

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
    localStorage.setItem('maxmode-tasks', JSON.stringify(newTasks))
  }

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, stageId: t.stageId === 'done' ? 'todo' : 'done' }
      }
      return t
    })
    saveTasks(updated)
  }

  const addTask = () => {
    if (!newTask.title.trim()) return
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority as 'high' | 'medium' | 'low',
      assignee: 'julius',
      stageId: 'todo',
      updatedAt: new Date().toISOString()
    }
    saveTasks([task, ...tasks])
    setShowModal(false)
    setNewTask({ title: '', category: 'Wedding', priority: 'medium' })
  }

  const getTasksByStage = (stage: string) => tasks.filter(t => t.stageId === stage)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="task-page">
        <div className="task-container">
          {/* Header */}
          <div className="task-header">
            <h1 className="task-title">Tasks</h1>
            <button className="add-btn" onClick={() => setShowModal(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
              </svg>
              Add task
            </button>
          </div>

          {/* Todo Section */}
          <div className="section">
            <h2 className="section-title">To Do</h2>
            <div className="task-list">
              {getTasksByStage('todo').length === 0 ? (
                <div className="empty-state">No tasks yet</div>
              ) : (
                getTasksByStage('todo').map(task => (
                  <div key={task.id} className="task-card" onClick={() => toggleTask(task.id)}>
                    <div className="task-checkbox" onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}>
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                      </svg>
                    </div>
                    <div className="task-content">
                      <div className="task-name">{task.title}</div>
                      <div className="task-meta">
                        <span className={`task-tag ${task.category.toLowerCase()}`}>{task.category}</span>
                        <span className={`priority-dot priority-${task.priority}`}></span>
                      </div>
                    </div>
                    <div className={`avatar ${task.assignee}`}>
                      {task.assignee === 'max' ? 'M' : 'J'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* This Week Section */}
          <div className="section">
            <h2 className="section-title">This Week</h2>
            <div className="task-list">
              {getTasksByStage('this-week').length === 0 ? (
                <div className="empty-state">No tasks this week</div>
              ) : (
                getTasksByStage('this-week').map(task => (
                  <div key={task.id} className="task-card" onClick={() => toggleTask(task.id)}>
                    <div className="task-checkbox" onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}>
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                      </svg>
                    </div>
                    <div className="task-content">
                      <div className="task-name">{task.title}</div>
                      <div className="task-meta">
                        <span className={`task-tag ${task.category.toLowerCase()}`}>{task.category}</span>
                        <span className={`priority-dot priority-${task.priority}`}></span>
                      </div>
                    </div>
                    <div className={`avatar ${task.assignee}`}>
                      {task.assignee === 'max' ? 'M' : 'J'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Done Section */}
          <div className="section">
            <h2 className="section-title">Done</h2>
            <div className="task-list">
              {getTasksByStage('done').length === 0 ? (
                <div className="empty-state">No completed tasks</div>
              ) : (
                getTasksByStage('done').map(task => (
                  <div key={task.id} className="task-card" onClick={() => toggleTask(task.id)} style={{ opacity: 0.6 }}>
                    <div className="task-checkbox checked" onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}>
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                      </svg>
                    </div>
                    <div className="task-content">
                      <div className="task-name" style={{ textDecoration: 'line-through' }}>{task.title}</div>
                      <div className="task-meta">
                        <span className={`task-tag ${task.category.toLowerCase()}`}>{task.category}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Task Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="modal-title">Add New Task</h3>
              <input
                className="modal-input"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                autoFocus
              />
              <select
                className="modal-input"
                value={newTask.category}
                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
              >
                <option value="Wedding">Wedding</option>
                <option value="Marketing">Marketing</option>
                <option value="Business">Business</option>
                <option value="Personal">Personal</option>
              </select>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="modal-btn submit" onClick={addTask}>Add Task</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
