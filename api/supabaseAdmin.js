// /js/admin/supabaseAdmin.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://wvebiyuoszwzsxavoitp.supabase.co'
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZWJpeXVvc3p3enN4YXZvaXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDAzMjksImV4cCI6MjA2NTY3NjMyOX0.l7SNxCXPfRsZ4uyTAmqpA00veBpZDbDAcy4oBBll5QI';
export const supabase = createClient(supabaseUrl, supabaseKey);