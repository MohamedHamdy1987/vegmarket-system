// ===================== renderers/employees.js =====================

async function addEmployee() {
  const name = document.getElementById('emp-name').value.trim();
  const role = document.getElementById('emp-role').value;
  const salary = parseFloat(document.getElementById('emp-salary').value) || 0;
  const phone = document.getElementById('emp-phone').value.trim();
  if (!name || !salary) return alert('أدخل الاسم والراتب');
  try {
    await insertEmployee({
      name, role, salary, phone,
      payments: [], absences: [],
      created_at: new Date().toISOString()
    });
    document.getElementById('emp-name').value = '';
    document.getElementById('emp-salary').value = '';
    document.getElementById('emp-phone').value = '';
    await loadAllData();
  } catch (e) {
    alert('فشل الإضافة: ' + e.message);
  }
}

async function updateEmployee(id) {
  const emp = S.employees.find(e => e.id == id);
  if (!emp) return;
  const newName = prompt('الاسم الجديد', emp.name);
  if (!newName || newName === emp.name) return;
  try {
    await updateEmployeeRow(id, { name: newName });
    await loadAllData();
  } catch (e) {
    alert('فشل التحديث: ' + e.message);
  }
}

async function deleteEmployee(id) {
  if (!confirm('حذف هذا الموظف وكل سجلاته؟')) return;
  try {
    await deleteEmployeeRow(id);
    await loadAllData();
  } catch (e) {
    alert('فشل الحذف: ' + e.message);
  }
}

function renderEmployees() {
  const container = document.getElementById('emp-list-cont');
  if (!S.employees.length) {
    container.innerHTML = '<p style="text-align:center;color:#aaa;padding:24px">لا يوجد موظفون</p>';
    return;
  }
  container.innerHTML = S.employees.map(e => {
    const dr = e.salary / 30;
    const ded = (e.absences || []).length * dr;
    const paid = (e.payments || []).reduce((s, p) => s + p.amount, 0);
    const rem = e.salary - ded - paid;
    return `
      <div class="card" style="cursor:pointer" onclick="openEmpDetail(${e.id})">
        <div class="ch g" style="justify-content:space-between">
          <div style="display:flex;align-items:center;gap:9px">
            <span>👷</span>
            <div>
              <div style="font-weight:800;color:var(--green)">${e.name}</div>
              <div style="font-size:0.74rem;color:var(--gray)">${e.role} | راتب: ${N(e.salary)} جنيه</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="text-align:left">
              <div style="font-size:0.74rem;color:var(--gray)">المتبقي</div>
              <div style="font-weight:900;color:${rem > 0 ? 'var(--red)' : 'var(--green)'}">${N(rem)} جنيه</div>
            </div>
            <button class="btn btn-b btn-xs no-print" onclick="event.stopPropagation();updateEmployee(${e.id})">✏️</button>
            <button class="btn btn-r btn-xs no-print" onclick="event.stopPropagation();deleteEmployee(${e.id})">🗑️</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function openEmpDetail(id) {
  const e = S.employees.find(x => x.id == id);
  if (!e) return;
  document.getElementById('emp-list-view').style.display = 'none';
  document.getElementById('emp-detail-view').style.display = 'block';
  document.getElementById('ed-name').textContent = e.name;
  document.getElementById('ed-role').textContent = e.role;
  document.getElementById('ed-salary').textContent = 'راتب: ' + N(e.salary) + ' جنيه';
  const dr = Math.round(e.salary / 30);
  const ded = (e.absences || []).length * dr;
  const paid = (e.payments || []).reduce((s, p) => s + p.amount, 0);
  const net = e.salary - ded - paid;

  const absRows = (e.absences || []).map((a, ai) => `
    <tr>
      <td style="padding:5px">${a.date}</td>
      <td style="padding:5px;color:var(--red)">${N(dr)} جنيه</td>
      <td style="padding:5px"><button class="btn btn-r btn-xs" onclick="delAbsence(${id},${ai})">🗑️</button></td>
    </tr>`).join('') || '<tr><td colspan="3" style="color:#aaa;padding:10px;text-align:center">لا توجد غيابات</td></tr>';

  const payRows = (e.payments || []).map((p, pi) => `
    <div style="display:flex;align-items:center;gap:7px;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:0.84rem">
      <span style="font-weight:900;color:var(--red);min-width:85px">-${N(p.amount)} جنيه</span>
      <span style="flex:1;color:#444;font-size:0.79rem">${p.note || 'دفعة'} — ${p.date}</span>
      <button class="btn btn-r btn-xs" onclick="delEmpPayment(${id},${pi})">🗑️</button>
    </div>`).join('') || '<p style="color:#aaa;text-align:center;padding:8px">لا توجد مدفوعات</p>';

  document.getElementById('ed-body').innerHTML = `
    <div class="card">
      <div class="ch" style="background:#fef9e7;border-bottom-color:#f0d080;"><span>📅</span><h2 style="color:#d4ac0d">تسجيل الغياب</h2></div>
      <div class="cb">
        <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:9px">
          <div style="flex:1"><label class="lbl">التاريخ</label><input type="text" id="abs-date-${id}" placeholder="${S.date}"></div>
          <button class="btn btn-r btn-sm" onclick="addAbsence(${id})">🔴 غياب</button>
        </div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
            <thead><tr style="background:#f0f7f0"><th>التاريخ</th><th>الخصم</th><th></th></tr></thead>
            <tbody>${absRows}</tbody>
          </table>
        </div>
        <div style="margin-top:7px;font-size:0.85rem">
          غيابات: <strong style="color:var(--red)">${e.absences.length} يوم</strong> |
          خصم: <strong style="color:var(--red)">${N(ded)} جنيه</strong>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="ch g"><span>💵</span><h2>المدفوعات</h2></div>
      <div class="cb">
        <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:9px">
          <div style="flex:1"><label class="lbl">المبلغ</label><input type="number" id="ep-amt-${id}" placeholder="0" min="0"></div>
          <div style="flex:1"><label class="lbl">البيان</label><input type="text" id="ep-note-${id}" placeholder="دفعة راتب..."></div>
          <button class="btn btn-g btn-sm" onclick="addEmpPayment(${id})">✅</button>
        </div>
        ${payRows}
      </div>
    </div>
    <div style="background:var(--green);color:#fff;border-radius:10px;padding:12px 15px;display:grid;grid-template-columns:repeat(4,1fr);text-align:center">
      <div><div style="font-size:0.74rem;opacity:0.8">الراتب</div><div style="font-weight:800">${N(e.salary)}</div></div>
      <div><div style="font-size:0.74rem;opacity:0.8">خصم غياب</div><div style="font-weight:800;color:#ffd700">-${N(ded)}</div></div>
      <div><div style="font-size:0.74rem;opacity:0.8">واصل</div><div style="font-weight:800;color:#a9dfbf">-${N(paid)}</div></div>
      <div><div style="font-size:0.74rem;opacity:0.8">المتبقي</div><div style="font-weight:800">${N(net)} جنيه</div></div>
    </div>`;
}

async function addAbsence(id) {
  const e = S.employees.find(x => x.id == id);
  const date = document.getElementById(`abs-date-${id}`).value.trim() || S.date;
  const newAbsences = [...(e.absences || []), { date }];
  try {
    await updateEmployeeRow(id, { absences: newAbsences });
    await loadAllData();
    openEmpDetail(id);
  } catch (err) { alert('فشل تسجيل الغياب'); }
}

async function delAbsence(id, idx) {
  const e = S.employees.find(x => x.id == id);
  const newAbsences = (e.absences || []).filter((_, i) => i != idx);
  try {
    await updateEmployeeRow(id, { absences: newAbsences });
    await loadAllData();
    openEmpDetail(id);
  } catch (err) { alert('فشل حذف الغياب'); }
}

async function addEmpPayment(id) {
  const amt = parseFloat(document.getElementById(`ep-amt-${id}`).value) || 0;
  const note = document.getElementById(`ep-note-${id}`).value.trim();
  if (!amt) return alert('أدخل المبلغ');
  const e = S.employees.find(x => x.id == id);
  const newPayments = [...(e.payments || []), { amount: amt, note, date: S.date }];
  try {
    await updateEmployeeRow(id, { payments: newPayments });
    // إضافة المصروف تلقائياً
    await insertExpense({ date: S.date, desc: `راتب — ${e.name}: ${note || 'دفعة'}`, suppId: '', amount: amt });
    await loadAllData();
    openEmpDetail(id);
  } catch (err) { alert('فشل إضافة الدفعة'); }
}

async function delEmpPayment(id, idx) {
  const e = S.employees.find(x => x.id == id);
  const payment = (e.payments || [])[idx];
  const newPayments = (e.payments || []).filter((_, i) => i != idx);
  try {
    await updateEmployeeRow(id, { payments: newPayments });
    // حذف المصروف المرتبط (اختياري حسب الحاجة)
    await loadAllData();
    openEmpDetail(id);
  } catch (err) { alert('فشل حذف الدفعة'); }
}

function showEmpList() {
  document.getElementById('emp-list-view').style.display = 'block';
  document.getElementById('emp-detail-view').style.display = 'none';
}