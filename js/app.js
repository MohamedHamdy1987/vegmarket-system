// js/app.js
import { supabase, S, setCurrentUser, getCurrentUser, loadUserData, saveData } from './data.js';
import { fmtDate, N, showAlert, setSyncStatus } from './utils.js';
import { doLogin, doRegister, doLogout, switchAuthTab } from './auth.js';
import { renderBaqi } from './renderers/baqi.js';
import { renderNazilList, addProduct, delProduct, goToProduct } from './renderers/nazil.js';
import { renderSalesTable, confirmSale, saveEditSale, delSaleLine, openSaleForm, openEditSale, calcSF, closeDay, toggleProd } from './renderers/sales.js';
import { renderTarhil, goToTarhilDate } from './renderers/tarhil.js';
import { renderCustList, addCustomer, openCustDetail, showCustList, shareCustomerWhatsApp, filterCustomersList } from './renderers/customers.js';
import { renderSuppList, addSupplier, openSuppDetail, showSuppList, filterSuppliersList } from './renderers/suppliers.js';
import { renderInvoicesPage, generateInvoice, updateDed, delInvoice } from './renderers/invoices.js';
import { renderEmployees, addEmployee, openEmpDetail, showEmpList, addAbsence, delAbsence, addEmpPayment, delEmpPayment } from './renderers/employees.js';
import { renderPartners, addPartner, openPartDetail, showPartList, addPartAbsence, delPartAbsence, addPartPayment, delPartPayment, addPartProfit, delPartProfit } from './renderers/partners.js';
import { renderShops, addShop, openShopDetail, showShopList, showShopTab, calcShop, addShopLahu, delShopLahu } from './renderers/shops.js';
import { addCollection, renderCollections, delCollection, addExpense, renderExpenses, delExpense, renderDaySummary, showKTab } from './renderers/khazna.js';
import { selectPlan, updatePaymentDetails, payWithFawry, submitPayment, renderSubscriptionStatus } from './renderers/subscription.js';
import { loadAdminPayments, confirmPayment, rejectPayment, resetPayment, updateAdminTabVisibility } from './renderers/admin.js';

let xProd = null;
let saveTimer = null;

export function showPage(n, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + n).classList.add('active');
  if (btn) btn.classList.add('active');
  renderAll();
  if (n === 'admin') loadAdminPayments();
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
}

function refreshDropdowns() {
  const so = '<option value="">-- اختر --</option>' + S.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  const npSupplier = document.getElementById('np-supplier');
  if (npSupplier) npSupplier.innerHTML = so;
  const invSuppSel = document.getElementById('inv-supp-sel');
  if (invSuppSel) invSuppSel.innerHTML = so;
  const colCustSel = document.getElementById('col-cust-sel');
  if (colCustSel) colCustSel.innerHTML = '<option value="">-- اختر --</option>' + S.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const expSuppSel = document.getElementById('exp-supp-sel');
  if (expSuppSel) expSuppSel.innerHTML = '<option value="">-- بدون مورد --</option>' + S.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

export function showApp() {
  document.getElementById('app').style.display = 'block';
  document.getElementById('auth-screen').style.display = 'none';
  if (getCurrentUser()) {
    const user = getCurrentUser();
    document.getElementById('user-email-badge').textContent = user.email.split('@')[0];
    const meta = user.user_metadata;
    if (meta && meta.shop_name) document.getElementById('shop-name-header').textContent = meta.shop_name;
    checkTrial();
    updateAdminTabVisibility();
    renderSubscriptionStatus();
  }
  updateDates();
  renderAll();
}

export function showAuth() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

function updateDates() {
  const headerDate = document.getElementById('headerDate');
  if (headerDate) headerDate.textContent = S.date;
  const salesBadge = document.getElementById('sales-badge');
  if (salesBadge) salesBadge.textContent = S.date;
  const nazilBadge = document.getElementById('nazil-badge');
  if (nazilBadge) nazilBadge.textContent = S.date;
  const colBadge = document.getElementById('col-badge');
  if (colBadge) colBadge.textContent = S.date;
  const expBadge = document.getElementById('exp-badge');
  if (expBadge) expBadge.textContent = S.date;
  const tarhilBadge = document.getElementById('tarhil-badge');
  if (tarhilBadge) tarhilBadge.textContent = S.date;
}

function checkTrial() {
  const banner = document.getElementById('trial-banner');
  const text = document.getElementById('trial-text');
  const meta = getCurrentUser()?.user_metadata;
  if (meta && meta.subscription === 'trial') {
    const ends = new Date(meta.trial_ends || Date.now() + 14 * 24 * 60 * 60 * 1000);
    const days = Math.ceil((ends - Date.now()) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      banner.style.display = 'block';
      text.textContent = `متبقي ${days} يوم من التجربة المجانية`;
    }
  }
}

function changeDatePrompt() {
  const d = prompt('أدخل التاريخ:', S.date);
  if (d && d.trim()) {
    S.date = d.trim();
    saveData(document.getElementById('sync-bar'), document.getElementById('sync-text'));
    updateDates();
    renderAll();
  }
}

function showUserMenu() {
  const meta = getCurrentUser()?.user_metadata;
  document.getElementById('user-info').innerHTML = `<div><strong>المحل:</strong> ${meta?.shop_name || '-'}</div><div><strong>البريد:</strong> ${getCurrentUser()?.email || '-'}</div><div><strong>الاشتراك:</strong> ${meta?.subscription === 'trial' ? 'تجربة مجانية' : (meta?.subscription === 'active' ? 'مشترك' : 'منتهي')}</div>`;
  document.getElementById('user-modal').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ربط الدوال التي تستخدم في HTML بـ window
window.showPage = showPage;
window.showKTab = showKTab;
window.closeModal = closeModal;
window.showUserMenu = showUserMenu;
window.changeDatePrompt = changeDatePrompt;
window.doLogin = () => {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  doLogin(email, pass, document.getElementById('login-btn'));
};
window.doRegister = () => {
  const shop = document.getElementById('reg-shop').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  doRegister(shop, email, pass, pass2, document.getElementById('reg-btn'));
};
window.switchAuthTab = switchAuthTab;
window.doLogout = doLogout;
window.addProduct = addProduct;
window.delProduct = delProduct;
window.goToProduct = goToProduct;
window.toggleProd = toggleProd;
window.openSaleForm = openSaleForm;
window.openEditSale = openEditSale;
window.calcSF = calcSF;
window.confirmSale = confirmSale;
window.saveEditSale = saveEditSale;
window.delSaleLine = delSaleLine;
window.closeDay = closeDay;
window.addCustomer = addCustomer;
window.openCustDetail = openCustDetail;
window.showCustList = showCustList;
window.shareCustomerWhatsApp = shareCustomerWhatsApp;
window.filterCustomersList = filterCustomersList;
window.addSupplier = addSupplier;
window.openSuppDetail = openSuppDetail;
window.showSuppList = showSuppList;
window.filterSuppliersList = filterSuppliersList;
window.generateInvoice = generateInvoice;
window.updateDed = updateDed;
window.delInvoice = delInvoice;
window.addEmployee = addEmployee;
window.openEmpDetail = openEmpDetail;
window.showEmpList = showEmpList;
window.addAbsence = addAbsence;
window.delAbsence = delAbsence;
window.addEmpPayment = addEmpPayment;
window.delEmpPayment = delEmpPayment;
window.addPartner = addPartner;
window.openPartDetail = openPartDetail;
window.showPartList = showPartList;
window.addPartAbsence = addPartAbsence;
window.delPartAbsence = delPartAbsence;
window.addPartPayment = addPartPayment;
window.delPartPayment = delPartPayment;
window.addPartProfit = addPartProfit;
window.delPartProfit = delPartProfit;
window.addShop = addShop;
window.openShopDetail = openShopDetail;
window.showShopList = showShopList;
window.showShopTab = showShopTab;
window.calcShop = calcShop;
window.addShopLahu = addShopLahu;
window.delShopLahu = delShopLahu;
window.addCollection = addCollection;
window.delCollection = delCollection;
window.addExpense = addExpense;
window.delExpense = delExpense;
window.selectPlan = selectPlan;
window.updatePaymentDetails = updatePaymentDetails;
window.payWithFawry = payWithFawry;
window.submitPayment = submitPayment;
window.confirmPayment = confirmPayment;
window.rejectPayment = rejectPayment;
window.resetPayment = resetPayment;

async function init() {
  if (!S.employees) S.employees = [];
  if (!S.partners) S.partners = [];
  if (!S.shops) S.shops = [];
  if (!S.tarhilLog) S.tarhilLog = {};
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    setCurrentUser(session.user);
    await loadUserData();
    showApp();
  } else {
    showAuth();
  }
  document.getElementById('loading').style.display = 'none';
}

init();
