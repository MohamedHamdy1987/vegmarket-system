// auth.js
import { sb, setCurrentUser, getCurrentUser, S, loadUserData, saveData } from './data.js';
import { fmtDate, showAlert, showToast, getDomElement } from './utils.js';
import { showApp, showAuth, renderAll, updateAdminTabVisibility, renderSubscriptionStatus, checkTrial } from './app.js';

export function switchAuthTab(tab) {
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('auth-err').classList.remove('show');
}

function showAuthErr(msg) {
  const el = document.getElementById('auth-err');
  el.textContent = msg;
  el.classList.add('show');
}

export async function doLogin() {
  const email = getDomElement('login-email').value.trim();
  const pass = getDomElement('login-pass').value;
  if (!email || !pass) return showAuthErr('أدخل البريد وكلمة المرور');
  const btn = getDomElement('login-btn');
  btn.disabled = true;
  btn.textContent = 'جاري الدخول...';
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    setCurrentUser(data.user);
    await loadUserData();
    showApp();
  } catch(e) {
    showAuthErr('خطأ في البريد أو كلمة المرور');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔑 دخول';
  }
}

export async function doRegister() {
  const shop = getDomElement('reg-shop').value.trim();
  const email = getDomElement('reg-email').value.trim();
  const pass = getDomElement('reg-pass').value;
  const pass2 = getDomElement('reg-pass2').value;
  if (!shop || !email || !pass) return showAuthErr('أكمل جميع البيانات');
  if (pass !== pass2) return showAuthErr('كلمة المرور غير متطابقة');
  if (pass.length < 8) return showAuthErr('كلمة المرور أقل من ٨ أحرف');
  const btn = getDomElement('reg-btn');
  btn.disabled = true;
  btn.textContent = 'جاري الإنشاء...';
  try {
    const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await sb.auth.signUp({
      email,
      password: pass,
      options: { data: { shop_name: shop, subscription: 'trial', trial_ends: trialEnds } }
    });
    if (error) throw error;
    setCurrentUser(data.user);
    getDomElement('shop-name-header').textContent = shop;
    await saveData();
    showApp();
  } catch(e) {
    showAuthErr('حدث خطأ: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ إنشاء حساب مجاني';
  }
}

export async function doLogout() {
  await sb.auth.signOut();
  setCurrentUser(null);
  // لا نمسح S أو localStorage، فقط ننهي الجلسة
  const modal = document.getElementById('user-modal');
  if (modal) modal.classList.remove('open');
  showAuth();
}
