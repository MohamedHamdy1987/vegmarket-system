// ======================================================
// 🚀 app.js — نسخة ثابتة بدون تهنيج
// ======================================================

function updateDates() {
  const dateEl = document.getElementById('todayDate');
  if (dateEl) dateEl.textContent = S.date;
}

function renderAll() {
  try {
    updateDates();
    if (typeof renderCustomers === 'function') renderCustomers();
    if (typeof renderSuppliers === 'function') renderSuppliers();
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof renderSales === 'function') renderSales();
    if (typeof renderDashboard === 'function') renderDashboard();
  } catch (e) {
    console.error('Render error:', e);
  }
}

// 🔥 تحميل آمن (حتى لو جدول وقع)
async function safeLoad(table) {
  try {
    const res = await sb.from(table).select('*');
    if (res.error) throw res.error;
    return res.data || [];
  } catch (e) {
    console.warn(`⚠️ فشل تحميل ${table}`, e.message);
    return []; // ما يوقفش البرنامج
  }
}

async function loadAllData() {
  S.customers = await safeLoad('customers');
  S.suppliers = await safeLoad('suppliers');
  S.products = await safeLoad('products');
  S.batches = await safeLoad('incoming_batches');
  S.sales = await safeLoad('sales');
  S.invoices = await safeLoad('invoices');
  S.expenses = await safeLoad('expenses');
  S.collections = await safeLoad('collections');

  console.log('✅ تحميل البيانات انتهى');
}

async function init() {
  try {
    // ⏱ timeout حماية
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject('timeout'), 5000)
    );

    await Promise.race([loadAllData(), timeout]);

  } catch (e) {
    console.warn('⚠️ تحميل بطيء أو فشل:', e);
  }

  // 👇 يكمل مهما حصل
  S.date = new Date().toLocaleDateString('ar-EG');
  renderAll();
}

window.addEventListener('load', init);