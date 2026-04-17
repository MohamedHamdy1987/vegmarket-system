// ===================== app.js — التشغيل الرئيسي =====================

async function init() {
  const loadingEl = document.getElementById('loading');
  try {
    // محاولة استئناف الجلسة
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      currentUser = session.user;
      await loadAllData();  // تحميل البيانات من Supabase
    } else {
      // إظهار شاشة المصادقة
      document.getElementById('auth-screen').style.display = 'flex';
      document.getElementById('app').style.display = 'none';
      loadingEl.style.display = 'none';
      return;
    }
    showApp();
  } catch (e) {
    console.error(e);
    loadingEl.style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
  } finally {
    loadingEl.style.display = 'none';
  }
}

function showApp() {
  document.getElementById('app').style.display = 'block';
  document.getElementById('auth-screen').style.display = 'none';
  if (currentUser) {
    document.getElementById('user-email-badge').textContent = currentUser.email.split('@')[0];
    const meta = currentUser.user_metadata;
    if (meta && meta.shop_name) document.getElementById('shop-name-header').textContent = meta.shop_name;
    checkTrial();
    updateAdminTabVisibility();
    renderSubscriptionStatus();
  }
  updateDates();
  renderAll();
}

function renderAll() {
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
  renderDashboard();  // صفحة الإحصائيات الجديدة
}

window.addEventListener('load', init);