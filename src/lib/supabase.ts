import { createClient } from '@supabase/supabase-js'

// Replace these with your Supabase project URL and anon key
export const supabase = createClient(
  'https://owrsfcytxpqlfgsdagro.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cnNmY3l0eHBxbGZnc2RhZ3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MDMyMzUsImV4cCI6MjA1MTk3OTIzNX0.9zgLVQ7JXHs75ORonc6CUTVg3Pg7pERdPUjmfoALGPA'
)