export function fmtDate(d) {
    return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function N(n) { return (parseFloat(n) || 0).toLocaleString('ar-EG'); }

let syncTimeout = null;
export function setSyncStatus(status, msg) {
    const bar = document.getElementById('sync-bar');
    const text = document.getElementById('sync-text');
    if (!bar || !text) return;
    bar.className = 'sync-bar ' + (status === 'saving' ? 'saving' : (status === 'error' ? 'error' : ''));
    text.textContent = msg;
    if (syncTimeout) clearTimeout(syncTimeout);
    if (status === 'saving' || status === 'error') {
        syncTimeout = setTimeout(() => {
            if (document.getElementById('sync-bar')) {
                document.getElementById('sync-bar').className = 'sync-bar';
                document.getElementById('sync-text').textContent = 'محفوظ على السحابة ✓';
            }
        }, 3000);
    }
}

export function showAuthErr(msg) {
    const el = document.getElementById('auth-err');
    if (el) { el.textContent = msg; el.classList.add('show'); }
}

export function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
}
