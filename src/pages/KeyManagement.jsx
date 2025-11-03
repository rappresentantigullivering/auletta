// File: src/pages/KeyManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { FaKey } from 'react-icons/fa';
import './KeyManagement.css'; 

function KeyManagement() {
  const { refreshKeyHolders } = useAuth(); 
  
  const [keySlots, setKeySlots] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  // (Funzioni fetchKeySlots, fetchAllUsers, useEffect, handleOpenModal, handleCloseModal...
  // ...rimangono invariate)
  async function fetchKeySlots() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('key_slots')
        .select(`
          id,
          profiles (id, full_name, has_keys)
        `)
        .order('id', { ascending: true }); 

      if (error) throw error;
      setKeySlots(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  async function fetchAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name', { ascending: true });
      if (error) throw error;
      setAllUsers(data);
    } catch (err) {
      console.error("Errore nel caricare gli utenti:", err);
    }
  }
  useEffect(() => {
    fetchKeySlots();
    fetchAllUsers();
  }, []);
  const handleOpenModal = (slot) => {
    setSelectedSlotId(slot.id);
    setSelectedUserId(slot.profiles ? slot.profiles.id : ''); 
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlotId(null);
    setSelectedUserId('');
  };


  const handleSave = async () => {
    if (!selectedSlotId) return;

    const oldSlotData = keySlots.find(s => s.id === selectedSlotId);
    const oldUserId = oldSlotData.profiles ? oldSlotData.profiles.id : null;
    
    const newUserId = selectedUserId === '' ? null : selectedUserId; 

    try {
      // 1. Aggiorna la tabella 'key_slots'
      const { error: slotError } = await supabase
        .from('key_slots')
        .update({ user_id: newUserId })
        .eq('id', selectedSlotId);
      if (slotError) throw slotError;

      // 2. Aggiorna lo stato 'has_keys' del NUOVO utente (se c'è)
      if (newUserId) {
        const { error: rpcError } = await supabase.rpc('set_key_status', {
          user_id_to_update: newUserId,
          new_status: true
        });
        if (rpcError) throw rpcError;
      }
      
      // 3. Aggiorna lo stato 'has_keys' del VECCHIO utente (se c'era)
      if (oldUserId && oldUserId !== newUserId) {
         const { error: rpcError } = await supabase.rpc('set_key_status', {
          user_id_to_update: oldUserId,
          new_status: false
        });
        if (rpcError) throw rpcError;
      }

      // 4. Ricarica i dati e chiudi
      refreshKeyHolders(); // Aggiorna lo stato globale
      fetchKeySlots(); // Aggiorna lo stato locale
      handleCloseModal();

    } catch (err) {
      if (err.code === '23505') { 
        alert('Errore: Questo utente è già in un altro slot chiavi!');
      } else {
        // --- ECCO LA CORREZIONE ---
        alert('Errore: ' + err.message);
      }
    }
  };
  
  if (loading) return <div className="loading-spinner">Caricamento slot...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <div className="keys-container">
        <h1 className="keys-title">Gestione Chiavi Auletta</h1>
        <div className="slots-grid">
          {keySlots.map((slot) => (
            <div key={slot.id} className={`slot-card ${slot.profiles ? 'is-assigned' : ''}`}>
              <div>
                <div className="slot-header">
                  <span className="slot-title">Slot Chiave #{slot.id}</span>
                  {slot.profiles && <FaKey size={20} color="var(--primary-color)" />}
                </div>
                <div className={`slot-user ${slot.profiles ? '' : 'is-empty'}`}>
                  {slot.profiles ? slot.profiles.full_name : 'Slot Libero'}
                </div>
              </div>
              <button className="btn-edit" onClick={() => handleOpenModal(slot)}>
                Modifica Assegnazione
              </button>
            </div>
          ))}
        </div>

        {/* --- NUOVA SEZIONE REGOLE --- */}
        <div className="rules-container">
          <h2 className="rules-title">Regole Possessori Chiavi</h2>
          <ul className="rules-list">
            <li>Ricordarsi di aggiornare la tabella.</li>
            <li>Rispettare rigorosamente i turni, in caso di variazioni ricordarsi di aggiornare la tabella anche durante la settimana.</li>
            <li>Lɜ custodi (coloro che hanno le chiavi) devono aprire e chiudere l’auletta.</li>
            <li>Non lasciare l’auletta aperta se non custodita. In auletta sono presenti oggetti di valore e vanno tenuti al sicuro!</li>
            <li>Scrivere sul gruppo quando l'auletta viene aperta o chiusa.</li>
          </ul>
        </div>
      </div>

      {/* Modal per modificare (Invariato) */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assegna Slot #{selectedSlotId}</h3>
            </div>
            <div className="modal-body">
              <label htmlFor="user-select">Assegna a:</label>
              <select
                id="user-select"
                className="modal-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Nessuno (Slot Libero) --</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn-secondary">
                Annulla
              </button>
              <button onClick={handleSave} className="btn-primary">
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default KeyManagement;