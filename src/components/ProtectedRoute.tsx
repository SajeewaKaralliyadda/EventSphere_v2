import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, Role } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Not logged in, redirect to landing page
    return <Navigate to="/" replace />;
  }

  if (user.status === "PENDING") {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in but insufficient permissions
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized, render child routes
  return <Outlet />;
}
