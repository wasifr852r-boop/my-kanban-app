/**
 * Dashboard.jsx — KanbanFlow
 *
 * ✅ Fully responsive: 320px phones → 4K desktops
 * ✅ Drag-and-drop works on mouse, touch (mobile/tablet), and keyboard
 * ✅ Zero JS-based width detection — pure CSS media queries
 * ✅ Touch scroll lock during drag so the page doesn't scroll under the card
 *
 * Breakpoints
 * ───────────
 *  xs   < 480px      small phones
 *  sm   480–767px    large phones / landscape
 *  md   768–1023px   tablets
 *  lg   1024–1439px  laptops
 *  xl   1440px+      desktops / TVs
 */

import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { supabase }                                              from '../service/supabaseClients'
import { setTasks, addTask, updateTask, removeTask, setLoading } from '../store/taskSlice'
import { clearUser }                                             from '../store/authSlice'
import { fetchTasks, createTask, updateTaskInDB, deleteTaskFromDB } from '../service/taskService'
import TaskColumn from '../components/taskColumn'
import TaskModal  from '../components/taskModels'
import TaskCard   from '../components/taskCards'
import toast, { Toaster } from 'react-hot-toast'

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const COLUMNS = ['todo', 'in-progress', 'done']

/* ─── Styles ────────────────────────────────────────────────────────────────── */
/*
 * All colours live here — editor syntax highlighting won't colour them inside
 * template literals, but the browser receives and applies them correctly.
 *
 * Colour palette
 * ──────────────
 *  --clr-bg         #eef0fb   page background (soft indigo-white)
 *  --clr-primary    #5b6ef5   brand indigo
 *  --clr-primary2   #8b5cf6   brand violet
 *  --clr-surface    #ffffff   card / panel surface
 *  --clr-text       #1e1b4b   heading text
 *  --clr-muted      #6b7280   secondary text
 *  --clr-border     #e0e3f7   subtle borders
 */
const CSS = `
  /* ── Reset ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── CSS variables ── */
  :root {
    --clr-bg:       #eef0fb;
    --clr-primary:  #5b6ef5;
    --clr-primary2: #8b5cf6;
    --clr-surface:  #ffffff;
    --clr-text:     #1e1b4b;
    --clr-muted:    #6b7280;
    --clr-border:   #e0e3f7;
    --header-h:     60px;
    --radius:       14px;
    --shadow-sm:    0 2px 8px rgba(91,110,245,0.10);
    --shadow-md:    0 6px 24px rgba(91,110,245,0.18);
    --shadow-lg:    0 16px 48px rgba(91,110,245,0.22);
    --gradient:     linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-primary2) 100%);
  }

  /* ── CRITICAL for touch drag ────────────────────────────────────────────────
     dnd-kit sets [data-dnd-draggable] on each draggable element.
     touch-action:none tells the browser NOT to intercept the touch gesture
     for scrolling, which is what breaks drag on mobile.                       */
  [data-dnd-draggable] { touch-action: none; -webkit-user-select: none; user-select: none; }

  /* Lock page scroll while a card is held (mobile) */
  body.is-dragging { overflow: hidden; touch-action: none; overscroll-behavior: none; }

  /* ── Root ── */
  .db {
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--clr-bg);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: var(--clr-text);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     HEADER
  ═══════════════════════════════════════════════════════════════════════════ */
  .db__header {
    position: sticky;
    top: 0;
    z-index: 300;
    height: var(--header-h);
    background: var(--gradient);
    box-shadow: 0 4px 20px rgba(91,110,245,0.35);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 clamp(1rem, 5vw, 2.5rem);
    gap: 1rem;
  }

  .db__logo {
    font-size: clamp(1.05rem, 2.8vw, 1.45rem);
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.5px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  /* Desktop right-side nav (email + logout) */
  .db__nav {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .db__email {
    font-size: clamp(0.7rem, 1.6vw, 0.85rem);
    color: rgba(255,255,255,0.9);
    background: rgba(255,255,255,0.15);
    border-radius: 999px;
    padding: 0.28rem 0.85rem;
    max-width: clamp(100px, 22vw, 260px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .db__btn-logout {
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.35);
    color: #fff;
    font-size: 0.84rem;
    font-weight: 600;
    padding: 0.38rem 1.1rem;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.18s;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }
  .db__btn-logout:hover  { background: rgba(255,255,255,0.30); }
  .db__btn-logout:active { background: rgba(255,255,255,0.40); }

  /* Hamburger — hidden by default, shown on xs/sm */
  .db__hamburger {
    display: none;
    background: rgba(255,255,255,0.12);
    border: 1.5px solid rgba(255,255,255,0.25);
    color: #fff;
    font-size: 1.35rem;
    line-height: 1;
    padding: 0.32rem 0.6rem;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.18s;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
  }
  .db__hamburger:hover  { background: rgba(255,255,255,0.22); }
  .db__hamburger:active { background: rgba(255,255,255,0.35); }

  /* ═══════════════════════════════════════════════════════════════════════════
     MOBILE DRAWER
  ═══════════════════════════════════════════════════════════════════════════ */
  .db__drawer {
    overflow: hidden;
    max-height: 0;
    background: #7060e8;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0 clamp(1rem, 5vw, 2.5rem);
    transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1),
                padding-top 0.3s, padding-bottom 0.3s;
  }
  .db__drawer.open {
    max-height: 180px;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  .db__drawer .db__email {
    max-width: 100%;
    white-space: normal;
    word-break: break-all;
  }
  .db__drawer .db__btn-logout { width: fit-content; }

  /* ═══════════════════════════════════════════════════════════════════════════
     TOOLBAR
  ═══════════════════════════════════════════════════════════════════════════ */
  .db__toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: clamp(0.9rem, 2.5vw, 1.5rem) clamp(1rem, 5vw, 2.5rem);
    padding-bottom: 0;
    flex-wrap: wrap;
  }

  .db__btn-add {
    background: var(--gradient);
    color: #fff;
    border: none;
    font-size: clamp(0.875rem, 1.6vw, 0.95rem);
    font-weight: 700;
    padding: 0.7rem 1.6rem;
    border-radius: var(--radius);
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: transform 0.15s, box-shadow 0.15s;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
  }
  .db__btn-add:hover  { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .db__btn-add:active { transform: translateY(0px);  box-shadow: var(--shadow-sm); }

  /* ═══════════════════════════════════════════════════════════════════════════
     LOADING
  ═══════════════════════════════════════════════════════════════════════════ */
  .db__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 6rem 1rem;
    color: var(--clr-primary);
    font-size: 1rem;
    font-weight: 500;
  }
  .db__spinner {
    width: 36px; height: 36px;
    border: 3px solid var(--clr-border);
    border-top-color: var(--clr-primary);
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ═══════════════════════════════════════════════════════════════════════════
     BOARD
  ═══════════════════════════════════════════════════════════════════════════ */
  .db__board {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: clamp(0.85rem, 2vw, 1.5rem);
    padding: clamp(0.9rem, 2.5vw, 1.5rem) clamp(1rem, 5vw, 2.5rem) 3rem;

    /* horizontal scroll fallback for very narrow screens */
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scrollbar-width: thin;
    scrollbar-color: var(--clr-primary) transparent;
  }
  .db__board::-webkit-scrollbar       { height: 4px; }
  .db__board::-webkit-scrollbar-thumb { background: var(--clr-border); border-radius: 99px; }

  /* Individual column wrapper */
  .db__col {
    flex: 1 1 0;
    min-width: clamp(260px, 30vw, 400px);
    max-width: 420px;
    scroll-snap-align: start;
  }

  /* Dragging ghost card */
  .db__ghost {
    border-radius: var(--radius);
    box-shadow: 0 28px 72px rgba(0,0,0,0.20);
    transform: rotate(2deg);
    opacity: 0.96;
    pointer-events: none;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     RESPONSIVE BREAKPOINTS
  ═══════════════════════════════════════════════════════════════════════════

  Strategy
  ────────
  xl  1440px+  →  flex row, up to 420px per col
  lg  1024px+  →  flex row (default above)
  md  768–1023 →  2-column CSS grid, 3rd col spans full width on left
  sm  480–767  →  single column, full width
  xs  <480     →  single column, tighter spacing
  */

  /* md: tablets 768–1023px */
  @media (min-width: 768px) and (max-width: 1023px) {
    .db__board {
      display: grid;
      grid-template-columns: 1fr 1fr;
      overflow-x: visible;
      scroll-snap-type: none;
    }
    .db__col {
      min-width: unset;
      max-width: unset;
      width: 100%;
    }
    /* 3rd column → full row, but only half-wide (mirrors one column) */
    .db__col:nth-child(3) {
      grid-column: 1 / -1;
      max-width: 50%;
    }
  }

  /* sm: large phones / landscape 480–767px */
  @media (max-width: 767px) {
    .db__hamburger { display: flex; align-items: center; }
    .db__nav       { display: none; }

    .db__btn-add   { width: 100%; justify-content: center; }

    .db__board {
      flex-direction: column;
      overflow-x: visible;
      scroll-snap-type: none;
    }
    .db__col {
      flex: unset;
      width: 100%;
      min-width: unset;
      max-width: unset;
    }
  }

  /* xs: small phones <480px */
  @media (max-width: 479px) {
    :root { --header-h: 54px; }
    .db__logo { font-size: 1rem; }
    .db__board {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      gap: 0.85rem;
    }
  }

  /* xl: big desktops 1440px+ */
  @media (min-width: 1440px) {
    .db__col { max-width: 500px; }
  }
`

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const dispatch = useDispatch()
  const { user }            = useSelector(s => s.auth)
  const { tasks, loading }  = useSelector(s => s.tasks)

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [activeTask,  setActiveTask]  = useState(null)
  const [menuOpen,    setMenuOpen]    = useState(false)

  /* ── Sensors ─────────────────────────────────────────────────────────────
   *
   * PointerSensor  covers mouse + stylus.
   *   distance:8   → user must move 8px before drag activates (prevents
   *                  accidental drags on click)
   *
   * TouchSensor    covers finger touch on phones & tablets.
   *   delay:250    → wait 250ms before committing to a drag; this gives the
   *                  browser time to decide if the user wants to scroll instead
   *   tolerance:8  → finger can drift 8px during the delay without cancelling
   *
   * KeyboardSensor covers arrow-key navigation (accessibility).
   * ─────────────────────────────────────────────────────────────────────── */
  const sensors = useSensors(
    useSensor(PointerSensor,  { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,    { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  /* ── Load tasks ─────────────────────────────────────────────────────────── */
  useEffect(() => { if (user) loadTasks() }, [user])

  const loadTasks = async () => {
    dispatch(setLoading(true))
    try {
      dispatch(setTasks(await fetchTasks(user.id)))
    } catch {
      toast.error('Failed to load tasks')
    }
  }

  /* ── Close mobile drawer on outside tap ─────────────────────────────────── */
  useEffect(() => {
    if (!menuOpen) return
    const close = (e) => {
      if (!e.target.closest('.db__header') && !e.target.closest('.db__drawer'))
        setMenuOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [menuOpen])

  /* ── CRUD ───────────────────────────────────────────────────────────────── */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    dispatch(clearUser())
  }

  const handleSaveTask = async (data) => {
    try {
      if (editingTask?.id) {
        dispatch(updateTask(await updateTaskInDB(editingTask.id, data)))
        toast.success('Task updated!')
      } else {
        dispatch(addTask(await createTask({ ...data, user_id: user.id, status: 'todo' })))
        toast.success('Task created!')
      }
      setModalOpen(false)
      setEditingTask(null)
    } catch {
      toast.error('Failed to save task')
    }
  }

  const handleEdit = (task) => { setEditingTask(task); setModalOpen(true) }

  const handleDelete = async (id) => {
    try {
      await deleteTaskFromDB(id)
      dispatch(removeTask(id))
      toast.success('Task deleted!')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  /* ── Drag handlers ──────────────────────────────────────────────────────── */
  const handleDragStart = useCallback(({ active }) => {
    setActiveTask(tasks.find(t => t.id === active.id) ?? null)
    // Prevent the whole page from scrolling under the user's finger while dragging
    document.body.classList.add('is-dragging')
  }, [tasks])

  const handleDragEnd = useCallback(async ({ active, over }) => {
    document.body.classList.remove('is-dragging')
    setActiveTask(null)

    if (!over || !COLUMNS.includes(over.id)) return
    const task = tasks.find(t => t.id === active.id)
    if (!task || task.status === over.id) return

    // Optimistic update — update UI instantly, sync to DB in background
    dispatch(updateTask({ ...task, status: over.id }))
    try {
      await updateTaskInDB(task.id, { status: over.id })
    } catch {
      dispatch(updateTask(task))           // rollback if DB write fails
      toast.error('Failed to move task')
    }
  }, [tasks, dispatch])

  const handleDragCancel = useCallback(() => {
    document.body.classList.remove('is-dragging')
    setActiveTask(null)
  }, [])

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  const byStatus   = (s)  => tasks.filter(t => t.status === s)
  const openAdd    = ()   => { setEditingTask(null); setModalOpen(true) }
  const closeModal = ()   => { setModalOpen(false);  setEditingTask(null) }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="db">
      {/* Inject all CSS — colours, layout, breakpoints, animations */}
      <style>{CSS}</style>

      <Toaster
        position="top-right"
        toastOptions={{ style: { fontSize: '0.875rem', maxWidth: '340px' } }}
      />

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="db__header">
        <h1 className="db__logo">🗂️ KanbanFlow</h1>

        {/* Desktop nav — hidden on mobile by CSS */}
        <nav className="db__nav">
          <span className="db__email">{user?.email}</span>
          <button className="db__btn-logout" onClick={handleLogout}>Logout</button>
        </nav>

        {/* Hamburger — shown on mobile by CSS */}
        <button
          className="db__hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* ══ MOBILE DRAWER ═══════════════════════════════════════════════════ */}
      <div className={`db__drawer${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <span className="db__email">{user?.email}</span>
        <button className="db__btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      {/* ══ TOOLBAR ═════════════════════════════════════════════════════════ */}
      <div className="db__toolbar">
        <button className="db__btn-add" onClick={openAdd}>＋ Add Task</button>
      </div>

      {/* ══ BOARD ═══════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="db__loading">
          <div className="db__spinner" />
          Loading tasks…
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="db__board">
            {COLUMNS.map(col => (
              <div key={col} className="db__col">
                <TaskColumn
                  id={col}
                  tasks={byStatus(col)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {/*
            DragOverlay renders the "ghost" card that follows the cursor / finger.
            It renders outside the normal DOM so it never gets clipped by overflow.
          */}
          <DragOverlay
            dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}
          >
            {activeTask && (
              <div className="db__ghost">
                <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* ══ MODAL ═══════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <TaskModal task={editingTask} onSave={handleSaveTask} onClose={closeModal} />
      )}
    </div>
  )
}
