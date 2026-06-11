<script setup>
import { ref, computed, onMounted } from 'vue'
import { N1 as api, N2 as apiN2 } from '../../data/api.js'

// ── State ──
const list = ref([])
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

const courses = ref([])
onMounted(async () => {
  try {
    const res = await api.getCourses()
    courses.value = res.data.map(c => ({ id: c.id, name: c.title || c.name }))
  } catch (e) { console.error(e) }

  try {
    const resStu = await apiN2.getStudents()
    list.value = resStu.data.map(s => ({
      ...s,
      dob: s.dob || '01/01/2000', gender: s.gender || 'Nam', email: s.email || `${s.code.toLowerCase()}@email.com`,
      address: s.address || 'Hà Nội', completedCourses:[], note:''
    }))
  } catch(e) { console.error(e) }
})

function exportToExcel() {
  if (filtered.value.length === 0) return alert('Không có dữ liệu để xuất!')
  const headers = ['Mã HV', 'Tên học viên', 'Khóa học', 'Ngày nhập học', 'Điểm danh', 'Học phí', 'Trạng thái']
  const rows = filtered.value.map(s => [
    s.code, s.name, s.course, s.enrollDate, s.attendance+'%', s.feeStatus, s.status
  ])
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n")
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "danh_sach_hoc_vien.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const stats = computed(() => ({
  total: list.value.length,
  active: list.value.filter(s=>s.status==='Đang học').length,
  done: list.value.filter(s=>s.status==='Hoàn thành').length,
  paid: list.value.filter(s=>s.feeStatus==='Đã đóng').length,
}))

// ── Helpers ──
const getInitials = n => n.split(' ').map(w=>w[0]).slice(-2).join('')
const avatarColors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#14b8a6','#ef4444']
const attColor = v => v>=80?'#10b981':v>=60?'#f59e0b':'#ef4444'
const attBg = v => v>=80?'#dcfce7':v>=60?'#fef3c7':'#fee2e2'
const feeClass = s => s==='Đã đóng'?'badge-green':s.includes('nợ')||s.includes('Nợ')||s==='Chưa đóng'?'badge-red':'badge-yellow'
const statusClass = s => s==='Hoàn thành'?'badge-purple':'badge-green'

// ── Actions ──
function openDetail(s) { selectedStudent.value = s; showDetail.value = true }
function openAdd() {
  isEdit.value = false
  form.value = { code:'HV-'+(100+list.value.length+1), name:'', dob:'', gender:'Nam', phone:'', email:'', address:'', course:'', enrollDate: new Date().toLocaleDateString('vi-VN'), feeStatus:'Chưa đóng', status:'Đang học', attendance:0, note:'' }
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
    list.value.unshift({...form.value, id: Date.now()})
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
<transition name="fade">
  <div v-if="showDetail" class="modal-overlay" @click.self="showDetail=false">
    <div class="modal-content profile-modal">
      <div class="modal-header">
        <h3 class="modal-title">Hồ sơ chi tiết học viên</h3>
        <button @click="showDetail=false" class="close-btn">✕</button>
      </div>
      
      <div v-if="selectedStudent" class="modal-body">
        <!-- Banner/Profile Info -->
        <div class="profile-banner">
          <div class="profile-avatar" :style="{background: avatarColors[selectedStudent.id % 6]}">
            {{ getInitials(selectedStudent.name) }}
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ selectedStudent.name }}</h2>
            <div class="profile-code">Mã HV: <strong>{{ selectedStudent.code }}</strong></div>
            <div class="profile-badges">
              <span class="badge" :class="statusClass(selectedStudent.status)">{{ selectedStudent.status }}</span>
              <span class="badge" :class="feeClass(selectedStudent.feeStatus)">{{ selectedStudent.feeStatus }}</span>
            </div>
          </div>
          <div class="profile-actions">
            <button class="btn-icon btn-edit" @click="openEdit(selectedStudent);showDetail=false" title="Chỉnh sửa">✏️</button>
            <button class="btn-icon btn-delete" @click="deleteStudent(selectedStudent)" title="Xóa">🗑</button>
          </div>
        </div>

        <div class="detail-grid">
          <!-- Thông tin cá nhân -->
          <div class="detail-section">
            <h4 class="section-title">Thông tin cá nhân</h4>
            <div class="info-list">
              <div class="info-item">
                <div class="info-icon">📞</div>
                <div class="info-text">
                  <div class="info-label">Số điện thoại</div>
                  <div class="info-value">{{ selectedStudent.phone }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">📧</div>
                <div class="info-text">
                  <div class="info-label">Email</div>
                  <div class="info-value">{{ selectedStudent.email }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">🎂</div>
                <div class="info-text">
                  <div class="info-label">Ngày sinh</div>
                  <div class="info-value">{{ selectedStudent.dob || 'Chưa cập nhật' }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">👤</div>
                <div class="info-text">
                  <div class="info-label">Giới tính</div>
                  <div class="info-value">{{ selectedStudent.gender || '—' }}</div>
                </div>
              </div>
              <div class="info-item full-width">
                <div class="info-icon">📍</div>
                <div class="info-text">
                  <div class="info-label">Địa chỉ</div>
                  <div class="info-value">{{ selectedStudent.address || 'Chưa cập nhật' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Học tập & Chuyên cần -->
          <div class="detail-section right-col">
            <h4 class="section-title">Khóa học hiện tại</h4>
            <div class="course-card">
              <div class="course-icon">📘</div>
              <div class="course-details">
                <div class="course-name">{{ selectedStudent.course }}</div>
                <div class="course-date">Nhập học: {{ selectedStudent.enrollDate }}</div>
              </div>
            </div>

            <h4 class="section-title" style="margin-top:24px">Tỷ lệ chuyên cần</h4>
            <div class="attendance-card">
              <div class="attendance-header">
                <span class="attendance-label">Tỷ lệ có mặt</span>
                <span class="attendance-percent" :style="{color: attColor(selectedStudent.attendance)}">
                  {{ selectedStudent.attendance }}%
                </span>
              </div>
              <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" :style="{width: selectedStudent.attendance + '%', background: attColor(selectedStudent.attendance)}"></div>
              </div>
              <div class="attendance-status" :style="{color: selectedStudent.attendance >= 70 ? '#10b981' : '#ef4444'}">
                {{ selectedStudent.attendance >= 80 ? '✅ Đủ điều kiện thi/tốt nghiệp' : selectedStudent.attendance >= 70 ? '⚠️ Gần ngưỡng tối thiểu' : '❌ Chưa đủ điều kiện (tối thiểu 70%)' }}
              </div>
            </div>

            <div v-if="selectedStudent.note" class="note-card">
              <div class="note-title">📌 Ghi chú</div>
              <div class="note-content">{{ selectedStudent.note }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</transition>

<!-- ── ADD/EDIT MODAL ── -->
<transition name="fade">
  <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
    <div class="modal-content form-modal">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEdit ? 'Chỉnh sửa hồ sơ' : 'Thêm học viên mới' }}</h3>
        <button @click="showModal=false" class="close-btn">✕</button>
      </div>
      <div class="modal-body form-grid">
        <div class="form-group full-width">
          <label>Họ và tên <span class="required">*</span></label>
          <input v-model="form.name" placeholder="VD: Nguyễn Văn A" class="form-input" />
        </div>
        <div class="form-group">
          <label>Số điện thoại <span class="required">*</span></label>
          <input v-model="form.phone" placeholder="VD: 0901234567" class="form-input" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" placeholder="VD: email@gmail.com" class="form-input" />
        </div>
        <div class="form-group">
          <label>Ngày sinh</label>
          <input v-model="form.dob" type="date" class="form-input" />
        </div>
        <div class="form-group">
          <label>Giới tính</label>
          <select v-model="form.gender" class="form-input">
            <option>Nam</option><option>Nữ</option><option>Khác</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label>Địa chỉ</label>
          <input v-model="form.address" placeholder="VD: Hà Nội" class="form-input" />
        </div>
        <div class="form-group">
          <label>Khóa học</label>
          <select v-model="form.course" class="form-input">
            <option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Ngày nhập học</label>
          <input v-model="form.enrollDate" class="form-input" />
        </div>
        <div class="form-group">
          <label>Học phí</label>
          <select v-model="form.feeStatus" class="form-input">
            <option>Đã đóng</option><option>Chờ TT</option><option>Còn nợ</option><option>Nợ HF</option><option>Chưa đóng</option>
          </select>
        </div>
        <div class="form-group">
          <label>Trạng thái</label>
          <select v-model="form.status" class="form-input">
            <option>Đang học</option><option>Hoàn thành</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label>Ghi chú</label>
          <textarea v-model="form.note" placeholder="(Tuỳ chọn)" class="form-input form-textarea"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="showModal=false">Huỷ bỏ</button>
        <button class="btn-primary" @click="saveForm">{{ isEdit ? '💾 Lưu thay đổi' : '✅ Thêm học viên' }}</button>
      </div>
    </div>
  </div>
</transition>

<!-- ── MAIN PAGE ── -->
<div class="page-container">
  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Quản lý học viên</h2>
      <p class="page-desc">Theo dõi và quản lý thông tin {{ stats.total }} học viên tại trung tâm</p>
    </div>
    <div class="header-actions">
      <button class="btn-secondary btn-icon-text" @click="exportToExcel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Xuất Excel
      </button>
      <button class="btn-primary btn-icon-text" @click="openAdd">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Thêm học viên
      </button>
    </div>
  </div>

  <!-- Premium Stats -->
  <div class="stat-cards-premium cols-4">
    <div class="stat-card">
      <div class="stat-icon blue-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
      <div class="stat-info">
        <div class="stat-label">Tổng học viên</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <div class="stat-info">
        <div class="stat-label">Đang học</div>
        <div class="stat-value">{{ stats.active }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon purple-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <div class="stat-info">
        <div class="stat-label">Hoàn thành</div>
        <div class="stat-value">{{ stats.done }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon orange-bg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div>
      <div class="stat-info">
        <div class="stat-label">Đã hoàn thành học phí</div>
        <div class="stat-value">{{ stats.paid }}</div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="premium-card filter-section">
    <div class="filter-group">
      <div class="filter-item">
        <label>Khóa học</label>
        <select v-model="filterCourse" class="filter-select">
          <option value="">Tất cả khóa học</option>
          <option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
      </div>
      <div class="filter-item">
        <label>Trạng thái</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option>Đang học</option>
          <option>Hoàn thành</option>
        </select>
      </div>
    </div>
    <div class="search-group">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Tìm tên, mã HV, SĐT..." v-model="search" class="search-input" />
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="premium-card table-card">
    <div class="table-responsive">
      <table class="premium-table">
        <thead>
          <tr>
            <th>HỌC VIÊN</th>
            <th>KHÓA ĐANG HỌC</th>
            <th>NGÀY NHẬP HỌC</th>
            <th>CHUYÊN CẦN</th>
            <th>HỌC PHÍ</th>
            <th>TRẠNG THÁI</th>
            <th class="text-right">HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s,i) in filtered" :key="s.code" class="table-row">
            <td>
              <div class="user-profile" @click="openDetail(s)">
                <div class="user-avatar" :style="{background: avatarColors[i%6]}">{{ getInitials(s.name) }}</div>
                <div class="user-details">
                  <div class="user-name">{{ s.name }}</div>
                  <div class="user-code">{{ s.code }}</div>
                </div>
              </div>
            </td>
            <td><span class="course-name">{{ s.course }}</span></td>
            <td class="text-muted">{{ s.enrollDate }}</td>
            <td>
              <div class="attendance-indicator">
                <div class="progress-track">
                  <div class="progress-fill" :style="{width: s.attendance+'%', background: attColor(s.attendance)}"></div>
                </div>
                <span class="attendance-value" :style="{color: attColor(s.attendance), background: attBg(s.attendance)}">{{ s.attendance }}%</span>
              </div>
            </td>
            <td><span class="badge" :class="feeClass(s.feeStatus)">{{ s.feeStatus }}</span></td>
            <td>
              <div class="status-indicator" :class="s.status === 'Hoàn thành' ? 'status-done' : 'status-active'">
                <span class="status-dot"></span>
                {{ s.status }}
              </div>
            </td>
            <td class="text-right">
              <div class="action-buttons">
                <button class="btn-action btn-view" @click="openDetail(s)" title="Xem chi tiết">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-action btn-edit" @click="openEdit(s)" title="Chỉnh sửa">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Empty State -->
    <div v-if="filtered.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3 class="empty-title">Không tìm thấy học viên</h3>
      <p class="empty-desc">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
    </div>
    
    <!-- Pagination/Footer -->
    <div class="table-footer">
      <div class="table-info">
        Hiển thị <strong>{{ filtered.length }}</strong> trên tổng số <strong>{{ list.length }}</strong> học viên
      </div>
      <div class="pagination">
        <button class="page-btn" disabled>&laquo;</button>
        <button class="page-btn active">1</button>
        <button class="page-btn">&raquo;</button>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR ADMIN STUDENT LIST ── */
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}

.page-desc {
  color: #64748b;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-icon-text {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1);
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3), 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.btn-secondary {
  background: white;
  color: #334155;
  border: 1px solid #cbd5e1;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

/* Stats Cards */
.stat-cards-premium {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-cards-premium.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f1f5f9;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blue-bg { background: #eff6ff; color: #2563eb; }
.green-bg { background: #f0fdf4; color: #10b981; }
.purple-bg { background: #f5f3ff; color: #8b5cf6; }
.orange-bg { background: #fff7ed; color: #f59e0b; }

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

/* Filter Section */
.premium-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  margin-bottom: 24px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 16px;
  flex: 1;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding: 10px 36px 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  background-color: #f8fafc;
  min-width: 200px;
  transition: all 0.2s;
  outline: none;
}

.filter-select:focus {
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-group {
  min-width: 300px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  background-color: white;
  transition: all 0.2s;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Table Styles */
.table-card {
  overflow: hidden;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
}

.premium-table th {
  background: #f8fafc;
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.premium-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.table-row {
  transition: background-color 0.15s;
}

.table-row:hover {
  background-color: #f8fafc;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
  margin-bottom: 2px;
  transition: color 0.2s;
}

.user-profile:hover .user-name {
  color: #2563eb;
}

.user-code {
  font-size: 12px;
  color: #64748b;
}

.course-name {
  font-weight: 500;
  color: #334155;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.attendance-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-track {
  width: 80px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
}

.attendance-value {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-active .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 2px #dcfce7;
}

.status-done .status-dot {
  background: #8b5cf6;
  box-shadow: 0 0 0 2px #ede9fe;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f8fafc;
  color: #2563eb;
  border-color: #cbd5e1;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.empty-desc {
  color: #64748b;
  font-size: 14px;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.table-info {
  font-size: 13px;
  color: #64748b;
}

.pagination {
  display: flex;
  gap: 4px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f1f5f9;
}

.page-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.profile-modal { max-width: 800px; }
.form-modal { max-width: 600px; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8fafc;
}

/* Profile specific */
.profile-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid #bbf7d0;
  position: relative;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: rotate(-3deg);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.profile-code {
  color: #475569;
  font-size: 14px;
  margin-bottom: 12px;
}

.profile-badges {
  display: flex;
  gap: 8px;
}

.profile-actions {
  display: flex;
  gap: 8px;
  align-self: flex-start;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.btn-edit:hover { background: #eff6ff; color: #2563eb; }
.btn-delete:hover { background: #fee2e2; color: #ef4444; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background: #2563eb;
  border-radius: 2px;
}

.info-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-icon {
  font-size: 20px;
  background: white;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.course-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #eff6ff;
  border-radius: 12px;
  border: 1px solid #bfdbfe;
}

.course-icon {
  font-size: 24px;
}

.course-name {
  font-weight: 700;
  color: #1e40af;
  font-size: 15px;
  margin-bottom: 2px;
}

.course-date {
  font-size: 12px;
  color: #60a5fa;
}

.attendance-card {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.attendance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.attendance-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.attendance-percent {
  font-size: 20px;
  font-weight: 800;
}

.progress-bar-wrapper {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
}

.attendance-status {
  font-size: 12px;
  font-weight: 600;
}

.note-card {
  margin-top: 16px;
  padding: 16px;
  background: #fef9c3;
  border-radius: 12px;
  border: 1px solid #fde047;
}

.note-title {
  font-size: 13px;
  font-weight: 700;
  color: #854d0e;
  margin-bottom: 4px;
}

.note-content {
  font-size: 13px;
  color: #a16207;
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 14px;
  color: #334155;
  background: white;
  transition: all 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
