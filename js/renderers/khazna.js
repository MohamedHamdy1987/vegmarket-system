// ===================== renderers/khazna.js =====================

// --- التحصيلات ---
async function addCollection() {
  const custId = document.getElementById('col-cust-sel').value;
  const amount = parseFloat(document.getElementById('col-amount').value) || 0;
  const discount = parseFloat(document.getElementById('col-discount').value) || 0;
  const note = document.getElementById('col-note').value.trim();
  if (!custId) return alert('اختر العميل');
  if (amount <= 0 && discount <= 0) return alert('أدخل مبلغ أو قطعية');
  const cust = S.customers.find(c => c.id == custId);
  if (!cust) return;

  try {
    if (amount > 0) {
      const collectionId = Date.now();
      await insertCollection({
        id: collectionId, date: S.date, custId, amount, note: note || 'دفعة',
        isCash: false, isDiscount: false
      });
      const newLedger = [...(cust.ledger || []), {
        date: S.date, type: 'payment', amount, ref: note || 'دفعة', collectionId
      }];
      await updateCustomerRow(custId, { ledger: newLedger });
    }
    if (discount > 0) {
      const newLedger = [...(cust.ledger || []), {
        date: S.date, type: 'discount', amount: discount, ref: note ? `قطعية - ${note}` : 'قطعية'
      }];
      await updateCustomerRow(custId, { ledger: newLedger });
    }
    document.getElementById('col-amount').value = '';
    document.getElementById('col-discount').value = '';
    document.getElementById('col-note').value = '';
    await loadAllData();
    if (amount > 0) alert(`✅ تم تسجيل دفعة بقيمة ${amount} جنيه للعميل ${cust.name}`);
    if (discount > 0) alert(`✅ تم تسجيل قطعية بقيمة ${discount} جنيه للعميل ${cust.name}`);
  } catch (e) { alert('فشل تسجيل التحصيل: ' + e.message); }
}

async function updateCollection(id) {
  const col = S.collections.find(c => c.id == id);
  if (!col) return;
  const newNote = prompt('ملاحظة جديدة', col.note);
  if (!newNote || newNote === col.note) return;
  try {
    await updateCollectionRow(id, { note: newNote });
    // تحديث الـ ledger المرتبط
    if (!col.isCash && col.custId) {
      const cust = S.customers.find(c => c.id == col.custId);
      if (cust) {
        const newLedger = (cust.ledger || []).map(e =>
          e.collectionId === id ? { ...e, ref: newNote } : e
        );
        await updateCustomerRow(col.custId, { ledger: newLedger });
      }
    }
    await loadAllData();
  } catch (e) { alert('فشل التحديث'); }
}

async function deleteCollection(id) {
  if (!confirm('حذف هذا التحصيل؟')) return;
  try {
    const col = S.collections.find(c => c.id == id);
    if (col && !col.isCash && col.custId) {
      const cust = S.customers.find(c => c.id == col.custId);
      if (cust) {
        const newLedger = (cust.ledger || []).filter(e => !(e.type === 'payment' && e.collectionId === id));
        await updateCustomerRow(col.custId, { ledger: newLedger });
      }
    }
    await deleteCollectionRow(id);
    await loadAllData();
  } catch (e) { alert('فشل الحذف'); }
}

function renderCollections() {
  const today = S.collections.filter(c => c.date === S.date);
  const cash = today.filter(c => c.isCash === true);
  const customerPayments = today.filter(c => c.isCash === false && c.isDiscount !== true);
  let html = '';

  if (cash.length) {
    html += '<div style="font-size:0.78rem;font-weight:800;color:var(--green);margin:8px 0 5px">💵 النقديات</div>';
    cash.forEach(c => {
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:0.83rem">
          <span style="flex:1;color:#444">${c.note || '-'}</span>
          <span style="font-weight:900;color:var(--green)">${N(c.amount)} جنيه</span>
          <button class="btn btn-b btn-xs" style="margin-right:6px" onclick="updateCollection(${c.id})">✏️</button>
          <button class="btn btn-r btn-xs" style="margin-right:6px" onclick="deleteCollection(${c.id})">🗑️</button>
        </div>`;
    });
  }

  if (customerPayments.length) {
    html += '<div style="font-size:0.78rem;font-weight:800;color:var(--blue);margin:10px 0 5px">📋 تسديدات العملاء</div>';
    customerPayments.forEach(c => {
      const cust = S.customers.find(x => x.id == c.custId);
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:0.83rem">
          <span style="font-weight:700">${cust ? cust.name : 'عميل محذوف'}</span>
          <span style="font-size:0.79rem;color:var(--gray);flex:1;margin:0 8px">${c.note || '-'}</span>
          <span style="font-weight:900;color:var(--blue)">${N(c.amount)} جنيه</span>
          <button class="btn btn-b btn-xs" style="margin-right:6px" onclick="updateCollection(${c.id})">✏️</button>
          <button class="btn btn-r btn-xs" style="margin-right:6px" onclick="deleteCollection(${c.id})">🗑️</button>
        </div>`;
    });
  }

  if (!html) html = '<p style="color:#aaa;text-align:center;padding:12px">لا توجد تحصيلات اليوم</p>';
  document.getElementById('col-body').innerHTML = html;
  const total = today.reduce((s, c) => s + c.amount, 0);
  document.getElementById('col-total').textContent = N(total) + ' جنيه';
}

// --- المصروفات ---
async function addExpense() {
  const desc = document.getElementById('exp-desc').value.trim();
  const suppId = document.getElementById('exp-supp-sel').value;
  const amount = parseFloat(document.getElementById('exp-amount').value);
  if (!desc) return alert('أدخل البيان');
  if (!amount || amount <= 0) return alert('أدخل المبلغ');
  try {
    await insertExpense({ date: S.date, desc, suppId: suppId || '', amount });
    if (suppId) {
      const sup = S.suppliers.find(s => s.id == suppId);
      if (sup) {
        const newLedger = [...(sup.ledger || []), { date: S.date, type: 'payment', amount, ref: desc }];
        await updateSupplierRow(suppId, { ledger: newLedger });
      }
    }
    document.getElementById('exp-desc').value = '';
    document.getElementById('exp-amount').value = '';
    await loadAllData();
  } catch (e) { alert('فشل إضافة المصروف: ' + e.message); }
}

async function updateExpense(id) {
  const exp = S.expenses.find(e => e.id == id);
  if (!exp) return;
  const newDesc = prompt('وصف المصروف الجديد', exp.desc);
  if (!newDesc || newDesc === exp.desc) return;
  try {
    await updateExpenseRow(id, { desc: newDesc });
    // تحديث ledger المورد إذا وجد
    if (exp.suppId) {
      const sup = S.suppliers.find(s => s.id == exp.suppId);
      if (sup) {
        const newLedger = (sup.ledger || []).map(e =>
          (e.type === 'payment' && e.amount === exp.amount && e.date === exp.date) ? { ...e, ref: newDesc } : e
        );
        await updateSupplierRow(exp.suppId, { ledger: newLedger });
      }
    }
    await loadAllData();
  } catch (e) { alert('فشل التحديث'); }
}

async function deleteExpense(id) {
  if (!confirm('حذف هذا المصروف؟')) return;
  try {
    const exp = S.expenses.find(e => e.id == id);
    if (exp && exp.suppId) {
      const sup = S.suppliers.find(s => s.id == exp.suppId);
      if (sup) {
        const newLedger = (sup.ledger || []).filter(e => !(e.type === 'payment' && e.amount === exp.amount && e.date === exp.date));
        await updateSupplierRow(exp.suppId, { ledger: newLedger });
      }
    }
    await deleteExpenseRow(id);
    await loadAllData();
  } catch (e) { alert('فشل الحذف'); }
}

function renderExpenses() {
  const today = S.expenses.filter(e => e.date === S.date);
  let html = '';
  if (today.length) {
    today.forEach(e => {
      const sup = S.suppliers.find(s => s.id == e.suppId);
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:0.83rem">
          <span style="font-weight:700;flex:1">${e.desc}</span>
          <span style="font-size:0.79rem;color:var(--gray);margin:0 8px">${sup ? sup.name : '-'}</span>
          <span style="font-weight:900;color:var(--red)">${N(e.amount)} جنيه</span>
          <button class="btn btn-b btn-xs" style="margin-right:6px" onclick="updateExpense(${e.id})">✏️</button>
          <button class="btn btn-r btn-xs" style="margin-right:6px" onclick="deleteExpense(${e.id})">🗑️</button>
        </div>`;
    });
  } else {
    html = '<p style="color:#aaa;text-align:center;padding:12px">لا توجد مصروفات اليوم</p>';
  }
  document.getElementById('exp-body').innerHTML = html;
  const tot = today.reduce((s, e) => s + e.amount, 0);
  document.getElementById('exp-total').textContent = N(tot) + ' جنيه';
}

// --- ملخص الخزنة ---
function renderDaySummary() {
  const colTot = S.collections.filter(c => c.date === S.date).reduce((s, c) => s + c.amount, 0);
  const expTot = S.expenses.filter(e => e.date === S.date).reduce((s, e) => s + e.amount, 0);
  const salTot = S.products.reduce((s, p) => s + (p.salesLog || []).reduce((ss, x) => ss + x.total, 0), 0);
  document.getElementById('sum-col').textContent = N(colTot) + ' جنيه';
  document.getElementById('sum-exp').textContent = N(expTot) + ' جنيه';
  document.getElementById('sum-sales').textContent = N(salTot) + ' جنيه';
  document.getElementById('sum-net').textContent = N(colTot - expTot) + ' جنيه';
}