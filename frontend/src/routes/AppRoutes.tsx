import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import StudentLayout from '../components/layout/StudentLayout';
import SupervisorLayout from '../components/layout/SupervisorLayout';

import StudentLogin from '../pages/auth/StudentLogin';
import SupervisorLogin from '../pages/auth/SupervisorLogin';
import StudentDashboard from '../pages/student/Dashboard';
import ReportWaste from '../pages/student/ReportWaste';
import MyReports from '../pages/student/MyReports';

import SupervisorDashboard from '../pages/supervisor/Dashboard';
import PendingRequests from '../pages/supervisor/PendingRequests';
import CompletedRequests from '../pages/supervisor/CompletedRequests';
import CompleteRequest from '../pages/supervisor/CompleteRequest';

import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Placeholder component for pages not yet built
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
      <span className="text-3xl">🚧</span>
    </div>
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    <p className="text-gray-400 text-sm mt-2">This page is coming soon. Stay tuned!</p>
  </div>
);

// Helper component to redirect authenticated users away from login pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'supervisor' ? '/supervisor/dashboard' : '/student/dashboard'} replace />;
  }
  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Navigate to="/student/login" />} />
        <Route path="/student/login" element={<PublicRoute><StudentLogin /></PublicRoute>} />
        <Route path="/supervisor/login" element={<PublicRoute><SupervisorLogin /></PublicRoute>} />
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRole="student" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="report-waste" element={<ReportWaste />} />
          <Route path="my-reports" element={<MyReports />} />
          {/* Placeholder pages */}
          <Route path="leaderboard" element={<ComingSoon title="Leaderboard" />} />
          <Route path="rewards" element={<ComingSoon title="Rewards" />} />
          <Route path="resources" element={<ComingSoon title="Resources" />} />
        </Route>
      </Route>

      {/* Supervisor Protected Routes */}
      <Route element={<ProtectedRoute allowedRole="supervisor" />}>
        <Route path="/supervisor" element={<SupervisorLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<SupervisorDashboard />} />
          <Route path="pending" element={<PendingRequests />} />
          <Route path="completed" element={<CompletedRequests />} />
          <Route path="complete/:id" element={<CompleteRequest />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
