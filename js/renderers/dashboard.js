// ===================== dashboard.js — الإحصائيات =====================

function renderDashboard() {
  // نحسب من البيانات الموجودة في S (التي تم تحميلها من Supabase)
  const today = new Date().toLocaleDateString('ar-EG');
  const salesToday = S.products.reduce((sum, p) => {
    return sum + p.salesLog.filter(sl => sl.date === today).reduce((s, sl) => s + sl.total, 0);
  }, 0);
  
  const cashToday = S.collections.filter(c => c.date === today && c.isCash === true).reduce((s, c) => s + c.amount, 0);
  const creditToday = S.collections.filter(c => c.date === today && c.isCash === false && c.isDiscount !== true).reduce((s, c) => s + c.amount, 0);
  const expensesToday = S.expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
  const netKhazna = cashToday + creditToday - expensesToday;
  
  const html = `
    <div class="card">
      <div class="ch g"><span>📊</span><h2>إحصائيات اليوم (${today})</h2></div>
      <div class="cb" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
        <div style="background:var(--green-light);padding:12px;border-radius:12px;text-align:center">
          <div style="font-size:1.2rem">🛒</div>
          <div style="font-size:0.75rem;color:gray">إجمالي المبيعات</div>
          <div style="font-size:1.4rem;font-weight:900;color:var(--green)">${N(salesToday)} جنيه</div>
        </div>
        <div style="background:var(--blue-light);padding:12px;border-radius:12px;text-align:center">
          <div style="font-size:1.2rem">💰</div>
          <div style="font-size:0.75rem;color:gray">النقدي</div>
          <div style="font-size:1.4rem;font-weight:900;color:var(--blue)">${N(cashToday)} جنيه</div>
        </div>
        <div style="background:var(--orange-light);padding:12px;border-radius:12px;text-align:center">
          <div style="font-size:1.2rem">📝</div>
          <div style="font-size:0.75rem;color:gray">الآجل (تحت الحساب)</div>
          <div style="font-size:1.4rem;font-weight:900;color:var(--orange)">${N(creditToday)} جنيه</div>
        </div>
        <div style="background:var(--red-light);padding:12px;border-radius:12px;text-align:center">
          <div style="font-size:1.2rem">💸</div>
          <div style="font-size:0.75rem;color:gray">المصروفات</div>
          <div style="font-size:1.4rem;font-weight:900;color:var(--red)">${N(expensesToday)} جنيه</div>
        </div>
        <div style="background:var(--green);padding:12px;border-radius:12px;text-align:center;color:white">
          <div style="font-size:1.2rem">🏦</div>
          <div style="font-size:0.75rem;opacity:0.9">صافي الخزنة</div>
          <div style="font-size:1.6rem;font-weight:900">${N(netKhazna)} جنيه</div>
        </div>
      </div>
    </div>
  `;
  
  let dashboardDiv = document.getElementById('dashboard-stats');
  if (!dashboardDiv) {
    // إنشاء العنصر إذا لم يكن موجوداً (سيتم إضافته في صفحة dashboard)
    const page = document.getElementById('page-dashboard');
    if (page) {
      page.innerHTML = `<div id="dashboard-stats"></div>`;
      dashboardDiv = document.getElementById('dashboard-stats');
    }
  }
  if (dashboardDiv) dashboardDiv.innerHTML = html;
}