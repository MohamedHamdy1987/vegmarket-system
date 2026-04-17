// ===================== dashboard.js =====================

function renderDashboard() {
  const today = S.date || fmtDate(new Date());
  
  // إجمالي المبيعات
  const salesToday = S.products.reduce((sum, product) => {
    const todaySales = (product.salesLog || []).filter(sale => sale.date === today);
    const total = todaySales.reduce((s, sale) => s + (sale.total || 0), 0);
    return sum + total;
  }, 0);
  
  // النقدي
  const cashToday = S.collections.filter(c => c.date === today && c.isCash === true)
    .reduce((s, c) => s + (c.amount || 0), 0);
  
  // الآجل (تحت الحساب)
  const creditToday = S.collections.filter(c => c.date === today && c.isCash !== true && c.isDiscount !== true)
    .reduce((s, c) => s + (c.amount || 0), 0);
  
  // المصروفات
  const expensesToday = S.expenses.filter(e => e.date === today)
    .reduce((s, e) => s + (e.amount || 0), 0);
  
  // صافي الخزنة
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
        <div style="background:#fff3e0;padding:12px;border-radius:12px;text-align:center">
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
    </div>`;
  
  const dashboardDiv = document.getElementById('dashboard-stats');
  if (dashboardDiv) dashboardDiv.innerHTML = html;
}