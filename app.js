function showPage(id) {
document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
document.getElementById(id).classList.add('active');
}

// فتح المودال
function openJobModal() {
document.getElementById('jobModal').classList.remove('hidden');
}

// قفل المودال
function closeJobModal() {
document.getElementById('jobModal').classList.add('hidden');
}

// إضافة شغل
function addJob() {

let name = document.getElementById('jobName').value;
let type = document.getElementById('jobType').value;
let ownership = document.getElementById('jobOwnership').value;
let supplier = document.getElementById('jobSupplier').value;

if(!name) {
alert("اكتب اسم الشغل");
return;
}

let job = {
id: uid(),
name,
type,
ownership,
supplier,
trucks: []
};

state.jobs.push(job);

closeJobModal();
renderJobs();
}

// عرض الأشغال
function renderJobs() {

let container = document.getElementById('jobsList');

if(state.jobs.length === 0) {
container.innerHTML = "<p>لا يوجد أشغال بعد</p>";
return;
}

let html = "";

state.jobs.forEach(job => {
html += "<div class="card"> <h3>${job.name}</h3> <p>النوع: ${job.type}</p> <p>المورد: ${job.supplier}</p> </div>";
});

container.innerHTML = html;
}

// أول تشغيل
renderJobs();
