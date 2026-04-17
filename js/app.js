// ===================== app.js — النقطة الرئيسية لتشغيل التطبيق =====================
// هذا الملف يُحمَّل أخيراً بعد كل الوحدات الأخرى

/**
 * تحديث جميع القوائم المنسدلة (dropdowns) في التطبيق
 */
function refreshDropdowns() {
  // قائمة الموردين
  const suppOpts = '<option value="">-- اختر --</option>' +
    S.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  ['np-supplier', 'inv-supp-sel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = suppOpts;
  });

  // قائمة العملاء مع عرض رصيد كل عميل للمساعدة في الاختيار
  const cc = document.getElementById('col-cust-sel');
  if (cc) cc.innerHTML = '<option value="">-- اختر --</option>' +
    S.customers.map(c => `<option value="${c.id}">${c.name} (${N(getCustBal(c.id))} ج)</option>`).join('');

  // قائمة الموردين في المصروفات
  const es = document.getElementById('exp-supp-sel');
  if (es) es.innerHTML = '<option value="">-- بدون مورد --</option>' +
    S.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

/**
 * إعادة رسم كل صفحات التطبيق — يُستدعى بعد أي تغيير في البيانات
 */
function renderAll() {
  refreshDropdowns();
  renderBaqi();
  renderNazilList();
  renderSalesTable();
  renderTarhil();
  renderCustList();
  renderSuppList();
  renderInvoicesPage();
  renderCollections();
  renderExpenses();
  renderDaySummary();
  renderEmployees();
  renderPartners();
  renderShops();
}

/**
 * عرض التطبيق الرئيسي بعد تسجيل الدخول أو التحميل
 */
function showApp() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'none';
  document.getElementById('app').style.display          = 'block';
  document.getElementById('auth-screen').style.display  = 'none';

  if (currentUser) {
    document.getElementById('user-email-badge').textContent = currentUser.email.split('@')[0];
    const meta = currentUser.user_metadata;
    if (meta && meta.shop_name) document.getElementById('shop-name-header').textContent = meta.shop_name;
    checkTrial();
    updateAdminTabVisibility();
    renderSubscriptionStatus();
  } else {
    document.getElementById('shop-name-header').textContent = 'نظام المحل (محلي)';
  }

  updateDates();
  renderAll();
}

/**
 * نقطة البداية — تُنفَّذ عند تحميل الصفحة
 */
async function init() {
  try {
    // تحميل البيانات المحلية فوراً لتجنب الشاشة الفارغة
    import { loadAllData } from './data.js';

async function init() {
  try {
    // 🔥 تحميل البيانات من Supabase فقط
    await loadAllData();

    // تحديث التاريخ
    S.date = fmtDate(new Date());

    // عرض البيانات
    renderAll();

  } catch (e) {
    console.error('خطأ في تحميل البيانات:', e);
  }
}

    // محاولة استئناف الجلسة من Supabase مع timeout 3 ثوانٍ
    let session = null;
    try {
      const res = await Promise.race([
        sb.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000))
      ]);
      session = res?.data?.session;
    } catch (e) {
      console.warn('Supabase timeout أو offline:', e);
    }

    if (session) {
      currentUser = session.user;
      await loadUserData();
    } else {
      currentUser = null;
    }

    showApp();
  } catch (e) {
    console.error('INIT ERROR:', e);
    showApp(); // عرض التطبيق حتى في حالة الخطأ
  } finally {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// حماية من التجمد: إخفاء شاشة التحميل بعد 5 ثوانٍ على أقصى تقدير
window.addEventListener('load', () => {
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading && loading.style.display !== 'none') loading.style.display = 'none';
  }, 5000);
});

// تشغيل التطبيق
init();
