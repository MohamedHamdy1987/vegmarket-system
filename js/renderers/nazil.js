// renderers/nazil.js
import { S, saveData } from '../data.js';
import { renderAll } from '../app.js';
import { showToast } from '../utils.js';

export function addProduct() {
  const name = document.getElementById('np-name').value.trim();
  const qty = parseFloat(document.getElementById('np-qty').value);
  const unit = document.getElementById('np-unit').value;
  const noulon = parseFloat(document.getElementById('np-noulon').value) || 0;
  const mashal = parseFloat(document.getElementById('np-mashal').value) || 0;
  const supplierId = document.getElementById('np-supplier').value;
  if (!name || !qty) return showToast('أدخل الصنف والكمية', 'error');
  if (!supplierId) return showToast('اختر المورد', 'error');
  S.products.push({
    id: Date.now(),
    name,
    unit,
    noulon,
    mashal,
    supplierId,
    totalQty: qty,
    sold: 0,
    totalWeight: 0,
    salesLog: [],
    fromDate: S.date,
    carryoverFrom: null
  });
  ['np-name', 'np-qty', 'np-noulon', 'np-mashal'].forEach(id => document.getElementById(id).value = '');
  saveData();
  renderAll();
}

export function delProduct(i) {
  if (!confirm('حذف هذا الصنف؟')) return;
  S.products.splice(i, 1);
  if (window.xProd === i) window.xProd = null;
  saveData();
  renderAll();
}

export function goToProduct(idx) {
  window.xProd = idx;
  // تغيير الصفحة إلى sales
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-sales').classList.add('active');
  document.querySelectorAll('nav.tabs button')[2].classList.add('active');
  renderAll();
  setTimeout(() => {
    const r = document.getElementById('pr-' + idx);
    if (r) r.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 150);
}

export function renderNazilList() {
  const items = S.products.filter(p => !p.carryoverFrom);
  const container = document.getElementById('nazil-list');
  if (!container) return;
  if (!items.length) {
    container.innerHTML = '<p style="text-align:center;color:#aaa;padding:18px">لا توجد أصناف</p>';
    return;
  }
  container.innerHTML = items.map((p, i) => {
    const sup = S.suppliers.find(s => s.id == p.supplierId);
    const gi = S.products.indexOf(p);
    return `<div style="background:#fff;border:1.5px solid var(--border);border-radius:10px;margin-bottom:8px;overflow:hidden;">
      <div style="padding:10px 12px;display:flex;align-items:center;gap:8px;cursor:pointer;background:#e8f8f5;" onclick="window.goToProduct(${gi})">
        <div style="background:#0e6655;color:#fff;border-radius:50%;width:25px;height:25px;display:flex;align-items:center;justify-content:center;font-size:0.77rem;font-weight:900;">${i+1}</div>
        <div><div style="font-weight:800;font-size:0.93rem;color:#0e6655">${p.name}</div>
        <div style="font-size:0.74rem;color:var(--gray)">المورد: ${sup ? sup.name : '-'} | ${p.unit}</div></div>
        <div style="margin-right:auto;font-weight:900;color:#0e6655">${p.totalQty} ${p.unit}</div>
        <button class="btn btn-r btn-xs" onclick="event.stopPropagation();window.delProduct(${gi})">🗑️</button>
      </div>
    </div>`;
  }).join('');
}
