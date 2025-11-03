// File: src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { 
  startOfWeek, addDays, format, setHours, 
  setMinutes, setSeconds, isEqual, 
} from 'date-fns';
import { it } from 'date-fns/locale';
import { BsPeopleFill } from 'react-icons/bs'; 
// --- 1. AGGIUNTO IMPORT CHIAVE ---
import { FaKey } from 'react-icons/fa'; 
import './Dashboard.css';

function Dashboard() {
  // --- 2. AGGIUNTO 'keyHolders' ---
  const { user, profile, keyHolders } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // 1. DEFINIAMO LA SETTIMANA E GLI SLOT (Invariato)
  const { weekDays, timeSlots } = useMemo(() => {
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { locale: it });
    const days = [];
    for (let i = 0; i < 5; i++) { days.push(addDays(startOfThisWeek, i)); }
    const slots = [];
    for (let hour = 8; hour < 18; hour++) { slots.push(`${String(hour).padStart(2, '0')}:30`); }
    return { weekDays: days, timeSlots: slots };
  }, []); //

  // 3. FUNZIONE PER CARICARE LE PRENOTAZIONI (Invariato)
  async function fetchBookings() {
    setLoading(true);
    setError(null);
    const startDay = weekDays[0];
    const endDay = addDays(weekDays[weekDays.length - 1], 1);
    try {
      const { data, error } = await supabase.from('bookings').select('*').gte('slot_start', startDay.toISOString()).lt('slot_start', endDay.toISOString());
      if (error) throw error;
      setBookings(data);
    } catch (error) { 
      console.error('Errore nel caricare le prenotazioni:', error); 
      setError('Impossibile caricare il calendario. Riprova più tardi.');
    } finally { 
      setLoading(false); 
    }
  } //

  // 4. CARICA I DATI (Invariato)
  useEffect(() => {
    fetchBookings();
  }, [weekDays]); //

  // 5. FUNZIONE DI SUPPORTO (Invariato)
  const getSlotInfo = (day, time) => {
    const [hour, minute] = time.split(':');
    const slotDateTime = setSeconds(setMinutes(setHours(day, hour), minute), 0);
    const bookingsForSlot = bookings.filter(b => isEqual(new Date(b.slot_start), slotDateTime));
    const isBookedByMe = bookingsForSlot.some(b => b.user_id === user.id);
    return {
      bookingsForSlot: bookingsForSlot,
      count: bookingsForSlot.length,
      isBookedByMe: isBookedByMe,
      day: day,
      time: time,
      slotDateTime: slotDateTime
    };
  }; //

  // 6. FUNZIONE ON CLICK (Invariato)
  const handleSlotClick = (day, time) => {
    const info = getSlotInfo(day, time);
    setSelectedSlot(info); 
    setIsModalOpen(true);  
  }; //

  // 7. FUNZIONI PER IL MODAL (Invariato)
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  }; //

  const handleModalBook = async () => {
    if (!selectedSlot || !profile) return;
    const { slotDateTime } = selectedSlot;
    const userName = profile.full_name || user.email;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          slot_start: slotDateTime.toISOString(),
          user_id: user.id,
          user_full_name: userName,
        })
        .select()
        .single();
      if (error) throw error;
      setBookings([...bookings, data]); 
      handleModalClose(); 
    } catch (error) {
      console.error('Errore prenotazione:', error);
      alert('Impossibile prenotare lo slot.');
    }
  }; //

  const handleModalUnbook = async () => {
    if (!selectedSlot || !user) return;
    const myBooking = selectedSlot.bookingsForSlot.find(b => b.user_id === user.id);
    if (!myBooking) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .match({ id: myBooking.id });
      if (error) throw error;
      setBookings(bookings.filter(b => b.id !== myBooking.id)); 
      handleModalClose(); 
    } catch (error) {
      console.error('Errore cancellazione:', error);
      alert('Impossibile cancellare la prenotazione.');
    }
  }; //


  // 8. RENDER DEL COMPONENTE
  if (loading) {
    return <div className="loading-spinner">Caricamento calendario...</div>;
  }
  
  return (
    <div className="dashboard-container">
      {/* Titolo modificato per pulizia */}
      <h1 className="dashboard-title">Calendario (e regole) Auletta</h1>
      <p className="dashboard-subtitle">
        Settimana: {format(weekDays[0], 'd MMM', { locale: it })} - {format(weekDays[4], 'd MMM yyyy', { locale: it })}
      </p>
      <div className="calendar-grid-wrapper">
        <div className="calendar-grid">
          {/* ... (Codice griglia invariato) ... */}
          <div className="grid-cell header-time">Orario</div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="grid-cell header-day">
              <div>{format(day, 'EEE', { locale: it })}</div>
              <div className="day-number">{format(day, 'd', { locale: it })}</div>
            </div>
          ))}

          {timeSlots.map(time => (
            <React.Fragment key={time}>
              <div className="grid-cell time-label">{time}</div>
              {weekDays.map(day => {
                const info = getSlotInfo(day, time); 
                let cellClass = 'grid-cell slot';
                if (info.count > 0) { cellClass += ' booked'; }
                if (info.isBookedByMe) { cellClass += ' mine'; }

                return (
                  <button
                    key={day.toISOString()}
                    className={cellClass}
                    onClick={() => handleSlotClick(day, time)} 
                  >
                    {info.count > 0 ? (
                      <span className="booking-count">
                        <BsPeopleFill /> {info.count}
                      </span>
                    ) : (
                      <span className="plus-icon">+</span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* --- FINE CALENDARIO --- */}


      {/* SEZIONE REGOLE (Invariata) */}
      <div className="rules-container">
        <h2 className="rules-title">Regole Auletta</h2>
        <ul className="rules-list">
          <li>I rifiuti prodotti vanno buttati immediatamente</li>
          <li>Il caffè si paga prima di farlo</li>
          <li>Si possono far entrare le persone a mangiare</li>
          <li>Non fare caciara</li>
          <li>Tuttɜ possono entrare a patto che venga rispettato un comportamento consono al luogo</li>
          <li>Non si può fumare (sigarette e iqos) dentro l'auletta</li>
          <li>Evitare di lasciare scritte goliardiche sulle lavagne. Esse vengono usate per questioni più importanti ed è necessario mantenere ordine</li>
          <li>Mantenere quanto possibile ordine all'interno dell'auletta</li>
          <li>Orari Biliardino: 13:15-14:45 & 18:30 (se possibile)</li>
        </ul>
      </div> 
      {/* */}

      
      {/* MODAL */}
      {isModalOpen && selectedSlot && (
        <div className="modal-backdrop" onClick={handleModalClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Slot: {format(selectedSlot.day, 'eeee d MMM', { locale: it })}
              </h3>
              <span className="modal-time">{selectedSlot.time}</span>
            </div>
            
            <div className="modal-body">
              <h4 className="participants-title">Partecipanti:</h4>
              {selectedSlot.count === 0 ? (
                <p className="no-participants">Questo slot è libero.</p>
              ) : (
                <ul className="participants-list">
                  {/* --- 3. MODIFICA LOGICA MODAL --- */}
                  {selectedSlot.bookingsForSlot.map(b => {
                    // Controlla se l'ID di questo utente è nella lista globale
                    const userHasKeys = keyHolders && keyHolders.includes(b.user_id);

                    return (
                      <li key={b.id} className={b.user_id === user.id ? 'is-me' : ''}>
                        {b.user_full_name}
                        {b.user_id === user.id && " (Tu)"}
                        
                        {/* Se ha le chiavi, mostra l'icona */}
                        {userHasKeys && (
                          <FaKey 
                            size={16} 
                            color="var(--primary-color)" 
                            style={{ marginLeft: '8px', verticalAlign: 'middle' }}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleModalClose} className="btn-secondary">
                Chiudi
              </button>
              {selectedSlot.isBookedByMe ? (
                <button onClick={handleModalUnbook} className="btn-danger">
                  Rimuoviti
                </button>
              ) : (
                <button onClick={handleModalBook} className="btn-primary">
                  Aggiungiti
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default Dashboard;