import { createClient } from '@supabase/supabase-js'

// INCOLLA QUI I TUOI VALORI PRESI DA SUPABASE
const supabaseUrl = 'https://yvnylopwosaoebhemtsd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnlsb3B3b3Nhb2ViaGVtdHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQzNzQsImV4cCI6MjA3NzM0MDM3NH0.nP2p-m91RttOml_NmntHe-LEbCVPyF9O9XCODvoV180'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)