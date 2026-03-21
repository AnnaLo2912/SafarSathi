import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ 
  children, 
  allowedRole 
}) {
  const { currentUser, userRole, userProfile, loading } = useAuth()

  // Still fetching auth state — show nothing
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="font-playfair text-4xl text-charcoal mb-4 animate-pulse">
            SafarSathi
          </div>
          <div className="font-garamond text-sm text-charcoal/50 uppercase tracking-widest">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  // Not logged in — send to login
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Logged in but no role/profile document — complete onboarding first
  if (!userRole) {
    return <Navigate to="/signup" replace />
  }

  if (userProfile?.isDeactivated) {
    return <Navigate to="/login?deactivated=1" replace />
  }

  // Logged in but wrong role — redirect to their correct dashboard
  if (allowedRole && userRole !== allowedRole) {
    if (userRole === 'guide') {
      return <Navigate to="/guide-dashboard" replace />
    } else {
      return <Navigate to="/tourist-dashboard" replace />
    }
  }

  // All good — render the page
  return children
}
