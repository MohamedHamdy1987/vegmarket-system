import { sb } from './supabase.js';
import { setCurrentUser, currentUser, loadUserData, saveData, S } from './state.js';
import { showAuthErr } from './utils.js';
import { showApp, checkTrial, updateAdminTabVisibility, renderSubscriptionStatus, updateCountBadges } from './ui.js';

export async function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    if (!email || !pass) return showAuthErr('أدخل البريد وكلمة المرور');
    const btn = document.getElementById('login-btn');
    btn.disabled = true; btn.textContent = 'جاري الدخول...';
    try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        setCurrentUser(data.user);
        await loadUserData();
        window.location.href = 'dashboard.html';
    } catch (e) { showAuthErr('خطأ في البريد أو كلمة المرور'); }
    finally { btn.disabled = false; btn.textContent = '🔑 دخول'; }
}

export async function doRegister() {
    const shop = document.getElementById('reg-shop').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    if (!shop || !email || !pass) return showAuthErr('أكمل جميع البيانات');
    if (pass !== pass2) return showAuthErr('كلمة المرور غير متطابقة');
    if (pass.length < 8) return showAuthErr('كلمة المرور أقل من ٨ أحرف');
    const btn = document.getElementById('reg-btn');
    btn.disabled = true; btn.textContent = 'جاري الإنشاء...';
    try {
        const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await sb.auth.signUp({
            email, password: pass,
            options: { data: { shop_name: shop, subscription: 'trial', trial_ends: trialEnds } }
        });
        if (error) throw error;
        setCurrentUser(data.user);
        await saveData();
        window.location.href = 'dashboard.html';
    } catch (e) { showAuthErr('حدث خطأ: ' + e.message); }
    finally { btn.disabled = false; btn.textContent = '✅ إنشاء حساب مجاني'; }
}

export async function doLogout() {
    await sb.auth.signOut();
    setCurrentUser(null);
    window.location.href = 'index.html';
}

export async function initAuth() {
    const { data } = await sb.auth.getSession();
    if (data?.session) {
        setCurrentUser(data.session.user);
        await loadUserData();
        return true;
    }
    return false;
}
