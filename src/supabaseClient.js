import { createClient } from '@supabase/supabase-js'

// هذا هو رابط مشروعك الصحيح الذي ظهر في الصور
const supabaseUrl = 'https://uxaiybradeismbfryceb.supabase.co'

// ⚠️ اذهب لصفحة API Keys في موقع Supabase وانسخ مفتاح "anon public" وضعه هنا
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4YWl5YnJhZGVpc21iZnJ5Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzA3NzgsImV4cCI6MjA4MDM0Njc3OH0.-72otgSjDS8LEWRXt_w5quUTZydlSFjnugkXX5kB46M'

export const supabase = createClient(supabaseUrl, supabaseKey)