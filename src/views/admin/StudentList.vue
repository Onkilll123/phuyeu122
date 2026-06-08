<script setup>
import { ref, computed } from 'vue'
import { students, courses } from '../../data/mockData.js'

// ── State ──
const list = ref(students.map(s => ({...s,
  dob:'01/01/2000', gender:'Nam', email:`${s.code.toLowerCase()}@email.com`,
  address:'Hà Nội', completedCourses:[], note:''
})))
const search = ref('')
const filterStatus = ref('')
const filterCourse = ref('')
const showModal = ref(false)
const showDetail = ref(false)
const selectedStudent = ref(null)
const isEdit = ref(false)
const form = ref({})

// ── Computed ──
const filtered = computed(() => list.value.filter(s => {
  const q = search.value.toLowerCase()
  const matchQ = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.phone.includes(q)
  const matchStatus = !filterStatus.value || s.status === filterStatus.value
  const matchCourse = !filterCourse.value || s.course === filterCourse.value
  return matchQ && matchStatus && matchCourse
}))

const stats = computed(() => ({
  total: list.value.length,
  active: list.value.filter(s=>s.status==='Đang học').length,
  done: list.value.filter(s=>s.status==='Hoàn thành').length,
  paid: list.value.filter(s=>s.feeStatus==='Đã đóng').length,
}))

// ── Helpers ──
const getInitials = n => n.split(' ').map(w=>w[0]).slice(-2).join('')
const avatarColors = ['blue','green','purple','orange','teal','red']
const attColor = v => v>=80?'green':v>=60?'orange':'red'
const feeClass = s => s==='Đã đóng'?'badge-green':s.includes('nợ')||s.includes('Nợ')||s==='Chưa đóng'?'badge-red':'badge-yellow'
const fmt = n => n.toLocaleString('vi-VN')

// ── Actions ──
function openDetail(s) { selectedStudent.value = s; showDetail.value = true }
function openAdd() {
  isEdit.value = false
  form.value = { code:'HV-'+(100+list.value.length+1), name:'', dob:'', gender:'Nam', phone:'', email:'', address:'', course:'', enrollDate:'', feeStatus:'Chưa đóng', status:'Đang học', attendance:0, note:'' }
  showModal.value = true
}
function openEdit(s) {
  isEdit.value = true
  form.value = {...s}
  showModal.value = true
}
function saveForm() {
  if (!form.value.name || !form.value.phone) { alert('Vui lòng nhập đủ Họ tên và SĐT!'); return }
  if (isEdit.value) {
    const idx = list.value.findIndex(s=>s.code===form.value.code)
    if (idx>=0) list.value[idx] = {...form.value}
  } else {
    list.value.push({...form.value, id: Date.now()})
  }
  showModal.value = false
  if (showDetail.value) { selectedStudent.value = {...form.value}; }
}
function deleteStudent(s) {
  if (confirm(`Xoá học viên ${s.name}?`)) {
    list.value = list.value.filter(x=>x.code!==s.code)
    showDetail.value = false
  }
}
</script>

<template>
<!-- ── DETAIL MODAL ── -->
<div v-if="showDetail" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:center;justify-content:center" @click.self="showDetail=false">
  <div style="background:#fff;border-radius:16px;width:680px;max-height:90vh;overflow-y:auto;padding:28px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h3 style="font-size:18px;font-weight:700;color:#0f172a">Hồ sơ học viên</h3>
      <button @click="showDetail=false" style="border:none;background:none;font-size:20px;cursor:pointer;color:#94a3b8">✕</button>
    </div>
    <div v-if="selectedStudent">
      <!-- Profile header -->
      <div style="display:flex;gap:20px;align-items:center;padding:20px;background:#f0fdfa;border-radius:12px;margin-bottom:20px;border:1px solid #99f6e4">
        <div class="avatar teal" style="width:64px;height:64px;font-size:22px">{{ getInitials(selectedStudent.name) }}</div>
        <div style="flex:1">
          <div style="font-size:20px;font-weight:700;color:#0f172a">{{ selectedStudent.name }}</div>
          <div style="color:#64748b;margin-top:2px">{{ selectedStudent.code }}</div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <span class="badge" :class="selectedStudent.status==='Hoàn thành'?'badge-purple':'badge-green'">{{ selectedStudent.status }}</span>
            <span class="badge" :class="feeClass(selectedStudent.feeStatus)">{{ selectedStudent.feeStatus }}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-outline" style="padding:8px 14px;font-size:13px" @click="openEdit(selectedStudent);showDetail=false">✏️ Sửa</button>
          <button class="btn-reject" @click="deleteStudent(selectedStudent)">🗑 Xoá</button>
        </div>
      </div>

      <!-- Info Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
        <div v-for="item in [
          {icon:'📞',label:'Số điện thoại',val:selectedStudent.phone},
          {icon:'📧',label:'Email',val:selectedStudent.email},
          {icon:'🎂',label:'Ngày sinh',val:selectedStudent.dob||'Chưa cập nhật'},
          {icon:'👤',label:'Giới tính',val:selectedStudent.gender||'—'},
          {icon:'📍',label:'Địa chỉ',val:selectedStudent.address||'Chưa cập nhật'},
          {icon:'📅',label:'Ngày nhập học',val:selectedStudent.enrollDate},
        ]" :key="item.label" style="padding:12px;background:#f8fafc;border-radius:8px;display:flex;gap:10px;align-items:flex-start">
          <span style="font-size:16px">{{ item.icon }}</span>
          <div><div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase">{{ item.label }}</div><div style="font-weight:600;color:#0f172a;margin-top:2px">{{ item.val }}</div></div>
        </div>
      </div>

      <!-- Khóa học -->
      <div style="padding:16px;background:#f8fafc;border-radius:12px;margin-bottom:16px">
        <div style="font-weight:700;margin-bottom:12px;color:#0f172a">📚 Khóa đang học</div>
        <div style="display:flex;align-items:center;gap:12px;padding:10px;background:#fff;border-radius:8px;border:1px solid #e2e8f0">
          <span style="font-size:20px">📘</span>
          <div style="flex:1"><div style="font-weight:600">{{ selectedStudent.course }}</div></div>
          <span class="badge badge-green">● Đang học</span>
        </div>
      </div>

      <!-- Chuyên cần -->
      <div style="padding:16px;background:#f8fafc;border-radius:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-weight:700;color:#0f172a">📊 Tỷ lệ chuyên cần</div>
          <span style="font-size:20px;font-weight:700" :class="'text-'+attColor(selectedStudent.attendance)">{{ selectedStudent.attendance }}%</span>
        </div>
        <div class="progress-bar" style="height:10px">
          <div class="progress-fill" :class="attColor(selectedStudent.attendance)" :style="{width:selectedStudent.attendance+'%'}"></div>
        </div>
        <div style="margin-top:8px;font-size:12px;color:#94a3b8">
          {{ selectedStudent.attendance>=80?'✅ Đủ điều kiện thi/tốt nghiệp':selectedStudent.attendance>=70?'⚠️ Gần ngưỡng tối thiểu':'❌ Chưa đủ điều kiện (tối thiểu 70%)' }}
        </div>
      </div>

      <div v-if="selectedStudent.note" style="margin-top:12px;padding:12px;background:#fef9c3;border-radius:8px;font-size:13px;color:#854d0e">
        📌 Ghi chú: {{ selectedStudent.note }}
      </div>
    </div>
  </div>
</div>

<!-- ── ADD/EDIT MODAL ── -->
<div v-if="showModal" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:300;display:flex;align-items:center;justify-content:center" @click.self="showModal=false">
  <div style="background:#fff;border-radius:16px;width:560px;max-height:90vh;overflow-y:auto;padding:28px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h3 style="font-size:18px;font-weight:700;color:#0f172a">{{ isEdit?'Chỉnh sửa hồ sơ':'Thêm học viên mới' }}</h3>
      <button @click="showModal=false" style="border:none;background:none;font-size:20px;cursor:pointer;color:#94a3b8">✕</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div v-for="field in [
        {key:'name',label:'Họ và tên *',placeholder:'Nguyễn Văn A',span:2},
        {key:'phone',label:'Số điện thoại *',placeholder:'0901234567'},
        {key:'email',label:'Email',placeholder:'email@gmail.com'},
        {key:'dob',label:'Ngày sinh',placeholder:'dd/mm/yyyy'},
        {key:'address',label:'Địa chỉ',placeholder:'Hà Nội'},
        {key:'enrollDate',label:'Ngày nhập học',placeholder:'dd/mm/yyyy'},
        {key:'note',label:'Ghi chú',placeholder:'(tuỳ chọn)',span:2},
      ]" :key="field.key" :style="{gridColumn: field.span===2?'1/-1':'auto'}">
        <label style="display:block;font-size:13px;font-weight:500;margin-bottom:5px;color:#374151">{{ field.label }}</label>
        <input v-model="form[field.key]" :placeholder="field.placeholder" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:14px;outline:none" />
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:500;margin-bottom:5px;color:#374151">Giới tính</label>
        <select v-model="form.gender" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:14px;outline:none"><option>Nam</option><option>Nữ</option><option>Khác</option></select>
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:500;margin-bottom:5px;color:#374151">Học phí</label>
        <select v-model="form.feeStatus" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:14px;outline:none"><option>Đã đóng</option><option>Chờ TT</option><option>Còn nợ</option><option>Nợ HF</option><option>Chưa đóng</option></select>
      </div>
      <div style="grid-column:1/-1">
        <label style="display:block;font-size:13px;font-weight:500;margin-bottom:5px;color:#374151">Khóa học</label>
        <select v-model="form.course" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:14px;outline:none">
          <option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
      <button class="btn-outline" @click="showModal=false">Huỷ</button>
      <button class="btn-primary" @click="saveForm">{{ isEdit?'💾 Lưu thay đổi':'✅ Thêm học viên' }}</button>
    </div>
  </div>
</div>

<!-- ── MAIN PAGE ── -->
<div>
  <div class="page-header">
    <div><h2 class="page-title">Danh sách học viên</h2><p class="page-desc">{{ stats.total }} học viên tại trung tâm</p></div>
    <div class="btn-actions"><button class="btn-outline">📥 Xuất Excel</button><button class="btn-primary" @click="openAdd">+ Thêm học viên</button></div>
  </div>

  <!-- Stats -->
  <div class="stat-cards cols-4">
    <div class="stat-card blue"><div class="label">TỔNG HỌC VIÊN</div><div class="value">{{ stats.total }}</div></div>
    <div class="stat-card green"><div class="label">ĐANG HỌC</div><div class="value">{{ stats.active }}</div></div>
    <div class="stat-card purple"><div class="label">HOÀN THÀNH</div><div class="value">{{ stats.done }}</div></div>
    <div class="stat-card orange"><div class="label">ĐÃ ĐÓNG HỌC PHÍ</div><div class="value">{{ stats.paid }}</div></div>
  </div>

  <!-- Filters -->
  <div class="card" style="margin-bottom:16px">
    <div class="filter-bar">
      <label>Khóa học:</label>
      <select v-model="filterCourse"><option value="">Tất cả</option><option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option></select>
      <label>Trạng thái:</label>
      <select v-model="filterStatus"><option value="">Tất cả</option><option>Đang học</option><option>Hoàn thành</option></select>
      <div class="spacer"></div>
      <input placeholder="🔍 Tìm tên, mã, SĐT..." v-model="search" style="min-width:240px" />
    </div>
  </div>

  <!-- Table -->
  <div class="card">
    <table class="data-table">
      <thead><tr><th>HỌC VIÊN</th><th>KHÓA ĐANG HỌC</th><th>NGÀY NHẬP HỌC</th><th>CHUYÊN CẦN</th><th>HỌC PHÍ</th><th>TRẠNG THÁI</th><th>HÀNH ĐỘNG</th></tr></thead>
      <tbody>
        <tr v-for="(s,i) in filtered" :key="s.code">
          <td>
            <div class="user-cell" style="cursor:pointer" @click="openDetail(s)">
              <div class="avatar" :class="avatarColors[i%6]">{{ getInitials(s.name) }}</div>
              <div><div class="name" style="color:#2563eb">{{ s.name }}</div><div class="code">{{ s.code }}</div></div>
            </div>
          </td>
          <td>{{ s.course }}</td>
          <td class="text-muted">{{ s.enrollDate }}</td>
          <td>
            <div class="progress-row">
              <div class="progress-bar"><div class="progress-fill" :class="attColor(s.attendance)" :style="{width:s.attendance+'%'}"></div></div>
              <span class="progress-text" :class="'text-'+attColor(s.attendance)">{{ s.attendance }}%</span>
            </div>
          </td>
          <td><span class="badge" :class="feeClass(s.feeStatus)">{{ s.feeStatus }}</span></td>
          <td><span class="badge" :class="s.status==='Hoàn thành'?'badge-purple':'badge-green'">● {{ s.status }}</span></td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn-outline" style="padding:5px 10px;font-size:12px" @click="openDetail(s)">👁 Chi tiết</button>
              <button class="btn-outline" style="padding:5px 10px;font-size:12px" @click="openEdit(s)">✏️</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="filtered.length===0" style="text-align:center;padding:40px;color:#94a3b8">Không tìm thấy học viên nào.</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:13px;color:#94a3b8">
      <span>Hiển thị {{ filtered.length }} / {{ list.length }} học viên</span>
    </div>
  </div>
</div>
</template>
