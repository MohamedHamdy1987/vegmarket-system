// app.js
import { supabase, S, setCurrentUser, getCurrentUser, loadUserData, saveData } from './data.js';
import { fmtDate, N, showAlert, setSyncStatus } from './utils.js';
import { doLogin, doRegister, doLogout, switchAuthTab } from './auth.js';
// استيراد كل الريندررز
import { renderBaqi } from './renderers/baqi.js';
import { renderNazilList, addProduct } from './renderers/nazil.js';
import { renderSalesTable, confirmSale, closeDay } from './renderers/sales.js';
import { renderTarhil } from './renderers/tarhil.js';
import { renderCustList, addCustomer, openCustDetail, shareCustomerWhatsApp } from './renderers/customers.js';
// ... باقي الاستيرادات

let xProd = null;
let saveTimer = null;

export function showPage(n, btn) { /* ... */ }
export function renderAll() { /* تستدعي كل دوال الريندر */ }
export function showApp() { /* ... */ }
export function showAuth() { /* ... */ }

// تهيئة التطبيق
async function init() {
  // نفس الكود القديم
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    setCurrentUser(session.user);
    await loadUserData();
    showApp();
  } else showAuth();
  document.getElementById('loading').style.display = 'none';
}

// ربط الدوال بالـ window للوصول إليها من onClick في HTML
window.showPage = showPage;
window.doLogin = () => { /* استدعاء doLogin مع قيم من DOM */ };
// ... إلخ

init();
