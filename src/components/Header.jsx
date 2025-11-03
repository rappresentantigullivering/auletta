// File: src/components/Header.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Rimossi import di supabase e date-fns
import './Header.css';

function Header() {
  // Rimosso 'user' da useAuth
  const { profile, signOut } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // --- FUNZIONE 'handlePresenceClick' RIMOSSA ---

  return (
    <header className="app-header">
      <div className="header-content">
        <NavLink to="/" className="header-logo">
          AulettApp
        </NavLink>
        
        <nav className="header-nav">
          {/* Aggiunto 'end' per un routing corretto */}
          <NavLink to="/" end>Calendario</NavLink>
          <NavLink to="/keys">Chiavi</NavLink>
          <NavLink to="/auletta-care">AulettaCare</NavLink>
          
          {profile && profile.role === 'Amministratore' && (
            <NavLink to="/admin-users" className="admin-link">Gestisci Utenti</NavLink>
          )}
        </nav>

        <div className="header-actions">
          {/* --- BOTTONE "Presente!" RIMOSSO --- */}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

      </div>
    </header>
  );
}

export default Header;