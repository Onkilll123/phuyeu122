<script setup>
import { ref, computed, onMounted } from 'vue'
import { attendanceToday, attendanceStats } from '../../data/mockData.js'
import { N1 as api } from '../../data/api.js'

const selectedClass = ref('Lập trình Java Web & Spring Boot')
// Add dynamic date and session selection

const courses = ref([])
onMounted(async () => {
  try {
    const res = await api.getCourses()
    courses.value = res.data.map(c => ({ id: c.id, name: c.title || c.name }))
  } catch (e) {}
})
const attendanceDate = ref(new Date().toISOString().split('T')[0])
const sessionNum = ref(24)
const totalSessions = ref(48)

const list = ref(attendanceToday.map(s => ({...s})))
const stats = ref(attendanceStats.map(s => ({...s})))
const saved = ref(false)

// Formatting helpers
const formattedDate = computed(() => {
  if (!attendanceDate.value) return ''
  return new Date(attendanceDate.value).toLocaleDateString('vi-VN', {weekday:'long', year:'numeric', month:'long', day:'numeric'})
})

function setStatus(s, status) { s.status = s.status === status ? '' : status }

const summary = computed(() => ({
  p: list.value.filter(s=>s.status==='P').length,
  a: list.value.filter(s=>s.status==='A').length,
  l: list.value.filter(s=>s.status==='L').length,
  none: list.value.filter(s=>!s.status).length,
}))

function saveAttendance() {
  if (!attendanceDate.value || !sessionNum.value) {
    alert('Vui lòng chọn ngày và buổi điểm danh hợp lệ!')
    return
  }
  if (summary.value.none > 0) {
    if (!confirm(`Còn ${summary.value.none} học viên chưa điểm danh. Tiếp tục lưu?`)) return
  }
  // Simulate saving logic
  list.value.forEach(s => {
    const found = stats.value.find(st => st.name === s.studentName)
    if (found && s.status === 'P') { found.present++; found.rate = Math.round(found.present/(found.present+found.absent)*100) }
    else if (found && s.status === 'A') { found.absent++; found.rate = Math.round(found.present/(found.present+found.absent)*100) }
  })
  saved.value = true
  setTimeout(() => saved.value = false, 3000)
}

function selectAll(status) { list.value.forEach(s => s.status = status) }
const attColor = v => v>=80?'#10b981':v>=60?'#f59e0b':'#ef4444'
const attBg = v => v>=80?'#dcfce7':v>=60?'#fef3c7':'#fee2e2'
const avatarColors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#14b8a6','#ef4444']
</script>

<template>
<div class="page-container">
  <!-- Header -->
  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Điểm danh</h2>
      <p class="page-desc">Ghi nhận chuyên cần lớp học</p>
    </div>
    <div class="header-actions">
      <button class="btn-primary btn-icon-text" @click="saveAttendance">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Lưu điểm danh
      </button>
    </div>
  </div>

  <!-- Selection Controls -->
  <div class="premium-card control-panel mb-6">
    <div class="control-group">
      <label class="control-label">Khóa học / Lớp</label>
      <div class="select-wrapper">
        <select v-model="selectedClass" class="filter-select large-select">
          <option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
      </div>
    </div>
    <div class="control-divider"></div>
    <div class="control-group">
      <label class="control-label">Ngày điểm danh</label>
      <input type="date" v-model="attendanceDate" class="control-input" />
      <div class="input-hint">{{ formattedDate }}</div>
    </div>
    <div class="control-group">
      <label class="control-label">Buổi học số</label>
      <div class="session-input-wrapper">
        <input type="number" v-model="sessionNum" min="1" :max="totalSessions" class="control-input small-input" />
        <span class="session-divider">/</span>
        <input type="number" v-model="totalSessions" min="1" class="control-input small-input muted-input" />
      </div>
    </div>
  </div>

  <!-- Success Toast -->
  <transition name="slide-down">
    <div v-if="saved" class="toast-success">
      <div class="toast-icon">✓</div>
      <div class="toast-content">
        <div class="toast-title">Thành công!</div>
        <div class="toast-message">Đã lưu điểm danh cho lớp {{ selectedClass }} (Buổi {{ sessionNum }}).</div>
      </div>
    </div>
  </transition>

  <div class="grid-layout">
    <!-- Main Form Column -->
    <div class="main-column">
      <div class="premium-card">
        <div class="card-header">
          <div class="card-title-group">
            <h3 class="card-title">Danh sách học viên</h3>
          </div>
          <div class="quick-actions">
            <button class="btn-outline-small" @click="selectAll('P')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Tất cả có mặt
            </button>
            <button class="btn-outline-small" @click="selectAll('')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Đặt lại
            </button>
          </div>
        </div>

        <div class="summary-bar">
          <div class="summary-item green"><span class="dot"></span> Có mặt: <strong>{{ summary.p }}</strong></div>
          <div class="summary-item red"><span class="dot"></span> Vắng: <strong>{{ summary.a }}</strong></div>
          <div class="summary-item yellow"><span class="dot"></span> Đi muộn: <strong>{{ summary.l }}</strong></div>
          <div class="summary-item gray"><span class="dot"></span> Chưa ĐD: <strong>{{ summary.none }}</strong></div>
        </div>

        <div class="table-responsive">
          <table class="premium-table attendance-table">
            <thead>
              <tr>
                <th width="50">#</th>
                <th>HỌC VIÊN</th>
                <th width="300">TRẠNG THÁI</th>
                <th width="200">GHI CHÚ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s,i) in list" :key="s.id" class="table-row" :class="{'row-present':s.status==='P', 'row-absent':s.status==='A', 'row-late':s.status==='L'}">
                <td class="text-muted text-center">{{ String(i+1).padStart(2,'0') }}</td>
                <td>
                  <div class="user-profile">
                    <div class="user-avatar-sm" :style="{background: avatarColors[i%6]}">{{ s.studentName.split(' ').map(w=>w[0]).slice(-2).join('') }}</div>
                    <div class="user-details">
                      <div class="user-name">{{ s.studentName }}</div>
                      <div class="user-code">{{ s.code }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="segmented-control">
                    <button class="segment-btn btn-p" :class="{active: s.status==='P'}" @click="setStatus(s,'P')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Có mặt
                    </button>
                    <button class="segment-btn btn-l" :class="{active: s.status==='L'}" @click="setStatus(s,'L')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Muộn
                    </button>
                    <button class="segment-btn btn-a" :class="{active: s.status==='A'}" @click="setStatus(s,'A')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Vắng
                    </button>
                  </div>
                </td>
                <td>
                  <input class="note-input" placeholder="Thêm ghi chú..." v-model="s.note" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Side Panel -->
    <div class="side-panel">
      <div class="premium-card">
        <h3 class="panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Thống kê chuyên cần
        </h3>
        
        <div class="overall-progress">
          <div class="progress-header">
            <span class="progress-label">Tỷ lệ có mặt hôm nay</span>
            <span class="progress-value">{{ list.length ? Math.round(summary.p/list.length*100) : 0 }}%</span>
          </div>
          <div class="progress-track-lg">
            <div class="progress-fill-lg" :style="{width: list.length ? (summary.p/list.length*100)+'%' : '0%'}"></div>
          </div>
        </div>

        <div class="stats-list-container">
          <table class="stats-table">
            <thead>
              <tr>
                <th>HỌC VIÊN</th>
                <th class="text-center" title="Có mặt/Vắng">C / V</th>
                <th class="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in stats" :key="s.name">
                <td class="stat-name">{{ s.name }}</td>
                <td class="text-center">
                  <span class="text-green">{{ s.present }}</span>
                  <span class="text-muted mx-1">/</span>
                  <span class="text-red">{{ s.absent }}</span>
                </td>
                <td class="text-right">
                  <span class="stat-badge" :style="{color: attColor(s.rate), background: attBg(s.rate)}">{{ s.rate }}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="info-alert">
          <div class="info-icon">ℹ️</div>
          <div class="info-text">Học viên cần duy trì <strong>trên 70%</strong> điểm danh để đủ điều kiện thi cuối kỳ.</div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR ATTENDANCE ── */
.page-container { max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.page-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
.page-desc { color: #64748b; font-size: 14px; margin: 0; }

.mb-6 { margin-bottom: 24px; }

/* Control Panel */
.control-panel { display: flex; gap: 24px; align-items: center; padding: 20px 24px; background: linear-gradient(to right, #ffffff, #f8fafc); border-radius: 16px; border: 1px solid #e2e8f0; }
.control-group { display: flex; flex-direction: column; gap: 8px; }
.control-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.control-divider { width: 1px; height: 40px; background: #e2e8f0; margin: 0 12px; }
.input-hint { font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 2px; }

.select-wrapper { position: relative; }
.filter-select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; padding: 10px 40px 10px 16px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 15px; font-weight: 600; color: #0f172a; background-color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-width: 220px; outline: none; transition: all 0.2s; }
.large-select { font-size: 16px; min-width: 280px; }
.filter-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.control-input { padding: 10px 16px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 15px; font-weight: 600; color: #0f172a; outline: none; transition: all 0.2s; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); }
.control-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.session-input-wrapper { display: flex; align-items: center; gap: 8px; }
.small-input { width: 70px; text-align: center; padding: 10px; }
.muted-input { color: #64748b; background: #f8fafc; border-color: #e2e8f0; }
.session-divider { font-size: 18px; color: #94a3b8; font-weight: 300; }

.btn-icon-text { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: all 0.2s; cursor: pointer; }
.btn-primary { background: #2563eb; color: white; border: none; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
.btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3); }

.btn-outline-small { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; }
.btn-outline-small:hover { background: #f8fafc; border-color: #94a3b8; }

/* Toast */
.toast-success { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: white; border: 1px solid #86efac; border-radius: 12px; padding: 12px 20px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); z-index: 1000; }
.toast-icon { width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
.toast-title { font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
.toast-message { color: #64748b; font-size: 13px; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translate(-50%, -20px); }

/* Layout */
.grid-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
.premium-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; padding: 24px; }

/* Main Card */
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-title-group { display: flex; align-items: center; gap: 12px; }
.card-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }

.summary-bar { display: flex; gap: 16px; background: #f8fafc; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; border: 1px solid #f1f5f9; }
.summary-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; }
.summary-item strong { color: #0f172a; font-size: 15px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.green .dot { background: #10b981; }
.red .dot { background: #ef4444; }
.yellow .dot { background: #f59e0b; }
.gray .dot { background: #94a3b8; }

/* Table */
.table-responsive { width: 100%; overflow-x: auto; }
.premium-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.premium-table th { background: #f8fafc; padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
.premium-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; transition: background-color 0.2s; }
.text-center { text-align: center; }

.row-present td { background: rgba(220, 252, 231, 0.3); }
.row-absent td { background: rgba(254, 226, 226, 0.3); }
.row-late td { background: rgba(254, 249, 195, 0.3); }

.user-profile { display: flex; align-items: center; gap: 12px; }
.user-avatar-sm { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.user-name { font-weight: 600; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
.user-code { font-size: 12px; color: #64748b; }

/* Segmented Control */
.segmented-control { display: flex; background: #f1f5f9; padding: 4px; border-radius: 8px; width: max-content; }
.segment-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; border: none; background: transparent; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
.segment-btn:hover { color: #334155; }
.btn-p.active { background: white; color: #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #86efac; }
.btn-l.active { background: white; color: #d97706; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #fde047; }
.btn-a.active { background: white; color: #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #fca5a5; }

.note-input { width: 100%; padding: 8px 12px; border: 1px solid transparent; border-radius: 6px; font-size: 13px; color: #334155; background: transparent; transition: all 0.2s; outline: none; }
.note-input:focus, .note-input:not(:placeholder-shown) { border-color: #cbd5e1; background: white; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }

/* Side Panel */
.panel-title { font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; margin-top: 0; margin-bottom: 20px; }

.overall-progress { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
.progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.progress-label { font-size: 13px; font-weight: 600; color: #475569; }
.progress-value { font-size: 24px; font-weight: 800; color: #2563eb; }
.progress-track-lg { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.progress-fill-lg { height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.5s ease; }

.stats-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
.stats-table th { text-align: left; padding: 0 0 12px 0; font-size: 11px; font-weight: 600; color: #94a3b8; border-bottom: 1px solid #e2e8f0; }
.stats-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
.stat-name { font-weight: 600; color: #334155; }
.text-right { text-align: right; }
.text-green { color: #10b981; font-weight: 600; }
.text-red { color: #ef4444; font-weight: 600; }
.mx-1 { margin: 0 4px; }
.stat-badge { padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 12px; }

.info-alert { display: flex; gap: 12px; padding: 12px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe; }
.info-icon { font-size: 16px; }
.info-text { font-size: 13px; color: #1e40af; line-height: 1.4; }
</style>
