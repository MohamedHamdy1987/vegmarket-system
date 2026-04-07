// utils.js
export function fmtDate(d) {
  return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function N(n) {
  return (parseFloat(n) || 0).toLocaleString('ar-EG');
}

export function showAlert(msg, type = 'info') {
  alert(msg); // يمكن استبدالها بـ toast مستقبلاً
}

export function setSyncStatus(status, msg, syncBarEl, syncTextEl) {
  if (!syncBarEl || !syncTextEl) return;
  syncBarEl.className = 'sync-bar ' + (status === 'saving' ? 'saving' : (status === 'error' ? 'error' : ''));
  syncTextEl.textContent = msg;
  if (!status || status === '') {
    setTimeout(() => { syncBarEl.style.opacity = '0.5'; }, 3000);
    syncBarEl.style.opacity = '1';
  } else {
    syncBarEl.style.opacity = '1';
  }
}

export function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  toast.style.cssText = `position:fixed;bottom:20px;left:20px;background:${type === 'success' ? '#1a6b38' : '#c0392b'};color:#fff;padding:8px 16px;border-radius:8px;z-index:1000;animation:fadeIn 0.3s ease;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function getDomElement(id) {
  return document.getElementById(id);
}
