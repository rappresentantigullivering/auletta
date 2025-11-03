// File: src/pages/AulettaCare.jsx

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import "./AulettaCare.css";

// --- SEZIONE 1: SEGNALAZIONI (Invariata) ---

function ReportsSection({ user, profile }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  async function fetchReports() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select(`
        id,
        created_at,
        subject,
        content,
        is_resolved,
        user_id,
        profiles(full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) console.error("Errore caricamento segnalazioni:", error);
    else setReports(data);
    setLoading(false);
  }

  async function handleAddReport(e) {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      alert("Compila tutti i campi prima di inviare.");
      return;
    }
    const { error } = await supabase.from("reports").insert([
      {
        user_id: user.id,
        subject,
        content,
        is_resolved: false,
      },
    ]);
    if (error) alert("Errore nell'invio della segnalazione: " + error.message);
    else {
      setSubject("");
      setContent("");
      fetchReports();
    }
  }

  async function toggleResolved(reportId, currentState) {
    const { error } = await supabase
      .from("reports")
      .update({ is_resolved: !currentState })
      .eq("id", reportId);
    if (error) alert("Errore aggiornamento stato: " + error.message);
    else {
      fetchReports();
      setSelectedReport(null);
    }
  }

  async function handleDeleteReport(reportId) {
    if (!window.confirm("Sei sicuro di voler eliminare questa segnalazione?")) return;
    const { error } = await supabase.from("reports").delete().eq("id", reportId);
    if (error) alert("Errore durante l'eliminazione: " + error.message);
    else {
      fetchReports();
      setSelectedReport(null);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <p className="loading-state">Caricamento segnalazioni...</p>;

  return (
    <section className="reports-section">
      <h2 className="reports-title">
        {/* 🚨 Icona sirena di avviso */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "8px", verticalAlign: "middle" }}
        >
          <path d="M12 2v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M17.66 6.34l1.41-1.41" />
          <path d="M6 22h12" />
          <path d="M6 18h12l-1-8a6 6 0 0 0-10 0Z" />
        </svg>
        Segnalazioni
      </h2>

      <p className="section-description">
        Qui puoi segnalare problemi o malfunzionamenti dell'auletta.
      </p>

      {/* Form nuova segnalazione */}
      <form className="add-form" onSubmit={handleAddReport}>
        <input
          type="text"
          placeholder="Oggetto della segnalazione"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          placeholder="Descrizione dettagliata..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit" className="btn-secondary">
          Invia Segnalazione
        </button>
      </form>

      {/* Lista segnalazioni */}
      <div className="report-list">
        {reports.length === 0 ? (
          <p className="empty-state">Nessuna segnalazione al momento</p>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className={`report-item ${r.is_resolved ? "resolved" : ""}`}
              onClick={() => setSelectedReport(r)}
            >
              <div className="report-header">
                <span className="report-subject">{r.subject}</span>
                <span className="report-meta">
                  da {r.profiles?.full_name || "Utente sconosciuto"} il{" "}
                  {format(new Date(r.created_at), "dd/MM/yy", { locale: it })}
                </span>
              </div>
              <div className="report-status">
                <span
                  className="status-dot"
                  style={{
                    backgroundColor: r.is_resolved ? "#4caf50" : "#f44336",
                  }}
                ></span>
                {r.is_resolved ? "Risolta" : "Non risolta"}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modale Dettaglio */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedReport.subject}</h3>
            <p className="modal-meta">
              Segnalato da <b>{selectedReport.profiles?.full_name}</b> il{" "}
              {format(new Date(selectedReport.created_at), "PPP", { locale: it })}
            </p>
            <div className="modal-body">
              <p>{selectedReport.content}</p>
            </div>

            {(profile.role === "Amministratore" ||
              selectedReport.user_id === user.id) && (
              <>
                <button
                  type="button"
                  className={`btn-toggle-resolve ${
                    selectedReport.is_resolved ? "btn-unresolve" : "btn-resolve"
                  }`}
                  onClick={() =>
                    toggleResolved(selectedReport.id, selectedReport.is_resolved)
                  }
                >
                  {selectedReport.is_resolved
                    ? "Riapri Segnalazione"
                    : "Segna come Risolta"}
                </button>

                {selectedReport.user_id === user.id && (
                  <button
                    type="button"
                    className="btn-delete-full"
                    onClick={() => handleDeleteReport(selectedReport.id)}
                  >
                    {/* 🗑️ Icona cestino */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        marginRight: "6px",
                        verticalAlign: "middle",
                        marginBottom: "2px",
                      }}
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    Elimina Segnalazione
                  </button>
                )}
              </>
            )}

            <button
              className="btn-close-modal"
              onClick={() => setSelectedReport(null)}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </section>
  );
}


// --- SEZIONE 2: LISTA DELLA SPESA (Codice Aggiornato) ---

function ShoppingListSection({ user, profile }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");

  // fetchItems ora viene chiamato SOLO al caricamento iniziale
  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("shopping_list")
      .select(`
        id,
        created_at,
        name,
        is_purchased,
        user_id,
        profiles(full_name)
      `)
      .order("is_purchased", { ascending: true }) // Prima quelle da comprare
      .order("created_at", { ascending: true });

    if (error) console.error("Errore caricamento lista spesa:", error);
    else setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  // --- FUNZIONE AGGIUNTA (MODIFICATA) ---
  async function handleAddItem(e) {
    e.preventDefault();
    const nameToAdd = newItemName.trim();
    if (!nameToAdd) return;

    // Svuotiamo l'input per reattività
    setNewItemName("");

    // 1. Inserisci E richiedi i dati inseriti (con il join)
    const { data: insertedItem, error: insertError } = await supabase
      .from("shopping_list")
      .insert([
        { name: nameToAdd, user_id: user.id, is_purchased: false },
      ])
      .select(`
        id,
        created_at,
        name,
        is_purchased,
        user_id,
        profiles(full_name)
      `)
      .single(); // Ci aspettiamo un singolo oggetto

    if (insertError) {
      alert("Errore nell'aggiunta dell'articolo: " + insertError.message);
      // Se fallisce, rimettiamo il testo nell'input
      setNewItemName(nameToAdd);
      return;
    }

    if (insertedItem) {
      // 2. Aggiorna lo stato locale (invece di chiamare fetchItems)
      // Aggiungiamo il nuovo item in fondo alla lista dei "non comprati"
      // per rispettare l'ordinamento (created_at ASC)
      setItems(currentItems => {
        const nonPurchased = currentItems.filter(item => !item.is_purchased);
        const purchased = currentItems.filter(item => item.is_purchased);
        return [...nonPurchased, insertedItem, ...purchased];
      });
    }
  }

  // --- FUNZIONE SPUNTA (MODIFICATA) ---
  async function togglePurchased(id, currentState) {
    // 1. Aggiorna il DB e richiedi i dati aggiornati
    const { data: updatedItem, error } = await supabase
      .from("shopping_list")
      .update({ is_purchased: !currentState })
      .eq("id", id)
      .select(`
        id,
        created_at,
        name,
        is_purchased,
        user_id,
        profiles(full_name)
      `)
      .single();

    if (error) {
      alert("Errore aggiornamento stato: " + error.message);
      return;
    }

    if (updatedItem) {
      // 2. Aggiorna lo stato locale e riordina
      setItems(currentItems => {
        // Rimuoviamo il vecchio item
        const otherItems = currentItems.filter(item => item.id !== id);
        // Aggiungiamo quello aggiornato
        const newItems = [...otherItems, updatedItem];
        
        // Riordiniamo come fa fetchItems
        return newItems.sort((a, b) => {
          // Ordina per is_purchased (false prima)
          if (a.is_purchased !== b.is_purchased) {
            return a.is_purchased ? 1 : -1;
          }
          // Se uguali, ordina per data (vecchi prima)
          return new Date(a.created_at) - new Date(b.created_at);
        });
      });
    }
  }

  // --- FUNZIONE ELIMINA (MODIFICATA) ---
  async function handleDeleteItem(id) {
    if (!window.confirm("Sei sicuro di voler eliminare questo articolo?")) return;
    
    // 1. Elimina dal DB
    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Errore durante l'eliminazione: " + error.message);
    } else {
      // 2. Aggiorna lo stato locale (rimuovendo l'item)
      setItems(currentItems => currentItems.filter(item => item.id !== id));
    }
  }


  if (loading) return <p className="loading-state">Caricamento lista spesa...</p>;

  return (
    <section className="shopping-list-section">
      <h2 className="shopping-list-title">
        {/* 🛒 Icona Carrello SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "8px", verticalAlign: "middle" }}
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        Lista della Spesa
      </h2>

      <p className="section-description">
        Aggiungi qui gli articoli che mancano in auletta (caffè, carta, etc.).
      </p>

      {/* Form aggiunta articolo */}
      <form className="add-form" onSubmit={handleAddItem}>
        <input
          type="text"
          placeholder="Nome articolo (es. CFU)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <button type="submit" className="btn-secondary">
          Aggiungi Articolo
        </button>
      </form>

      {/* Lista articoli */}
      <ul className="shopping-list">
        {items.length === 0 ? (
          <p className="empty-state">La lista della spesa è vuota</p>
        ) : (
          items.map((item) => (
            <li key={item.id} className={item.is_purchased ? "purchased" : ""}>
              <div className="item-info">
                {/* Pulsante per segnare come "comprato" */}
                <button
                  className="toggle-btn"
                  onClick={() => togglePurchased(item.id, item.is_purchased)}
                >
                  {item.is_purchased ? (
                    // Icona "Check" (comprato)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    // Icona "Cerchio" (da comprare)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </button>
                <span className="item-name">{item.name}</span>
              </div>
              <div className="item-controls">
                <span className="item-meta">
                  Aggiunto da {item.profiles?.full_name || "N/D"}
                </span>
                
                {/* Mostra il cestino solo se l'utente è Admin o è il creatore */}
                {(profile.role === "Amministratore" || item.user_id === user.id) && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    {/* Icona "Cestino" SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}


// --- COMPONENTE PRINCIPALE (Invariato) ---

function AulettaCare() {
  const { user, profile } = useAuth();

  if (!user || !profile)
    return <p className="loading-state">Caricamento profilo...</p>;

  return (
    <div className="auletta-care-container">
      <h1 className="auletta-care-title">Cura dell'Auletta</h1>
      <div className="sections-wrapper">
        
        {/* Sezione 1: Segnalazioni (già presente) */}
        <div className="section-container">
          <ReportsSection user={user} profile={profile} />
        </div>

        {/* Sezione 2: Lista Spesa */}
        <div className="section-container">
          <ShoppingListSection user={user} profile={profile} />
        </div>
        
      </div>
    </div>
  );
}

export default AulettaCare;