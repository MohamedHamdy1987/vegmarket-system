import { S, currentUser, xProd, setXProd, save } from './state.js';
import { N, fmtDate } from './utils.js';
import { renderBaqi, renderNazilList, renderSalesTable, updateDayTotal, renderTarhil } from './sales.js';
import { renderCustList, renderSuppList } from './customers.js';
import { renderInvoicesPage } from './invoices.js';
import { renderCollections, renderExpenses, renderDaySummary } from './treasury.js';
import { renderEmployees } from './employees.js';
import { renderPartners } from './partners.js';
import { renderShops } from './shops.js';
import { loadAdminPayments } from './admin.js';
import { renderSubscriptionStatus } from './subscription.js';

export function updateDates() {
    const ids = ['headerDate', 'sales-badge', 'nazil-badge', 'col-badge', 'exp-badge', 'tarhil-badge'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = S.date; });
}

export function updateCountBadges() {
    const custBadge = document.getElementById('custCountBadge');
    if (custBadge) custBadge.textContent = S.customers.length;
    const suppBadge = document.getElementById('suppCountBadge');
    if (suppBadge) suppBadge.textContent = S.suppliers.length;
}

export function refreshDropdowns() {
    const so = '<option value="">-- اختر --</option>' + S.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    const npSupp = document.getElementById('np-supplier');
    if (npSupp) npSupp.innerHTML = so;
    const invSupp = document.getElementById('inv-supp-sel');
    if (invSupp) invSupp.innerHTML = so;
    const colCust = document.getElementById('col-cust-sel');
    if (colCust) colCust.innerHTML = '<option value="">-- اختر --</option>' + S.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const expSupp = document.getElementById('exp-supp-sel');
    if (expSupp) expSupp.innerHTML = '<option value="">-- بدون مورد --</option>' + S.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

export function showPage(pageName, btnElement = null) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
    const page = document.getElementById('page-' + pageName);
    if (page) page.classList.add('active');
    if (btnElement) btnElement.classList.add('active');
    renderAll();
    if (pageName === 'admin') loadAdminPayments();
    if (pageName === 'subscription') renderSubscriptionStatus();
}

export function showKTab(tab, btn) {
    const colDiv = document.getElementById('ks-col');
    const expDiv = document.getElementById('ks-exp');
    if (colDiv) colDiv.style.display = tab === 'col' ? 'block' : 'none';
    if (expDiv) expDiv.style.display = tab === 'exp' ? 'block' : 'none';
}

export function renderAll() {
    refreshDropdowns();
    renderBaqi();
    renderNazilList();
    renderSalesTable();
    renderTarhil();
    renderCustList();
    renderSuppList();
    renderInvoicesPage();
    renderCollections();
    renderExpenses();
    renderDaySummary();
    renderEmployees();
    renderPartners();
    renderShops();
    updateCountBadges();
    updateDates();
}

export function changeDatePrompt() {
    const d = prompt('أدخل التاريخ:', S.date);
    if (d && d.trim()) { S.date = d.trim(); save(); updateDates(); renderAll(); }
}

export function showUserMenu() {
    const meta = currentUser?.user_metadata;
    const infoDiv = document.getElementById('user-info');
    if (infoDiv) {
        infoDiv.innerHTML = `<div><strong>المحل:</strong> ${meta?.shop_name || '-'}</div>
                             <div><strong>البريد:</strong> ${currentUser?.email || '-'}</div>
                             <div><strong>الاشتراك:</strong> ${meta?.subscription === 'trial' ? 'تجربة مجانية' : (meta?.subscription === 'active' ? 'مشترك' : 'منتهي')}</div>`;
    }
    const modal = document.getElementById('user-modal');
    if (modal) modal.classList.add('open');
}

export function checkTrial() {
    if (!currentUser) return;
    const banner = document.getElementById('trial-banner');
    const text = document.getElementById('trial-text');
    const meta = currentUser.user_metadata;
    if (meta && meta.subscription === 'trial') {
        const ends = new Date(meta.trial_ends || Date.now() + 14 * 24 * 60 * 60 * 1000);
        const days = Math.ceil((ends - Date.now()) / (1000 * 60 * 60 * 24));
        if (days > 0) { if (banner) banner.style.display = 'block'; if (text) text.textContent = `متبقي ${days} يوم من التجربة المجانية`; }
        else if (banner) banner.style.display = 'none';
    } else { if (banner) banner.style.display = 'none'; }
}

export function updateAdminTabVisibility() {
    const isAdmin = currentUser?.user_metadata?.role === 'admin';
    const adminTab = document.getElementById('adminTabBtn');
    if (adminTab) adminTab.style.display = isAdmin ? 'inline-block' : 'none';
    if (isAdmin) loadAdminPayments();
}
