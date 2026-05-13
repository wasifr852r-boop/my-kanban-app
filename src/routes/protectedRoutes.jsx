import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { user, loading } = useSelector(state => state.auth)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Loading...
    </div>
  )

  if (!user) return <Navigate to="/" />

  return children
}

export default ProtectedRoute