import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { supabase } from './service/supabaseClients'
import { setUser, clearUser } from './store/authSlice'
import Login from './pages/login'
import Signup from './pages/signUp'
import Dashboard from './pages/dashboard'
import ProtectedRoute from './routes/protectedRoutes'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) dispatch(setUser(session.user))
      else dispatch(clearUser())
    })

    // Listen for auth state changes (login, logout, email verification)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) dispatch(setUser(session.user))
      } else if (event === 'SIGNED_OUT') {
        dispatch(clearUser())
      }
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      {/* Catch-all: redirect unknown routes to login */}
      <Route path="*" element={<Login />} />
    </Routes>
  )
}

export default App
