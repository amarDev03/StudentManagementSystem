const API='/api/students';

let students=[];
let currentPage=0;
let pageSize=8;
let editingId=null;
let deleteId=null;
let searchTimer=null;

const $=id=>document.getElementById(id);
const viewModal=new bootstrap.Modal($('viewModal'));
const deleteModal=new bootstrap.Modal($('deleteModal'));

document.addEventListener('DOMContentLoaded',()=>{
	
	bindNavigation();
	bindEvents();
	loadDashboard();
	loadStudents();
});

function bindNavigation(){
	
	document.querySelectorAll('[data-section]').forEach(el=>el.addEventListener('click',()=>showSection(el.dataset.section)));
	document.querySelectorAll('.nav-item').forEach(el=>el.addEventListener('click',()=>{
		
		document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
		el.classList.add('active')
	}));
}

function showSection(section){
	
	document.querySelectorAll('.page-section').forEach(s=>s.classList.remove('active'));
	$(section+'Section').classList.add('active');
	
	const titles={
		
		dashboard:'Dashboard',
		students:'Students',
		add:editingId?'Edit Student':'Add Student'
	
	};
	
	$('pageTitle').textContent=titles[section]||'Dashboard';
	
	if(section==='students')loadStudents();
	if(section==='dashboard')loadDashboard();
	if(section==='add'&&!editingId)resetForm();
	$('sidebar').classList.remove('open');
	
	window.scrollTo({
		
		top:0,behavior:'smooth'
	
	});
}

function bindEvents(){
	
	$('mobileMenu').onclick=()=>$('sidebar').classList.toggle('open');
	$('refreshBtn').onclick=()=>{
		
		loadDashboard();
		loadStudents();
		toast('Data refreshed','success')
	};
		$('tableRefresh').onclick=()=>loadStudents();
		$('searchInput').addEventListener('input',e=>{
			
			const val=e.target.value.trim();
			$('clearSearch').classList.toggle('d-none',!val);
			
			clearTimeout(searchTimer);
			searchTimer=setTimeout(()=>search(val),300)
		});
			$('clearSearch').onclick=()=>{
				
				$('searchInput').value='';
				$('clearSearch').classList.add('d-none');
				
				loadStudents()
			};
			
			$('sortSelect').onchange=()=>{
				
				currentPage=0;
				loadStudents()
			};
			
			$('studentForm').onsubmit=saveStudent;
			$('resetForm').onclick=resetForm;
			$('confirmDelete').onclick=confirmDelete;
		}
		
async function api(url,options={}){
	
	const res=await fetch(url,{
	
	headers:{
		
		'Content-Type':'application/json',...(options.headers||{})
	
	},...options

});

let data=null;

try{
	
	data=await res.json()

}

catch{
	
	data=await res.text()

}

if(!res.ok){
	
	let msg=data?.message||data?.error||'Something went wrong';
	
	if(data?.errors)msg=Object.values(data.errors).join(' ');
	
	throw new Error(msg)

}

return data

}

async function loadDashboard(){
	
	try{
		
		const data=await api(API);
		
		students=Array.isArray(data)?data:[];
		updateStats(students);
		renderRecent(students)
	
	}
	
	catch(e){
		
		updateStats([]);
		renderRecent([]);
		toast(e.message,'error')
	
	}
}

function updateStats(data){
	
	$('totalStudents').textContent=data.length;
	$('maleStudents').textContent=data.filter(s=>(s.gender||'').toLowerCase()==='male').length;
	$('femaleStudents').textContent=data.filter(s=>(s.gender||'').toLowerCase()==='female').length;
	$('courseCount').textContent=new Set(data.map(s=>(s.course||'').trim()).filter(Boolean)).size

}

function renderRecent(data){
	
	const rows=data.slice().sort((a,b)=>(b.id||0)-(a.id||0)).slice(0,5);
	
	$('recentTable').innerHTML=rows.length?rows.map(student=>
		`<tr><td>${studentCell(student)}</td><td><span class="course-pill">${esc(student.course)}</span></td>
		<td>${esc(student.email)}</td><td>${esc(student.gender)}</td>
		<td><button class="action-btn" onclick="viewStudent(${student.id})" title="View"><i class="bi bi-eye"></i></button></td></tr>`).join(''):
		`<tr><td colspan="5" class="loading-cell">No students found.</td></tr>`
	}
	
async function loadStudents(){
	
	const q=$('searchInput').value.trim();
	
	if(q){
		
		search(q);
		
		return
	
	}
	
	const sort=$('sortSelect').value;
	
	try{
		
		const data=await api(`${API}/page-sort?page=${currentPage}&size=${pageSize}&sortBy=${encodeURIComponent(sort)}`);
		
		renderStudents(data.content||[]);
		renderPagination(data)
	
	}
	
	catch(e){
		
		$('studentsTable').innerHTML=`<tr><td colspan="8" class="loading-cell text-danger">${esc(e.message)}</td></tr>`
	
	}

}

async function search(name){
	
	if(!name){
		
		loadStudents();
		
		return
	
	}
	
	try{
		
		const data=await api(`${API}/search?name=${encodeURIComponent(name)}`);
		
		renderStudents(data||[]);
		$('pageInfo').textContent=`${data?.length||0} result${(data?.length||0)===1?'':'s'} found`;
		$('pagination').innerHTML=''
	
	}
	
	catch(e){
		
		toast(e.message,'error')
	
	}

}

function renderStudents(data){
	
	$('studentsTable').innerHTML=data.length?data.map(s=>`<tr><td><strong>#${s.id}</strong></td>
		<td>${studentCell(s)}</td><td>${esc(s.email)}</td><td>${esc(s.phone)}</td>
		<td><span class="course-pill">${esc(s.course)}</span></td>
		<td><span class="gender-pill">${esc(s.gender)}</span></td>
		<td title="${esc(s.address)}">${truncate(s.address,28)}</td>
		<td><div class="action-group"><button class="action-btn" onclick="viewStudent(${s.id})" title="View"><i class="bi bi-eye"></i>
		</button><button class="action-btn" onclick="editStudent(${s.id})" title="Edit"><i class="bi bi-pencil"></i></button>
		<button class="action-btn delete" onclick="askDelete(${s.id})" title="Delete"><i class="bi bi-trash3"></i></button></div></td></tr>`).join(''):
		`<tr><td colspan="8" class="loading-cell"><i class="bi bi-people fs-4 d-block mb-2"></i>No students found.</td></tr>`
	
	}
	
function studentCell(s){
	
	const initials=((s.firstName||'S')[0]+(s.lastName||'')[0]).toUpperCase();
	
	return `<div class="student-cell"><div class="mini-avatar">${esc(initials)}</div>
	<div><strong>${esc(s.firstName)} ${esc(s.lastName)}</strong><span>Student ID #${esc(s.id)}</span></div></div>`

}

function renderPagination(data){
	
	const total=data.totalElements||0;
	const pages=data.totalPages||0;
	
	$('pageInfo').textContent=total?`Showing ${data.number*pageSize+1}-${Math.min((data.number+1)*pageSize,total)} of ${total} students`:
	'Showing 0 students';
	
	let html='';
	
	if(pages>1){
		
		if(data.number>0)html+=`<button class="page-btn" onclick="goPage(${data.number-1})"><i class="bi bi-chevron-left"></i></button>`;
		
		for(let i=0;
			
			i<pages;
			
			i++){
				
				if(i<2||i===pages-1||Math.abs(i-data.number)<=1)html+=`<button class="page-btn ${i===data.number?'active':''}" onclick="goPage(${i})">${i+1}</button>`;
				
				else if(i===2&&data.number>3)html+='<span class="px-1">…</span>'
			
			}
			
			if(data.number<pages-1)html+=`<button class="page-btn" onclick="goPage(${data.number+1})"><i class="bi bi-chevron-right"></i></button>`
		
		}
		
		$('pagination').innerHTML=html
	
	}
	
function goPage(p){
	
	currentPage=p;
	loadStudents();
}

async function viewStudent(id){
	
	try{
		
		const s=await api(`${API}/${id}`);
		
		$('viewName').textContent=`${s.firstName} ${s.lastName}`;
		$('viewAvatar').textContent=((s.firstName||'S')[0]+(s.lastName||'')[0]).toUpperCase();
		$('viewCourse').textContent=s.course||'-';
		$('viewEmail').textContent=s.email||'-';
		$('viewId').textContent=`#${s.id}`;
		$('viewGender').textContent=s.gender||'-';
		$('viewPhone').textContent=s.phone||'-';
		$('viewCourse2').textContent=s.course||'-';
		$('viewAddress').textContent=s.address||'-';
		
		viewModal.show()
	
	}
	
	catch(e){
		
		toast(e.message,'error')
	
	}

}

async function editStudent(id){
	
	try{
		
		const s=await api(`${API}/${id}`);
		
		editingId=id;
		
		$('studentId').value=id;
		$('firstName').value=s.firstName||'';
		$('lastName').value=s.lastName||'';
		$('email').value=s.email||'';
		$('phone').value=s.phone||'';
		$('course').value=s.course||'';
		$('gender').value=s.gender||'';
		$('address').value=s.address||'';
		$('formTitle').textContent='Edit Student';
		$('pageTitle').textContent='Edit Student';
		
		showSection('add');
		
		window.scrollTo({
			
			top:0,behavior:'smooth'
		
		})
	
	}
	
	catch(e){
		
		toast(e.message,'error')
	
	}

}

async function saveStudent(e){
	
	e.preventDefault();
	
	clearErrors();
	
	const payload={
		
		firstName:$('firstName').value.trim(),
		lastName:$('lastName').value.trim(),
		email:$('email').value.trim(),
		phone:$('phone').value.trim(),
		course:$('course').value,
		gender:$('gender').value,
		address:$('address').value.trim()
	
	};
	
	if(!validate(payload))
		
		return;
		
		const btn=$('saveBtn');
		
		btn.disabled=true;
		btn.innerHTML='<span class="spinner-border spinner-border-sm"></span> Saving...';
		
		try{
			
			const isEdit=!!editingId;
			
			await api(isEdit?`${API}/${editingId}`:API,{
				
				method:isEdit?'PUT':'POST',body:JSON.stringify(payload)
			
			});
			
			toast(isEdit?'Student updated successfully':'Student added successfully','success');
			editingId=null;
			resetForm();
			await loadDashboard();
			showSection('students')
		
		}
		
		catch(e){
			
			toast(e.message,'error')
		
		}
		
		finally{
			
			btn.disabled=false;
			btn.innerHTML='<i class="bi bi-check2-circle"></i> Save Student'
		
		}
	
	}
	
function validate(p){
	
	let ok=true;
	
	const rules=[['firstName',p.firstName.length>=2,'First name must be at least 2 characters'],
				 ['lastName',p.lastName.length>=2,'Last name must be at least 2 characters'],
				 ['email',/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email),'Enter a valid email address'],
				 ['phone',/^[0-9]{10}$/.test(p.phone),'Phone must contain exactly 10 digits'],
				 ['course',!!p.course,'Select a course'],
				 ['gender',!!p.gender,'Select gender'],
				 ['address',p.address.length>=3,'Address is required']];
				 
				 rules.forEach(([id,valid,msg])=>{
					
					if(!valid){
						
						$(id).closest('.field').querySelector('.field-error').textContent=msg;
						
						ok=false
					
					}
				
				});
				
				return ok
			
			}
function clearErrors(){
	
	document.querySelectorAll('.field-error').forEach(e=>e.textContent='')

}

function resetForm(){
	
	editingId=null;
	
	$('studentForm').reset();
	$('studentId').value='';
	$('formTitle').textContent='Add Student';
	
	clearErrors()

}

function askDelete(id){
	
	deleteId=id;
	deleteModal.show()

}

async function confirmDelete(){
	
	if(!deleteId)
		
		return;
		
		const btn=$('confirmDelete');
		
		btn.disabled=true;
		
		try{
			
			await api(`${API}/${deleteId}`,{
				
				method:'DELETE'
			
			});
			
			deleteModal.hide();
			toast('Student deleted successfully','success');
			deleteId=null;
			
			await loadDashboard();
			
			currentPage=0;
			
			await loadStudents()
		
		}
		
		catch(e){
			
			toast(e.message,'error')
		
		}
		
		finally{
			
			btn.disabled=false
		
		}
	
	}
	
function toast(message,type='success'){
	
	const id='t'+Date.now();
	
	$('toastContainer').insertAdjacentHTML('beforeend',`<div id="${id}" class="toast ${type} show" role="alert">
		<div class="d-flex align-items-center p-3 gap-2">
		<i class="bi ${type==='success'?'bi-check-circle-fill':'bi-exclamation-circle-fill'} toast-icon"></i>
		<span>${esc(message)}</span>
		<button type="button" class="btn-close ms-auto" onclick="document.getElementById('${id}').remove()"></button></div></div>`);
		
		setTimeout(()=>document.getElementById(id)?.remove(),3500)
	
	}
	
function truncate(v,n){
	
	v=v||'';
	
	return esc(v.length>n?v.slice(0,n)+'…':v)

}

function esc(v){
	
	return String(v??'').replace(/[&<>'"]/g,c=>({
		
		'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
	
	}[c]))

}

window.viewStudent=viewStudent;
window.editStudent=editStudent;
window.askDelete=askDelete;
window.goPage=goPage;