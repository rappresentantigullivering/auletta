// File: src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  // --- NUOVO STATE ---
  // Questo conterrà un array di ID utente, es: ['uuid1', 'uuid2']
  const [keyHolders, setKeyHolders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NUOVA FUNZIONE ---
  // Carica la lista di TUTTI gli utenti con has_keys = true
  const fetchKeyHolders = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id') // Seleziona solo gli ID
        .eq('has_keys', true);
      
      if (error) throw error;
      
      // Trasforma [ {id: 'uuid1'}, {id: 'uuid2'} ] in [ 'uuid1', 'uuid2' ]
      const holderIds = data.map(holder => holder.id);
      setKeyHolders(holderIds);

    } catch (error) {
      console.error("Errore nel caricare i possessori delle chiavi:", error);
    }
  };

  useEffect(() => {
    // 1. Controlla la sessione
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        getProfile(session.user);
        fetchKeyHolders(); // Carica anche la lista chiavi
      } else {
        setLoading(false);
      }
    });

    // 2. Ascolta i cambiamenti di stato
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          getProfile(session.user);
          fetchKeyHolders(); // Ricarica la lista chiavi
        } else {
          setProfile(null);
          setKeyHolders([]); // Svuota la lista al logout
          setLoading(false);
        }
      }
    );
    
    // --- NUOVO LISTENER ---
    // 3. Ascolta in REALTIME i cambiamenti sulla tabella profili!
    // Se qualcuno cambia lo stato 'has_keys', aggiorniamo la lista.
    const profileListener = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Cambiamento profili, ricarico lista chiavi:', payload);
          fetchKeyHolders(); // Ricarica la lista
        }
      )
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(profileListener); // Pulisce il nuovo listener
    };
  }, []);

  const getProfile = async (user) => {
    try {
      setLoading(true);
      let { data, error, status } = await supabase
        .from('profiles')
        .select(`role, full_name, has_keys`) // --- AGGIUNTO 'has_keys' ---
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        console.error(error);
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Errore nel caricamento del profilo:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user: session?.user,
    profile,
    loading,
    signOut: () => supabase.auth.signOut(),
    // --- ESPONIAMO I DATI NUOVI ---
    keyHolders, // La lista [ 'uuid1', 'uuid2' ]
    refreshKeyHolders: fetchKeyHolders // Funzione per forzare l'aggiornamento
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}