import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://rdqefbexbjulbrfbylxv.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcWVmYmV4Ymp1bGJyZmJ5bHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODYxNzcsImV4cCI6MjA2MjY2MjE3N30.QNSaLLS7xRmhMi2DCcN_t5H0ZZZr_oL9zguZRQcjUCU'; // ← remplace

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});


