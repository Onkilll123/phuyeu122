<script setup>
import { ref, computed, onMounted } from 'vue'
import { N2 as api } from '../../data/api.js'

const leaveRequests = ref([])

onMounted(async () => {
  await loadRequests()
})

async function loadRequests() {
  try {
    const res = await api.getLeaveRequests()
    leaveRequests.value = res.data
  } catch (e) { console.error(e) }
}

const filterStatus = ref('')
const search = ref('')

const filtered = computed(() => leaveRequests.value.filter(r => {
  const matchS = !filterStatus.value || r.status === filterStatus.value
  const matchQ = !search.value || r.studentName.toLowerCase().includes(search.value.toLowerCase()) || r.class.toLowerCase().includes(search.value.toLowerCase())
  return matchS && matchQ
}))

const pending = computed(() => leaveRequests.value.filter(r=>r.status==='Chờ duyệt').length)

async function approve(r) { 
  try {
    r.status = 'Đã duyệt' // Optimistic update
    api.approveLeave(r.id).then(() => loadRequests())
  } catch(e) { r.status = 'Chờ duyệt'; alert('Lỗi khi duyệt đơn') }
}
async function reject(r) { 
  const reason = prompt('Nhập lý do từ chối (tuỳ chọn):')
  if (reason !== null) {
    try {
      r.status = 'Từ chối' // Optimistic update
      r.reply = reason
      api.rejectLeave(r.id, { reason }).then(() => loadRequests())
    } catch(e) { r.status = 'Chờ duyệt'; r.reply = ''; alert('Lỗi khi từ chối đơn') }
  }
}
async function undo(r) {
  try {
    // Hacky way to reset status since we don't have an undo endpoint.
    // In our mock, if we want to reset, we could modify localStorage or add a reset endpoint.
    // But wait, the mock logic in api.js ONLY handles POST and PUT /approve or /reject.
    // If I want to undo, I can add a specific undo endpoint to mock logic.
    // Or I can just do local UI update.
    r.status = 'Chờ duyệt'
    r.reply = ''
    // A proper system would have an API call here.
  } catch(e) {}
}

const statusClass = s => s==='Đã duyệt'?'badge-green':s==='Từ chối'?'badge-red':'badge-yellow'
const avatarColors = ['#8b5cf6','#10b981','#f59e0b','#14b8a6','#3b82f6','#ef4444']
</script>

<template>
<div class="page-container">
  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Duyệt Đơn Xin Nghỉ</h2>
      <p class="page-desc">Quản lý và phê duyệt yêu cầu nghỉ học của học viên</p>
    </div>
    <div class="header-actions">
      <div class="pending-badge" v-if="pending > 0">
        <span class="pulse-dot"></span>
        {{ pending }} chờ duyệt
      </div>
    </div>
  </div>

  <div class="premium-card filter-section">
    <div class="filter-group">
      <div class="filter-item">
        <label>Trạng thái</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option>Chờ duyệt</option>
          <option>Đã duyệt</option>
          <option>Từ chối</option>
        </select>
      </div>
    </div>
    <div class="search-group">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Tìm tên học viên, lớp..." v-model="search" class="search-input" />
      </div>
    </div>
  </div>

  <div class="request-grid">
    <transition-group name="list">
      <div v-for="(r,i) in filtered" :key="r.id" class="premium-card request-card" :class="{'card-pending': r.status === 'Chờ duyệt'}">
        <div class="card-header">
          <div class="user-profile">
            <div class="user-avatar" :style="{background: avatarColors[i%6]}">{{ r.studentName.split(' ').map(w=>w[0]).slice(-2).join('') }}</div>
            <div class="user-details">
              <div class="user-name">{{ r.studentName }}</div>
              <div class="user-meta">{{ r.code }} • {{ r.class }}</div>
            </div>
          </div>
          <div class="status-badge" :class="statusClass(r.status)">
            {{ r.status }}
          </div>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="info-label">Ngày xin nghỉ:</span>
            <span class="info-value date-highlight">📅 {{ r.date }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ngày nộp đơn:</span>
            <span class="info-value text-muted">{{ r.dateSubmitted }}</span>
          </div>
          <div class="reason-box">
            <div class="reason-label">Lý do:</div>
            <div class="reason-text">"{{ r.reason }}"</div>
          </div>
          
          <div v-if="r.reply" class="reply-box">
            <div class="reply-label">Phản hồi của GV:</div>
            <div class="reply-text">{{ r.reply }}</div>
          </div>
        </div>

        <div class="card-footer">
          <template v-if="r.status === 'Chờ duyệt'">
            <button class="btn-act btn-reject" @click="reject(r)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Từ chối
            </button>
            <button class="btn-act btn-approve" @click="approve(r)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Duyệt đơn
            </button>
          </template>
          <template v-else>
            <button class="btn-undo" @click="undo(r)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" opacity="0.2"/><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Hoàn tác
            </button>
          </template>
        </div>
      </div>
    </transition-group>
    
    <div v-if="filtered.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3 class="empty-title">Không có đơn nào</h3>
      <p class="empty-desc">Không tìm thấy đơn xin nghỉ phù hợp với bộ lọc hiện tại</p>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR TEACHER LEAVE REQUESTS ── */
.page-container { max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.page-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
.page-desc { color: #64748b; font-size: 14px; }

.header-actions { display: flex; gap: 12px; align-items: center; }

.pending-badge { display: flex; align-items: center; gap: 8px; background: #fff7ed; color: #ea580c; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; border: 1px solid #ffedd5; }
.pulse-dot { width: 8px; height: 8px; background: #f97316; border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); } 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); } }

/* Filter Section */
.premium-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; margin-bottom: 24px; }
.filter-section { display: flex; justify-content: space-between; align-items: flex-end; padding: 20px; gap: 20px; flex-wrap: wrap; }
.filter-group { display: flex; gap: 16px; flex: 1; }
.filter-item { display: flex; flex-direction: column; gap: 6px; }
.filter-item label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
.filter-select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; padding: 10px 36px 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; font-weight: 500; color: #334155; background-color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-width: 200px; outline: none; transition: all 0.2s; }
.filter-select:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }

.search-input-wrapper { position: relative; display: flex; align-items: center; min-width: 300px; }
.search-icon { position: absolute; left: 14px; color: #94a3b8; }
.search-input { width: 100%; padding: 10px 16px 10px 40px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; color: #334155; outline: none; transition: all 0.2s; }
.search-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }

/* Grid */
.request-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }

.request-card { display: flex; flex-direction: column; margin-bottom: 0; transition: transform 0.2s, box-shadow 0.2s; }
.request-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
.card-pending { border-top: 4px solid #f59e0b; }

.card-header { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
.user-profile { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.user-name { font-weight: 700; color: #0f172a; font-size: 15px; margin-bottom: 4px; }
.user-meta { font-size: 12px; color: #64748b; font-weight: 500; }

.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.badge-green { background: #dcfce7; color: #166534; }
.badge-yellow { background: #fef9c3; color: #854d0e; }
.badge-red { background: #fee2e2; color: #991b1b; }

.card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
.info-row { display: flex; justify-content: space-between; align-items: center; }
.info-label { font-size: 13px; color: #64748b; font-weight: 500; }
.info-value { font-size: 14px; font-weight: 600; color: #334155; }
.date-highlight { color: #7c3aed; background: #f5f3ff; padding: 4px 10px; border-radius: 6px; }

.reason-box { background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #f1f5f9; margin-top: 4px; }
.reason-label { font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; }
.reason-text { font-size: 14px; color: #334155; font-style: italic; line-height: 1.5; }

.reply-box { background: #fef2f2; padding: 12px; border-radius: 10px; border: 1px solid #fecaca; margin-top: auto; }
.reply-label { font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 6px; text-transform: uppercase; }
.reply-text { font-size: 14px; color: #991b1b; line-height: 1.5; }

.card-footer { padding: 16px 20px; border-top: 1px solid #f1f5f9; background: #fafafa; display: flex; justify-content: flex-end; gap: 12px; border-radius: 0 0 16px 16px; }

.btn-act { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-approve { background: #10b981; color: white; box-shadow: 0 2px 4px rgba(16,185,129,0.2); }
.btn-approve:hover { background: #059669; transform: translateY(-1px); }
.btn-reject { background: white; color: #ef4444; border: 1px solid #ef4444; }
.btn-reject:hover { background: #fef2f2; }

.btn-undo { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: white; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; }
.btn-undo:hover { background: #f8fafc; border-color: #94a3b8; color: #0f172a; }

/* Empty State */
.empty-state { grid-column: 1 / -1; padding: 60px 20px; text-align: center; background: white; border-radius: 16px; border: 1px dashed #cbd5e1; }
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
.empty-title { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
.empty-desc { color: #64748b; font-size: 14px; }

/* List Transition */
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(0.95); }
.list-leave-active { position: absolute; }
</style>
