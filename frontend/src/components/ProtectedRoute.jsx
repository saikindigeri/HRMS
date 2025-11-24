// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // If no token → kick to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Validate token expiry (bonus security)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  // Token valid → show page
  return children;
}