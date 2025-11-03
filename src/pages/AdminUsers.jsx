// File: src/pages/AdminUsers.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; 
import './AdminUsers.css'; 

function AdminUsers() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Membro'); 
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La password deve essere di almeno 6 caratteri.' });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('create_new_user', {
        p_email: email,
        p_password: password,
        p_full_name: fullName,
        p_role: role,
      });

      if (error) {
        throw error;
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessage({ type: 'success', text: data.message });
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('Membro');

    } catch (error) {
      setMessage({ type: 'error', text: `Errore dal database: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-users-container">
      <h1 className="admin-users-title">Gestisci Utenti</h1>
      
      {/* --- NUOVO POSIZIONAMENTO: SOPRA IL FORM --- */}
      <div className="admin-warning">
        <h3 className="warning-title">⚠️ Attenzione ⚠️</h3>
        <p>
          Solo i tesserati possono essere salvati come Amministratori,
          <br />
          chi frequenta l'auletta e basta può essere aggiunto come Membro.
        </p>
      </div>
      {/* --- FINE BLOCCO AVVERTIMENTO --- */}

      <form onSubmit={handleSubmit} className="admin-form">
        <h2 className="form-title">Crea Nuovo Utente</h2>
        <p>Crea un nuovo account per un membro dell'associazione.</p>

        <div className="form-group">
          <label htmlFor="full_name">Nome e Cognome</label>
          <input
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password (min. 6 caratteri)</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Ruolo</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Membro">Membro</option>
            <option value="Amministratore">Amministratore</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creazione in corso...' : 'Crea Utente'}
        </button>

        {message.text && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}

export default AdminUsers;