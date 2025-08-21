// admin/callFn.js
import { supabase } from './supabaseClient.js';

const supabaseUrl = 'https://wvebiyuoszwzsxavoitp.supabase.co';

export async function callFn(path, payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${supabaseUrl}/functions/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error');
  return json;
}