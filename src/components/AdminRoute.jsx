// File: src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Questo componente protegge le rotte SOLO per gli Amministratori
function AdminRoute({ children }) {
  // Usiamo 'profile' e 'loading' dal tuo AuthContext
  const { profile, loading } = useAuth();

  if (loading) {
    // Aspettiamo che AuthContext.jsx finisca
    return <div className="loading-spinner">Verifica permessi...</div>;
  }

  // Se non c'è profilo, o se il ruolo NON è 'Amministratore'
  if (!profile || profile.role !== 'Amministratore') {
    // Rimandalo alla homepage (il Calendario)
    return <Navigate to="/" replace />; 
  }

  // Se è un Admin, mostra la pagina (es. <AdminUsers />)
  return children;
}

export default AdminRoute;