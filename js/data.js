 // ============================================================
// 🔥 Supabase Setup
// ============================================================

const SUPABASE_URL = 'https://lfhrorjiukzkqhafjtdd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaHJvcmppdWt6a3FoYWZqdGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTc3NTgsImV4cCI6MjA5MDM3Mzc1OH0.eQ0w4DG_-DNvnJRJxgvJ7KhNNkBhOEswQhtbiO2my3Q';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// 🧠 Global State
// ============================================================

export let S = {
  customers: [],
  suppliers: [],
  products: [],
  batches: [],
  sales: [],
  invoices: [],
  expenses: [],
  collections: []
};

// ============================================================
// 📥 Load Data from Supabase
// ============================================================

export async function loadData() {
console.log("🔥 loadData شغالة");
  try {
    const [
      customers,
      suppliers,
      products,
      batches,
      sales,
      invoices,
      expenses,
      collections
    ] = await Promise.all([

      sb.from("customers").select("*"),
      sb.from("suppliers").select("*"),
      sb.from("products").select("*"),

      // ✅ تم التعديل هنا
      sb.from("incoming_batches").select("*"),

      sb.from("sales").select("*"),
      sb.from("invoices").select("*"),
      sb.from("expenses").select("*"),

      // ✅ تم التعديل هنا
      sb.from("payments").select("*")
    ]);

    S.customers = customers.data || [];
    S.suppliers = suppliers.data || [];
    S.products = products.data || [];
    S.batches = batches.data || [];
    S.sales = sales.data || [];
    S.invoices = invoices.data || [];
    S.expenses = expenses.data || [];
    S.collections = collections.data || [];

    console.log("✅ Data loaded successfully", S);

  } catch (err) {
    console.error("❌ Error loading data:", err);
    alert("فشل تحميل البيانات من السحابة");
  }
}