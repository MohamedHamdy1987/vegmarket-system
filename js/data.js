// ===============================
// 🔥 Supabase Setup
// ===============================
const SUPABASE_URL = 'https://lfhrorjiukzkqhafjtdd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaHJvcmppdWt6a3FoYWZqdGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTc3NTgsImV4cCI6MjA5MDM3Mzc1OH0.eQ0w4DG_-DNvnJRJxgvJ7KhNNkBhOEswQhtbiO2my3Q';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
// 🧠 Global State (Cache فقط)
// ===============================
export let S = {
  customers: [],
  suppliers: [],
  products: [],
  batches: [],
  sales: [],
  invoices: [],
  expenses: [],
  collections: []
};

// ===============================
// 🔄 تحميل كل البيانات
// ===============================
export async function loadAllData() {
  const [
    customers,
    suppliers,
    products,
    batches,
    sales,
    invoices,
    expenses,
    collections
  ] = await Promise.all([
    sb.from('customers').select('*'),
    sb.from('suppliers').select('*'),
    sb.from('products').select('*'),
    sb.from('incoming_batches').select('*'),
    sb.from('sales').select('*'),
    sb.from('invoices').select('*'),
    sb.from('expenses').select('*'),
    sb.from('collections').select('*')
  ]);

  S.customers = customers.data || [];
  S.suppliers = suppliers.data || [];
  S.products = products.data || [];
  S.batches = batches.data || [];
  S.sales = sales.data || [];
  S.invoices = invoices.data || [];
  S.expenses = expenses.data || [];
  S.collections = collections.data || [];
}

// ===============================
// 👤 Customers
// ===============================
export async function addCustomer(obj) {
  await sb.from('customers').insert([obj]);
  await loadAllData();
}

export async function updateCustomer(id, obj) {
  await sb.from('customers').update(obj).eq('id', id);
  await loadAllData();
}

export async function deleteCustomer(id) {
  await sb.from('customers').delete().eq('id', id);
  await loadAllData();
}

// ===============================
// 🚚 Suppliers
// ===============================
export async function addSupplier(obj) {
  await sb.from('suppliers').insert([obj]);
  await loadAllData();
}

export async function updateSupplier(id, obj) {
  await sb.from('suppliers').update(obj).eq('id', id);
  await loadAllData();
}

// ===============================
// 📦 Products
// ===============================
export async function addProduct(obj) {
  await sb.from('products').insert([obj]);
  await loadAllData();
}

// ===============================
// 📥 Incoming (النازل)
// ===============================
export async function addBatch(obj) {
  obj.remaining_qty = obj.quantity;

  await sb.from('incoming_batches').insert([obj]);
  await loadAllData();
}

// ===============================
// 🛒 Sales
// ===============================
export async function addSale(obj) {
  const total = obj.quantity * obj.price;

  await sb.from('sales').insert([{
    ...obj,
    total
  }]);

  // تحديث المتبقي
  const batch = S.batches.find(b => b.id === obj.batch_id);
  const newQty = batch.remaining_qty - obj.quantity;

  await sb.from('incoming_batches')
    .update({ remaining_qty: newQty })
    .eq('id', obj.batch_id);

  // لو خلصت → تصفية
  if (newQty <= 0) {
    await createSettlement(obj.batch_id);
  }

  await loadAllData();
}

// ===============================
// 💰 Settlement (الفاتورة)
// ===============================
export async function createSettlement(batch_id) {
  const batch = S.batches.find(b => b.id === batch_id);

  const sales = S.sales.filter(s => s.batch_id === batch_id);

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);

  const commission = totalSales * 0.10; // عدلها لو 7%
  const net = totalSales - commission - batch.noulon - batch.mashal;

  await sb.from('invoices').insert([{
    supplier_id: batch.supplier_id,
    batch_id,
    total_sales: totalSales,
    commission,
    noulon: batch.noulon,
    mashal: batch.mashal,
    net
  }]);

  // تحديث رصيد المورد
  const supplier = S.suppliers.find(s => s.id === batch.supplier_id);

  await sb.from('suppliers')
    .update({ balance: supplier.balance + net })
    .eq('id', supplier.id);
}