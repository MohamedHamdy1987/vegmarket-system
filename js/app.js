// ======================================================
// 🚀 app.js — تشغيل التطبيق
// ======================================================

// 📅 تحديث التاريخ
function updateDates() {
  const dateEl = document.getElementById('todayDate');
  if (dateEl) {
    dateEl.textContent = S.date;
  }
}

// 🎨 إعادة رسم كل الواجهات
function renderAll() {
  try {
    updateDates();

    if (typeof renderCustomers === 'function') renderCustomers();
    if (typeof renderSuppliers === 'function') renderSuppliers();
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof renderSales === 'function') renderSales();
    if (typeof renderDashboard === 'function') renderDashboard();

  } catch (e) {
    console.error('خطأ في render:', e);
  }
}

// ======================================================
// 🔥 تحميل البيانات من Supabase
// ======================================================
async function loadAllData() {
  try {
    // 👇 كل جدول لوحده
    const [
      customersRes,
      suppliersRes,
      productsRes,
      batchesRes,
      salesRes,
      invoicesRes,
      expensesRes,
      collectionsRes
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

    // 👇 تخزين في الكاش
    S.customers = customersRes.data || [];
    S.suppliers = suppliersRes.data || [];
    S.products = productsRes.data || [];
    S.batches = batchesRes.data || [];
    S.sales = salesRes.data || [];
    S.invoices = invoicesRes.data || [];
    S.expenses = expensesRes.data || [];
    S.collections = collectionsRes.data || [];

    console.log('✅ البيانات اتحملت من Supabase');

  } catch (e) {
    console.error('❌ خطأ في تحميل البيانات:', e);
    alert('⚠️ فشل تحميل البيانات من السحابة');
  }
}

// ======================================================
// 🔥 بدء تشغيل التطبيق
// ======================================================
async function init() {
  try {

    // 🔐 محاولة تحميل session (اختياري)
    let session = null;
    try {
      const res = await Promise.race([
        sb.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject('timeout'), 3000)
        )
      ]);
      session = res?.data?.session;
    } catch (e) {
      console.warn('⚠️ session timeout');
    }

    // 🔥 تحميل البيانات من Supabase
    await loadAllData();

    // 📅 تحديث التاريخ
    S.date = new Date().toLocaleDateString('ar-EG');

    // 🎨 عرض البيانات
    renderAll();

  } catch (e) {
    console.error('❌ خطأ في init:', e);
  }
}

// ======================================================
// 🚀 تشغيل عند فتح الصفحة
// ======================================================
window.addEventListener('load', init);