import { sb } from './supabase.js';
import { setSyncStatus, fmtDate } from './utils.js';

export let S = {
    date: fmtDate(new Date()),
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

export let currentUser = null;
export let xProd = null;
let saveTimer = null;

export function setCurrentUser(user) { currentUser = user; }
export function setXProd(val) { xProd = val; }

export async function saveData() {
    localStorage.setItem('veg_local', JSON.stringify(S));
    if (!currentUser) {
        setSyncStatus('', 'محفوظ محلياً');
        return;
    }
    setSyncStatus('saving', 'جاري الحفظ...');
    try {
        const { data: existing } = await sb.from('shop_data').select('id').eq('user_id', currentUser.id).maybeSingle();
        const payload = { user_id: currentUser.id, data: JSON.stringify(S), updated_at: new Date().toISOString() };
        if (existing) await sb.from('shop_data').update(payload).eq('user_id', currentUser.id);
        else await sb.from('shop_data').insert(payload);
        setSyncStatus('', 'محفوظ على السحابة ✓');
    } catch (e) { setSyncStatus('error', 'خطأ في الحفظ — محفوظ محلياً'); }
}

export function save() { clearTimeout(saveTimer); saveTimer = setTimeout(saveData, 1500); }

export async function loadUserData() {
    const localData = localStorage.getItem('veg_local');
    if (localData) {
        try {
            let parsed = JSON.parse(localData);
            S = parsed;
            if (!S.employees) S.employees = [];
            if (!S.partners) S.partners = [];
            if (!S.shops) S.shops = [];
            if (!S.tarhilLog) S.tarhilLog = {};
            if (!S.collections) S.collections = [];
            if (!S.expenses) S.expenses = [];
            if (!S.date) S.date = fmtDate(new Date());
        } catch (e) { console.error(e); }
    }
    if (!currentUser) return;
    setSyncStatus('saving', 'جاري التحميل من السحابة...');
    try {
        const { data } = await sb.from('shop_data').select('data').eq('user_id', currentUser.id).maybeSingle();
        if (data && data.data) {
            S = JSON.parse(data.data);
            localStorage.setItem('veg_local', JSON.stringify(S));
            setSyncStatus('', 'محفوظ على السحابة ✓');
        } else if (localData) {
            await saveData();
            setSyncStatus('', 'تم رفع البيانات المحلية إلى السحابة');
        }
    } catch (e) { setSyncStatus('error', 'خطأ في الاتصال'); }
}
