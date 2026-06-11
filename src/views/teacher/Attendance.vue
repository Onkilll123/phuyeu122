<script setup>
import { ref, computed, onMounted } from 'vue'
import { teacherAttendanceList } from '../../data/mockData.js'
import { N1 as api } from '../../data/api.js'

const selectedClass = ref('Cấu trúc dữ liệu & Giải thuật')
const attendanceDate = ref(new Date().toISOString().split('T')[0])

const courses = ref([])
onMounted(async () => {
  try {
    const res = await api.getCourses()
    courses.value = res.data.map(c => ({ id: c.id, name: c.title || c.name }))
  } catch (e) {}
})
const sessionNum = ref(12)
const totalSessions = ref(36)

const list = ref(teacherAttendanceList.map(s => ({...s})))
const saved = ref(false)

const formattedDate = computed(() => {
  if (!attendanceDate.value) return ''
  return new Date(attendanceDate.value).toLocaleDateString('vi-VN', {weekday:'long', year:'numeric', month:'long', day:'numeric'})
})

const avatarColors = ['#8b5cf6','#10b981','#f59e0b','#14b8a6','#3b82f6','#ef4444']

const summary = computed(() => ({
  p: list.value.filter(s=>s.status==='P').length,
  l: list.value.filter(s=>s.status==='L').length,
  a: list.value.filter(s=>s.status==='A').length,
  none: list.value.filter(s=>!s.status).length,
}))

function setS(s, v) { s.status = s.status === v ? '' : v }
function selectAll(v) { list.value.forEach(s => s.status = v) }

function save() {
  if (!attendanceDate.value || !sessionNum.value) {
    alert('Vui lòng chọn ngày và buổi điểm danh!')
    return
  }
  if (summary.value.none > 0 && !confirm(`Còn ${summary.value.none} học viên chưa điểm danh. Lưu?`)) return
  saved.value = true; setTimeout(() => saved.value = false, 3000)
}
</script>

<template>
<div class="page-container">
  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Điểm danh Lớp học</h2>
      <p class="page-desc">Ghi nhận thông tin chuyên cần theo ngày</p>
    </div>
    <div class="header-actions">
      <button class="btn-primary btn-icon-text" @click="save">
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
          <option v-for="c in courses.slice(0,4)" :key="c.id" :value="c.name">{{ c.name }}</option>
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

  <transition name="slide-down">
    <div v-if="saved" class="toast-success">
      <div class="toast-icon">✓</div>
      <div class="toast-content">
        <div class="toast-title">Thành công!</div>
        <div class="toast-message">Đã lưu điểm danh lớp {{ selectedClass }} (Buổi {{ sessionNum }}).</div>
      </div>
    </div>
  </transition>

  <div class="premium-card">
    <div class="card-header">
      <div class="class-summary">
        <div class="summary-box green"><div class="box-val">{{ summary.p }}</div><div class="box-label">Có mặt</div></div>
        <div class="summary-box yellow"><div class="box-val">{{ summary.l }}</div><div class="box-label">Đi muộn</div></div>
        <div class="summary-box red"><div class="box-val">{{ summary.a }}</div><div class="box-label">Vắng mặt</div></div>
        <div class="summary-box gray"><div class="box-val">{{ summary.none }}</div><div class="box-label">Chưa ĐD</div></div>
      </div>
      <div class="quick-actions">
        <button class="btn-outline" @click="selectAll('P')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Đánh dấu tất cả có mặt
        </button>
        <button class="btn-outline btn-reset" @click="selectAll('')" title="Đặt lại">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="premium-table">
        <thead>
          <tr>
            <th width="60" class="text-center">STT</th>
            <th>HỌC VIÊN</th>
            <th width="400">TRẠNG THÁI ĐIỂM DANH</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s,i) in list" :key="s.id" class="table-row" :class="{'row-p':s.status==='P','row-l':s.status==='L','row-a':s.status==='A'}">
            <td class="text-muted text-center">{{ i+1 }}</td>
            <td>
              <div class="user-profile">
                <div class="user-avatar" :style="{background: avatarColors[i%6]}">{{ s.name.split(' ').map(w=>w[0]).slice(-2).join('') }}</div>
                <div class="user-details">
                  <div class="user-name">{{ s.name }}</div>
                  <div class="user-code">{{ s.code }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="segmented-control">
                <button class="segment-btn btn-p" :class="{active:s.status==='P'}" @click="setS(s,'P')">
                  <div class="icon-circle">✓</div> Có mặt
                </button>
                <button class="segment-btn btn-l" :class="{active:s.status==='L'}" @click="setS(s,'L')">
                  <div class="icon-circle">!</div> Đi muộn
                </button>
                <button class="segment-btn btn-a" :class="{active:s.status==='A'}" @click="setS(s,'A')">
                  <div class="icon-circle">✕</div> Vắng mặt
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR TEACHER ATTENDANCE ── */
.page-container { max-width: 1000px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
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
.filter-select:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }

.control-input { padding: 10px 16px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 15px; font-weight: 600; color: #0f172a; outline: none; transition: all 0.2s; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); }
.control-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }

.session-input-wrapper { display: flex; align-items: center; gap: 8px; }
.small-input { width: 70px; text-align: center; padding: 10px; }
.muted-input { color: #64748b; background: #f8fafc; border-color: #e2e8f0; }
.session-divider { font-size: 18px; color: #94a3b8; font-weight: 300; }

.btn-icon-text { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: all 0.2s; cursor: pointer; }
.btn-primary { background: #7c3aed; color: white; border: none; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2); }
.btn-primary:hover { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(124, 58, 237, 0.3); }
.btn-outline { display: flex; align-items: center; gap: 6px; background: white; color: #475569; border: 1px solid #cbd5e1; padding: 10px 16px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { background: #f8fafc; border-color: #94a3b8; color: #0f172a; }
.btn-reset { padding: 10px; }

/* Toast */
.toast-success { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: white; border: 1px solid #86efac; border-radius: 12px; padding: 12px 20px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 1000; }
.toast-icon { width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
.toast-title { font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
.toast-message { color: #64748b; font-size: 13px; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translate(-50%, -20px); }

/* Card */
.premium-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }

.card-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; background: #fafafa; flex-wrap: wrap; gap: 16px; }

.class-summary { display: flex; gap: 12px; }
.summary-box { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 12px; border: 1px solid transparent; }
.box-val { font-size: 24px; font-weight: 800; line-height: 1.2; }
.box-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
.green { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.yellow { background: #fef9c3; color: #854d0e; border-color: #fef08a; }
.red { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
.gray { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

.quick-actions { display: flex; gap: 8px; }

/* Table */
.table-responsive { width: 100%; overflow-x: auto; }
.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { background: white; padding: 16px 24px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
.premium-table td { padding: 12px 24px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; transition: background-color 0.2s; }
.text-center { text-align: center; }

.row-p td { background: rgba(240, 253, 244, 0.4); }
.row-l td { background: rgba(254, 249, 195, 0.4); }
.row-a td { background: rgba(254, 226, 226, 0.4); }
.table-row:hover td { background-color: #f8fafc; }
.row-p:hover td { background: rgba(240, 253, 244, 0.8); }
.row-l:hover td { background: rgba(254, 249, 195, 0.8); }
.row-a:hover td { background: rgba(254, 226, 226, 0.8); }

.user-profile { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.user-name { font-weight: 600; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
.user-code { font-size: 12px; color: #64748b; }

/* Segmented */
.segmented-control { display: inline-flex; background: #f1f5f9; padding: 4px; border-radius: 12px; gap: 4px; }
.segment-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: none; background: transparent; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
.icon-circle { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; background: #e2e8f0; color: white; transition: all 0.2s; }

.segment-btn:hover { color: #334155; }
.btn-p.active { background: white; color: #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.btn-p.active .icon-circle { background: #10b981; }
.btn-l.active { background: white; color: #d97706; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.btn-l.active .icon-circle { background: #f59e0b; }
.btn-a.active { background: white; color: #ef4444; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.btn-a.active .icon-circle { background: #ef4444; }
</style>
