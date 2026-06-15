import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wvhsfaapnbzmhsqgmaid.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aHNmYWFwbmJ6bWhzcWdtYWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDQ0OTQsImV4cCI6MjA5NzEyMDQ5NH0.2dgcQXJkZntZBSZZsZ8EEBza1baw3j6cEy1W2XYN7VQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)