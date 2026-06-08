<script setup>
import { ref, computed } from 'vue'
import { teacherAttendanceList, courses } from '../../data/mockData.js'

const selectedClass = ref('TOEIC 600+')
const list = ref(teacherAttendanceList.map(s => ({...s})))
const saved = ref(false)
const today = new Date().toLocaleDateString('vi-VN', {weekday:'long',year:'numeric',month:'long',day:'numeric'})
const avatarColors = ['purple','green','orange','teal','blue','red']

const summary = computed(() => ({
  p: list.value.filter(s=>s.status==='P').length,
  l: list.value.filter(s=>s.status==='L').length,
  a: list.value.filter(s=>s.status==='A').length,
  none: list.value.filter(s=>!s.status).length,
}))

function setS(s, v) { s.status = s.status === v ? '' : v }
function selectAll(v) { list.value.forEach(s => s.status = v) }

function save() {
  if (summary.value.none > 0 && !confirm(`Còn ${summary.value.none} học viên chưa điểm danh. Lưu?`)) return
  saved.value = true; setTimeout(() => saved.value = false, 3000)
}
</script>

<template>
<div>
  <div class="page-header">
    <h2 class="page-title">Điểm danh</h2>
    <div class="btn-actions">
      <select v-model="selectedClass" style="border:1px solid #cbd5e1;border-radius:8px;padding:8px 14px;font-size:14px">
        <option v-for="c in courses.slice(0,4)" :key="c.id" :value="c.name">{{ c.name }}</option>
      </select>
      <button class="btn-primary" @click="save">💾 Lưu điểm danh</button>
    </div>
  </div>

  <div v-if="saved" style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#166534;font-weight:500">✅ Đã lưu thành công!</div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
      <div>
        <div class="card-title">{{ selectedClass }}</div>
        <div class="text-muted" style="margin-top:2px">{{ today }}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-outline" style="padding:6px 12px;font-size:12px" @click="selectAll('P')">✓ Tất cả có mặt</button>
        <button class="btn-outline" style="padding:6px 12px;font-size:12px" @click="selectAll('')">⟳ Reset</button>
      </div>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:16px;padding:10px 14px;background:#f8fafc;border-radius:8px">
      <span class="badge badge-green">✓ Có mặt: {{ summary.p }}</span>
      <span class="badge badge-yellow">⏰ Trễ: {{ summary.l }}</span>
      <span class="badge badge-red">✗ Vắng: {{ summary.a }}</span>
      <span class="badge badge-gray">— Chưa: {{ summary.none }}</span>
    </div>

    <table class="data-table">
      <thead><tr><th style="width:40px">#</th><th>HỌC VIÊN</th><th style="width:280px">TRẠNG THÁI</th></tr></thead>
      <tbody>
        <tr v-for="(s,i) in list" :key="s.id" :style="{background:s.status==='A'?'#fff5f5':s.status==='P'?'#f0fdf4':s.status==='L'?'#fefce8':''}">
          <td class="text-muted">{{ i+1 }}</td>
          <td><div class="user-cell"><div class="avatar" :class="avatarColors[i%6]" style="width:32px;height:32px;font-size:12px">{{ s.name.split(' ').map(w=>w[0]).slice(-2).join('') }}</div><div><div class="name">{{ s.name }}</div><div class="code">{{ s.code }}</div></div></div></td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="toggle-btn" :class="{'active-p':s.status==='P'}" @click="setS(s,'P')" style="padding:6px 14px;width:auto;font-size:12px">✓ Có mặt</button>
              <button class="toggle-btn" :class="{'active-l':s.status==='L'}" @click="setS(s,'L')" style="padding:6px 14px;width:auto;font-size:12px">⏰ Trễ</button>
              <button class="toggle-btn" :class="{'active-a':s.status==='A'}" @click="setS(s,'A')" style="padding:6px 14px;width:auto;font-size:12px">✗ Vắng</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>
