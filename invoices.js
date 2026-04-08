// ===================== renderers/invoices.js — فواتير الموردين =====================

function generateInvoice() {
  const id = document.getElementById('inv-supp-sel').value;
  if (!id) return alert('اختر مورداً');
  generateInvoiceFor(id, false);
}

function generateInvoiceFor(supplierId, auto) {
  const sup   = S.suppliers.find(s => s.id == supplierId);
  const prods = S.products.filter(p => p.supplierId == supplierId && p.salesLog.length > 0);
  if (!prods.length) { if (!auto) alert('لا توجد مبيعات لهذا المورد'); return; }

  const gross      = prods.reduce((s, p) => s + p.salesLog.reduce((ss, x) => ss + x.total, 0), 0);
  const noulon     = prods.reduce((s, p) => s + (p.noulon || 0), 0);
  const mashal     = prods.reduce((s, p) => s + (p.mashal || 0), 0);
  const commission = Math.round(gross * 0.07);
  const net        = gross - noulon - mashal - commission;

  const inv = {
    id: Date.now(), supplierId, supplierName: sup ? sup.name : '?', date: S.date,
    products: prods.map(p => ({
      name: p.name, unit: p.unit, sold: p.sold,
      totalWeight: p.totalWeight || 0,
      total: p.salesLog.reduce((s, x) => s + x.total, 0),
      dates: [...new Set(p.salesLog.map(x => x.date))]
    })),
    gross, ded_noulon: noulon, ded_commission: commission, ded_mashal: mashal, net
  };

  S.invoices.unshift(inv);
  if (sup && !sup.ledger.some(e => e.invId == inv.id)) {
    sup.ledger.push({
      date: S.date, type: 'invoice', amount: net,
      ref: prods.map(p => `${p.name} ${p.sold}${p.unit}`).join('+'),
      invId: inv.id
    });
  }
  save(); renderAll();
  if (auto) {
    const s2 = S.suppliers.find(s => s.id == supplierId);
    alert(`✅ فاتورة "${s2 ? s2.name : ''}" — الصافي: ${N(net)} جنيه`);
  }
}

function renderInvoicesPage() {
  const c = document.getElementById('invoices-cont');
  if (!S.invoices.length) { c.innerHTML = '<p style="text-align:center;color:#aaa;padding:32px">لا توجد فواتير</p>'; return; }
  c.innerHTML = S.invoices.map(inv => {
    const gross = inv.gross || inv.products.reduce((s, p) => s + p.total, 0);
    const n  = parseFloat(inv.ded_noulon)     || 0;
    const cm = parseFloat(inv.ded_commission) || 0;
    const m  = parseFloat(inv.ded_mashal)     || 0;
    const ded = n + cm + m, net = gross - ded;
    const rows = inv.products.map(p =>
      `<tr>
        <td style="padding:5px;font-weight:700">${p.name}</td>
        <td style="padding:5px">${p.unit}</td>
        <td style="padding:5px">${p.sold || 0}</td>
        <td style="padding:5px">${p.totalWeight > 0 ? p.totalWeight + ' ك' : '-'}</td>
        <td style="padding:5px;font-weight:900;color:var(--green)">${N(p.total)} جنيه</td>
      </tr>`).join('');
    return `<div class="card" id="inv-${inv.id}">
      <div class="ch g" style="justify-content:space-between">
        <div>
          <h2>🧾 فاتورة: ${inv.supplierName}</h2>
          <div style="font-size:0.76rem;color:var(--gray)">${inv.date}</div>
        </div>
        <div style="display:flex;gap:6px" class="no-print">
          <button class="btn btn-b btn-sm" onclick="window.print()">🖨️</button>
          <button class="btn btn-r btn-sm" onclick="delInvoice(${inv.id})">🗑️</button>
        </div>
      </div>
      <div class="cb">
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:0.83rem">
            <thead><tr style="background:#f0f7f0"><th>الصنف</th><th>الوحدة</th><th>المباع</th><th>الوزن</th><th>الإجمالي</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr style="background:#eafaf1;font-weight:900">
              <td colspan="4" style="text-align:right;padding:5px">إجمالي المبيعات</td>
              <td style="padding:5px">${N(gross)} جنيه</td>
            </tr></tfoot>
          </table>
        </div>
        <div style="background:#fef9e7;border:1.5px solid #f0d080;border-radius:9px;padding:11px;margin-top:9px">
          <div style="font-size:0.84rem;font-weight:800;color:#7a5c00;margin-bottom:7px">✂️ الخصومات</div>
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">
            <label style="font-size:0.79rem;font-weight:700;min-width:82px">النولون</label>
            <input type="number" value="${n}" min="0" style="width:95px" oninput="updateDed(${inv.id},'ded_noulon',this.value)">
            <span style="font-size:0.79rem">جنيه</span>
          </div>
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">
            <label style="font-size:0.79rem;font-weight:700;min-width:82px">العمولة (٧٪)</label>
            <input type="number" value="${cm}" min="0" style="width:95px" oninput="updateDed(${inv.id},'ded_commission',this.value)">
            <span style="font-size:0.78rem;color:var(--gray)">تلقائي</span>
          </div>
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">
            <label style="font-size:0.79rem;font-weight:700;min-width:82px">المشال</label>
            <input type="number" value="${m}" min="0" style="width:95px" oninput="updateDed(${inv.id},'ded_mashal',this.value)">
            <span style="font-size:0.79rem">جنيه</span>
          </div>
          <div style="font-size:0.83rem;color:#7a5c00">إجمالي الخصومات: <strong id="ded-${inv.id}">${N(ded)} جنيه</strong></div>
        </div>
        <div class="netbox">
          <span>💰 الصافي المستحق للمورد</span>
          <span id="net-${inv.id}">${N(net)} جنيه</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function updateDed(invId, field, val) {
  const inv = S.invoices.find(i => i.id == invId);
  if (!inv) return;
  inv[field] = parseFloat(val) || 0;
  const ded = (inv.ded_noulon || 0) + (inv.ded_commission || 0) + (inv.ded_mashal || 0);
  inv.net    = inv.gross - ded;
  const sup  = S.suppliers.find(s => s.id == inv.supplierId);
  if (sup) { const e = sup.ledger.find(e => e.invId == invId); if (e) e.amount = inv.net; }
  save();
  const dt = document.getElementById('ded-' + invId); if (dt) dt.textContent = N(ded) + ' جنيه';
  const nt = document.getElementById('net-' + invId); if (nt) nt.textContent = N(inv.net) + ' جنيه';
}

function delInvoice(id) {
  if (!confirm('حذف هذه الفاتورة؟')) return;
  const inv = S.invoices.find(i => i.id == id);
  if (inv) { const s = S.suppliers.find(s => s.id == inv.supplierId); if (s) s.ledger = s.ledger.filter(e => e.invId != id); }
  S.invoices = S.invoices.filter(i => i.id != id);
  save(); renderAll();
}

function goToInvoice(invId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-invoices').classList.add('active');
  document.querySelectorAll('nav.tabs button')[6].classList.add('active');
  renderInvoicesPage();
  setTimeout(() => {
    const el = document.getElementById('inv-' + invId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}
