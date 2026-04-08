// ===================== utils.js — دوال مساعدة مشتركة =====================
// هذا الملف يُحمَّل أولاً لأن باقي الملفات تعتمد عليه

/**
 * تنسيق التاريخ بالعربية
 * @param {Date} d
 * @returns {string}
 */
function fmtDate(d) {
  return d.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * تنسيق الأرقام بالعربية
 * @param {number} n
 * @returns {string}
 */
function N(n) {
  return (parseFloat(n) || 0).toLocaleString('ar-EG');
}

/**
 * إغلاق مودال
 * @param {string} id
 */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/**
 * تغيير التاريخ يدوياً
 */
function changeDatePrompt() {
  const d = prompt('أدخل التاريخ:', S.date);
  if (d && d.trim()) {
    S.date = d.trim();
    save();
    updateDates();
    renderAll();
  }
}

/**
 * تحديث عرض التاريخ في كل العناصر
 */
function updateDates() {
  ['headerDate', 'sales-badge', 'nazil-badge', 'col-badge', 'exp-badge', 'tarhil-badge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = S.date;
  });
}

/**
 * عرض قائمة المستخدم
 */
function showUserMenu() {
  const meta = currentUser?.user_metadata;
  document.getElementById('user-info').innerHTML = `
    <div><strong>المحل:</strong> ${meta?.shop_name || '-'}</div>
    <div><strong>البريد:</strong> ${currentUser?.email || '-'}</div>
    <div><strong>الاشتراك:</strong> ${
      meta?.subscription === 'trial' ? 'تجربة مجانية' :
      (meta?.subscription === 'active' ? 'مشترك' : 'منتهي')
    }</div>`;
  document.getElementById('user-modal').classList.add('open');
}

/**
 * عرض صفحة معينة
 * @param {string} n - اسم الصفحة
 * @param {HTMLElement|null} btn - زر التاب المضغوط
 */
function showPage(n, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + n).classList.add('active');
  if (btn) btn.classList.add('active');
  renderAll();
  if (n === 'admin') loadAdminPayments();
  if (n === 'subscription') renderSubscriptionStatus();
}

/**
 * تبديل تاب الخزنة (تحصيلات / مصروفات)
 * @param {string} t
 */
function showKTab(t) {
  document.getElementById('ks-col').style.display = t === 'col' ? 'block' : 'none';
  document.getElementById('ks-exp').style.display  = t === 'exp' ? 'block' : 'none';
}
