import { createClient } from '@supabase/supabase-js'

// INCOLLA QUI I TUOI VALORI PRESI DA SUPABASE
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Le variabili SUPABASE_URL e SUPABASE_ANON_KEY non sono definite. Controlla il tuo file .env.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)