<script setup>
import { ref, computed } from 'vue'

// Học viên chỉ được xem các khóa học mình đã đăng ký
const enrolledCourses = ref([
  { id: 'C01', name: 'TOEIC 600+', totalSessions: 36, startDate: '01/05/2025' },
  { id: 'C02', name: 'Tiếng Anh Giao Tiếp Cơ Bản', totalSessions: 24, startDate: '15/04/2025' }
])

const selectedCourse = ref(enrolledCourses.value[0].id)

// Dữ liệu điểm danh chi tiết từng buổi cho khóa học
const attendanceDetails = ref({
  'C01': [
    { session: 1, date: '01/05/2025', status: 'P', note: '' },
    { session: 2, date: '03/05/2025', status: 'P', note: '' },
    { session: 3, date: '05/05/2025', status: 'L', note: 'Đi muộn 15p' },
    { session: 4, date: '08/05/2025', status: 'P', note: '' },
    { session: 5, date: '10/05/2025', status: 'A', note: 'Không phép' },
    { session: 6, date: '12/05/2025', status: 'P', note: '' },
  ],
  'C02': [
    { session: 1, date: '15/04/2025', status: 'P', note: '' },
    { session: 2, date: '17/04/2025', status: 'A', note: 'Xin nghỉ phép' },
    { session: 3, date: '20/04/2025', status: 'P', note: '' },
    { session: 4, date: '22/04/2025', status: 'P', note: '' },
  ]
})

const currentDetails = computed(() => attendanceDetails.value[selectedCourse.value] || [])
const currentCourseInfo = computed(() => enrolledCourses.value.find(c => c.id === selectedCourse.value))

const summary = computed(() => {
  const details = currentDetails.value
  const present = details.filter(d => d.status === 'P').length
  const late = details.filter(d => d.status === 'L').length
  const absent = details.filter(d => d.status === 'A').length
  const totalConducted = details.length
  const rate = totalConducted > 0 ? Math.round(((present + late)/totalConducted)*100) : 0
  
  return { present, late, absent, totalConducted, rate }
})

const statusMap = {
  'P': { text: 'Có mặt', class: 'status-p', icon: '✓' },
  'L': { text: 'Đi muộn', class: 'status-l', icon: '!' },
  'A': { text: 'Vắng mặt', class: 'status-a', icon: '✕' }
}
</script>

<template>
<div class="page-container">
  <!-- Header -->
  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Thống kê Điểm danh</h2>
      <p class="page-desc">Theo dõi tình trạng chuyên cần theo từng khóa học của bạn</p>
    </div>
    <div class="header-actions">
      <div class="select-wrapper">
        <select v-model="selectedCourse" class="filter-select large-select">
          <option v-for="c in enrolledCourses" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </div>
  </div>

  <div class="dashboard-grid">
    <!-- Left: Stats Overview -->
    <div class="stats-column">
      <div class="premium-card overview-card">
        <div class="course-meta">
          <div class="course-icon">🎓</div>
          <div>
            <h3 class="course-name">{{ currentCourseInfo.name }}</h3>
            <p class="course-dates">Khóa học {{ currentCourseInfo.totalSessions }} buổi • Bắt đầu: {{ currentCourseInfo.startDate }}</p>
          </div>
        </div>
        
        <div class="rate-circle-container">
          <svg class="rate-circle" viewBox="0 0 36 36">
            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="circle-path" :stroke-dasharray="summary.rate + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div class="rate-text">
            <span class="rate-val">{{ summary.rate }}%</span>
            <span class="rate-label">Tỷ lệ đi học</span>
          </div>
        </div>

        <div class="stats-boxes">
          <div class="stat-box box-p">
            <div class="stat-num">{{ summary.present }}</div>
            <div class="stat-lbl">Có mặt</div>
          </div>
          <div class="stat-box box-l">
            <div class="stat-num">{{ summary.late }}</div>
            <div class="stat-lbl">Đi muộn</div>
          </div>
          <div class="stat-box box-a">
            <div class="stat-num">{{ summary.absent }}</div>
            <div class="stat-lbl">Vắng mặt</div>
          </div>
        </div>
        
        <div class="alert-box mt-4">
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">Chú ý: Nếu vắng mặt quá 20% tổng số buổi, bạn sẽ không đủ điều kiện dự thi cuối kỳ.</span>
        </div>
      </div>
    </div>

    <!-- Right: Detailed Log -->
    <div class="details-column">
      <div class="premium-card">
        <div class="card-header border-bottom">
          <h3 class="card-title">Chi tiết các buổi đã học ({{ summary.totalConducted }} buổi)</h3>
        </div>
        
        <div class="history-list">
          <div v-for="(log, idx) in currentDetails" :key="idx" class="history-item">
            <div class="history-left">
              <div class="session-badge">Buổi {{ log.session }}</div>
              <div class="session-date">📅 {{ log.date }}</div>
            </div>
            
            <div class="history-right">
              <div class="history-note text-muted" v-if="log.note">"{{ log.note }}"</div>
              <div class="status-pill" :class="statusMap[log.status].class">
                <span class="pill-icon">{{ statusMap[log.status].icon }}</span>
                {{ statusMap[log.status].text }}
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="currentDetails.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-desc">Chưa có dữ liệu điểm danh cho khóa học này.</p>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR STUDENT ATTENDANCE STATS ── */
.page-container { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.page-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
.page-title { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
.page-desc { color: #64748b; font-size: 15px; margin: 0; }

.select-wrapper { position: relative; }
.filter-select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 16px center; background-size: 16px; padding: 12px 48px 12px 20px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 16px; font-weight: 700; color: #0f172a; background-color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); min-width: 320px; outline: none; transition: all 0.2s; }
.filter-select:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1); }

/* Grid Layout */
.dashboard-grid { display: grid; grid-template-columns: 400px 1fr; gap: 24px; align-items: start; }
@media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }

.premium-card { background: white; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 4px 10px -5px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; overflow: hidden; }

/* Overview Card */
.overview-card { padding: 32px; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); }
.course-meta { display: flex; gap: 16px; align-items: center; margin-bottom: 32px; }
.course-icon { font-size: 36px; background: #f0fdfa; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; box-shadow: 0 4px 6px rgba(13, 148, 136, 0.1); border: 1px solid #ccfbf1; }
.course-name { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; }
.course-dates { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }

.rate-circle-container { position: relative; width: 180px; height: 180px; margin: 0 auto 32px auto; }
.rate-circle { width: 100%; height: 100%; }
.circle-bg { fill: none; stroke: #e2e8f0; stroke-width: 3; }
.circle-path { fill: none; stroke: #0d9488; stroke-width: 3; stroke-linecap: round; animation: progress 1.5s ease-out forwards; }
@keyframes progress { from { stroke-dasharray: 0, 100; } }

.rate-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; }
.rate-val { font-size: 36px; font-weight: 900; color: #0f172a; }
.rate-label { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

.stats-boxes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-box { padding: 16px; border-radius: 16px; text-align: center; border: 1px solid transparent; }
.stat-num { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
.stat-lbl { font-size: 12px; font-weight: 600; opacity: 0.8; text-transform: uppercase; }

.box-p { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.box-l { background: #fef9c3; color: #854d0e; border-color: #fef08a; }
.box-a { background: #fef2f2; color: #991b1b; border-color: #fecaca; }

.mt-4 { margin-top: 24px; }
.alert-box { display: flex; gap: 12px; padding: 16px; background: #fffbeb; border-radius: 12px; border: 1px solid #fde68a; }
.alert-text { font-size: 13px; color: #92400e; font-weight: 500; line-height: 1.5; }

/* Details Column */
.card-header { padding: 24px; }
.border-bottom { border-bottom: 1px solid #f1f5f9; }
.card-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }

.history-list { display: flex; flex-direction: column; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f8fafc; transition: background-color 0.2s; }
.history-item:hover { background-color: #f8fafc; }
.history-item:last-child { border-bottom: none; }

.history-left { display: flex; align-items: center; gap: 16px; }
.session-badge { background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 700; min-width: 80px; text-align: center; }
.session-date { font-size: 15px; font-weight: 600; color: #0f172a; }

.history-right { display: flex; align-items: center; gap: 16px; }
.history-note { font-size: 14px; font-style: italic; }

.status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; min-width: 110px; justify-content: center; }
.pill-icon { font-size: 12px; background: rgba(255,255,255,0.5); width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

.status-p { background: #dcfce7; color: #166534; }
.status-l { background: #fef08a; color: #854d0e; }
.status-a { background: #fee2e2; color: #991b1b; }

.empty-state { padding: 60px 20px; text-align: center; }
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
.empty-desc { color: #64748b; font-size: 15px; font-weight: 500; }
</style>
