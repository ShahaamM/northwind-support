import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('authToken');

  // If there is no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the child routes/components
  return <Outlet />;
};
