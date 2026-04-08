// ===================== auth.js — تسجيل الدخول والخروج والتسجيل =====================

/**
 * تبديل تاب المصادقة (دخول / تسجيل)
 * @param {string} tab - 'login' | 'register'
 */
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('auth-err').classList.remove('show');
}

/**
 * عرض رسالة خطأ في شاشة المصادقة
 * @param {string} msg
 */
function showAuthErr(msg) {
  const el = document.getElementById('auth-err');
  el.textContent = msg;
  el.classList.add('show');
}

/**
 * تسجيل الدخول
 */
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) return showAuthErr('أدخل البريد وكلمة المرور');

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'جاري الدخول...';
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    currentUser = data.user;
    await loadUserData();
    showApp();
  } catch (e) {
    showAuthErr('خطأ في البريد أو كلمة المرور');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔑 دخول';
  }
}

/**
 * إنشاء حساب جديد مع تجربة مجانية 14 يوم
 */
async function doRegister() {
  const shop  = document.getElementById('reg-shop').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;

  if (!shop || !email || !pass) return showAuthErr('أكمل جميع البيانات');
  if (pass !== pass2)           return showAuthErr('كلمة المرور غير متطابقة');
  if (pass.length < 8)          return showAuthErr('كلمة المرور أقل من ٨ أحرف');

  const btn = document.getElementById('reg-btn');
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
    currentUser = data.user;
    document.getElementById('shop-name-header').textContent = shop;
    await saveData();
    showApp();
  } catch (e) {
    showAuthErr('حدث خطأ: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ إنشاء حساب مجاني';
  }
}

/**
 * تسجيل الخروج — لا يمسح البيانات المحلية
 */
async function doLogout() {
  await sb.auth.signOut();
  currentUser = null;
  closeModal('user-modal');
  showAuth();
}

/**
 * إظهار شاشة تسجيل الدخول
 */
function showAuth() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

/**
 * التحقق من التجربة المجانية وعرض الشريط التحذيري
 */
function checkTrial() {
  if (!currentUser) return;
  const banner = document.getElementById('trial-banner');
  const text   = document.getElementById('trial-text');
  const meta   = currentUser.user_metadata;
  if (meta && meta.subscription === 'trial') {
    const ends = new Date(meta.trial_ends || Date.now() + 14 * 24 * 60 * 60 * 1000);
    const days = Math.ceil((ends - Date.now()) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      banner.style.display = 'block';
      text.textContent = `متبقي ${days} يوم من التجربة المجانية`;
    } else {
      banner.style.display = 'none';
    }
  } else {
    banner.style.display = 'none';
  }
}
