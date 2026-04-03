// data.js
import { setSyncStatus } from './utils.js';

export const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); // عرّف الثوابت هنا

let currentUser = null;
export let S = { date: null, products: [], customers: [], suppliers: [], invoices: [], collections: [], expenses: [], tarhilLog: {}, employees: [], partners: [], shops: [] };

export function setCurrentUser(user) { currentUser = user; }
export function getCurrentUser() { return currentUser; }

export async function loadUserData() {
  if (!currentUser) return;
  try {
    const { data, error } = await supabase.from('shop_data').select('data').eq('user_id', currentUser.id).single();
    if (data && data.data) {
      const parsed = JSON.parse(data.data);
      S = { ...S, ...parsed };
      if (!S.employees) S.employees = [];
      if (!S.partners) S.partners = [];
      if (!S.shops) S.shops = [];
      if (!S.tarhilLog) S.tarhilLog = {};
    }
  } catch(e) {
    const local = localStorage.getItem('veg_local');
    if (local) S = JSON.parse(local);
  }
}

export async function saveData(syncBarEl, syncTextEl) {
  localStorage.setItem('veg_local', JSON.stringify(S));
  if (!currentUser) {
    setSyncStatus('', 'محفوظ محلياً', syncBarEl, syncTextEl);
    return;
  }
  setSyncStatus('saving', 'جاري الحفظ...', syncBarEl, syncTextEl);
  try {
    const { data: existing } = await supabase.from('shop_data').select('id').eq('user_id', currentUser.id).single();
    const payload = { user_id: currentUser.id, data: JSON.stringify(S), updated_at: new Date().toISOString() };
    if (existing) await supabase.from('shop_data').update(payload).eq('user_id', currentUser.id);
    else await supabase.from('shop_data').insert(payload);
    setSyncStatus('', 'محفوظ على السحابة ✓ ' + new Date().toLocaleTimeString('ar-EG'), syncBarEl, syncTextEl);
  } catch(e) {
    setSyncStatus('error', 'خطأ في الحفظ — محفوظ محلياً', syncBarEl, syncTextEl);
  }
}
