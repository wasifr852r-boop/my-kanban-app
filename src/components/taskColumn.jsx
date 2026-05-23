import { useDroppable } from '@dnd-kit/core'
import TaskCard from './taskCards'

const columns = {
  'todo':        { label:'To Do',      emoji:'📋', bg:'#fff5f5', border:'#ffb3b3', header:'linear-gradient(135deg,#ff6b6b,#ee5a24)' },
  'in-progress': { label:'In Progress', emoji:'⚡', bg:'#fffbf0', border:'#ffd89b', header:'linear-gradient(135deg,#f7971e,#ffd200)' },
  'done':        { label:'Done',        emoji:'✅', bg:'#f0fff4', border:'#9ae6b4', header:'linear-gradient(135deg,#56ab2f,#a8e063)' },
}

function TaskColumn({ id, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const col = columns[id]

  return (
    <div style={{
      flex: 1,
      minWidth: '280px',
      borderRadius: '20px',
      overflow: 'hidden',
      border: `2px solid ${isOver ? '#667eea' : col.border}`,
      background: isOver ? 'rgba(102,126,234,0.06)' : col.bg,
      transition: 'all 0.2s ease',
      boxShadow: isOver ? '0 0 0 4px rgba(102,126,234,0.25)' : 'none',
      transform: isOver ? 'scale(1.01)' : 'scale(1)',
    }}>

      {/* Column header */}
      <div style={{background:col.header, padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={{color:'white', fontSize:'1rem', fontWeight:'700', margin:0}}>{col.emoji} {col.label}</h2>
        <span style={{background:'rgba(255,255,255,0.3)', color:'white', fontSize:'0.8rem', fontWeight:'700', padding:'2px 10px', borderRadius:'20px'}}>
          {tasks.length}
        </span>
      </div>

      {/* Drop zone — large touch target */}
      <div
        ref={setNodeRef}
        style={{
          padding: '1rem',
          minHeight: '220px',    // taller = easier to drop on mobile
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          transition: 'background 0.2s',
        }}
      >
        {tasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            color: isOver ? '#667eea' : '#aaa',
            fontSize: '0.85rem',
            border: `2px dashed ${isOver ? '#667eea' : '#ddd'}`,
            borderRadius: '12px',
            background: isOver ? 'rgba(102,126,234,0.05)' : 'transparent',
            transition: 'all 0.2s',
            fontWeight: isOver ? '600' : '400',
          }}>
            {isOver ? '📥 Drop here!' : 'Drop tasks here'}
          </div>
        ) : (
          <>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete}/>
            ))}
            {/* Extra drop area at the bottom when column has tasks */}
            {isOver && (
              <div style={{
                height: '60px',
                border: '2px dashed #667eea',
                borderRadius: '12px',
                background: 'rgba(102,126,234,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#667eea',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}>
                📥 Drop here
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
export default TaskColumn
