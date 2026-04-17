// ===================== renderers/suppliers.js =====================

function getSuppBal(id) {
  const s = S.suppliers.find(x => x.id == id);
  if (!s) return 0;
  return (s.ledger || []).reduce((sum, e) => e.type === 'invoice' ? sum + e.amount : sum - e.amount, 0);
}

async function addSupplier() {
  const name = document.getElementById('ns-name').value.trim();
  const phone = document.getElementById('ns-phone').value.trim();
  if (!name) return alert('أدخل اسم المورد');
  try {
    await insertSupplier({ name, phone, ledger: [], created_at: new Date().toISOString() });
    document.getElementById('ns-name').value = '';
    document.getElementById('ns-phone').value = '';
    await loadAllData();
  } catch (e) {
    alert('فشل الإضافة: ' + e.message);
  }
}

async function updateSupplier(id) {
  const supp = S.suppliers.find(s => s.id == id);
  if (!supp) return;
  const newName = prompt('الاسم الجديد', supp.name);
  if (!newName || newName === supp.name) return;
  try {
    await updateSupplierRow(id, { name: newName });
    await loadAllData();
  } catch (e) {
    alert('فشل التحديث: ' + e.message);
  }
}

async function deleteSupplier(id) {
  if (!confirm('حذف هذا المورد؟')) return;
  try {
    await deleteSupplierRow(id);
    // تحديث المنتجات التي كانت مرتبطة بهذا المورد
    const relatedProducts = S.products.filter(p => p.supplierId == id);
    for (const prod of relatedProducts) {
      await updateProductRow(prod.id, { supplierId: null });
    }
    await loadAllData();
  } catch (e) {
    alert('فشل الحذف: ' + e.message);
  }
}

function renderSuppList() {
  const container = document.getElementById('supp-list-cont');
  if (!S.suppliers.length) {
    container.innerHTML = '<p style="text-align:center;color:#aaa;padding:24px">لا يوجد موردون</p>';
    return;
  }
  container.innerHTML = S.suppliers.map(s => {
    const bal = getSuppBal(s.id);
    return `
      <div class="card supplier-card" style="cursor:pointer"
        data-id="${s.id}"
        data-name="${s.name.toLowerCase()}"
        data-phone="${(s.phone || '').toLowerCase()}"
        onclick="openSuppDetail(${s.id})">
        <div style="padding:10px 14px;display:flex;align-items:center;justify-content:space-between;background:#fef5ec;border-bottom:2px solid #f5cba7">
          <div style="display:flex;align-items:center;gap:9px">
            <span>🚛</span>
            <div>
              <div style="font-weight:800;color:var(--orange)">${s.name}</div>
              <div style="font-size:0.74rem;color:var(--gray)">${s.phone || 'لا يوجد هاتف'}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="text-align:left">
              <div style="font-size:0.74rem;color:var(--gray)">المستحق</div>
              <div style="font-weight:900;color:${bal > 0 ? 'var(--red)' : 'var(--green)'}">${N(bal)} جنيه</div>
            </div>
            <button class="btn btn-b btn-xs no-print" onclick="event.stopPropagation();updateSupplier(${s.id})">✏️</button>
            <button class="btn btn-r btn-xs no-print" onclick="event.stopPropagation();deleteSupplier(${s.id})">🗑️</button>
          </div>
        </div>
      </div>`;
  }).join('');
  filterSuppliersList();
}

function filterSuppliersList() {
  const keyword = document.getElementById('searchSupplierInput')?.value.trim().toLowerCase() || '';
  const cards = document.querySelectorAll('#supp-list-cont .supplier-card');
  cards.forEach(card => {
    const name = card.getAttribute('data-name') || '';
    const phone = card.getAttribute('data-phone') || '';
    card.style.display = (name.includes(keyword) || phone.includes(keyword)) ? '' : 'none';
  });
}

function openSuppDetail(id) {
  const s = S.suppliers.find(x => x.id == id);
  if (!s) return;
  document.getElementById('supp-list-view').style.display = 'none';
  document.getElementById('supp-detail-view').style.display = 'block';
  document.getElementById('sd-name').textContent = s.name;
  const bal = getSuppBal(id);
  document.getElementById('sd-bal').textContent = N(bal) + ' جنيه';
  let run = 0, html = '';
  const ledger = s.ledger || [];
  if (!ledger.length) {
    html = '<p style="text-align:center;color:#aaa;padding:24px">لا توجد حركات</p>';
  } else {
    html = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.83rem">
      <thead><tr style="background:#f0f7f0"><th>التاريخ</th><th>النوع</th><th>المبلغ</th><th>المستحق</th></td></thead>
      <tbody>`;
    ledger.forEach(e => {
      if (e.type === 'invoice') run += e.amount; else run -= e.amount;
      const isInv = e.type === 'invoice';
      html += `<tr>
        <td style="padding:6px 5px;font-size:0.78rem">${e.date}</td>
        <td style="padding:6px 5px">${isInv
          ? `<span style="background:#d6eaf8;color:var(--blue);border-radius:4px;padding:2px 6px;font-size:0.7rem;cursor:pointer" onclick="goToInvoice(${e.invId})">فاتورة ↗</span>`
          : `<span style="background:#fde8e8;color:var(--red);border-radius:4px;padding:2px 6px;font-size:0.7rem">خصم</span>`}</td>
        <td style="padding:6px 5px;font-weight:900;color:${isInv ? 'var(--green)' : 'var(--red)'}">${isInv ? '+' : '-'}${N(e.amount)} جنيه</td>
        <td style="padding:6px 5px;font-weight:900;color:${run > 0 ? 'var(--red)' : 'var(--green)'}">${N(run)} جنيه</td>
      </tr>`;
    });
    html += '</tbody></table></div>';
  }
  document.getElementById('sd-body').innerHTML = html;
}

function showSuppList() {
  document.getElementById('supp-list-view').style.display = 'block';
  document.getElementById('supp-detail-view').style.display = 'none';
}