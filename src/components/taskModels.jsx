import { useState, useEffect } from 'react'
import { generateDescription } from '../service/geminiService'
import toast from 'react-hot-toast'

const today = new Date().toISOString().split('T')[0]

function TaskModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'medium')
      setDueDate(task.due_date || '')
    }
  }, [task])

  const handleAI = async () => {
    if (!title.trim()) { toast.error('Enter a title first!'); return }
    setAiLoading(true)
    try {
      const desc = await generateDescription(title)
      setDescription(desc)
      toast.success('Description generated!')
    } catch (err) {
      toast.error(err.message || 'AI failed. Try again.')
    }
    setAiLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title is required!'); return }
    setLoading(true)
    await onSave({ title: title.trim(), description: description.trim(), priority, due_date: dueDate || null })
    setLoading(false)
  }

  const priorityOptions = [
    { value: 'low',    label: '🟢 Low',    color: '#2e7d32', bg: '#e8f5e9' },
    { value: 'medium', label: '🟡 Medium', color: '#f57f17', bg: '#fff8e1' },
    { value: 'high',   label: '🔴 High',   color: '#c62828', bg: '#ffebee' },
  ]
  const selectedPriority = priorityOptions.find(p => p.value === priority)

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'1rem'}}>
      <div style={{background:'white',borderRadius:'24px',width:'100%',maxWidth:'500px',boxShadow:'0 25px 50px rgba(0,0,0,0.3)',overflow:'hidden',maxHeight:'90vh',display:'flex',flexDirection:'column'}}>

        {/* Header */}
        <div style={{background:'linear-gradient(135deg,#667eea,#764ba2)',padding:'1.25rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <h2 style={{color:'white',fontSize:'1.1rem',fontWeight:'700',margin:0}}>{task?.id ? '✏️ Edit Task' : '✨ New Task'}</h2>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'1rem'}}>✕</button>
        </div>

        {/* Scrollable form */}
        <div style={{overflowY:'auto',flex:1}}>
          <form onSubmit={handleSubmit} style={{padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>

            {/* Title */}
            <div>
              <label style={{display:'block',fontSize:'0.85rem',fontWeight:'600',color:'#444',marginBottom:'0.4rem'}}>Title *</label>
              <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required
                style={{width:'100%',padding:'0.7rem 1rem',border:'2px solid #e8e8e8',borderRadius:'12px',fontSize:'0.95rem',outline:'none',boxSizing:'border-box',transition:'border 0.2s'}}
                onFocus={e=>e.target.style.borderColor='#667eea'}
                onBlur={e=>e.target.style.borderColor='#e8e8e8'}
                placeholder="What needs to be done?"/>
            </div>

            {/* Description */}
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem'}}>
                <label style={{fontSize:'0.85rem',fontWeight:'600',color:'#444'}}>Description</label>
                <button type="button" onClick={handleAI} disabled={aiLoading}
                  style={{background:'linear-gradient(135deg,#a855f7,#6366f1)',color:'white',border:'none',padding:'5px 14px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:'600',cursor:aiLoading?'not-allowed':'pointer',opacity:aiLoading?0.6:1,display:'flex',alignItems:'center',gap:'4px'}}>
                  {aiLoading ? '⏳ Generating...' : '✨ AI Generate'}
                </button>
              </div>
              {/* Fixed: full description visible, scrollable */}
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={5}
                style={{width:'100%',padding:'0.7rem 1rem',border:'2px solid #e8e8e8',borderRadius:'12px',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',resize:'vertical',minHeight:'100px',lineHeight:1.6,transition:'border 0.2s'}}
                onFocus={e=>e.target.style.borderColor='#667eea'}
                onBlur={e=>e.target.style.borderColor='#e8e8e8'}
                placeholder="Task description..."/>
            </div>

            {/* Priority + Due Date */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>

              {/* Priority — improved UI */}
              <div>
                <label style={{display:'block',fontSize:'0.85rem',fontWeight:'600',color:'#444',marginBottom:'0.4rem'}}>Priority</label>
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                  {priorityOptions.map(opt => (
                    <button key={opt.value} type="button" onClick={()=>setPriority(opt.value)}
                      style={{
                        padding:'6px 10px',borderRadius:'10px',border:`2px solid ${priority===opt.value ? opt.color : '#e8e8e8'}`,
                        background:priority===opt.value ? opt.bg : 'white',
                        color:priority===opt.value ? opt.color : '#666',
                        fontWeight:priority===opt.value ? '700' : '500',
                        fontSize:'0.82rem',cursor:'pointer',textAlign:'left',
                        transition:'all 0.15s'
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date — no past dates */}
              <div>
                <label style={{display:'block',fontSize:'0.85rem',fontWeight:'600',color:'#444',marginBottom:'0.4rem'}}>Due Date</label>
                <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}
                  min={today}
                  style={{width:'100%',padding:'0.7rem 1rem',border:'2px solid #e8e8e8',borderRadius:'12px',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',transition:'border 0.2s'}}
                  onFocus={e=>e.target.style.borderColor='#667eea'}
                  onBlur={e=>e.target.style.borderColor='#e8e8e8'}/>
                <p style={{fontSize:'0.75rem',color:'#a0aec0',margin:'4px 0 0'}}>Today or future only</p>
              </div>
            </div>

            {/* Buttons */}
            <div style={{display:'flex',gap:'0.75rem',marginTop:'0.5rem'}}>
              <button type="button" onClick={onClose}
                style={{flex:1,padding:'0.75rem',border:'2px solid #e8e8e8',borderRadius:'12px',background:'white',color:'#666',fontSize:'0.95rem',fontWeight:'600',cursor:'pointer'}}>
                Cancel
              </button>
              <button type="submit" disabled={loading}
                style={{flex:1,padding:'0.75rem',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'12px',fontSize:'0.95rem',fontWeight:'700',cursor:'pointer',opacity:loading?0.7:1}}>
                {loading ? 'Saving...' : task?.id ? 'Update Task' : 'Create Task'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
export default TaskModal
