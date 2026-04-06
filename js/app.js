import { sb } from './supabase.js';
import { S, currentUser, setCurrentUser, loadUserData, save, xProd, setXProd } from './state.js';
import { initAuth, doLogin, doRegister, doLogout } from './auth.js';
import { showPage, showKTab, changeDatePrompt, showUserMenu, checkTrial, updateAdminTabVisibility, renderAll, updateDates, updateCountBadges, refreshDropdowns, closeModal } from './ui.js';
import { addCustomer, openCustDetail, editCustomer, deleteCustomer, showCustList, shareCustomerWhatsApp, filterCustomersList } from './customers.js';
import { addSupplier, openSuppDetail, editSupplier, deleteSupplier, showSuppList, filterSuppliersList } from './suppliers.js';
import { addProduct, delProduct, closeDay, goToProduct, confirmSale, saveEditSale, delSaleLine, openSaleForm, openEditSale, calcSF, toggleProd, goToTarhilDate } from './sales.js';
import { addCollection, delCollection, addExpense, delExpense } from './treasury.js';
import { addEmployee, openEmpDetail, deleteEmployee, showEmpList, addAbsence, delAbsence, addEmpPayment, delEmpPayment } from './employees.js';
import { addPartner, openPartDetail, deletePartner, showPartList, addPartAbsence, delPartAbsence, addPartPayment, delPartPayment, addPartProfit, delPartProfit } from './partners.js';
import { addShop, openShopDetail, deleteShop, showShopList, showShopTab, calcShop, addShopLahu, delShopLahu } from './shops.js';
import { generateInvoice, delInvoice, updateDed } from './invoices.js';
import { selectPlan, updatePaymentDetails, submitPayment } from './subscription.js';
import { confirmPayment, rejectPayment, resetPayment } from './admin.js';

// ربط الدوال بـ window لتكون متاحة من onclick في HTML
window.showPage = showPage;
window.showKTab = showKTab;
window.changeDatePrompt = changeDatePrompt;
window.showUserMenu = showUserMenu;
window.closeModal = closeModal;
window.addCustomer = addCustomer;
window.openCustDetail = openCustDetail;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.showCustList = showCustList;
window.shareCustomerWhatsApp = shareCustomerWhatsApp;
window.filterCustomersList = filterCustomersList;
window.addSupplier = addSupplier;
window.openSuppDetail = openSuppDetail;
window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;
window.showSuppList = showSuppList;
window.filterSuppliersList = filterSuppliersList;
window.addProduct = addProduct;
window.delProduct = delProduct;
window.closeDay = closeDay;
window.goToProduct = goToProduct;
window.confirmSale = confirmSale;
window.saveEditSale = saveEditSale;
window.delSaleLine = delSaleLine;
window.openSaleForm = openSaleForm;
window.openEditSale = openEditSale;
window.calcSF = calcSF;
window.toggleProd = toggleProd;
window.goToTarhilDate = goToTarhilDate;
window.addCollection = addCollection;
window.delCollection = delCollection;
window.addExpense = addExpense;
window.delExpense = delExpense;
window.addEmployee = addEmployee;
window.openEmpDetail = openEmpDetail;
window.deleteEmployee = deleteEmployee;
window.showEmpList = showEmpList;
window.addAbsence = addAbsence;
window.delAbsence = delAbsence;
window.addEmpPayment = addEmpPayment;
window.delEmpPayment = delEmpPayment;
window.addPartner = addPartner;
window.openPartDetail = openPartDetail;
window.deletePartner = deletePartner;
window.showPartList = showPartList;
window.addPartAbsence = addPartAbsence;
window.delPartAbsence = delPartAbsence;
window.addPartPayment = addPartPayment;
window.delPartPayment = delPartPayment;
window.addPartProfit = addPartProfit;
window.delPartProfit = delPartProfit;
window.addShop = addShop;
window.openShopDetail = openShopDetail;
window.deleteShop = deleteShop;
window.showShopList = showShopList;
window.showShopTab = showShopTab;
window.calcShop = calcShop;
window.addShopLahu = addShopLahu;
window.delShopLahu = delShopLahu;
window.generateInvoice = generateInvoice;
window.delInvoice = delInvoice;
window.updateDed = updateDed;
window.selectPlan = selectPlan;
window.updatePaymentDetails = updatePaymentDetails;
window.submitPayment = submitPayment;
window.confirmPayment = confirmPayment;
window.rejectPayment = rejectPayment;
window.resetPayment = resetPayment;

// تسجيل الدخول والتسجيل
window.doLogin = doLogin;
window.doRegister = doRegister;
window.doLogout = doLogout;

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', async () => {
    // إذا كنا في صفحة dashboard.html
    if (window.location.pathname.includes('dashboard.html')) {
        const loggedIn = await initAuth();
        if (!loggedIn) {
            window.location.href = 'index.html';
            return;
        }
        // تحديث واجهة dashboard
        document.getElementById('shop-name-header').textContent = currentUser?.user_metadata?.shop_name || 'نظام المحل';
        document.getElementById('user-email-badge').textContent = currentUser?.email?.split('@')[0] || '-';
        checkTrial();
        updateAdminTabVisibility();
        updateDates();
        renderAll();
        
        // ربط أحداث الأزرار الإضافية (مثل زر الطباعة)
        const printBtn = document.getElementById('printBtn');
        if (printBtn) printBtn.addEventListener('click', () => window.print());
        const subscribeNowBtn = document.getElementById('subscribeNowBtn');
        if (subscribeNowBtn) subscribeNowBtn.addEventListener('click', () => showPage('subscription', null));
        const dateBadge = document.getElementById('dateBadge');
        if (dateBadge) dateBadge.addEventListener('click', changeDatePrompt);
        const userBadge = document.getElementById('userBadge');
        if (userBadge) userBadge.addEventListener('click', showUserMenu);
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
        const closeUserModal = document.getElementById('closeUserModal');
        if (closeUserModal) closeUserModal.addEventListener('click', () => closeModal('user-modal'));
        
        // أزرار الصفحات (nav tabs)
        document.querySelectorAll('nav.tabs button').forEach(btn => {
            const page = btn.getAttribute('data-page');
            if (page) btn.addEventListener('click', () => showPage(page, btn));
        });
    }
    // إذا كنا في صفحة index.html
    else {
        const loggedIn = await initAuth();
        if (loggedIn) {
            window.location.href = 'dashboard.html';
            return;
        }
        // ربط أحداث المصادقة
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabName = tab.getAttribute('data-tab');
                document.getElementById('login-form').style.display = tabName === 'login' ? 'block' : 'none';
                document.getElementById('register-form').style.display = tabName === 'register' ? 'block' : 'none';
                document.getElementById('auth-err').classList.remove('show');
            });
        });
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.addEventListener('click', doLogin);
        const regBtn = document.getElementById('reg-btn');
        if (regBtn) regBtn.addEventListener('click', doRegister);
    }
});
