import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { supabase } from '../service/supabaseClients'
import { setTasks, addTask, updateTask, removeTask, setLoading } from '../store/taskSlice'
import { clearUser } from '../store/authSlice'
import { fetchTasks, createTask, updateTaskInDB, deleteTaskFromDB } from '../service/taskService'
import TaskColumn from '../components/taskColumn'
import TaskModal from '../components/taskModels'
import TaskCard from '../components/taskCards'
import toast, { Toaster } from 'react-hot-toast'

const COLUMNS = ['todo', 'in-progress', 'done']

// Breakpoints
// mobile:  < 640px
// tablet:  640px – 1023px
// laptop:  1024px – 1439px
// desktop: 1440px+

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])
  return width
}

function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { tasks, loading } = useSelector(state => state.tasks)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const width = useWindowWidth()
  const isMobile  = width < 640
  const isTablet  = width >= 640 && width < 1024
  const isLaptop  = width >= 1024 && width < 1440
  const isDesktop = width >= 1440

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  useEffect(() => { if (user) loadTasks() }, [user])

  const loadTasks = async () => {
    dispatch(setLoading(true))
    try {
      const data = await fetchTasks(user.id)
      dispatch(setTasks(data))
    } catch {
      toast.error('Failed to load tasks')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    dispatch(clearUser())
  }

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask?.id) {
        const updated = await updateTaskInDB(editingTask.id, taskData)
        dispatch(updateTask(updated))
        toast.success('Task updated!')
      } else {
        const newTask = await createTask({ ...taskData, user_id: user.id, status: 'todo' })
        dispatch(addTask(newTask))
        toast.success('Task created!')
      }
      setModalOpen(false)
      setEditingTask(null)
    } catch {
      toast.error('Failed to save task')
    }
  }

  const handleEdit   = (task) => { setEditingTask(task); setModalOpen(true) }
  const handleDelete = async (id) => {
    try {
      await deleteTaskFromDB(id)
      dispatch(removeTask(id))
      toast.success('Task deleted!')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleDragStart = (event) => {
    setActiveTask(tasks.find(t => t.id === event.active.id))
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null)
    if (!over || !COLUMNS.includes(over.id)) return
    const task = tasks.find(t => t.id === active.id)
    if (!task || task.status === over.id) return
    dispatch(updateTask({ ...task, status: over.id }))
    try {
      await updateTaskInDB(task.id, { status: over.id })
    } catch {
      dispatch(updateTask(task))
      toast.error('Failed to move task')
    }
  }

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  // ─── Responsive values ────────────────────────────────────────────────────
  const headerPadding  = isMobile ? '0.75rem 1rem' : isTablet ? '0.85rem 1.5rem' : '1rem 2.5rem'
  const logoSize       = isMobile ? '1.1rem' : isTablet ? '1.25rem' : '1.5rem'
  const bodyPadding    = isMobile ? '1rem' : isTablet ? '1.25rem 1.5rem' : isLaptop ? '1.5rem 2rem' : '1.5rem 2.5rem'
  const boardPadding   = isMobile ? '0 1rem 2rem' : isTablet ? '0 1.5rem 2rem' : isLaptop ? '0 2rem 2rem' : '0 2.5rem 2.5rem'

  // Column layout:
  // mobile  → stacked (column)
  // tablet  → 2-col grid (3rd col full-width below)
  // laptop+ → 3-col flex row
  const boardLayout = isMobile
    ? { display: 'flex', flexDirection: 'column', gap: '1rem' }
    : isTablet
    ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }
    : { display: 'flex', flexDirection: 'row', gap: '1.5rem', alignItems: 'flex-start' }

  const columnStyle = isMobile
    ? { width: '100%' }
    : isTablet
    ? { width: '100%' }
    : { flex: '1 1 0', minWidth: '260px', maxWidth: isDesktop ? '420px' : '360px' }

  // On tablet, make the 3rd column span full width
  const thirdColExtra = isTablet ? { gridColumn: '1 / -1', maxWidth: '50%', margin: '0 auto', width: '100%' } : {}

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2ff' }}>
      <Toaster position={isMobile ? 'bottom-center' : 'top-right'} />

      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(135deg,#667eea,#764ba2)',
        padding: headerPadding,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{ color: 'white', fontSize: logoSize, fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
          🗂️ KanbanFlow
        </h1>

        {/* Desktop / Laptop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: isTablet ? '0.8rem' : '0.85rem',
              maxWidth: isTablet ? '180px' : '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              background: 'rgba(255,255,255,0.1)',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
            }}>
              {user?.email}
            </span>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.4rem 1.1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'background 0.2s',
            }}
              onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={e  => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '0.2rem' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        )}
      </header>

      {/* ── Mobile dropdown menu ── */}
      {isMobile && menuOpen && (
        <div style={{
          background: '#764ba2',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
            {user?.email}
          </span>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '0.5rem 1.2rem',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            width: 'fit-content',
          }}>
            Logout
          </button>
        </div>
      )}

      {/* ── Add Task button ── */}
      <div style={{ padding: bodyPadding, paddingBottom: 0 }}>
        <button
          onClick={() => { setEditingTask(null); setModalOpen(true) }}
          style={{
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            color: 'white',
            border: 'none',
            padding: isMobile ? '0.65rem 1.25rem' : '0.75rem 1.75rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: isMobile ? '0.9rem' : '0.95rem',
            fontWeight: '700',
            boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
            width: isMobile ? '100%' : 'auto',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.5)' }}
          onMouseOut={e  => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.4)' }}
        >
          + Add Task
        </button>
      </div>

      {/* ── Board ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#667eea', fontSize: '1.1rem' }}>
          Loading tasks…
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ padding: boardPadding, marginTop: '1.25rem', ...boardLayout }}>
            {COLUMNS.map((col, i) => (
              <div
                key={col}
                style={{
                  ...columnStyle,
                  ...(isTablet && i === 2 ? thirdColExtra : {}),
                }}
              >
                <TaskColumn
                  id={col}
                  tasks={getTasksByStatus(col)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask
              ? <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
              : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setModalOpen(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}

export default Dashboard
