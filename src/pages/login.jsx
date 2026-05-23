import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from '../service/supabaseClients'
import toast, { Toaster } from 'react-hot-toast'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [navLoading, setNavLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  // Redirect if already logged in — fixes "going back logs out" issue
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) toast.error(error.message)
    else { toast.success('Welcome back!'); navigate('/dashboard') }
    setLoading(false)
  }

  const handleNavToSignup = () => {
    setNavLoading(true)
    setTimeout(() => navigate('/signup'), 300)
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <Toaster />
      <div style={{background:'white',borderRadius:'24px',padding:'2.5rem',width:'100%',maxWidth:'420px',boxShadow:'0 25px 50px rgba(0,0,0,0.2)'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>🗂️</div>
          <h1 style={{fontSize:'1.8rem',fontWeight:'800',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:0}}>KanbanFlow</h1>
          <p style={{color:'#888',marginTop:'0.5rem',fontSize:'0.9rem'}}>Sign in to your workspace</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontSize:'0.85rem',fontWeight:'600',color:'#444',marginBottom:'0.4rem'}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:'100%',padding:'0.75rem 1rem',border:'2px solid #e8e8e8',borderRadius:'12px',fontSize:'0.95rem',outline:'none',boxSizing:'border-box',transition:'border 0.2s'}}
              onFocus={e=>e.target.style.borderColor='#667eea'}
              onBlur={e=>e.target.style.borderColor='#e8e8e8'}
              placeholder="your@email.com"/>
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block',fontSize:'0.85rem',fontWeight:'600',color:'#444',marginBottom:'0.4rem'}}>Password</label>
            <div style={{position:'relative'}}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={e=>setPassword(e.target.value)} required
                style={{width:'100%',padding:'0.75rem 3rem 0.75rem 1rem',border:'2px solid #e8e8e8',borderRadius:'12px',fontSize:'0.95rem',outline:'none',boxSizing:'border-box',transition:'border 0.2s'}}
                onFocus={e=>e.target.style.borderColor='#667eea'}
                onBlur={e=>e.target.style.borderColor='#e8e8e8'}
                placeholder="••••••••"/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)}
                style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'1.1rem',color:'#888',padding:'0'}}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'0.85rem',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'12px',fontSize:'1rem',fontWeight:'700',cursor:'pointer',opacity:loading?0.7:1,transition:'opacity 0.2s'}}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1.5rem',color:'#888',fontSize:'0.9rem'}}>
          No account?{' '}
          <button onClick={handleNavToSignup} disabled={navLoading}
            style={{background:'none',border:'none',color:'#667eea',fontWeight:'700',cursor:'pointer',fontSize:'0.9rem',padding:0}}>
            {navLoading ? '⏳ Loading...' : 'Create one free'}
          </button>
        </p>
      </div>
    </div>
  )
}
export default Login
