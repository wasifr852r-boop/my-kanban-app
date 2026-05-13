import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../service/supabaseClients'
import toast, { Toaster } from 'react-hot-toast'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) toast.error(error.message)
    else { toast.success('Account created! Check your email.'); navigate('/') }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <Toaster />
      <div style={{background:'white',borderRadius:'24px',padding:'2.5rem',width:'100%',maxWidth:'420px',boxShadow:'0 25px 50px rgba(0,0,0,0.2)'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>✨</div>
          <h1 style={{fontSize:'1.8rem',fontWeight:'800',background:'linear-gradient(135deg,#f093fb,#f5576c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:0}}>Get Started</h1>
          <p style={{color:'#888',marginTop:'0.5rem',fontSize:'0.9rem'}}>Create your free account</p>
        </div>
        <form onSubmit={handleSignup}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontSize:'0.85rem',fontWeight:'600',color:'#444',marginBottom:'0.4rem'}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:'100%',padding:'0.75rem 1rem',border:'2px solid #e8e8e8',borderRadius:'12px',fontSize:'0.95rem',outline:'none',boxSizing:'border-box'}}
              onFocus={e=>e.target.style.borderColor='#f5576c'}
              onBlur={e=>e.target.style.borderColor='#e8e8e8'}
              placeholder="your@email.com"/>
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block',fontSize:'0.85rem',fontWeight:'600',color:'#444',marginBottom:'0.4rem'}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}
              style={{width:'100%',padding:'0.75rem 1rem',border:'2px solid #e8e8e8',borderRadius:'12px',fontSize:'0.95rem',outline:'none',boxSizing:'border-box'}}
              onFocus={e=>e.target.style.borderColor='#f5576c'}
              onBlur={e=>e.target.style.borderColor='#e8e8e8'}
              placeholder="Min 6 characters"/>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'0.85rem',background:'linear-gradient(135deg,#f093fb,#f5576c)',color:'white',border:'none',borderRadius:'12px',fontSize:'1rem',fontWeight:'700',cursor:'pointer',opacity:loading?0.7:1}}>
            {loading ? '⏳ Creating...' : 'Create Account →'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1.5rem',color:'#888',fontSize:'0.9rem'}}>
          Have an account? <Link to="/" style={{color:'#f5576c',fontWeight:'700',textDecoration:'none'}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
export default Signup