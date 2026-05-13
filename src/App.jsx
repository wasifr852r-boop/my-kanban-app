import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) dispatch(setUser(session.user))
      else dispatch(clearUser())
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) dispatch(setUser(session.user))
      else dispatch(clearUser())
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
    </Routes>
  )
}

export default App