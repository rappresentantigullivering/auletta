import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css'; // Riutilizziamo lo stile del login

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Membro'); // Default
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Creiamo l'utente in Supabase Auth
      // Passiamo i dati extra (fullName, role) usando 'options.data'
      // Il nostro TRIGGER sul database intercetterà questo e creerà il profilo!
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (error) throw error;
      
      setSuccess(`Utente ${fullName} (${email}) creato con successo come ${role}!`);
      // Pulisci il form
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('Membro');

    } catch (error) {
      setError(error.message || "Errore nella creazione utente.");
      console.error("Errore registrazione:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ minHeight: 'auto', paddingTop: 0 }}>
      <div className="login-box">
        <h1 className="login-title">Crea Nuovo Utente</h1>
        
        <form className="login-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Mario Rossi"
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
              placeholder="m.rossi@studenti.it"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password Temporanea</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caratteri"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Ruolo</label>
            <select 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8em 1em',
                fontSize: '1em',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid #444',
                borderRadius: '8px',
                color: 'var(--text-primary)',
              }}
            >
              <option value="Membro">Membro</option>
              <option value="Amministratore">Amministratore</option>
            </select>
          </div>
          
          <button type="submit" className="primary login-button" disabled={loading}>
            {loading ? 'Creazione...' : 'Crea Utente'}
          </button>
        </form>

        {error && (
          <p className="error-message">{error}</p>
        )}
        {success && (
          <p className="error-message" style={{ color: 'var(--success-color)', borderColor: 'var(--success-color)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            {success}
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;