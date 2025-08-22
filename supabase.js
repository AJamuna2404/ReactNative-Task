import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = "https://vuluqxsntvwzptwxhark.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bHVxeHNudHZ3enB0d3hoYXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDc1ODQsImV4cCI6MjA3MTMyMzU4NH0.Lsb8PJTHhMhlchEklFya0k_9knjA8I8jWbOINn-kHcU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
