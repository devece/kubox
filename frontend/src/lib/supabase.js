import { createClient } from '@supabase/supabase-js'

// URL completa con la clave
const supabaseUrl = 'https://woughxczlbjiivfntuog.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycGJ5eHZpZHFhdnJucW1oamhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDMzMzgsImV4cCI6MjA5NTMxOTMzOH0.2snzkauyPL6dnSEisps9JYMPwtnY5pZjEOJvpwh1Y1k'

// Configuración adicional para evitar CORS
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
})