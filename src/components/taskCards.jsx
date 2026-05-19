import { useDraggable } from '@dnd-kit/core'

const priorityConfig = {
  low:    { bg: '#e8f5e9', color: '#2e7d32', label: '🟢 Low'    },
  medium: { bg: '#fff8e1', color: '#f57f17', label: '🟡 Medium' },
  high:   { bg: '#ffebee', color: '#c62828', label: '🔴 High'   },
}

function TaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const p = priorityConfig[task.priority] || priorityConfig.medium

  const cardStyle = {
    /* ── Position / drag transform ── */
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity:   isDragging ? 0.45 : 1,
    zIndex:    isDragging ? 999  : 'auto',

    /* ── CRITICAL: without this, mobile browsers swallow the touch
          event for scrolling and drag never activates on phones/tablets ── */
    touchAction: 'none',

    /* ── Visual ── */
    background:    '#ffffff',
    borderRadius:  '14px',
    padding:       '1rem',
    boxShadow:     isDragging
      ? '0 16px 40px rgba(0,0,0,0.18)'
      : '0 2px 8px rgba(0,0,0,0.08)',
    border:        '1px solid rgba(0,0,0,0.06)',
    cursor:        isDragging ? 'grabbing' : 'grab',
    transition:    'box-shadow 0.2s, opacity 0.15s',
    userSelect:    'none',
    WebkitUserSelect: 'none',
  }

  return (
    <div ref={setNodeRef} style={cardStyle} {...listeners} {...attributes}>

      {/* ── Title row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#2d3748', margin: 0, flex: 1, paddingRight: '0.5rem', lineHeight: 1.4 }}>
          {task.title}
        </h3>

        {/* Buttons: stop propagation so tapping edit/delete doesn't start a drag */}
        <div
          style={{ display: 'flex', gap: '4px' }}
          onPointerDown={e => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(task)}
            style={{ background: '#eef2ff', border: 'none', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{ background: '#fff0f0', border: 'none', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ── Description ── */}
      {task.description && (
        <p style={{
          fontSize: '0.8rem',
          color: '#718096',
          margin: '0 0 0.75rem',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.description}
        </p>
      )}

      {/* ── Footer: priority badge + due date ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          padding: '3px 10px',
          borderRadius: '20px',
          background: p.bg,
          color: p.color,
        }}>
          {p.label}
        </span>

        {task.due_date && (
          <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>
            📅 {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

    </div>
  )
}

export default TaskCard