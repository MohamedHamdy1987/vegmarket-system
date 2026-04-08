// ===================== renderers/admin.js — لوحة تحكم المشرف =====================

function updateAdminTabVisibility() {
  const isAdmin  = currentUser?.user_metadata?.role === 'admin';
  const adminTab = document.getElementById('adminTabBtn');
  if (adminTab) adminTab.style.display = isAdmin ? 'inline-block' : 'none';
  if (isAdmin) loadAdminPayments();
}

async function loadAdminPayments() {
  const container = document.getElementById('admin-payments-list');
  if (!container) return;
  container.innerHTML = 'جاري التحميل...';

  const { data, error } = await sb.from('payments')
    .select('*, users:user_id(email)')
    .order('created_at', { ascending: false });

  if (error) { container.innerHTML = 'خطأ في التحميل'; console.error(error); return; }
  if (!data || data.length === 0) { container.innerHTML = '<p>لا توجد طلبات دفع حالياً</p>'; return; }

  const methodNames = { vodafone: 'فودافون كاش', instapay: 'إنستاباي', bank: 'تحويل بنكي', fawry: 'فوري' };

  let html = `<div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:8px">المستخدم</th>
          <th style="padding:8px">المبلغ</th>
          <th style="padding:8px">الطريقة</th>
          <th style="padding:8px">رقم العملية</th>
          <th style="padding:8px">التفاصيل</th>
          <th style="padding:8px">الحالة</th>
          <th style="padding:8px">الإجراء</th>
        </tr>
      </thead>
      <tbody>`;

  for (const p of data) {
    const userEmail = p.users?.email || p.user_id;
    let details = '';
    try { details = Object.values(JSON.parse(p.notes || '{}')).join(' | '); } catch (e) { details = p.notes || ''; }

    const statusMap   = { pending: 'قيد المراجعة', confirmed: 'مؤكد', rejected: 'مرفوض' };
    const statusText  = statusMap[p.status] || p.status;
    const actionBtns  = p.status === 'pending'
      ? `<button class="btn btn-success btn-sm" onclick="confirmPayment('${p.id}',${p.amount},'${p.user_id}')">تأكيد</button>
         <button class="btn btn-danger btn-sm"  onclick="rejectPayment('${p.id}')">رفض</button>`
      : `<button class="btn btn-warning btn-sm" onclick="resetPayment('${p.id}')">إعادة للمراجعة</button>`;

    html += `<tr>
      <td style="padding:8px">${userEmail}</td>
      <td style="padding:8px">${p.amount} جنيه</td>
      <td style="padding:8px">${methodNames[p.method] || p.method}</td>
      <td style="padding:8px">${p.transaction_id || '-'}</td>
      <td style="padding:8px;font-size:12px;">${details}</td>
      <td style="padding:8px"><span style="display:inline-block;padding:2px 8px;border-radius:4px;background:#f0f0f0;">${statusText}</span></td>
      <td style="padding:8px">${actionBtns}</td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

async function confirmPayment(paymentId, amount, userId) {
  await sb.from('payments').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('id', paymentId);
  alert('✅ تم تأكيد الدفع');
  loadAdminPayments();
}

async function rejectPayment(paymentId) {
  await sb.from('payments').update({ status: 'rejected' }).eq('id', paymentId);
  loadAdminPayments();
}

async function resetPayment(paymentId) {
  await sb.from('payments').update({ status: 'pending', confirmed_at: null }).eq('id', paymentId);
  loadAdminPayments();
}
