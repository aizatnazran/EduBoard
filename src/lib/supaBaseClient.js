import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://kqbgvkiwwqacwnimhrvf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYmd2a2l3d3FhY3duaW1ocnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI0NTAxNDksImV4cCI6MjAxODAyNjE0OX0.pGFgwetTKWlhVArc5A_ThnshMqW9iiosF38Y9ev0RW4')