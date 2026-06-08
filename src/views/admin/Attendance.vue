<script setup>
import { ref, computed } from 'vue'
import { attendanceToday, attendanceStats, courses } from '../../data/mockData.js'

const selectedClass = ref('Tiếng Anh B1 — Lớp A')
const sessionNum = ref(24)
const totalSessions = ref(48)
const list = ref(attendanceToday.map(s => ({...s})))
const stats = ref(attendanceStats.map(s => ({...s})))
const saved = ref(false)
const today = new Date().toLocaleDateString('vi-VN', {weekday:'long',year:'numeric',month:'long',day:'numeric'})

function setStatus(s, status) { s.status = s.status === status ? '' : status }

const summary = computed(() => ({
  p: list.value.filter(s=>s.status==='P').length,
  a: list.value.filter(s=>s.status==='A').length,
  l: list.value.filter(s=>s.status==='L').length,
  none: list.value.filter(s=>!s.status).length,
}))

function saveAttendance() {
  if (summary.value.none > 0) {
    if (!confirm(`Còn ${summary.value.none} học viên chưa điểm danh. Tiếp tục lưu?`)) return
  }
  // Cập nhật stats
  list.value.forEach(s => {
    const found = stats.value.find(st => st.name === s.studentName)
    if (found && s.status === 'P') { found.present++; found.rate = Math.round(found.present/(found.present+found.absent)*100) }
    else if (found && s.status === 'A') { found.absent++; found.rate = Math.round(found.present/(found.present+found.absent)*100) }
  })
  saved.value = true
  setTimeout(() => saved.value = false, 3000)
}
function selectAll(status) { list.value.forEach(s => s.status = status) }
const attColor = v => v>=80?'green':v>=60?'orange':'red'
const avatarColors = ['blue','green','purple','orange','teal','red']
</script>

<template>
<div>
  <div class="page-header">
    <div>
      <h2 class="page-title">Điểm danh</h2>
      <p class="page-desc">{{ today }}</p>
    </div>
    <div class="btn-actions">
      <select v-model="selectedClass" style="border:1px solid #cbd5e1;border-radius:8px;padding:8px 14px;font-size:14px">
        <option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option>
      </select>
      <button class="btn-primary" @click="saveAttendance">💾 Lưu điểm danh</button>
    </div>
  </div>

  <!-- Success toast -->
  <div v-if="saved" style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#166534;font-weight:500;display:flex;align-items:center;gap:8px">
    ✅ Đã lưu điểm danh thành công!
  </div>

  <div class="grid-2">
    <!-- Attendance form -->
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div>
          <div class="card-title">{{ selectedClass }}</div>
          <span class="badge badge-blue" style="margin-top:6px;display:inline-block">📅 Buổi {{ sessionNum }} / {{ totalSessions }}</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn-outline" style="padding:5px 10px;font-size:12px" @click="selectAll('P')">✓ Tất cả có mặt</button>
          <button class="btn-outline" style="padding:5px 10px;font-size:12px" @click="selectAll('')">⟳ Đặt lại</button>
        </div>
      </div>

      <!-- Summary bar -->
      <div style="display:flex;gap:12px;margin-bottom:14px;padding:10px 14px;background:#f8fafc;border-radius:8px">
        <span class="badge badge-green">✓ Có mặt: {{ summary.p }}</span>
        <span class="badge badge-red">✗ Vắng: {{ summary.a }}</span>
        <span class="badge badge-yellow">⏰ Muộn: {{ summary.l }}</span>
        <span class="badge badge-gray">— Chưa: {{ summary.none }}</span>
      </div>

      <table class="data-table">
        <thead><tr><th style="width:36px">#</th><th>HỌC VIÊN</th><th style="width:240px">TRẠNG THÁI</th><th>GHI CHÚ</th></tr></thead>
        <tbody>
          <tr v-for="(s,i) in list" :key="s.id" :style="{background: s.status==='A'?'#fff5f5':s.status==='P'?'#f0fdf4':s.status==='L'?'#fefce8':''}">
            <td class="text-muted" style="font-size:12px">{{ String(i+1).padStart(2,'0') }}</td>
            <td>
              <div class="user-cell">
                <div class="avatar" :class="avatarColors[i%6]" style="width:28px;height:28px;font-size:11px">{{ s.studentName.split(' ').map(w=>w[0]).slice(-2).join('') }}</div>
                <div><div class="name" style="font-size:13px">{{ s.studentName }}</div><div class="code">{{ s.code }}</div></div>
              </div>
            </td>
            <td>
              <div class="toggle-group">
                <button class="toggle-btn" :class="{'active-p':s.status==='P'}" @click="setStatus(s,'P')" style="padding:5px 10px;width:auto;font-size:12px">✓ Có mặt</button>
                <button class="toggle-btn" :class="{'active-l':s.status==='L'}" @click="setStatus(s,'L')" style="padding:5px 10px;width:auto;font-size:12px">⏰ Muộn</button>
                <button class="toggle-btn" :class="{'active-a':s.status==='A'}" @click="setStatus(s,'A')" style="padding:5px 10px;width:auto;font-size:12px">✗ Vắng</button>
              </div>
            </td>
            <td><input class="input-ghost" placeholder="Ghi chú..." v-model="s.note" style="font-size:13px" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stats panel -->
    <div class="card">
      <div class="card-title" style="margin-bottom:16px">📊 Thống kê chuyên cần</div>
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#94a3b8;margin-bottom:4px"><span>Tỷ lệ điểm danh buổi này</span><span class="text-bold text-blue">{{ list.value?.length ? Math.round(summary.p/list.value.length*100) : 0 }}%</span></div>
        <div class="progress-bar" style="height:8px"><div class="progress-fill blue" :style="{width: list.length ? (summary.p/list.length*100)+'%':'0%'}"></div></div>
      </div>
      <table class="data-table">
        <thead><tr><th>HỌC VIÊN</th><th>CÓ MẶT</th><th>VẮNG</th><th>% CHUYÊN CẦN</th></tr></thead>
        <tbody>
          <tr v-for="s in stats" :key="s.name">
            <td class="text-bold" style="font-size:13px">{{ s.name }}</td>
            <td style="color:#10b981;font-weight:600">{{ s.present }}</td>
            <td style="color:#ef4444;font-weight:600">{{ s.absent }}</td>
            <td>
              <div class="progress-row">
                <div class="progress-bar"><div class="progress-fill" :class="attColor(s.rate)" :style="{width:s.rate+'%'}"></div></div>
                <span class="progress-text" :class="'text-'+attColor(s.rate)">{{ s.rate }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:8px;font-size:12px;color:#166534">
        📌 Ngưỡng tối thiểu: 70% để đủ điều kiện thi cuối kỳ
      </div>
    </div>
  </div>
</div>
</template>
