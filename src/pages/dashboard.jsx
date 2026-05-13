import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { supabase } from '../service/supabaseClients'
import { setTasks, addTask, updateTask, removeTask, setLoading } from '../store/taskSlice'
import { clearUser } from '../store/authSlice'
import { fetchTasks, createTask, updateTaskInDB, deleteTaskFromDB } from '../service/taskService'
import TaskColumn from '../components/taskColumn'
import TaskModal from '../components/taskModels'
import TaskCard from '../components/taskCards'
import toast, { Toaster } from 'react-hot-toast'

const COLUMNS = ['todo', 'in-progress', 'done']

function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { tasks, loading } = useSelector(state => state.tasks)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    if (user) loadTasks()
  }, [user])

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

  const handleEdit = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

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

return (
    <div style={{minHeight:'100vh',background:'#f0f2ff'}}>
      <Toaster />
      <header style={{background:'linear-gradient(135deg,#667eea,#764ba2)',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 4px 20px rgba(102,126,234,0.4)'}}>
        <h1 style={{color:'white',fontSize:'1.5rem',fontWeight:'800',margin:0}}>🗂️ KanbanFlow</h1>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <span style={{color:'rgba(255,255,255,0.85)',fontSize:'0.85rem'}}>{user?.email}</span>
          <button onClick={handleLogout}
            style={{background:'rgba(255,255,255,0.2)',color:'white',border:'1px solid rgba(255,255,255,0.3)',padding:'0.4rem 1rem',borderRadius:'20px',cursor:'pointer',fontSize:'0.85rem',fontWeight:'600'}}>
            Logout
          </button>
        </div>
      </header>

      <div style={{padding:'1.5rem 2rem'}}>
        <button onClick={()=>{setEditingTask(null);setModalOpen(true)}}
          style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',padding:'0.7rem 1.5rem',borderRadius:'12px',cursor:'pointer',fontSize:'0.95rem',fontWeight:'700',boxShadow:'0 4px 15px rgba(102,126,234,0.4)'}}>
          + Add Task
        </button>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'4rem',color:'#667eea',fontSize:'1.1rem'}}>Loading tasks...</div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{padding:'0 2rem 2rem',display:'flex',gap:'1.5rem',overflowX:'auto'}}>
            {COLUMNS.map(col => (
              <TaskColumn key={col} id={col} tasks={getTasksByStatus(col)} onEdit={handleEdit} onDelete={handleDelete}/>
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onEdit={()=>{}} onDelete={()=>{}}/> : null}
          </DragOverlay>
        </DndContext>
      )}

      {modalOpen && (
        <TaskModal task={editingTask} onSave={handleSaveTask} onClose={()=>{setModalOpen(false);setEditingTask(null)}}/>
      )}
    </div>
  )
}
export default Dashboard