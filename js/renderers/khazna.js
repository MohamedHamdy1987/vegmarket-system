// ===================== renderers/khazna.js — الخزنة (تحصيلات + مصروفات) =====================

// --- التحصيلات ---
function addCollection() {
  const custId   = document.getElementById('col-cust-sel').value;
  const amount   = parseFloat(document.getElementById('col-amount').value)   || 0;
  const discount = parseFloat(document.getElementById('col-discount').value) || 0;
  const note     = document.getElementById('col-note').value.trim();
  if (!custId)                    return alert('اختر العميل');
  if (amount <= 0 && discount <= 0) return alert('أدخل مبلغ أو قطعية');
  const cust = S.customers.find(c => c.id == custId);
  if (!cust) return;

  if (amount > 0) {
    const collectionId = Date.now();
    S.collections.push({ id: collectionId, date: S.date, custId, amount, note: note || 'دفعة', isCash: false, isDiscount: false });
    cust.ledger.push({ date: S.date, type: 'payment', amount, ref: note || 'دفعة', collectionId });
  }
  if (discount > 0) {
    cust.ledger.push({ date: S.date, type: 'discount', amount: discount, ref: note ? `قطعية - ${note}` : 'قطعية' });
  }

  document.getElementById('col-amount').value   = '';
  document.getElementById('col-discount').value = '';
  document.getElementById('col-note').value     = '';
  save(); renderAll();
  if (amount   > 0) alert(`✅ تم تسجيل دفعة بقيمة ${amount} جنيه للعميل ${cust.name}`);
  if (discount > 0) alert(`✅ تم تسجيل قطعية بقيمة ${discount} جنيه للعميل ${cust.name}`);
}

function renderCollections() {
  const today            = S.collections.filter(c => c.date === S.date);
  const cash             = today.filter(c => c.isCash === true);
  const customerPayments = today.filter(c => c.isCash === false && c.isDiscount !== true);
  let html = '';

  if (cash.length) {
    html += '<div style="font-size:0.78rem;font-weight:800;color:var(--green);margin:8px 0 5px">💵 النقديات</div>';
    cash.forEach(c => {
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:0.83rem">
        <span style="flex:1;color:#444">${c.note || '-'}</span>
        <span style="font-weight:900;color:var(--green)">${N(c.amount)} جنيه</span>
        <button class="btn btn-r btn-xs" style="margin-right:6px" onclick="delCollection(${c.id})">🗑️</button>
      </div>`;
    });
  }

  if (customerPayments.length) {
    html += '<div style="font-size:0.78rem;font-weight:800;color:var(--blue);margin:10px 0 5px">📋 تسديدات العملاء</div>';
    customerPayments.forEach(c => {
      const cust = S.customers.find(x => x.id == c.custId);
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:0.83rem">
        <span style="font-weight:700">${cust ? cust.name : 'عميل محذوف'}</span>
        <span style="font-size:0.79rem;color:var(--gray);flex:1;margin:0 8px">${c.note || '-'}</span>
        <span style="font-weight:900;color:var(--blue)">${N(c.amount)} جنيه</span>
        <button class="btn btn-r btn-xs" style="margin-right:6px" onclick="delCollection(${c.id})">🗑️</button>
      </div>`;
    });
  }

  if (!html) html = '<p style="color:#aaa;text-align:center;padding:12px">لا توجد تحصيلات اليوم</p>';
  document.getElementById('col-body').innerHTML = html;

  const total = today.reduce((s, c) => s + c.amount, 0);
  document.getElementById('col-total').textContent = N(total) + ' جنيه';
}

function delCollection(id) {
  const col = S.collections.find(c => c.id == id);
  if (col && !col.isCash) {
    const cust = S.customers.find(c => c.id == col.custId);
    if (cust) cust.ledger = cust.ledger.filter(e => !(e.type === 'payment' && e.collectionId === id));
  }
  S.collections = S.collections.filter(c => c.id != id);
  save(); renderAll();
}

// --- المصروفات ---
function addExpense() {
  const desc   = document.getElementById('exp-desc').value.trim();
  const suppId = document.getElementById('exp-supp-sel').value;
  const amount = parseFloat(document.getElementById('exp-amount').value);
  if (!desc)            return alert('أدخل البيان');
  if (!amount || amount <= 0) return alert('أدخل المبلغ');
  S.expenses.push({ id: Date.now(), date: S.date, desc, suppId, amount });
  if (suppId) {
    const sup = S.suppliers.find(s => s.id == suppId);
    if (sup) sup.ledger.push({ date: S.date, type: 'payment', amount, ref: desc });
  }
  ['exp-desc', 'exp-amount'].forEach(id => document.getElementById(id).value = '');
  save(); renderAll();
}

function renderExpenses() {
  const today = S.expenses.filter(e => e.date === S.date);
  let html = '';
  if (today.length) {
    today.forEach(e => {
      const sup = S.suppliers.find(s => s.id == e.suppId);
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:0.83rem">
        <span style="font-weight:700;flex:1">${e.desc}</span>
        <span style="font-size:0.79rem;color:var(--gray);margin:0 8px">${sup ? sup.name : '-'}</span>
        <span style="font-weight:900;color:var(--red)">${N(e.amount)} جنيه</span>
        <button class="btn btn-r btn-xs" style="margin-right:6px" onclick="delExpense(${e.id})">🗑️</button>
      </div>`;
    });
  } else {
    html = '<p style="color:#aaa;text-align:center;padding:12px">لا توجد مصروفات اليوم</p>';
  }
  document.getElementById('exp-body').innerHTML = html;
  const tot = today.reduce((s, e) => s + e.amount, 0);
  document.getElementById('exp-total').textContent = N(tot) + ' جنيه';
}

function delExpense(id) {
  const exp = S.expenses.find(e => e.id == id);
  if (exp && exp.suppId) {
    const sup = S.suppliers.find(s => s.id == exp.suppId);
    if (sup) sup.ledger = sup.ledger.filter(e => !(e.type === 'payment' && e.amount === exp.amount && e.date === exp.date));
  }
  S.expenses = S.expenses.filter(e => e.id != id);
  save(); renderAll();
}

// --- ملخص الخزنة ---
function renderDaySummary() {
  const colTot = S.collections.filter(c => c.date === S.date).reduce((s, c) => s + c.amount, 0);
  const expTot = S.expenses.filter(e => e.date === S.date).reduce((s, e) => s + e.amount, 0);
  const salTot = S.products.reduce((s, p) => s + p.salesLog.reduce((ss, x) => ss + x.total, 0), 0);
  document.getElementById('sum-col').textContent   = N(colTot) + ' جنيه';
  document.getElementById('sum-exp').textContent   = N(expTot) + ' جنيه';
  document.getElementById('sum-sales').textContent = N(salTot) + ' جنيه';
  document.getElementById('sum-net').textContent   = N(colTot - expTot) + ' جنيه';
}
