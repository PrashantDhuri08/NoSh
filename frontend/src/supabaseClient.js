// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ztpkrolkyvgclbrijlzu.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cGtyb2xreXZnY2xicmlqbHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU5MDY3MiwiZXhwIjoyMDY4MTY2NjcyfQ.jj9hY5MV4-LODKRCQGu8brBdwG32owg29ZGa97kWTW4"
export const supabase = createClient(supabaseUrl, supabaseKey)
