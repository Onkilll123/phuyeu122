<script setup>
import { ref, computed } from 'vue'
import { teacherAttendanceList, courses } from '../../data/mockData.js'

const selectedClass = ref('TOEIC 600+')
const list = ref(teacherAttendanceList.map(s => ({
  ...s,
  attendance: Math.floor(Math.random() * 30) + 70, // 70-100
  score: (Math.random() * 4 + 6).toFixed(1), // 6.0 - 10.0
  dob: '01/01/2000',
  phone: '0901234567'
})))

const search = ref('')
const filtered = computed(() => list.value.filter(s => 
  !search.value || s.name.toLowerCase().includes(search.value.toLowerCase()) || s.code.toLowerCase().includes(search.value.toLowerCase())
))

const avatarColors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#14b8a6','#ef4444']
const attColor = v => v>=80?'#10b981':v>=70?'#f59e0b':'#ef4444'
const attBg = v => v>=80?'#dcfce7':v>=70?'#fef3c7':'#fee2e2'
const scoreColor = v => v>=8?'#2563eb':v>=6.5?'#10b981':v>=5?'#f59e0b':'#ef4444'
const scoreBg = v => v>=8?'#eff6ff':v>=6.5?'#f0fdf4':v>=5?'#fff7ed':'#fef2f2'
</script>

<template>
<div class="page-container">
  <div class="page-header-premium">
    <div class="header-content">
      <h2 class="page-title">Danh sách lớp học</h2>
      <p class="page-desc">Theo dõi thông tin và tiến độ học tập của từng học viên</p>
    </div>
    <div class="header-actions">
      <div class="select-wrapper">
        <select v-model="selectedClass" class="filter-select">
          <option v-for="c in courses.slice(0,4)" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
      </div>
      <button class="btn-secondary btn-icon-text">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Xuất danh sách
      </button>
    </div>
  </div>

  <div class="premium-card">
    <div class="filter-section">
      <div class="class-info">
        <span class="info-badge">🎓 {{ filtered.length }} Học viên</span>
        <span class="info-badge">📅 Thứ 3, 5, 7</span>
        <span class="info-badge">🕒 18:00 - 19:30</span>
      </div>
      <div class="search-input-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Tìm tên, mã HV..." v-model="search" class="search-input" />
      </div>
    </div>

    <div class="table-responsive">
      <table class="premium-table">
        <thead>
          <tr>
            <th width="50">#</th>
            <th>HỌC VIÊN</th>
            <th>LIÊN HỆ</th>
            <th width="200">CHUYÊN CẦN</th>
            <th width="150" class="text-center">ĐIỂM TB (HIỆN TẠI)</th>
            <th width="100" class="text-right">THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s,i) in filtered" :key="s.code" class="table-row">
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
              <div class="contact-info">
                <div class="contact-item"><span class="icon">📞</span> {{ s.phone }}</div>
              </div>
            </td>
            <td>
              <div class="attendance-indicator">
                <div class="progress-track">
                  <div class="progress-fill" :style="{width: s.attendance+'%', background: attColor(s.attendance)}"></div>
                </div>
                <span class="attendance-value" :style="{color: attColor(s.attendance), background: attBg(s.attendance)}">{{ s.attendance }}%</span>
              </div>
            </td>
            <td class="text-center">
              <span class="score-badge" :style="{color: scoreColor(s.score), background: scoreBg(s.score)}">{{ s.score }}</span>
            </td>
            <td class="text-right">
              <button class="btn-action" title="Nhắn tin">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES ── */
.page-container { max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.page-title { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
.page-desc { color: #64748b; font-size: 14px; }

.header-actions { display: flex; gap: 12px; align-items: center; }

.select-wrapper { position: relative; }
.filter-select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; padding: 10px 40px 10px 16px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; font-weight: 600; color: #0f172a; background-color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-width: 220px; outline: none; transition: all 0.2s; }
.filter-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.btn-icon-text { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: all 0.2s; cursor: pointer; }
.btn-secondary { background: white; color: #334155; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.btn-secondary:hover { background: #f8fafc; border-color: #94a3b8; }

.premium-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow: hidden; }

.filter-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
.class-info { display: flex; gap: 12px; }
.info-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; }

.search-input-wrapper { position: relative; display: flex; align-items: center; min-width: 260px; }
.search-icon { position: absolute; left: 12px; color: #94a3b8; }
.search-input { width: 100%; padding: 10px 16px 10px 40px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #334155; background-color: white; outline: none; transition: all 0.2s; }
.search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.table-responsive { width: 100%; overflow-x: auto; }
.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { background: white; padding: 16px 24px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
.premium-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; transition: background-color 0.2s; }
.text-center { text-align: center !important; }
.text-right { text-align: right !important; }

.table-row:hover { background-color: #f8fafc; }

.user-profile { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.user-name { font-weight: 600; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
.user-code { font-size: 12px; color: #64748b; }

.contact-info { display: flex; flex-direction: column; gap: 4px; }
.contact-item { font-size: 13px; color: #475569; display: flex; align-items: center; gap: 6px; }
.contact-item .icon { font-size: 12px; }

.attendance-indicator { display: flex; align-items: center; gap: 12px; }
.progress-track { flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; }
.attendance-value { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 12px; min-width: 44px; text-align: center; }

.score-badge { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; font-size: 15px; font-weight: 800; }

.btn-action { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #64748b; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.btn-action:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
</style>
