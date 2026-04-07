// renderers/sales.js
import { S, saveData } from '../data.js';
import { N, showToast } from '../utils.js';
import { renderAll } from '../app.js';
import { addToTarhil, postDailyTotal, checkAutoInvoice } from './tarhil.js';
import { renderCollections } from './khazna.js';

export let xProd = null;

export function setXProd(val) { xProd = val; }
export function getXProd() { return xProd; }

export function toggleProd(i) {
  xProd = xProd === i ? null : i;
  renderSalesTable();
}

export function updateDayTotal() {
  const total = S.products.reduce((s, p) => s + p.salesLog.reduce((ss, x) => ss + x.total, 0), 0);
  const el = document.getElementById('day-total');
  if (el) el.textContent = N(total) + ' جنيه';
}

export function renderSalesTable() {
  const tbody = document.getElementById('sales-tbody');
  if (!tbody) return;
  if (!S.products.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="color:#aaa;padding:22px;text-align:center">لا توجد أصناف</td></tr>';
    updateDayTotal();
    return;
  }
  let html = '';
  S.products.forEach((p, i) => {
    const rem = p.totalQty - p.sold;
    const sup = S.suppliers.find(s => s.id == p.supplierId);
    const done = rem <= 0;
    const tot = p.salesLog.reduce((s, x) => s + x.total, 0);
    const isX = xProd === i;
    html += `<tr style="cursor:pointer;${isX ? 'background:#eafaf1;font-weight:700;' : ''}" id="pr-${i}" onclick="window.toggleProd(${i})">
      <td style="padding:6px 5px;text-align:center;font-size:0.76rem;color:var(--gray)">${i+1}</td>
      <td style="padding:6px 5px;text-align:center"><strong style="color:var(--orange);font-size:0.79rem">${sup ? sup.name : '-'}</strong></td>
      <td style="padding:6px 5px;text-align:center"><strong>${p.name}</strong></td>
      <td style="padding:6px 5px;text-align:center">${p.totalQty}</td>
      <td style="padding:6px 5px;text-align:center;color:var(--green);font-weight:800">${p.sold}</td>
      <td style="padding:6px 5px;text-align:center;color:${done ? 'var(--red)' : 'var(--blue)'};font-weight:800">${rem}${done ? ' ✅' : ''}</td>
      <td style="padding:6px 5px;text-align:center;font-weight:900;color:var(--green)">${N(tot)} جنيه</td>
      <td style="padding:6px 5px;text-align:center">${isX ? '▲' : '▼'}</td>
      <td style="padding:6px 5px;" onclick="event.stopPropagation()"><button class="btn btn-r btn-xs" onclick="window.delProduct(${i})">🗑️</button></td>
    </tr>`;
    if (isX) {
      html += `<tr style="background:#f8fff8"><td colspan="9" style="padding:0"><div style="padding:8px 12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;">
          <strong style="color:var(--green);font-size:0.86rem">مبيعات ${p.name}</strong>
          <button class="btn btn-g btn-sm" onclick="event.stopPropagation();window.openSaleForm(${i})">+ بيعة</button>
        </div>`;
      if (p.salesLog.length) {
        html += `<table style="width:100%;border-collapse:collapse;font-size:0.79rem"><thead><tr style="background:#e8f8ee"><th>عدد</th><th>العميل</th><th>وزن(ك)</th><th>سعر</th><th>المبلغ</th><th>✏️</th><th>🗑️</th></tr></thead><tbody>`;
        p.salesLog.forEach((sl, si) => {
          const cust = S.customers.find(c => c.id == sl.custId);
          const isCash = !sl.custId;
          html += `<tr>
            <td style="padding:4px 5px">${sl.qty || '-'}</td>
            <td style="padding:4px 5px;font-weight:700">${isCash ? '<span style="background:#d5f5e3;color:var(--green);border-radius:4px;padding:1px 5px;font-size:0.69rem">نقدي</span>' : (cust ? cust.name : '-')}</td>
            <td style="padding:4px 5px">${sl.weight || '-'}</td>
            <td style="padding:4px 5px">${sl.price} جنيه</td>
            <td style="padding:4px 5px;font-weight:900;color:var(--green)">${N(sl.total)} جنيه</td>
            <td style="padding:4px 5px"><button class="btn btn-y btn-xs" style="background:var(--yellow,#d4ac0d);color:#fff;" onclick="event.stopPropagation();window.openEditSale(${i},${si})">✏️</button></td>
            <td style="padding:4px 5px"><button class="btn btn-r btn-xs" onclick="event.stopPropagation();window.delSaleLine(${i},${si})">🗑️</button></td>
          </tr>`;
        });
        html += `</tbody><tfoot><tr style="background:#eafaf1;font-weight:900"><td colspan="4" style="text-align:right;padding:5px">الإجمالي</td><td style="padding:5px;color:var(--green)">${N(tot)} جنيه</td><td colspan="2"></td></tr></tfoot></table>`;
      } else {
        html += '<p style="color:#aaa;text-align:center;padding:10px">لا توجد مبيعات</p>';
      }
      html += `<div id="sf-${i}"></div></div></td></tr>`;
    }
  });
  tbody.innerHTML = html;
  updateDayTotal();
}

export function openSaleForm(i) {
  const d = document.getElementById('sf-' + i);
  if (!d) return;
  if (d.innerHTML.trim()) { d.innerHTML = ''; return; }
  d.innerHTML = buildSaleForm(i, null);
}

export function openEditSale(pi, si) {
  const d = document.getElementById('sf-' + pi);
  if (!d) return;
  d.innerHTML = buildSaleForm(pi, si);
}

function buildSaleForm(pi, editIdx) {
  const p = S.products[pi];
  const sl = editIdx !== null ? p.salesLog[editIdx] : null;
  const custOpts = '<option value="">نقدي</option>' + S.customers.map(c => `<option value="${c.id}" ${sl && sl.custId == c.id ? 'selected' : ''}>${c.name}</option>`).join('');
  return `<div style="background:#f0faf5;border-radius:8px;padding:10px;margin-top:8px;border:1.5px solid var(--border)">
    <div style="font-weight:800;color:var(--green);margin-bottom:7px;font-size:0.85rem">${editIdx !== null ? '✏️ تعديل' : '+ بيعة جديدة'}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(75px,1fr));gap:6px;margin-bottom:7px">
      <div><label class="lbl">عدد</label><input type="number" id="sf-qty-${pi}" value="${sl && sl.qty || ''}" placeholder="0" min="0" oninput="window.calcSF(${pi})"></div>
      <div><label class="lbl">العميل</label><select id="sf-cust-${pi}">${custOpts}</select></div>
      <div><label class="lbl">وزن(ك)</label><input type="number" id="sf-wt-${pi}" value="${sl && sl.weight || ''}" placeholder="0" step="0.01" min="0" oninput="window.calcSF(${pi})"></div>
      <div><label class="lbl">سعر</label><input type="number" id="sf-price-${pi}" value="${sl ? sl.price : ''}" placeholder="0" min="0" oninput="window.calcSF(${pi})"></div>
      <div><label class="lbl">المبلغ</label><input type="number" id="sf-tot-${pi}" readonly placeholder="0" value="${sl ? sl.total : ''}"></div>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn btn-g btn-sm" onclick="${editIdx !== null ? `window.saveEditSale(${pi},${editIdx})` : `window.confirmSale(${pi})`}">✅ ${editIdx !== null ? 'حفظ' : 'تأكيد'}</button>
      <button class="btn btn-gr btn-sm" onclick="document.getElementById('sf-${pi}').innerHTML=''">إلغاء</button>
    </div>
  </div>`;
}

export function calcSF(i) {
  const qty = parseFloat(document.getElementById(`sf-qty-${i}`).value) || 0;
  const wt = parseFloat(document.getElementById(`sf-wt-${i}`).value) || 0;
  const price = parseFloat(document.getElementById(`sf-price-${i}`).value) || 0;
  const tot = (wt > 0 ? wt : qty) * price;
  document.getElementById(`sf-tot-${i}`).value = tot || '';
}

export function confirmSale(i) {
  const p = S.products[i];
  const qty = parseFloat(document.getElementById(`sf-qty-${i}`).value) || 0;
  const wt = parseFloat(document.getElementById(`sf-wt-${i}`).value) || 0;
  const price = parseFloat(document.getElementById(`sf-price-${i}`).value) || 0;
  const custId = document.getElementById(`sf-cust-${i}`).value;
  const units = wt > 0 ? wt : qty;
  if (!units || !price) return showToast('أدخل الكمية والسعر', 'error');
  if (qty > 0 && qty > (p.totalQty - p.sold)) return showToast('الكمية أكبر من المتبقي!', 'error');
  const total = units * price;
  const isCash = !custId;
  const colId = isCash ? (Date.now() + Math.random()) : null;
  S.products[i].sold += qty || 0;
  S.products[i].totalWeight = (p.totalWeight || 0) + (wt || 0);
  S.products[i].salesLog.push({
    date: S.date,
    qty: qty || null,
    weight: wt || null,
    price,
    total,
    custId,
    collectionId: colId
  });
  if (isCash) {
    S.collections.push({
      id: colId,
      date: S.date,
      custId: null,
      amount: total,
      note: `نقدية — ${p.name} ${qty || wt} ${qty ? p.unit : 'ك'} × ${price}`,
      isCash: true,
      isDiscount: false
    });
  } else {
    addToTarhil(custId, p.name, qty || null, p.unit, wt || null, price, total);
    postDailyTotal(custId, S.date);
  }
  saveData();
  renderAll();
  checkAutoInvoice(p.supplierId);
}

export function saveEditSale(pi, si) {
  const p = S.products[pi];
  const old = p.salesLog[si];
  if (old.custId) window.removeFromTarhil(old.custId, old.date, old.total);
  if (!old.custId && old.collectionId) S.collections = S.collections.filter(c => c.id !== old.collectionId);
  S.products[pi].sold -= (old.qty || 0);
  S.products[pi].totalWeight = (p.totalWeight || 0) - (old.weight || 0);
  const qty = parseFloat(document.getElementById(`sf-qty-${pi}`).value) || 0;
  const wt = parseFloat(document.getElementById(`sf-wt-${pi}`).value) || 0;
  const price = parseFloat(document.getElementById(`sf-price-${pi}`).value) || 0;
  const custId = document.getElementById(`sf-cust-${pi}`).value;
  const units = wt > 0 ? wt : qty;
  if (!units || !price) return showToast('أدخل الكمية والسعر', 'error');
  const total = units * price;
  const isCash = !custId;
  const colId = isCash ? (Date.now() + Math.random()) : null;
  p.salesLog[si] = {
    date: S.date,
    qty: qty || null,
    weight: wt || null,
    price,
    total,
    custId,
    collectionId: colId
  };
  S.products[pi].sold += qty || 0;
  S.products[pi].totalWeight = (p.totalWeight || 0) + (wt || 0);
  if (isCash) {
    S.collections.push({
      id: colId,
      date: S.date,
      custId: null,
      amount: total,
      note: `نقدية — ${p.name}`,
      isCash: true,
      isDiscount: false
    });
  } else {
    window.addToTarhil(custId, p.name, qty || null, p.unit, wt || null, price, total);
    window.postDailyTotal(custId, S.date);
  }
  saveData();
  renderAll();
}

export function delSaleLine(pi, si) {
  const p = S.products[pi];
  const sl = p.salesLog[si];
  if (sl.custId) window.removeFromTarhil(sl.custId, sl.date, sl.total);
  if (!sl.custId && sl.collectionId) S.collections = S.collections.filter(c => c.id !== sl.collectionId);
  p.sold -= (sl.qty || 0);
  p.totalWeight = (p.totalWeight || 0) - (sl.weight || 0);
  p.salesLog.splice(si, 1);
  saveData();
  renderAll();
}

export function closeDay() {
  const rem = S.products.filter(p => (p.totalQty - p.sold) > 0);
  if (!rem.length) {
    showToast('لا توجد بضاعة للترحيل!', 'error');
    return;
  }
  if (!confirm(`ترحيل ${rem.length} صنف للغد؟`)) return;
  S.products = S.products.map(p => {
    if ((p.totalQty - p.sold) <= 0) return null;
    return { ...p, totalQty: p.totalQty - p.sold, sold: 0, salesLog: [], carryoverFrom: S.date };
  }).filter(Boolean);
  window.xProd = null;
  const nd = new Date();
  nd.setDate(nd.getDate() + 1);
  S.date = fmtDate(nd);
  saveData();
  window.updateDates();
  renderAll();
  showToast('✅ تم إغلاق اليوم!');
}
