import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRole?: 'student' | 'supervisor';
}

export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Logged in but wrong role
    const targetPath = user.role === 'supervisor' ? '/supervisor/dashboard' : '/student/dashboard';
    
    // Prevent infinite loop if role is missing/corrupted
    if (window.location.pathname === targetPath) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white shadow rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Account Error</h2>
            <p className="text-gray-600 mb-6">Your account is missing a valid role. Please log out and try again.</p>
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-blue-600 text-white px-4 py-2 rounded">
              Log Out
            </button>
          </div>
        </div>
      );
    }
    
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
}
