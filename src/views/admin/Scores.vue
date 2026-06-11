<script setup>
import { ref, computed, onMounted } from 'vue'
import { scoresAdmin } from '../../data/mockData.js'
import { N1 as api } from '../../data/api.js'

const tab = ref('midterm')
const selectedClass = ref('Lập trình Java Web & Spring Boot')

const courses = ref([])
onMounted(async () => {
  try {
    const res = await api.getCourses()
    courses.value = res.data.map(c => ({ id: c.id, name: c.title || c.name }))
  } catch (e) {}
})
const saved = ref(false)
const scores = ref(scoresAdmin.map(s => ({...s, midTheory:s.writing, midPractical:s.listening, midProject:s.speaking, midAvg:s.average, finalTheory:8, finalPractical:7.5, finalProject:8.5, finalAvg:8.0})))

function calcAvg(s) {
  if (tab.value === 'midterm') {
    const arr = [parseFloat(s.midTheory||0), parseFloat(s.midPractical||0), parseFloat(s.midProject||0)]
    s.midAvg = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length * 10) / 10
    s.average = s.midAvg
  } else {
    const arr = [parseFloat(s.finalTheory||0), parseFloat(s.finalPractical||0), parseFloat(s.finalProject||0)]
    s.finalAvg = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length * 10) / 10
    s.average = Math.round((s.midAvg * 0.4 + s.finalAvg * 0.6) * 10) / 10
  }
  // Auto grade
  const avg = tab.value === 'midterm' ? s.midAvg : s.average
  s.grade = avg >= 9 ? 'Xuất sắc' : avg >= 8 ? 'Giỏi' : avg >= 6.5 ? 'Khá' : avg >= 5 ? 'Trung bình' : 'Yếu'
}

function saveScores() { saved.value = true; setTimeout(() => saved.value = false, 3000) }

function exportToExcel() {
  if (scores.value.length === 0) return alert('Không có dữ liệu để xuất!')
  let headers = []
  let rows = []
  if (tab.value === 'midterm') {
    headers = ['Mã HV', 'Tên học viên', 'Lý thuyết', 'Thực hành', 'Dự án', 'Trung bình', 'Xếp loại']
    rows = scores.value.map(s => [s.code, s.name, s.midTheory, s.midPractical, s.midProject, s.midAvg, s.grade])
  } else if (tab.value === 'final') {
    headers = ['Mã HV', 'Tên học viên', 'Lý thuyết (CK)', 'Thực hành (CK)', 'Dự án (CK)', 'ĐTB CK', 'Tổng kết', 'Xếp loại']
    rows = scores.value.map(s => [s.code, s.name, s.finalTheory, s.finalPractical, s.finalProject, s.finalAvg, s.average, s.grade])
  } else {
    headers = ['Mã HV', 'Tên học viên', 'ĐTB Giữa kỳ', 'ĐTB Cuối kỳ', 'Tổng kết', 'Xếp loại', 'Kết quả']
    rows = scores.value.map(s => [s.code, s.name, s.midAvg, s.finalAvg, s.average, s.grade, s.average>=5?'Đạt':'Học lại'])
  }
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n")
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `bang_diem_${tab.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const gradeClass = g => g==='Xuất sắc'?'grade-xs':g==='Giỏi'?'grade-g':g==='Khá'?'grade-k':g==='Trung bình'?'grade-tb':'grade-y'
const avgColor = v => v>=8?'text-green':v>=6.5?'text-blue':v>=5?'text-orange':'text-red'
const avatarColors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#14b8a6','#ef4444']

// Summary for tab=summary
const summary = computed(() => ({
  xuat_sac: scores.value.filter(s=>s.grade==='Xuất sắc').length,
  gioi: scores.value.filter(s=>s.grade==='Giỏi').length,
  kha: scores.value.filter(s=>s.grade==='Khá').length,
  tb: scores.value.filter(s=>s.grade==='Trung bình').length,
  yeu: scores.value.filter(s=>s.grade==='Yếu').length,
  avgClass: Math.round(scores.value.reduce((a,s)=>a+s.average,0)/scores.value.length*10)/10
}))
</script>

<template>
<div class="page-container">
  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Quản lý Điểm số</h2>
      <p class="page-desc">Nhập và theo dõi kết quả học tập của học viên</p>
    </div>
    <div class="header-actions">
      <div class="select-wrapper">
        <select v-model="selectedClass" class="filter-select">
          <option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
      </div>
      <button class="btn-secondary btn-icon-text" @click="exportToExcel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Xuất bảng điểm
      </button>
      <button class="btn-primary btn-icon-text" @click="saveScores">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Lưu thay đổi
      </button>
    </div>
  </div>

  <transition name="slide-down">
    <div v-if="saved" class="toast-success">
      <div class="toast-icon">✓</div>
      <div class="toast-content">
        <div class="toast-title">Đã lưu điểm!</div>
        <div class="toast-message">Bảng điểm đã được cập nhật thành công.</div>
      </div>
    </div>
  </transition>

  <div class="premium-card main-card">
    <div class="tabs-container">
      <div class="tabs">
        <button class="tab-btn" :class="{active:tab==='midterm'}" @click="tab='midterm'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Điểm giữa kỳ
        </button>
        <button class="tab-btn" :class="{active:tab==='final'}" @click="tab='final'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          Điểm cuối kỳ
        </button>
        <button class="tab-btn" :class="{active:tab==='summary'}" @click="tab='summary'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Tổng kết
        </button>
      </div>
      <div class="tab-indicator" :class="'indicator-'+tab"></div>
    </div>

    <div class="tab-content-area">
      <!-- Midterm -->
      <transition name="fade" mode="out-in">
        <div v-if="tab==='midterm'" key="midterm" class="table-responsive">
          <div class="info-bar mb-4">
            <span class="info-icon">💡</span>
            <span>Điểm giữa kỳ được tính bằng trung bình cộng 3 kỹ năng: <strong>Lý thuyết, Thực hành, Dự án</strong>. Hệ thống sẽ tự động xếp loại.</span>
          </div>
          <table class="premium-table">
            <thead>
              <tr>
                <th width="50">#</th>
                <th>HỌC VIÊN</th>
                <th class="text-center" width="120">LÝ THUYẾT (0-10)</th>
                <th class="text-center" width="120">THỰC HÀNH (0-10)</th>
                <th class="text-center" width="120">DỰ ÁN (0-10)</th>
                <th class="text-center" width="120">TRUNG BÌNH</th>
                <th width="140">XẾP LOẠI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s,i) in scores" :key="s.id" class="table-row">
                <td class="text-muted text-center">{{ i+1 }}</td>
                <td>
                  <div class="user-profile">
                    <div class="user-avatar-sm" :style="{background: avatarColors[i%6]}">{{ s.name.split(' ').map(w=>w[0]).slice(-2).join('') }}</div>
                    <div class="user-details">
                      <div class="user-name">{{ s.name }}</div>
                      <div class="user-code">{{ s.code }}</div>
                    </div>
                  </div>
                </td>
                <td class="text-center"><input class="input-score" v-model.number="s.midTheory" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
                <td class="text-center"><input class="input-score" v-model.number="s.midPractical" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
                <td class="text-center"><input class="input-score" v-model.number="s.midProject" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
                <td class="text-center">
                  <span class="avg-score" :class="avgColor(s.midAvg)">{{ s.midAvg }}</span>
                </td>
                <td><span class="grade-badge" :class="gradeClass(s.grade)">{{ s.grade }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Final -->
        <div v-else-if="tab==='final'" key="final" class="table-responsive">
          <div class="info-bar mb-4">
            <span class="info-icon">💡</span>
            <span>Điểm tổng kết = <strong>(Giữa kỳ × 40%) + (Cuối kỳ × 60%)</strong>. Kết quả này sẽ quyết định học viên đạt hay không đạt.</span>
          </div>
          <table class="premium-table">
            <thead>
              <tr>
                <th width="50">#</th>
                <th>HỌC VIÊN</th>
                <th class="text-center" width="120">LÝ THUYẾT (0-10)</th>
                <th class="text-center" width="120">THỰC HÀNH (0-10)</th>
                <th class="text-center" width="120">DỰ ÁN (0-10)</th>
                <th class="text-center highlight-col" width="120">ĐTB CK</th>
                <th class="text-center highlight-col-main" width="120">TỔNG KẾT</th>
                <th width="140">XẾP LOẠI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s,i) in scores" :key="s.id" class="table-row">
                <td class="text-muted text-center">{{ i+1 }}</td>
                <td>
                  <div class="user-profile">
                    <div class="user-avatar-sm" :style="{background: avatarColors[i%6]}">{{ s.name.split(' ').map(w=>w[0]).slice(-2).join('') }}</div>
                    <div class="user-details">
                      <div class="user-name">{{ s.name }}</div>
                      <div class="user-code">{{ s.code }}</div>
                    </div>
                  </div>
                </td>
                <td class="text-center"><input class="input-score" v-model.number="s.finalTheory" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
                <td class="text-center"><input class="input-score" v-model.number="s.finalPractical" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
                <td class="text-center"><input class="input-score" v-model.number="s.finalProject" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
                <td class="text-center highlight-col">
                  <span class="avg-score-sm">{{ s.finalAvg }}</span>
                </td>
                <td class="text-center highlight-col-main">
                  <span class="avg-score" :class="avgColor(s.average)">{{ s.average }}</span>
                </td>
                <td><span class="grade-badge" :class="gradeClass(s.grade)">{{ s.grade }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div v-else key="summary">
          <div class="stat-cards-premium cols-3 mb-6">
            <div class="stat-card">
              <div class="stat-icon teal-bg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
              <div class="stat-info">
                <div class="stat-label">Điểm TB Lớp</div>
                <div class="stat-value text-teal">{{ summary.avgClass }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green-bg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
              <div class="stat-info">
                <div class="stat-label">Xuất sắc & Giỏi</div>
                <div class="stat-value text-green">{{ summary.xuat_sac + summary.gioi }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon red-bg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
              <div class="stat-info">
                <div class="stat-label">Cần cải thiện (TB & Yếu)</div>
                <div class="stat-value text-red">{{ summary.tb + summary.yeu }}</div>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th width="50">#</th>
                  <th>HỌC VIÊN</th>
                  <th class="text-center" width="120">ĐTB GIỮA KỲ</th>
                  <th class="text-center" width="120">ĐTB CUỐI KỲ</th>
                  <th class="text-center highlight-col-main" width="120">TỔNG KẾT</th>
                  <th width="140">XẾP LOẠI</th>
                  <th width="120" class="text-right">KẾT QUẢ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s,i) in scores" :key="s.id" class="table-row">
                  <td class="text-muted text-center">{{ i+1 }}</td>
                  <td>
                    <div class="user-profile">
                      <div class="user-avatar-sm" :style="{background: avatarColors[i%6]}">{{ s.name.split(' ').map(w=>w[0]).slice(-2).join('') }}</div>
                      <div class="user-details">
                        <div class="user-name">{{ s.name }}</div>
                        <div class="user-code">{{ s.code }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center"><span class="score-text">{{ s.midAvg }}</span></td>
                  <td class="text-center"><span class="score-text">{{ s.finalAvg }}</span></td>
                  <td class="text-center highlight-col-main">
                    <span class="avg-score" :class="avgColor(s.average)">{{ s.average }}</span>
                  </td>
                  <td><span class="grade-badge" :class="gradeClass(s.grade)">{{ s.grade }}</span></td>
                  <td class="text-right">
                    <span class="status-badge" :class="s.average>=5?'status-pass':'status-fail'">
                      <span class="status-dot"></span>
                      {{ s.average>=5?'Đạt':'Học lại' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </transition>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR SCORES ── */
.page-container { max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.page-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
.page-desc { color: #64748b; font-size: 14px; }

.header-actions { display: flex; gap: 12px; align-items: center; }

.select-wrapper { position: relative; }
.filter-select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; padding: 10px 40px 10px 16px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; font-weight: 500; color: #334155; background-color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-width: 220px; outline: none; transition: all 0.2s; }
.filter-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.btn-icon-text { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: all 0.2s; cursor: pointer; }
.btn-primary { background: #2563eb; color: white; border: none; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
.btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3); }
.btn-secondary { background: white; color: #334155; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.btn-secondary:hover { background: #f8fafc; border-color: #94a3b8; }

/* Toast */
.toast-success { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: white; border: 1px solid #86efac; border-radius: 12px; padding: 12px 20px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); z-index: 1000; }
.toast-icon { width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
.toast-title { font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
.toast-message { color: #64748b; font-size: 13px; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translate(-50%, -20px); }

/* Main Card */
.premium-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
.main-card { min-height: 500px; display: flex; flex-direction: column; overflow: hidden; }

/* Tabs */
.tabs-container { position: relative; border-bottom: 1px solid #e2e8f0; padding: 0 24px; background: #fafafa; border-radius: 16px 16px 0 0; }
.tabs { display: flex; gap: 24px; }
.tab-btn { background: none; border: none; padding: 16px 0; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: color 0.2s; position: relative; z-index: 2; }
.tab-btn:hover { color: #334155; }
.tab-btn.active { color: #2563eb; }

.tab-indicator { position: absolute; bottom: -1px; height: 2px; background: #2563eb; transition: all 0.3s ease; z-index: 3; }
.indicator-midterm { width: 120px; left: 24px; }
.indicator-final { width: 120px; left: 168px; }
.indicator-summary { width: 100px; left: 312px; }

.tab-content-area { padding: 24px; flex: 1; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(5px); }

/* Info bar */
.info-bar { display: flex; gap: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #1e40af; align-items: center; }
.info-icon { font-size: 16px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }

/* Table */
.table-responsive { width: 100%; overflow-x: auto; }
.premium-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.premium-table th { background: #f8fafc; padding: 14px 16px; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
.premium-table th.text-left { text-align: left; }
.premium-table th.text-center { text-align: center; }
.premium-table th.text-right { text-align: right; }
.premium-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; transition: background-color 0.2s; }
.table-row:hover td { background-color: #f8fafc; }

.highlight-col { background: #f8fafc; border-left: 1px solid #e2e8f0; }
.highlight-col-main { background: #eff6ff; border-left: 1px solid #bfdbfe; border-right: 1px solid #bfdbfe; }
.table-row:hover .highlight-col { background: #f1f5f9; }
.table-row:hover .highlight-col-main { background: #dbeafe; }

/* User Info */
.user-profile { display: flex; align-items: center; gap: 12px; }
.user-avatar-sm { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.user-name { font-weight: 600; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
.user-code { font-size: 12px; color: #64748b; }

/* Inputs and Scores */
.input-score { width: 60px; text-align: center; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; font-size: 14px; font-weight: 600; color: #334155; outline: none; transition: all 0.2s; background: white; }
.input-score:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.avg-score { font-size: 20px; font-weight: 800; }
.avg-score-sm { font-size: 16px; font-weight: 700; color: #475569; }
.score-text { font-size: 15px; font-weight: 600; color: #334155; }

.text-green { color: #10b981; }
.text-blue { color: #2563eb; }
.text-orange { color: #f59e0b; }
.text-red { color: #ef4444; }

/* Badges */
.grade-badge { display: inline-flex; align-items: center; justify-content: center; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.grade-xs { background: #ccfbf1; color: #0f766e; border: 1px solid #99f6e4; }
.grade-g { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.grade-k { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
.grade-tb { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
.grade-y { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

.status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.status-pass { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.status-pass .status-dot { background: #10b981; }
.status-fail { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.status-fail .status-dot { background: #ef4444; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }

/* Summary Stats */
.stat-cards-premium { display: grid; gap: 20px; }
.stat-cards-premium.cols-3 { grid-template-columns: repeat(3, 1fr); }
.stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.teal-bg { background: #f0fdfa; color: #0d9488; }
.stat-label { font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 24px; font-weight: 800; }
.text-teal { color: #0f766e; }
</style>
