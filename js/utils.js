// utils.js
export function fmtDate(d) {
  return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function N(n) {
  return (parseFloat(n) || 0).toLocaleString('ar-EG');
}

export function showAlert(msg, type = 'info') {
  // يمكنك استخدام alert مؤقتاً أو إنشاء نافذة منبثقة مخصصة
  alert(msg);
}

export function setSyncStatus(status, msg, syncBarEl, syncTextEl) {
  syncBarEl.className = 'sync-bar ' + status;
  syncTextEl.textContent = msg;
}
