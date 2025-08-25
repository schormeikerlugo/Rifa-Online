// public/js/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

const SUPABASE_URL = 'https://wvebiyuoszwzsxavoitp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2ZWJpeXVvc3p3enN4YXZvaXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDAzMjksImV4cCI6MjA2NTY3NjMyOX0.l7SNxCXPfRsZ4uyTAmqpA00veBpZDbDAcy4oBBll5QI';

export const client = createClient(SUPABASE_URL, SUPABASE_KEY);