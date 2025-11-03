// File: src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// --- MODIFICA ---
// Ora accetta 'children' (cioè il componente <Dashboard /> o <KeyManagement />)
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth(); //

  if (loading) {
    // Aspettiamo che AuthContext.jsx finisca
    return <div className="loading-spinner">Caricamento...</div>;
  }

  if (!session) {
    // Utente non loggato, reindirizza al Login
    return <Navigate to="/login" replace />;
  }

  // --- CORREZIONE ---
  // Utente loggato, mostra i "figli" (es. <Dashboard />)
  return children; 
}

export default ProtectedRoute;