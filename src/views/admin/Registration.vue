<script setup>
import { ref, computed, onMounted } from 'vue'
import { N1, N2, N3 } from '../../data/api.js'

// Dữ liệu từ API N1
const coursesList = ref([])

// Dữ liệu mô phỏng học viên đăng ký theo khóa học (N2 fallback)
const enrollments = ref([
  { id: 1, courseId: 'C01', studentName: 'Nguyễn Văn An', studentCode: 'HV-0312', regDate: '01/05/2025', payment: 'Đã thanh toán đủ', status: 'Đã duyệt' },
  { id: 2, courseId: 'C01', studentName: 'Trần Thị Mai', studentCode: 'HV-0451', regDate: '05/05/2025', payment: 'Trả góp kỳ 1', status: 'Đã duyệt' },
  { id: 3, courseId: 'C02', studentName: 'Lê Hoàng Sơn', studentCode: 'HV-0502', regDate: '10/05/2025', payment: 'Chưa thanh toán', status: 'Chờ duyệt' },
  { id: 4, courseId: 'C01', studentName: 'Phạm Thu Hương', studentCode: 'HV-0511', regDate: '12/05/2025', payment: 'Đã thanh toán đủ', status: 'Chờ duyệt' }
])

const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await N1.getCourses()
    coursesList.value = Array.isArray(res.data) ? res.data : (res.value || res || [])
  } catch (e) {
    console.error("Lỗi lấy danh sách khóa học N1", e)
  }
  try {
    const resReg = await N2.getRegistrations()
    if (resReg && (resReg.data || Array.isArray(resReg))) {
      enrollments.value = Array.isArray(resReg.data) ? resReg.data : resReg
    }
  } catch(e) {
    console.warn("Lỗi lấy N2 registrations, dùng mock", e)
  }
  loading.value = false
}

onMounted(loadData)

const showModal = ref(false)
const form = ref({
  name: '', description: '', syllabus: '', price: '', sessions: '', installment: false
})

async function createCourse() {
  if (!form.value.name || !form.value.price) {
    alert('Vui lòng nhập tên khóa học và giá tiền!')
    return
  }
  const newCourse = {
    title: form.value.name,
    description: form.value.description,
    syllabus: form.value.syllabus,
    tuitionFee: Number(form.value.price),
    totalLessons: Number(form.value.sessions),
    status: 'Đang mở'
  }
  try {
    await N1.createCourse(newCourse)
    alert("Tạo khóa học trên N1 thành công!")
    showModal.value = false
    form.value = { name: '', description: '', syllabus: '', price: '', sessions: '', installment: false }
    loadData()
  } catch (e) {
    alert("Lỗi tạo khóa học: " + e.message)
  }
}

const selectedCourseFilter = ref('')
const searchStudent = ref('')

const filteredEnrollments = computed(() => {
  return enrollments.value.filter(e => {
    const matchCourse = !selectedCourseFilter.value || e.courseId === selectedCourseFilter.value
    const matchName = !searchStudent.value || e.studentName?.toLowerCase().includes(searchStudent.value.toLowerCase()) || e.studentCode?.toLowerCase().includes(searchStudent.value.toLowerCase())
    return matchCourse && matchName
  })
})

const getCourseName = (cId) => {
  const c = coursesList.value.find(x => x.id === cId)
  return c ? (c.title || c.name) : (cId || 'Unknown')
}

function formatCurrency(val) {
  if (!val) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

async function approve(e) { 
  // CROSS-SERVICE N3: Check debt before approve
  try {
    const debtStatus = await N3.checkStudentPaymentStatus(e.studentCode).catch(()=>null)
    if (debtStatus && debtStatus.isAllowed === false) {
       alert(`⚠️ TỪ CHỐI DUYỆT: Học viên ${e.studentName} đang nợ học phí quá hạn (${formatCurrency(debtStatus.totalOverdue)}). Yêu cầu thanh toán trước N3.`)
       return
    }
    
    // Nếu N2 có API approve:
    // await N2.approveRegistration(e.id)
    e.status = 'Đã duyệt' 
    alert(`Đã duyệt cho học viên ${e.studentName} vào khóa học.`)
  } catch (err) {
    e.status = 'Đã duyệt'
  }
}
function reject(e) { 
  e.status = 'Từ chối' 
  // N2.rejectRegistration(e.id)
}
</script>

<template>
<div class="page-container">
  <!-- Modal Tạo Khóa Học -->
  <transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal-content form-modal">
        <div class="modal-header">
          <h3 class="modal-title">Tạo Khóa Học Mới</h3>
          <button @click="showModal=false" class="close-btn">✕</button>
        </div>
        <div class="modal-body form-grid">
          <div class="form-group full-width">
            <label>Tên khóa học <span class="required">*</span></label>
            <input v-model="form.name" placeholder="VD: IELTS Siêu Tốc 7.0+" class="form-input" />
          </div>
          <div class="form-group full-width">
            <label>Mô tả ngắn</label>
            <textarea v-model="form.description" placeholder="Mục tiêu khóa học, đối tượng tham gia..." class="form-input form-textarea"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Nội dung giảng dạy (Syllabus)</label>
            <textarea v-model="form.syllabus" placeholder="Liệt kê các kiến thức, kỹ năng sẽ dạy..." class="form-input form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label>Học phí (VNĐ) <span class="required">*</span></label>
            <input type="number" v-model="form.price" placeholder="VD: 5000000" class="form-input" />
          </div>
          <div class="form-group">
            <label>Tổng số buổi <span class="required">*</span></label>
            <input type="number" v-model="form.sessions" placeholder="VD: 36" class="form-input" />
          </div>
          <div class="form-group full-width checkbox-group">
            <input type="checkbox" id="installment" v-model="form.installment" />
            <label for="installment" class="checkbox-label">Cho phép thanh toán trả góp</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showModal=false">Hủy bỏ</button>
          <button class="btn-primary" @click="createCourse">Tạo Khóa Học</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Page Header -->
  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Quản lý Khóa học & Ghi danh</h2>
      <p class="page-desc">Tạo khóa học mới và quản lý học viên đăng ký theo khóa</p>
    </div>
    <div class="header-actions">
      <button class="btn-primary btn-icon-text" @click="showModal=true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tạo khóa học mới
      </button>
    </div>
  </div>

  <!-- Danh sách khóa học hiện có (Dạng thẻ) -->
  <div class="courses-scroll-container mb-6">
    <div v-if="loading" class="text-gray-500 italic p-4">Đang tải dữ liệu...</div>
    <div class="course-cards-wrapper" v-else>
      <div v-for="c in coursesList" :key="c.id" class="course-card-mini" :class="{'active-filter': selectedCourseFilter === c.id}" @click="selectedCourseFilter = selectedCourseFilter === c.id ? '' : c.id">
        <div class="c-card-header">
          <div class="c-name">{{ c.name || c.title }}</div>
          <div class="c-badge">{{ c.status }}</div>
        </div>
        <div class="c-card-body">
          <div class="c-detail"><span>🎓</span> {{ c.sessions || c.totalLessons }} buổi</div>
          <div class="c-detail"><span>💰</span> {{ formatCurrency(c.price || c.tuitionFee || c.fee) }}</div>
        </div>
        <div class="c-card-footer">
          <span v-if="c.installment" class="installment-tag">Hỗ trợ trả góp</span>
          <span class="reg-count">{{ enrollments.filter(e=>e.courseId===c.id).length }} HV đăng ký</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Bảng học viên đăng ký -->
  <div class="premium-card">
    <div class="card-header border-bottom">
      <div class="header-left">
        <h3 class="card-title">
          Danh sách ghi danh 
          <span v-if="selectedCourseFilter" class="filtered-course-name">
            — {{ getCourseName(selectedCourseFilter) }}
          </span>
        </h3>
      </div>
      <div class="header-right">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Tìm học viên..." v-model="searchStudent" class="search-input" />
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="premium-table">
        <thead>
          <tr>
            <th width="50">#</th>
            <th>HỌC VIÊN</th>
            <th v-if="!selectedCourseFilter">KHÓA HỌC</th>
            <th>NGÀY ĐĂNG KÝ</th>
            <th>THANH TOÁN</th>
            <th>TRẠNG THÁI</th>
            <th class="text-right">THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(e, i) in filteredEnrollments" :key="e.id" class="table-row">
            <td class="text-muted text-center">{{ i + 1 }}</td>
            <td>
              <div class="user-profile">
                <div class="user-avatar blue">{{ e.studentName.charAt(0) }}</div>
                <div class="user-details">
                  <div class="user-name">{{ e.studentName }}</div>
                  <div class="user-code">{{ e.studentCode }}</div>
                </div>
              </div>
            </td>
            <td v-if="!selectedCourseFilter">
              <span class="course-pill">{{ getCourseName(e.courseId) }}</span>
            </td>
            <td><span class="date-text">📅 {{ e.regDate }}</span></td>
            <td>
              <span class="payment-badge" :class="e.payment.includes('Đã thanh toán')?'pay-full':e.payment.includes('Chưa')?'pay-none':'pay-part'">
                {{ e.payment }}
              </span>
            </td>
            <td>
              <div class="status-indicator" :class="e.status==='Đã duyệt'?'status-done':e.status==='Từ chối'?'status-reject':'status-pending'">
                <span class="status-dot"></span>
                {{ e.status }}
              </div>
            </td>
            <td class="text-right">
              <div v-if="e.status==='Chờ duyệt'" class="action-group">
                <button class="btn-act btn-check" @click="approve(e)" title="Duyệt">Duyệt</button>
                <button class="btn-act btn-times" @click="reject(e)" title="Từ chối">✕</button>
              </div>
              <button v-else class="btn-undo" @click="e.status='Chờ duyệt'">Hoàn tác</button>
            </td>
          </tr>
          <tr v-if="filteredEnrollments.length === 0">
            <td :colspan="selectedCourseFilter ? 6 : 7" class="text-center empty-cell">
              Không có dữ liệu học viên nào phù hợp.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR ADMIN COURSE CREATION & REGISTRATION ── */
.page-container { max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.page-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
.page-desc { color: #64748b; font-size: 14px; margin: 0; }
.mb-6 { margin-bottom: 24px; }

.btn-icon-text { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: all 0.2s; cursor: pointer; border: none; }
.btn-primary { background: #2563eb; color: white; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
.btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3); }

/* Horizontal Course Cards */
.courses-scroll-container { width: 100%; overflow-x: auto; padding-bottom: 8px; }
.course-cards-wrapper { display: flex; gap: 16px; min-width: max-content; }
.course-card-mini { background: white; border: 2px solid #f1f5f9; border-radius: 16px; padding: 16px; width: 320px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.course-card-mini:hover { border-color: #bfdbfe; transform: translateY(-2px); box-shadow: 0 6px 12px -2px rgba(37,99,235,0.1); }
.course-card-mini.active-filter { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 4px 12px -2px rgba(37,99,235,0.15); }

.c-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.c-name { font-weight: 700; font-size: 15px; color: #0f172a; line-height: 1.3; padding-right: 8px; }
.c-badge { background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; white-space: nowrap; }

.c-card-body { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.c-detail { font-size: 13px; color: #475569; display: flex; align-items: center; gap: 6px; font-weight: 500; }

.c-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 12px; }
.installment-tag { font-size: 11px; background: #fef9c3; color: #854d0e; padding: 2px 8px; border-radius: 6px; font-weight: 600; }
.reg-count { font-size: 12px; font-weight: 700; color: #2563eb; }

/* Table Section */
.premium-card { background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; }
.border-bottom { border-bottom: 1px solid #f1f5f9; }
.card-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.filtered-course-name { color: #2563eb; }

.search-input-wrapper { position: relative; display: flex; align-items: center; min-width: 250px; }
.search-icon { position: absolute; left: 12px; color: #94a3b8; }
.search-input { width: 100%; padding: 10px 16px 10px 40px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; color: #334155; outline: none; transition: all 0.2s; }
.search-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

/* Table */
.table-responsive { width: 100%; overflow-x: auto; }
.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { background: #f8fafc; padding: 16px 24px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.premium-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.table-row:hover td { background-color: #f8fafc; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.user-profile { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 13px; }
.user-avatar.blue { background: #3b82f6; }
.user-name { font-weight: 600; color: #0f172a; font-size: 14px; }
.user-code { font-size: 12px; color: #64748b; }

.course-pill { background: #f1f5f9; color: #334155; padding: 4px 10px; border-radius: 8px; font-size: 13px; font-weight: 600; }
.date-text { font-size: 13px; color: #475569; font-weight: 500; }

.payment-badge { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
.pay-full { background: #dcfce7; color: #166534; }
.pay-part { background: #fef9c3; color: #854d0e; }
.pay-none { background: #fee2e2; color: #991b1b; }

.status-indicator { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 20px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-done { background: #dcfce7; color: #166534; }
.status-done .status-dot { background: #10b981; }
.status-pending { background: #fef9c3; color: #854d0e; }
.status-pending .status-dot { background: #eab308; }
.status-reject { background: #fee2e2; color: #991b1b; }
.status-reject .status-dot { background: #ef4444; }

.action-group { display: flex; gap: 8px; justify-content: flex-end; }
.btn-act { display: flex; align-items: center; justify-content: center; height: 30px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-check { padding: 0 12px; background: #10b981; color: white; box-shadow: 0 2px 4px rgba(16,185,129,0.2); }
.btn-check:hover { background: #059669; }
.btn-times { width: 30px; padding: 0; background: white; border: 1px solid #ef4444; color: #ef4444; }
.btn-times:hover { background: #fef2f2; }
.btn-undo { padding: 6px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; }
.btn-undo:hover { background: #f8fafc; border-color: #94a3b8; }

.empty-cell { padding: 40px; color: #64748b; font-style: italic; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-content { background: white; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out; }
.form-modal { max-width: 600px; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-size: 18px; font-weight: 700; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; transition: color 0.2s; }
.close-btn:hover { color: #ef4444; }
.modal-body { padding: 24px; overflow-y: auto; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 13px; font-weight: 600; color: #475569; }
.required { color: #ef4444; }
.form-input { padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; color: #334155; outline: none; transition: all 0.2s; }
.form-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.form-textarea { min-height: 80px; resize: vertical; }

.checkbox-group { flex-direction: row !important; align-items: center; gap: 10px; margin-top: 8px; }
.checkbox-group input[type="checkbox"] { width: 18px; height: 18px; accent-color: #2563eb; }
.checkbox-label { font-size: 14px !important; font-weight: 500 !important; cursor: pointer; margin: 0 !important; }

.btn-secondary { background: white; color: #334155; border: 1px solid #cbd5e1; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { background: #f8fafc; }
</style>
