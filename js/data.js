// data.js
import { setSyncStatus } from './utils.js';

const SUPABASE_URL = 'https://lfhrorjiukzkqhafjtdd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaHJvcmppdWt6a3FoYWZqdGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTc3NTgsImV4cCI6MjA5MDM3Mzc1OH0.eQ0w4DG_-DNvnJRJxgvJ7KhNNkBhOEswQhtbiO2my3Q';

export const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
export let S = { 
  date: null, 
  products: [], 
  customers: [], 
  suppliers: [], 
  invoices: [], 
  collections: [], 
  expenses: [], 
  tarhilLog: {}, 
  employees: [], 
  partners: [], 
  shops: [] 
};

export function setCurrentUser(user) { currentUser = user; }
export function getCurrentUser() { return currentUser; }
export function getGlobalState() { return S; }
export function setGlobalState(newState) { S = newState; }

export async function loadUserData() {
  if (!currentUser) return;
  const syncBar = document.getElementById('sync-bar');
  const syncText = document.getElementById('sync-text');
  setSyncStatus('saving', 'جاري التحميل من السحابة...', syncBar, syncText);
  try {
    const { data } = await sb.from('shop_data').select('data').eq('user_id', currentUser.id).maybeSingle();
    if (data && data.data) {
      const parsed = JSON.parse(data.data);
      S = parsed;
      if (!S.employees) S.employees = [];
      if (!S.partners) S.partners = [];
      if (!S.shops) S.shops = [];
      if (!S.tarhilLog) S.tarhilLog = {};
      if (!S.collections) S.collections = [];
      if (!S.expenses) S.expenses = [];
      localStorage.setItem('veg_local', JSON.stringify(S));
      setSyncStatus('', 'محفوظ على السحابة ✓', syncBar, syncText);
    } else {
      const localData = localStorage.getItem('veg_local');
      if (localData) {
        S = JSON.parse(localData);
        await saveData();
        setSyncStatus('', 'تم رفع البيانات المحلية إلى السحابة', syncBar, syncText);
      }
    }
  } catch(e) {
    setSyncStatus('error', 'خطأ في الاتصال', syncBar, syncText);
  }
}

export async function saveData() {
  localStorage.setItem('veg_local', JSON.stringify(S));
  if (!currentUser) {
    const syncBar = document.getElementById('sync-bar');
    const syncText = document.getElementById('sync-text');
    setSyncStatus('', 'محفوظ محلياً', syncBar, syncText);
    return;
  }
  const syncBar = document.getElementById('sync-bar');
  const syncText = document.getElementById('sync-text');
  setSyncStatus('saving', 'جاري الحفظ...', syncBar, syncText);
  try {
    const { data: existing } = await sb.from('shop_data').select('id').eq('user_id', currentUser.id).maybeSingle();
    const payload = { user_id: currentUser.id, data: JSON.stringify(S), updated_at: new Date().toISOString() };
    if (existing) {
      await sb.from('shop_data').update(payload).eq('user_id', currentUser.id);
    } else {
      await sb.from('shop_data').insert(payload);
    }
    setSyncStatus('', 'محفوظ على السحابة ✓', syncBar, syncText);
  } catch(e) {
    setSyncStatus('error', 'خطأ في الحفظ — محفوظ محلياً', syncBar, syncText);
  }
}
