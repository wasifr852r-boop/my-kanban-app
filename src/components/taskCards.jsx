import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'

const priorityConfig = {
  low:    { bg:'#e8f5e9', color:'#2e7d32', label:'🟢 Low' },
  medium: { bg:'#fff8e1', color:'#f57f17', label:'🟡 Medium' },
  high:   { bg:'#ffebee', color:'#c62828', label:'🔴 High' },
}

function TaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const [showConfirm, setShowConfirm] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const style = transform
    ? { transform:`translate(${transform.x}px,${transform.y}px)`, opacity:isDragging?0.4:1, zIndex:999 }
    : {}

  const p = priorityConfig[task.priority] || priorityConfig.medium

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setShowConfirm(true)
  }

  const confirmDelete = (e) => {
    e.stopPropagation()
    onDelete(task.id)
    setShowConfirm(false)
  }

  const cancelDelete = (e) => {
    e.stopPropagation()
    setShowConfirm(false)
  }

  return (
    <>
      <div ref={setNodeRef} style={{...style, background:'white', borderRadius:'14px', padding:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', cursor:'grab', border:'1px solid rgba(0,0,0,0.06)', transition:'box-shadow 0.2s'}}
        {...listeners} {...attributes}>

        {/* Title + action buttons */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
          <h3 style={{fontSize:'0.9rem',fontWeight:'700',color:'#2d3748',margin:0,flex:1,paddingRight:'0.5rem',wordBreak:'break-word'}}>{task.title}</h3>
          <div style={{display:'flex',gap:'4px',flexShrink:0}} onPointerDown={e=>e.stopPropagation()}>
            <button onClick={()=>onEdit(task)} style={{background:'#eef2ff',border:'none',borderRadius:'8px',width:'28px',height:'28px',cursor:'pointer',fontSize:'0.75rem'}}>✏️</button>
            <button onClick={handleDeleteClick} style={{background:'#fff0f0',border:'none',borderRadius:'8px',width:'28px',height:'28px',cursor:'pointer',fontSize:'0.75rem'}}>🗑️</button>
          </div>
        </div>

        {/* Description — expandable, no cut-off */}
        {task.description && (
          <div onPointerDown={e=>e.stopPropagation()}>
            <p style={{
              fontSize:'0.8rem',color:'#718096',margin:'0 0 0.5rem',lineHeight:1.6,
              wordBreak:'break-word',whiteSpace:'pre-wrap',
              ...(expanded ? {} : {display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'})
            }}>
              {task.description}
            </p>
            {task.description.length > 80 && (
              <button onClick={()=>setExpanded(!expanded)}
                style={{background:'none',border:'none',color:'#667eea',fontSize:'0.75rem',fontWeight:'600',cursor:'pointer',padding:0,marginBottom:'0.5rem'}}>
                {expanded ? 'Show less ▲' : 'Show more ▼'}
              </button>
            )}
          </div>
        )}

        {/* Priority + Due date */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'0.5rem',flexWrap:'wrap',gap:'4px'}}>
          <span style={{fontSize:'0.75rem',fontWeight:'600',padding:'3px 10px',borderRadius:'20px',background:p.bg,color:p.color}}>{p.label}</span>
          {task.due_date && (
            <span style={{fontSize:'0.75rem',color:'#a0aec0'}}>
              📅 {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'1rem'}}>
          <div style={{background:'white',borderRadius:'20px',padding:'2rem',maxWidth:'360px',width:'100%',boxShadow:'0 20px 40px rgba(0,0,0,0.2)',textAlign:'center'}}>
            <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>🗑️</div>
            <h3 style={{fontSize:'1.1rem',fontWeight:'700',color:'#2d3748',margin:'0 0 0.5rem'}}>Delete Task?</h3>
            <p style={{color:'#718096',fontSize:'0.9rem',margin:'0 0 1.5rem',lineHeight:1.5}}>
              Are you sure you want to delete<br/>
              <strong>"{task.title}"</strong>?<br/>
              This action cannot be undone.
            </p>
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={cancelDelete}
                style={{flex:1,padding:'0.7rem',border:'2px solid #e8e8e8',borderRadius:'12px',background:'white',color:'#666',fontWeight:'600',cursor:'pointer',fontSize:'0.9rem'}}>
                Cancel
              </button>
              <button onClick={confirmDelete}
                style={{flex:1,padding:'0.7rem',background:'linear-gradient(135deg,#fc5c7d,#6a3093)',color:'white',border:'none',borderRadius:'12px',fontWeight:'700',cursor:'pointer',fontSize:'0.9rem'}}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default TaskCard
