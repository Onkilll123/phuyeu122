<script setup>
import { ref, onMounted } from 'vue'
import { N1 as api } from '../../data/api.js'
const myClasses = ref([])
onMounted(async () => {
  try {
    const res = await api.getCourses()
    myClasses.value = res.data.slice(0,4).map((c, i) => ({
      id: c.id,
      name: c.title || c.name,
      code: 'CLS-' + (100 + i),
      students: 20,
      schedule: 'T2, T4, T6',
      time: '18:30 - 20:30',
      room: 'Phòng A10' + (i+1),
      currentWeek: 4,
      weeks: c.sessions || c.totalLessons || 12
    }))
  } catch(e) {}
})
const colors = ['#3b82f6','#10b981','#f59e0b','#0d9488']
</script>
<template>
<div>
  <h2 class="page-title">Lớp học của tôi</h2>
  <div class="grid-2x2" style="margin-top:20px">
    <div v-for="(c,i) in myClasses" :key="c.id" class="card" :style="{borderLeft:'4px solid '+colors[i]}">
      <div style="display:flex;justify-content:space-between"><div style="display:flex;gap:10px;align-items:center"><span style="font-size:24px">📚</span><div><div class="text-bold" style="font-size:16px">{{ c.name }}</div><div class="text-muted">{{ c.code }}</div></div></div><span class="badge badge-teal">Đang học</span></div>
      <div style="display:flex;gap:14px;margin-top:14px;font-size:13px;color:#64748b">
        <span>👥 {{ c.students }} học viên</span><span>📅 {{ c.schedule }}</span><span>🕐 {{ c.time }}</span><span>📍 {{ c.room }}</span>
      </div>
      <div style="margin-top:14px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span class="text-muted">Tiến độ giáo trình</span><span :style="{color:colors[i]}">Tuần {{ c.currentWeek }} / {{ c.weeks }}</span></div>
        <div class="progress-bar"><div class="progress-fill" :style="{width:(c.currentWeek/c.weeks*100)+'%',background:colors[i]}"></div></div>
      </div>
    </div>
  </div>
</div>
</template>
