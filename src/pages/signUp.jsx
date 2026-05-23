import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../service/supabaseClients'
import toast, { Toaster } from 'react-hot-toast'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [navLoading, setNavLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) toast.error(error.message)
    else setEmailSent(true) // Show confirmation instead of navigating
    setLoading(false)
  }

  const handleNavToLogin = () => {
    setNavLoading(true)
    setTimeout(() => navigate('/'), 300)
  }

  // ── Email sent confirmation screen ──
  if (emailSent) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
        <div style={{background:'white',borderRadius:'24px',padding:'2.5rem',width:'100%',maxWidth:'420px',boxShadow:'0 25px 50px rgba(0,0,0,0.2)',textAlign:'center'}}>
          <div style={{fontSize:'4rem',marginBottom:'1rem'}}>📧</div>
          <h2 style={{fontSize:'1.5rem',fontWeight:'800',color:'#2d3748',margin:'0 0 0.75rem'}}>Check your email!</h2>
          <p style={{color:'#666',fontSize:'0.95rem',lineHeight:1.6,marginBottom:'1.5rem'}}>
            A confirmation email has been sent to<br/>
            <strong style={{color:'#f5576c'}}>{email}</strong><br/><br/>
            Please click the link in the email to verify your account before signing in.
          </p>
          <button onClick={handleNavToLogin}
            style={{width:'100%',padding:'0.85rem',background:'linear-gradient(135deg,#f093fb,#f5576c)',color:'white',border:'none',borderRadius:'12px',fontSize:'1rem',fontWeight:'700',cursor:'pointer'}}>
            Go to Sign In →
          </button>
        </div>
      </div>
    )
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
              style={{width:'100%',padding:'0.75rem 1rem',border:'2px solid #e8e8e8',borderRadius:'12px',fontSize:'0.95rem',outline:'none',boxSizing:'border-box',transition:'border 0.2s'}}
              onFocus={e=>e.target.style.borderColor='#f5576c'}
              onBlur={e=>e.target.style.borderColor='#e8e8e8'}
              placeholder="your@email.com"/>
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block',fontSize:'0.85rem',fontWeight:'600',color:'#444',marginBottom:'0.4rem'}}>Password</label>
            <div style={{position:'relative'}}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}
                style={{width:'100%',padding:'0.75rem 3rem 0.75rem 1rem',border:'2px solid #e8e8e8',borderRadius:'12px',fontSize:'0.95rem',outline:'none',boxSizing:'border-box',transition:'border 0.2s'}}
                onFocus={e=>e.target.style.borderColor='#f5576c'}
                onBlur={e=>e.target.style.borderColor='#e8e8e8'}
                placeholder="Min 6 characters"/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)}
                style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'1.1rem',color:'#888',padding:'0'}}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'0.85rem',background:'linear-gradient(135deg,#f093fb,#f5576c)',color:'white',border:'none',borderRadius:'12px',fontSize:'1rem',fontWeight:'700',cursor:'pointer',opacity:loading?0.7:1,transition:'opacity 0.2s'}}>
            {loading ? '⏳ Creating...' : 'Create Account →'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1.5rem',color:'#888',fontSize:'0.9rem'}}>
          Have an account?{' '}
          <button onClick={handleNavToLogin} disabled={navLoading}
            style={{background:'none',border:'none',color:'#f5576c',fontWeight:'700',cursor:'pointer',fontSize:'0.9rem',padding:0}}>
            {navLoading ? '⏳ Loading...' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
export default Signup
