// ===================== renderers/nazil.js =====================

async function addProduct() {
  const name = document.getElementById('np-name').value.trim();
  const qty = parseFloat(document.getElementById('np-qty').value);
  const unit = document.getElementById('np-unit').value;
  const noulon = parseFloat(document.getElementById('np-noulon').value) || 0;
  const mashal = parseFloat(document.getElementById('np-mashal').value) || 0;
  const supplierId = document.getElementById('np-supplier').value;

  if (!name || !qty) return alert('أدخل الصنف والكمية');
  if (!supplierId) return alert('اختر المورد');

  const newProduct = {
    name, unit, noulon, mashal, supplierId: parseInt(supplierId),
    totalQty: qty, sold: 0, totalWeight: 0,
    salesLog: [], fromDate: S.date, carryoverFrom: null,
    created_at: new Date().toISOString()
  };

  try {
    await insertProduct(newProduct);
    document.getElementById('np-name').value = '';
    document.getElementById('np-qty').value = '';
    document.getElementById('np-noulon').value = '';
    document.getElementById('np-mashal').value = '';
    await loadAllData();
  } catch (e) {
    alert('فشل الإضافة: ' + e.message);
  }
}

async function updateProduct(id) {
  const prod = S.products.find(p => p.id == id);
  if (!prod) return;
  const newName = prompt('اسم المنتج الجديد', prod.name);
  if (!newName || newName === prod.name) return;
  try {
    await updateProductRow(id, { name: newName });
    await loadAllData();
  } catch (e) {
    alert('فشل التحديث: ' + e.message);
  }
}

async function deleteProduct(id) {
  if (!confirm('حذف هذا المنتج وكل مبيعاته؟')) return;
  try {
    await deleteProductRow(id);
    await loadAllData();
  } catch (e) {
    alert('فشل الحذف: ' + e.message);
  }
}

function renderNazilList() {
  const items = S.products.filter(p => !p.carryoverFrom);
  const container = document.getElementById('nazil-list');
  if (!items.length) {
    container.innerHTML = '<p style="text-align:center;color:#aaa;padding:18px">لا توجد أصناف</p>';
    return;
  }
  container.innerHTML = items.map((p, i) => {
    const sup = S.suppliers.find(s => s.id == p.supplierId);
    const prodId = p.id;
    return `
      <div style="background:#fff;border:1.5px solid var(--border);border-radius:10px;margin-bottom:8px;overflow:hidden;">
        <div style="padding:10px 12px;display:flex;align-items:center;gap:8px;cursor:pointer;background:#e8f8f5;" onclick="goToProductById(${prodId})">
          <div style="background:#0e6655;color:#fff;border-radius:50%;width:25px;height:25px;display:flex;align-items:center;justify-content:center;font-size:0.77rem;font-weight:900;">${i + 1}</div>
          <div>
            <div style="font-weight:800;font-size:0.93rem;color:#0e6655">${p.name}</div>
            <div style="font-size:0.74rem;color:var(--gray)">المورد: ${sup ? sup.name : '-'} | ${p.unit}</div>
          </div>
          <div style="margin-right:auto;font-weight:900;color:#0e6655">${p.totalQty} ${p.unit}</div>
          <button class="btn btn-b btn-xs" onclick="event.stopPropagation();updateProduct(${p.id})">✏️</button>
          <button class="btn btn-r btn-xs" onclick="event.stopPropagation();deleteProduct(${p.id})">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

// دالة مساعدة للانتقال إلى منتج معين في صفحة المبيعات
function goToProductById(productId) {
  const index = S.products.findIndex(p => p.id == productId);
  if (index !== -1) {
    xProd = index;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
    document.getElementById('page-sales').classList.add('active');
    document.querySelectorAll('nav.tabs button')[3].classList.add('active');
    renderAll();
    setTimeout(() => {
      const row = document.getElementById('pr-' + index);
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }
}