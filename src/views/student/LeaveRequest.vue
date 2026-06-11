<script setup>
import { ref, onMounted, computed } from 'vue'
import { N2 as api } from '../../data/api.js'

const requests = ref([])

onMounted(async () => {
  await loadRequests()
})

async function loadRequests() {
  try {
    const res = await api.getLeaveRequests()
    // student only sees their own requests
    requests.value = res.data.filter(r => r.code === 'HV-0312')
  } catch (e) { console.error(e) }
}

const usedQuota = computed(() => requests.value.filter(r => r.status === 'Đã duyệt').length);
const remainingQuota = computed(() => {
  const maxQuota = 3;
  return Math.max(0, maxQuota - usedQuota.value);
});

const showModal = ref(false)
const form = ref({ date: '', reason: '' })

async function submitRequest() {
  if (!form.value.date || !form.value.reason) { alert('Vui lòng nhập đủ thông tin!'); return }
  try {
    const dateFormatted = new Date(form.value.date).toLocaleDateString('vi-VN')
    
    // Optimistic UI update
    const newReq = {
      id: Date.now(),
      date: dateFormatted,
      reason: form.value.reason,
      status: 'Chờ duyệt',
      dateSubmitted: new Date().toLocaleDateString('vi-VN'),
      reply: ''
    }
    requests.value.unshift(newReq)
    showModal.value = false
    
    api.createLeaveRequest({
      date: dateFormatted,
      reason: form.value.reason
    }).then(() => loadRequests()) // Background sync
    
    form.value = { date: '', reason: '' }
  } catch (e) {
    alert('Lỗi khi gửi yêu cầu')
  }
}

const statusClass = s => s==='Đã duyệt'?'status-approved':s==='Từ chối'?'status-rejected':'status-pending'

async function deleteRequest(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa đơn xin nghỉ này?')) return
  try {
    // Optimistic UI update
    requests.value = requests.value.filter(r => r.id !== id)
    api.deleteLeaveRequest(id).catch(() => loadRequests())
  } catch (e) {
    alert('Lỗi khi xóa đơn')
  }
}
</script>

<template>
<div class="page-container">
  <!-- Submit Modal -->
  <transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal-content form-modal">
        <div class="modal-header">
          <h3 class="modal-title">Tạo đơn xin nghỉ</h3>
          <button @click="showModal=false" class="close-btn">✕</button>
        </div>
        <div class="modal-body form-grid">
          <div class="info-alert mb-4">
            <span class="icon">ℹ️</span>
            <span>Học viên chỉ được nghỉ tối đa <strong>3 buổi</strong>/khóa học. Vui lòng cân nhắc trước khi gửi đơn.</span>
          </div>
          
          <div class="form-group full-width">
            <label>Ngày xin nghỉ <span class="required">*</span></label>
            <input type="date" v-model="form.date" class="form-input" />
          </div>
          <div class="form-group full-width">
            <label>Lý do nghỉ <span class="required">*</span></label>
            <textarea v-model="form.reason" placeholder="Ví dụ: Bận việc gia đình, ốm..." class="form-input form-textarea"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showModal=false">Huỷ bỏ</button>
          <button class="btn-primary" @click="submitRequest">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Gửi đơn
          </button>
        </div>
      </div>
    </div>
  </transition>

  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Xin Nghỉ Học</h2>
      <p class="page-desc">Gửi yêu cầu nghỉ học và theo dõi trạng thái duyệt đơn</p>
    </div>
    <div class="header-actions">
      <div class="leave-quota">
        <span class="quota-item">Đã nghỉ: <span class="quota-val used">{{ usedQuota }}</span> buổi</span>
        <span class="quota-divider">|</span>
        <span class="quota-item">Còn lại: <span class="quota-val">{{ remainingQuota }}/3</span> buổi</span>
      </div>
      <button class="btn-primary btn-icon-text" @click="showModal=true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Tạo đơn xin nghỉ
      </button>
    </div>
  </div>

  <div class="premium-card">
    <div class="card-header">
      <h3 class="card-title">Lịch sử xin nghỉ</h3>
    </div>
    
    <div class="request-list">
      <transition-group name="list">
        <div v-for="r in requests" :key="r.id" class="request-item">
          <div class="request-main">
            <div class="date-box" :class="r.status==='Đã duyệt'?'date-green':r.status==='Từ chối'?'date-red':'date-yellow'">
              <span class="day">{{ r.date.split('/')[0] }}</span>
              <span class="month-year">Th{{ r.date.split('/')[1] }}, {{ r.date.split('/')[2] }}</span>
            </div>
            <div class="request-info">
              <div class="request-reason">"{{ r.reason }}"</div>
              <div class="request-meta">Ngày nộp: {{ r.dateSubmitted }}</div>
              <div v-if="r.reply" class="teacher-reply">
                <span class="reply-icon">💬</span> <strong>Phản hồi:</strong> {{ r.reply }}
              </div>
            </div>
          </div>
          
          <div class="request-actions-status">
            <div class="status-badge" :class="statusClass(r.status)">
              <span class="status-dot"></span>
              {{ r.status }}
            </div>
            <button v-if="r.status === 'Chờ duyệt'" class="btn-delete-request" @click="deleteRequest(r.id)" title="Xóa đơn này">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Xóa đơn
            </button>
          </div>
        </div>
      </transition-group>
    </div>
    
    <div v-if="requests.length === 0" class="empty-state">
      <div class="empty-icon">📂</div>
      <h3 class="empty-title">Chưa có đơn xin nghỉ nào</h3>
      <p class="empty-desc">Bạn chưa gửi yêu cầu xin nghỉ nào trong khóa học này.</p>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR STUDENT LEAVE REQUEST ── */
.page-container { max-width: 1000px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.page-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
.page-desc { color: #64748b; font-size: 14px; }

.header-actions { display: flex; gap: 16px; align-items: center; }

.leave-quota { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 16px; border-radius: 12px; font-size: 14px; font-weight: 500; color: #166534; display: flex; align-items: center; gap: 12px; }
.quota-item { display: flex; align-items: center; gap: 4px; }
.quota-val { font-weight: 800; color: #059669; font-size: 16px; }
.quota-val.used { color: #dc2626; }
.quota-divider { color: #86efac; }

.btn-icon-text { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: all 0.2s; cursor: pointer; border: none; }
.btn-primary { background: #0d9488; color: white; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2); }
.btn-primary:hover { background: #0f766e; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(13, 148, 136, 0.3); }

/* Main Card */
.premium-card { background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; padding: 24px; }
.card-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
.card-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }

/* Request List */
.request-list { display: flex; flex-direction: column; gap: 16px; }
.request-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px; border-radius: 16px; background: #f8fafc; border: 1px solid #f1f5f9; transition: transform 0.2s, box-shadow 0.2s; }
.request-item:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

.request-main { display: flex; gap: 20px; flex: 1; }

.date-box { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 16px; flex-shrink: 0; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); }
.date-green { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.date-yellow { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
.date-red { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.day { font-size: 26px; font-weight: 800; line-height: 1; }
.month-year { font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 4px; opacity: 0.8; }

.request-info { display: flex; flex-direction: column; gap: 6px; padding-top: 4px; }
.request-reason { font-size: 16px; font-weight: 600; color: #334155; font-style: italic; }
.request-meta { font-size: 13px; color: #94a3b8; font-weight: 500; }

.teacher-reply { margin-top: 8px; padding: 10px 14px; background: white; border-radius: 10px; font-size: 13px; color: #475569; border: 1px solid #e2e8f0; display: inline-flex; align-items: flex-start; gap: 8px; }
.reply-icon { font-size: 14px; }

.status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-approved { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.status-approved .status-dot { background: #10b981; }
.status-pending { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
.status-pending .status-dot { background: #f97316; }
.status-rejected { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.status-rejected .status-dot { background: #ef4444; }

.request-actions-status { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.btn-delete-request { background: white; border: 1px solid #fecaca; color: #ef4444; cursor: pointer; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.btn-delete-request:hover { background: #fef2f2; border-color: #ef4444; }

/* Empty State */
.empty-state { padding: 60px 20px; text-align: center; }
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
.empty-title { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
.empty-desc { color: #64748b; font-size: 14px; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-content { background: white; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out; }
.form-modal { max-width: 500px; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-size: 18px; font-weight: 700; color: #0f172a; }
.close-btn { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; transition: color 0.2s; }
.close-btn:hover { color: #ef4444; }
.modal-body { padding: 24px; overflow-y: auto; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; }

.info-alert { display: flex; gap: 12px; padding: 12px; background: #eff6ff; border-radius: 10px; border: 1px solid #bfdbfe; font-size: 13px; color: #1e40af; line-height: 1.4; }

.form-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
.required { color: #ef4444; }
.form-input { width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 14px; color: #334155; background: white; transition: all 0.2s; outline: none; }
.form-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
.form-textarea { min-height: 100px; resize: vertical; }
.btn-secondary { background: white; color: #334155; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { background: #f8fafc; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.list-enter-active, .list-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(0.95) translateY(-20px); }
.list-leave-active { position: absolute; }
</style>
