// ===================== renderers/subscription.js — الاشتراك (نسخة سحابية) =====================

let selectedPlan = null;
const planAmount = { monthly: 750, yearly: 6000 };

function selectPlan(plan) {
  selectedPlan = plan;
  document.getElementById('payment-form').style.display = 'block';
  updatePaymentDetails();
}

function updatePaymentDetails() {
  const method = document.getElementById('payment-method').value;
  const detailsDiv = document.getElementById('payment-details');
  let html = '';

  if (method === 'vodafone') {
    html = `
      <div class="frow"><label>📱 رقم فودافون كاش</label><input type="text" id="phone" placeholder="01xxxxxxxxx"></div>
      <div class="frow"><label>🔢 رقم العملية</label><input type="text" id="trans_id" placeholder="رقم العملية"></div>
      <div style="background:#fef9e7;padding:10px;border-radius:8px;">⚠️ يرجى تحويل المبلغ إلى 0123456789 (محل الخضار)</div>`;
  } else if (method === 'instapay') {
    html = `
      <div class="frow"><label>🏦 رقم IBAN</label><input type="text" id="iban" placeholder="EG..."></div>
      <div class="frow"><label>🔢 رقم العملية</label><input type="text" id="trans_id" placeholder="رقم العملية"></div>
      <div style="background:#fef9e7;padding:10px;border-radius:8px;">⚠️ التحويل إلى EG123456789 بنك مصر</div>`;
  } else if (method === 'bank') {
    html = `
      <div class="frow"><label>🏦 اسم البنك</label><input type="text" id="bank_name" placeholder="بنك مصر"></div>
      <div class="frow"><label>🔢 رقم الحساب</label><input type="text" id="account_no" placeholder="رقم الحساب"></div>
      <div class="frow"><label>🔢 رقم العملية</label><input type="text" id="trans_id" placeholder="رقم العملية"></div>
      <div style="background:#fef9e7;padding:10px;border-radius:8px;">⚠️ بنك مصر، حساب: 123456789</div>`;
  } else if (method === 'fawry') {
    html = `
      <div class="frow"><label>📱 رقم الهاتف</label><input type="text" id="phone" placeholder="01xxxxxxxxx"></div>
      <div class="frow"><label>🔢 كود الدفع</label><input type="text" id="fawry_code" placeholder="الكود"></div>
      <button class="btn btn-b" onclick="payWithFawry()">💳 الدفع عبر فوري</button>`;
  }
  detailsDiv.innerHTML = html;
}

function payWithFawry() {
  alert('🚧 بوابة فوري قيد التطوير');
}

async function submitPayment() {
  if (!selectedPlan) return alert('اختر باقة أولاً');
  const method = document.getElementById('payment-method').value;
  const amount = planAmount[selectedPlan];
  const transactionId = document.getElementById('trans_id')?.value || '';
  let additionalData = {};

  if (method === 'vodafone') additionalData.phone = document.getElementById('phone')?.value;
  else if (method === 'instapay') additionalData.iban = document.getElementById('iban')?.value;
  else if (method === 'bank') {
    additionalData.bank_name = document.getElementById('bank_name')?.value;
    additionalData.account_no = document.getElementById('account_no')?.value;
  }

  if (!transactionId && method !== 'fawry') return alert('أدخل رقم العملية');

  try {
    const { error } = await sb.from('payments').insert({
      user_id: currentUser.id, amount, method,
      transaction_id: transactionId,
      notes: JSON.stringify(additionalData),
      status: 'pending'
    });
    if (error) throw error;
    alert('✅ تم إرسال طلب الدفع بنجاح');
    document.getElementById('payment-form').style.display = 'none';
    renderSubscriptionStatus();
  } catch (e) { alert('فشل الإرسال: ' + e.message); }
}

function renderSubscriptionStatus() {
  const meta = currentUser?.user_metadata;
  const div = document.getElementById('sub-status');
  if (!div) return;

  if (meta?.subscription === 'active') {
    const ends = new Date(meta.subscription_ends);
    div.innerHTML = `<div style="background:#e8f5e9;padding:12px;border-radius:8px;">✅ اشتراكك نشط حتى ${ends.toLocaleDateString('ar-EG')}</div>`;
  } else if (meta?.subscription === 'trial') {
    const ends = new Date(meta.trial_ends);
    const daysLeft = Math.ceil((ends - new Date()) / (1000 * 60 * 60 * 24));
    div.innerHTML = `<div style="background:#fff3e0;padding:12px;border-radius:8px;">⏳ تجربة مجانية: متبقي ${daysLeft} يوم.
      <a href="#" onclick="document.getElementById('payment-form').scrollIntoView();">اشترك الآن</a></div>`;
  } else {
    div.innerHTML = `<div style="background:#ffebee;padding:12px;border-radius:8px;">⚠️ اشتراكك منتهٍ. يرجى تجديد الاشتراك.</div>`;
  }
}