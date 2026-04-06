import { S, save } from './state.js';
import { N } from './utils.js';
import { renderAll, goToTarhilDate } from './ui.js';
import { shareCustomerWhatsApp as shareWA } from './utils.js'; // ستُنقل دالة المشاركة

export let currentCustomerId = null;

export function getCustBal(id) {
    const c = S.customers.find(x => x.id == id);
    if (!c) return 0;
    return c.ledger.reduce((s, e) => e.type === 'order' ? s + e.amount : (e.type === 'payment' || e.type === 'discount') ? s - e.amount : s, 0);
}

export function addCustomer() {
    const name = document.getElementById('nc-name').value.trim();
    const phone = document.getElementById('nc-phone').value.trim();
    const bal = parseFloat(document.getElementById('nc-balance').value) || 0;
    if (!name) return alert('أدخل اسم العميل');
    const cust = { id: Date.now(), name, phone, ledger: [] };
    if (bal > 0) cust.ledger.push({ date: S.date, type: 'order', amount: bal, ref: 'رصيد منقول من الدفاتر', isTarhil: false });
    S.customers.push(cust);
    document.getElementById('nc-name').value = '';
    document.getElementById('nc-phone').value = '';
    document.getElementById('nc-balance').value = '';
    save();
    renderAll();
}

export function openCustDetail(id) {
    currentCustomerId = id;
    const c = S.customers.find(x => x.id == id);
    if (!c) return;
    document.getElementById('cust-list-view').style.display = 'none';
    document.getElementById('cust-detail-view').style.display = 'block';
    document.getElementById('cd-name').textContent = c.name;
    const bal = getCustBal(id);
    document.getElementById('cd-bal').textContent = N(bal) + ' جنيه';
    const sorted = [...c.ledger].sort((a, b) => a.date.localeCompare(b.date));
    if (!sorted.length) { document.getElementById('cd-body').innerHTML = '<p style="text-align:center;color:#aaa;padding:24px">لا توجد حركات</p>'; return; }
    let run = 0, html = '';
    sorted.forEach(e => {
        const isOrd = e.type === 'order';
        if (isOrd) run += e.amount; else run -= e.amount;
        const ac = isOrd ? 'var(--blue)' : 'var(--red)';
        const bc = run > 0 ? 'var(--red)' : 'var(--green)';
        let lbl = '';
        if (isOrd && e.isTarhil) lbl = `<span style="color:#784212;font-weight:800;cursor:pointer;text-decoration:underline" onclick="window.goToTarhilDate('${e.tarhilDate}')">يومية ${e.date}</span>`;
        else if (isOrd) lbl = `<span style="color:#555">${e.ref || 'طلب'}</span>`;
        else lbl = `<span style="color:var(--red)">${e.type === 'discount' ? 'خصم — ' : 'دفعة — '}${e.ref || ''}</span>`;
        html += `<div style="display:flex;align-items:center;gap:7px;padding:7px 3px;border-bottom:1px solid #f0f0f0;font-size:0.84rem;flex-wrap:wrap">
                    <span style="font-weight:900;color:${ac};font-size:0.93rem;min-width:85px">${isOrd ? '+' : '-'}${N(e.amount)} جنيه</span>
                    <span style="flex:1;font-size:0.79rem">${lbl}</span>
                    <span style="font-weight:800;font-size:0.78rem;color:${bc}">باقي: ${N(run)}</span>
                 </div>${isOrd ? '<div style="border-bottom:1.5px dashed #ddd;margin:2px 0"></div>' : ''}`;
    });
    html += `<div class="netbox"><span>إجمالي الحساب</span><span>${N(bal)} جنيه</span></div>`;
    document.getElementById('cd-body').innerHTML = html;
}

export function editCustomer() {
    if (!currentCustomerId) return;
    const cust = S.customers.find(c => c.id == currentCustomerId);
    if (!cust) return;
    const newName = prompt('أدخل الاسم الجديد', cust.name);
    if (newName && newName.trim()) cust.name = newName.trim();
    const newPhone = prompt('أدخل رقم الهاتف الجديد', cust.phone || '');
    if (newPhone !== null) cust.phone = newPhone.trim();
    save();
    renderAll();
    openCustDetail(currentCustomerId);
}

export function deleteCustomer() {
    if (!currentCustomerId) return;
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف كل حركاته.')) return;
    S.customers = S.customers.filter(c => c.id !== currentCustomerId);
    save();
    showCustList();
    renderAll();
}

export function showCustList() {
    document.getElementById('cust-list-view').style.display = 'block';
    document.getElementById('cust-detail-view').style.display = 'none';
    currentCustomerId = null;
    renderCustList();
}

export function renderCustList() {
    const container = document.getElementById('cust-list-cont');
    if (!S.customers.length) { container.innerHTML = '<p style="text-align:center;color:#aaa;padding:24px">لا يوجد عملاء</p>'; return; }
    container.innerHTML = S.customers.map(cust => {
        const bal = getCustBal(cust.id);
        return `<div class="card customer-card" style="cursor:pointer" data-name="${cust.name.toLowerCase()}" data-phone="${(cust.phone || '').toLowerCase()}" onclick="window.openCustDetail(${cust.id})">
                    <div style="padding:10px 14px;display:flex;align-items:center;justify-content:space-between;background:var(--blue-light);border-bottom:2px solid #c5d8e8">
                        <div style="display:flex;align-items:center;gap:9px"><span>👤</span><div><div style="font-weight:800;color:var(--blue)">${cust.name}</div><div style="font-size:0.74rem;color:var(--gray)">${cust.phone || 'لا يوجد هاتف'}</div></div></div>
                        <div style="text-align:left"><div style="font-size:0.74rem;color:var(--gray)">الرصيد</div><div style="font-weight:900;color:${bal > 0 ? 'var(--red)' : 'var(--green)'}">${N(bal)} جنيه</div></div>
                    </div>
                </div>`;
    }).join('');
    const kw = document.getElementById('searchCustomerInput')?.value.trim().toLowerCase();
    if (kw) filterCustomersList();
}

export function filterCustomersList() {
    const kw = document.getElementById('searchCustomerInput').value.trim().toLowerCase();
    const cards = document.querySelectorAll('#cust-list-cont .customer-card');
    cards.forEach(card => {
        const name = card.getAttribute('data-name') || '';
        const phone = card.getAttribute('data-phone') || '';
        card.style.display = (name.includes(kw) || phone.includes(kw)) ? '' : 'none';
    });
}

export function shareCustomerWhatsApp() {
    const custName = document.getElementById('cd-name').textContent;
    const customer = S.customers.find(c => c.name === custName);
    if (!customer) return alert('لم يتم العثور على العميل');
    const entries = customer.ledger || [];
    if (entries.length === 0) return alert('لا توجد حركات لهذا العميل');
    let ledgerText = ''; let running = 0;
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach(e => {
        if (e.type === 'order') running += e.amount; else running -= e.amount;
        const typeDesc = e.type === 'order' ? 'فاتورة' : (e.type === 'discount' ? 'خصم' : 'دفعة');
        ledgerText += `${e.date} | ${typeDesc} | ${e.amount} ج | الرصيد: ${running} ج\n`;
    });
    const finalBalance = running;
    const status = finalBalance > 0 ? 'مدين' : (finalBalance < 0 ? 'دائن' : 'متزن');
    const shopName = currentUser?.user_metadata?.shop_name || 'المحل';
    let msg = `*بيان حساب العميل*\n🏢 ${shopName}\n👤 العميل: ${customer.name}\n📞 الهاتف: ${customer.phone || 'غير مسجل'}\n📅 التاريخ: ${S.date}\n━━━━━━━━━━━━━━━━━━━\n*الحركات:*\n${ledgerText}━━━━━━━━━━━━━━━━━━━\n💰 *الرصيد الحالي:* ${Math.abs(finalBalance)} ج\n📝 *الحالة:* ${status}\n━━━━━━━━━━━━━━━━━━━\n_تم إنشاء هذا التقرير آلياً من نظام إدارة المحل._`;
    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
                   }
