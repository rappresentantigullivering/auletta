import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Login.css';

// Importa il logo SVG
import GulliverLogo from '../assets/gulliver-logo.svg'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      navigate('/');

    } catch (error) {
      setError(error.message || "Email o password non validi.");
      console.error("Errore login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Aggiungiamo il logo qui */}
        <div className="login-logo-wrapper">
          <img src={GulliverLogo} alt="Gulliver Sinistra Universitaria Logo" className="gulliver-logo" />
        </div>
        

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mario.rossi@studenti.it"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="primary login-button" disabled={loading}>
           {loading ? 'Aspe...' : 'Entra in auletta'}
          </button>
        </form>

        {error && (
          <p className="error-message">{error}</p>
        )}
      </div>
    </div>
  );
}

export default Login;