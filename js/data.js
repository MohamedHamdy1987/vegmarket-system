// ===================== data.js — الاتصال بـ Supabase وإدارة البيانات (نسخة سحابية كاملة) =====================

const SUPABASE_URL = 'https://lfhrorjiukzkqhafjtdd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaHJvcmppdWt6a3FoYWZqdGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTc3NTgsImV4cCI6MjA5MDM3Mzc1OH0.eQ0w4DG_-DNvnJRJxgvJ7KhNNkBhOEswQhtbiO2my3Q';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let S = {
  customers: [],
  suppliers: [],
  products: [],
  invoices: [],
  collections: [],
  expenses: [],
  tarhilLog: {},
  employees: [],
  partners: [],
  shops: [],
  date: new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
};
let xProd = null;

// ========== دوال مساعدة ==========
function setSyncStatus(status, msg) {
  const bar = document.getElementById('sync-bar');
  const text = document.getElementById('sync-text');
  if (!bar) return;
  clearTimeout(window.syncHideTimer);
  bar.className = 'sync-bar ' + (status === 'saving' ? 'saving' : (status === 'error' ? 'error' : ''));
  text.textContent = msg;
  if (status === '') {
    window.syncHideTimer = setTimeout(() => bar.style.opacity = '0.5', 3000);
    bar.style.opacity = '1';
  }
}

function fmtDate(d) {
  return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function N(n) {
  return (parseFloat(n) || 0).toLocaleString('ar-EG');
}

// ========== تحميل جميع البيانات من Supabase ==========
async function loadAllData() {
  if (!currentUser) return;
  setSyncStatus('saving', 'جاري التحميل...');
  try {
    const [customers, suppliers, products, invoices, collections, expenses, employees, partners, shops] = await Promise.all([
      sb.from('customers').select('*').eq('user_id', currentUser.id),
      sb.from('suppliers').select('*').eq('user_id', currentUser.id),
      sb.from('products').select('*').eq('user_id', currentUser.id),
      sb.from('invoices').select('*').eq('user_id', currentUser.id),
      sb.from('collections').select('*').eq('user_id', currentUser.id),
      sb.from('expenses').select('*').eq('user_id', currentUser.id),
      sb.from('employees').select('*').eq('user_id', currentUser.id),
      sb.from('partners').select('*').eq('user_id', currentUser.id),
      sb.from('shops').select('*').eq('user_id', currentUser.id)
    ]);
    S.customers = customers.data || [];
    S.suppliers = suppliers.data || [];
    S.products = products.data || [];
    S.invoices = invoices.data || [];
    S.collections = collections.data || [];
    S.expenses = expenses.data || [];
    S.employees = employees.data || [];
    S.partners = partners.data || [];
    S.shops = shops.data || [];
    
    const { data: tarhilData } = await sb.from('tarhil_log').select('data').eq('user_id', currentUser.id).maybeSingle();
    S.tarhilLog = tarhilData?.data || {};
    
    setSyncStatus('', 'تم التحميل من السحابة ✓');
    if (typeof renderAll === 'function') renderAll();
  } catch (e) {
    setSyncStatus('error', 'فشل التحميل');
    console.error(e);
  }
}

// ========== دوال CRUD للعملاء ==========
async function insertCustomer(customer) {
  const { data, error } = await sb.from('customers')
    .insert({ ...customer, user_id: currentUser.id })
    .select()
    .single();
  if (error) throw error;
  setSyncStatus('', 'تم الحفظ ✓');
  return data;
}
async function updateCustomerRow(id, updates) {
  const { data, error } = await sb.from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  setSyncStatus('', 'تم التحديث ✓');
  return data;
}
async function deleteCustomerRow(id) {
  const { error } = await sb.from('customers').delete().eq('id', id);
  if (error) throw error;
  setSyncStatus('', 'تم الحذف ✓');
}

// ========== دوال CRUD للموردين ==========
async function insertSupplier(supplier) {
  const { data, error } = await sb.from('suppliers')
    .insert({ ...supplier, user_id: currentUser.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updateSupplierRow(id, updates) {
  const { data, error } = await sb.from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function deleteSupplierRow(id) {
  const { error } = await sb.from('suppliers').delete().eq('id', id);
  if (error) throw error;
}

// ========== دوال CRUD للمنتجات ==========
async function insertProduct(product) {
  const { data, error } = await sb.from('products')
    .insert({ ...product, user_id: currentUser.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updateProductRow(id, updates) {
  const { data, error } = await sb.from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function deleteProductRow(id) {
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ========== دوال CRUD للتحصيلات ==========
async function insertCollection(collection) {
  const { data, error } = await sb.from('collections')
    .insert({ ...collection, user_id: currentUser.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updateCollectionRow(id, updates) {
  const { data, error } = await sb.from('collections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function deleteCollectionRow(id) {
  const { error } = await sb.from('collections').delete().eq('id', id);
  if (error) throw error;
}

// ========== دوال CRUD للمصروفات ==========
async function insertExpense(expense) {
  const { data, error } = await sb.from('expenses')
    .insert({ ...expense, user_id: currentUser.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updateExpenseRow(id, updates) {
  const { data, error } = await sb.from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function deleteExpenseRow(id) {
  const { error } = await sb.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ========== دوال CRUD للفواتير ==========
async function insertInvoice(invoice) {
  const { data, error } = await sb.from('invoices')
    .insert({ ...invoice, user_id: currentUser.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updateInvoiceRow(id, updates) {
  const { data, error } = await sb.from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function deleteInvoiceRow(id) {
  const { error } = await sb.from('invoices').delete().eq('id', id);
  if (error) throw error;
}

// ========== دوال CRUD للموظفين ==========
async function insertEmployee(employee) {
  const { data, error } = await sb.from('employees')
    .insert({ ...employee, user_id: currentUser.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updateEmployeeRow(id, updates) {
  const { data, error } = await sb.from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function deleteEmployeeRow(id) {
  const { error } = await sb.from('employees').delete().eq('id', id);
  if (error) throw error;
}

// ========== دوال CRUD للشركاء ==========
async function insertPartner(partner) {
  const { data, error } = await sb.from('partners')
    .insert({ ...partner, user_id: currentUser.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updatePartnerRow(id, updates) {
  const { data, error } = await sb.from('partners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function deletePartnerRow(id) {
  const { error } = await sb.from('partners').delete().eq('id', id);
  if (error) throw error;
}

// ========== دوال CRUD للمحلات ==========
async function insertShop(shop) {
  const { data, error } = await sb.from('shops')
    .insert({ ...shop, user_id: currentUser.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updateShopRow(id, updates) {
  const { data, error } = await sb.from('shops')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function deleteShopRow(id) {
  const { error } = await sb.from('shops').delete().eq('id', id);
  if (error) throw error;
}

// ========== دوال CRUD لـ tarhilLog ==========
async function saveTarhilLog(tarhilData) {
  const { error } = await sb.from('tarhil_log')
    .upsert({ user_id: currentUser.id, data: tarhilData, updated_at: new Date().toISOString() })
    .eq('user_id', currentUser.id);
  if (error) throw error;
}
async function loadTarhilLog() {
  const { data, error } = await sb.from('tarhil_log')
    .select('data')
    .eq('user_id', currentUser.id)
    .maybeSingle();
  if (error) throw error;
  return data?.data || {};
}

// ========== دالة موحدة للحفظ (للتدرج مع الكود القديم) ==========
async function save() {
  // لا تفعل شيئاً لأن كل عملية تحفظ مباشرة عبر Supabase
  setSyncStatus('', 'محفوظ على السحابة ✓');
}