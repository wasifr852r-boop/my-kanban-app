import { useDroppable } from '@dnd-kit/core'
import TaskCard from './taskCards'

const columns = {
  'todo': { label:'To Do', emoji:'📋', bg:'#fff5f5', border:'#ffb3b3', header:'linear-gradient(135deg,#ff6b6b,#ee5a24)' },
  'in-progress': { label:'In Progress', emoji:'⚡', bg:'#fffbf0', border:'#ffd89b', header:'linear-gradient(135deg,#f7971e,#ffd200)' },
  'done': { label:'Done', emoji:'✅', bg:'#f0fff4', border:'#9ae6b4', header:'linear-gradient(135deg,#56ab2f,#a8e063)' },
}

function TaskColumn({ id, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const col = columns[id]

  return (
    <div style={{flex:1,minWidth:'280px',borderRadius:'20px',overflow:'hidden',border:`2px solid ${isOver ? '#667eea' : col.border}`,background:col.bg,transition:'all 0.2s',boxShadow:isOver?'0 0 0 3px rgba(102,126,234,0.3)':'none'}}>
      <div style={{background:col.header,padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{color:'white',fontSize:'1rem',fontWeight:'700',margin:0}}>{col.emoji} {col.label}</h2>
        <span style={{background:'rgba(255,255,255,0.3)',color:'white',fontSize:'0.8rem',fontWeight:'700',padding:'2px 10px',borderRadius:'20px'}}>{tasks.length}</span>
      </div>
      <div ref={setNodeRef} style={{padding:'1rem',minHeight:'200px',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
        {tasks.length === 0 ? (
          <div style={{textAlign:'center',padding:'2rem 1rem',color:'#aaa',fontSize:'0.85rem',border:'2px dashed #ddd',borderRadius:'12px'}}>
            Drop tasks here
          </div>
        ) : tasks.map(task => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete}/>
        ))}
      </div>
    </div>
  )
}
export default TaskColumn