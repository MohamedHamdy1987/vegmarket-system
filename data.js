// ===================== data.js — البيانات والمزامنة مع Supabase =====================

// --- إعداد Supabase ---
const SUPABASE_URL = 'https://lfhrorjiukzkqhafjtdd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaHJvcmppdWt6a3FoYWZqdGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTc3NTgsImV4cCI6MjA5MDM3Mzc1OH0.eQ0w4DG_-DNvnJRJxgvJ7KhNNkBhOEswQhtbiO2my3Q';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- الحالة العامة للتطبيق ---
let currentUser = null;
let S = {
  date: new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
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
let xProd = null;
let saveTimer = null;

// --- دوال المزامنة ---
let syncHideTimer = null;

function setSyncStatus(status, msg) {
  const bar  = document.getElementById('sync-bar');
  const text = document.getElementById('sync-text');
  if (!bar || !text) return;
  clearTimeout(syncHideTimer);
  bar.className = 'sync-bar ' + (status === 'saving' ? 'saving' : (status === 'error' ? 'error' : ''));
  text.textContent = msg;
  if (!status || status === '') {
    syncHideTimer = setTimeout(() => { bar.style.opacity = '0.5'; }, 3000);
    bar.style.opacity = '1';
  } else {
    bar.style.opacity = '1';
  }
}

/**
 * حفظ البيانات — محلياً دائماً، وعلى السحابة إن كان هناك مستخدم مسجّل
 */
async function saveData() {
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
    else          await sb.from('shop_data').insert(payload);
    setSyncStatus('', 'محفوظ على السحابة ✓');
  } catch (e) {
    setSyncStatus('error', 'خطأ في الحفظ — محفوظ محلياً');
  }
}

/** Debounce للحفظ: ينتظر 1.5 ثانية بعد آخر تعديل */
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveData, 1500);
}

/**
 * تحميل بيانات المستخدم من localStorage ثم السحابة
 */
async function loadUserData() {
  const localData = localStorage.getItem('veg_local');
  if (localData) {
    try {
      S = JSON.parse(localData);
      _normalizeState();
    } catch (e) {}
  }
  if (!currentUser) return;

  setSyncStatus('saving', 'جاري التحميل من السحابة...');
  try {
    const { data } = await sb.from('shop_data').select('data').eq('user_id', currentUser.id).maybeSingle();
    if (data && data.data) {
      S = JSON.parse(data.data);
      _normalizeState();
      localStorage.setItem('veg_local', JSON.stringify(S));
      setSyncStatus('', 'محفوظ على السحابة ✓');
    } else if (localData) {
      await saveData();
      setSyncStatus('', 'تم رفع البيانات المحلية إلى السحابة');
    }
  } catch (e) {
    setSyncStatus('error', 'خطأ في الاتصال');
  }
}

/**
 * ضمان وجود كل الحقول المطلوبة في S (للتوافق مع البيانات القديمة)
 */
function _normalizeState() {
  if (!S.employees)   S.employees   = [];
  if (!S.partners)    S.partners    = [];
  if (!S.shops)       S.shops       = [];
  if (!S.tarhilLog)   S.tarhilLog   = {};
  if (!S.collections) S.collections = [];
  if (!S.expenses)    S.expenses    = [];
  if (!S.invoices)    S.invoices    = [];
  if (!S.products)    S.products    = [];
  if (!S.customers)   S.customers   = [];
  if (!S.suppliers)   S.suppliers   = [];
  if (!S.date)        S.date        = fmtDate(new Date());
}
