// File: src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KeyManagement from './pages/KeyManagement';
import AdminUsers from './pages/AdminUsers';
import AulettaCare from './pages/AulettaCare';

// Importiamo ENTRAMBI i componenti di protezione corretti
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Header from './components/Header';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { session } = useAuth(); //

  return (
    <>
      {session && <Header />} {/* */}
      
      <Routes>
        <Route path="/login" element={<Login />} /> {/* */}

        {/* --- PAGINE PROTETTE (Tutti i membri) --- */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute> {/* Ora funziona! */}
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/keys" 
          element={
            <ProtectedRoute> {/* Ora funziona! */}
              <KeyManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/auletta-care" 
          element={
           <ProtectedRoute>
             <AulettaCare />
           </ProtectedRoute>
          } 
        />
        
        {/* --- PAGINA PROTETTA (Solo Admin) --- */}
        <Route 
          path="/admin-users" 
          element={
            <AdminRoute> {/* Ora funziona! */}
              <AdminUsers />
            </AdminRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={session ? <Dashboard /> : <Login />} /> {/* */}
      </Routes>
    </>
  );
}

export default App;