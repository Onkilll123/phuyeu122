<script setup>
import { ref, computed } from 'vue'
import { scoresTeacher, courses } from '../../data/mockData.js'

const selectedClass = ref('IELTS Intermediate')
const examType = ref('midterm')
const saved = ref(false)
const scores = ref(scoresTeacher.map(s => ({...s})))

function calcTotal(s) {
  const arr = [s.listening, s.reading, s.writing, s.speaking].map(Number)
  s.total = Math.round(arr.reduce((a,b)=>a+b,0)/4 * 10) / 10
  s.grade = s.total>=9?'Xuất sắc':s.total>=8?'Giỏi':s.total>=6.5?'Khá':s.total>=5?'Trung bình':'Yếu'
}
function save() { saved.value = true; setTimeout(()=>saved.value=false, 3000) }

const gradeClass = g => g==='Xuất sắc'?'grade-xs':g==='Giỏi'?'grade-g':g==='Khá'?'grade-k':g==='Trung bình'?'grade-tb':'grade-y'
const avgColor = v => v>=8?'text-green':v>=6.5?'text-blue':v>=5?'text-orange':'text-red'
const avatarColors = ['#8b5cf6','#10b981','#f59e0b','#14b8a6','#3b82f6','#ef4444']
const avgClass = computed(() => Math.round(scores.value.reduce((a,s)=>a+s.total,0)/scores.value.length*10)/10)
</script>

<template>
<div class="page-container">
  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Nhập điểm 4 kỹ năng</h2>
      <p class="page-desc">Tự động tính điểm trung bình môn IELTS</p>
    </div>
    <div class="header-actions">
      <div class="select-wrapper">
        <select v-model="selectedClass" class="filter-select">
          <option v-for="c in courses.slice(0,4)" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
      </div>
      <div class="select-wrapper">
        <select v-model="examType" class="filter-select select-icon">
          <option value="midterm">📝 Kiểm tra giữa kỳ</option>
          <option value="final">📋 Kiểm tra cuối kỳ</option>
        </select>
      </div>
      <button class="btn-primary btn-icon-text" @click="save">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Lưu bảng điểm
      </button>
    </div>
  </div>

  <transition name="slide-down">
    <div v-if="saved" class="toast-success">
      <div class="toast-icon">✓</div>
      <div class="toast-content">
        <div class="toast-title">Thành công!</div>
        <div class="toast-message">Đã lưu điểm thành công.</div>
      </div>
    </div>
  </transition>

  <div class="stat-cards-premium cols-3">
    <div class="stat-card">
      <div class="stat-icon purple-bg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <div class="stat-info">
        <div class="stat-label">Điểm TB Lớp</div>
        <div class="stat-value text-purple">{{ avgClass }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green-bg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></div>
      <div class="stat-info">
        <div class="stat-label">Khá & Giỏi</div>
        <div class="stat-value text-green">{{ scores.filter(s=>s.total>=6.5).length }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon red-bg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
      <div class="stat-info">
        <div class="stat-label">Cần cải thiện (< 5)</div>
        <div class="stat-value text-red">{{ scores.filter(s=>s.total<5).length }}</div>
      </div>
    </div>
  </div>

  <div class="premium-card">
    <div class="card-header">
      <div class="class-title">
        <span class="icon">📘</span>
        {{ selectedClass }} — {{ examType==='midterm'?'Giữa kỳ':'Cuối kỳ' }}
      </div>
      <div class="formula-badge">
        <span class="formula-icon">∑</span> Điểm tổng = (L + R + W + S) ÷ 4
      </div>
    </div>

    <div class="table-responsive">
      <table class="premium-table">
        <thead>
          <tr>
            <th width="50" class="text-center">#</th>
            <th>HỌC VIÊN</th>
            <th class="text-center highlight-col-l" width="120">LISTENING</th>
            <th class="text-center highlight-col-r" width="120">READING</th>
            <th class="text-center highlight-col-w" width="120">WRITING</th>
            <th class="text-center highlight-col-s" width="120">SPEAKING</th>
            <th class="text-center highlight-col-main" width="130">TỔNG KẾT</th>
            <th width="140">XẾP LOẠI</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s,i) in scores" :key="s.id" class="table-row">
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
            <td class="text-center highlight-col-l"><input class="input-score blue" v-model.number="s.listening" @input="calcTotal(s)" min="0" max="10" step="0.5" /></td>
            <td class="text-center highlight-col-r"><input class="input-score green" v-model.number="s.reading" @input="calcTotal(s)" min="0" max="10" step="0.5" /></td>
            <td class="text-center highlight-col-w"><input class="input-score purple" v-model.number="s.writing" @input="calcTotal(s)" min="0" max="10" step="0.5" /></td>
            <td class="text-center highlight-col-s"><input class="input-score orange" v-model.number="s.speaking" @input="calcTotal(s)" min="0" max="10" step="0.5" /></td>
            <td class="text-center highlight-col-main">
              <span class="avg-score" :class="avgColor(s.total)">{{ s.total }}</span>
            </td>
            <td><span class="grade-badge" :class="gradeClass(s.grade)">{{ s.grade }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR TEACHER SCORES ── */
.page-container { max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.page-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
.page-desc { color: #64748b; font-size: 14px; }

.header-actions { display: flex; gap: 12px; align-items: center; }

.select-wrapper { position: relative; }
.filter-select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; padding: 10px 40px 10px 16px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; font-weight: 600; color: #0f172a; background-color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-width: 220px; outline: none; transition: all 0.2s; }
.filter-select:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }
.select-icon { padding-left: 16px; min-width: 240px; }

.btn-icon-text { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: all 0.2s; cursor: pointer; }
.btn-primary { background: #7c3aed; color: white; border: none; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2); }
.btn-primary:hover { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(124, 58, 237, 0.3); }

/* Toast */
.toast-success { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: white; border: 1px solid #86efac; border-radius: 12px; padding: 12px 20px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 1000; }
.toast-icon { width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
.toast-title { font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
.toast-message { color: #64748b; font-size: 13px; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translate(-50%, -20px); }

/* Stats */
.stat-cards-premium { display: grid; gap: 20px; margin-bottom: 24px; }
.stat-cards-premium.cols-3 { grid-template-columns: repeat(3, 1fr); }
.stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); }
.stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
.purple-bg { background: #f5f3ff; color: #8b5cf6; }
.green-bg { background: #f0fdf4; color: #10b981; }
.red-bg { background: #fef2f2; color: #ef4444; }
.stat-label { font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 28px; font-weight: 800; }
.text-purple { color: #7c3aed; }
.text-green { color: #059669; }
.text-red { color: #dc2626; }

/* Main Card */
.premium-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }

.card-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
.class-title { font-size: 18px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.formula-badge { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #1e40af; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; border: 1px solid #bfdbfe; }
.formula-icon { font-size: 16px; font-family: serif; font-style: italic; }

/* Table */
.table-responsive { width: 100%; overflow-x: auto; }
.premium-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.premium-table th { background: white; padding: 16px 12px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.premium-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; transition: background-color 0.2s; }
.text-center { text-align: center !important; }

.table-row:hover td { background-color: #f8fafc; }

.highlight-col-l { background: rgba(239, 246, 255, 0.3); border-left: 1px solid #e2e8f0; }
.highlight-col-r { background: rgba(240, 253, 244, 0.3); border-left: 1px solid #e2e8f0; }
.highlight-col-w { background: rgba(245, 243, 255, 0.3); border-left: 1px solid #e2e8f0; }
.highlight-col-s { background: rgba(255, 247, 237, 0.3); border-left: 1px solid #e2e8f0; }
.highlight-col-main { background: #fafafa; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }

.table-row:hover .highlight-col-l { background: rgba(239, 246, 255, 0.6); }
.table-row:hover .highlight-col-r { background: rgba(240, 253, 244, 0.6); }
.table-row:hover .highlight-col-w { background: rgba(245, 243, 255, 0.6); }
.table-row:hover .highlight-col-s { background: rgba(255, 247, 237, 0.6); }
.table-row:hover .highlight-col-main { background: #f1f5f9; }

.user-profile { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.user-name { font-weight: 600; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
.user-code { font-size: 12px; color: #64748b; }

.input-score { width: 64px; text-align: center; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; font-size: 15px; font-weight: 700; color: #334155; outline: none; transition: all 0.2s; background: white; }
.input-score.blue:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.input-score.green:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
.input-score.purple:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
.input-score.orange:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }

.avg-score { font-size: 22px; font-weight: 800; }
.text-green { color: #10b981; }
.text-blue { color: #2563eb; }
.text-orange { color: #f59e0b; }
.text-red { color: #ef4444; }

/* Badges */
.grade-badge { display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }
.grade-xs { background: #ccfbf1; color: #0f766e; border: 1px solid #99f6e4; }
.grade-g { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.grade-k { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
.grade-tb { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
.grade-y { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
</style>
