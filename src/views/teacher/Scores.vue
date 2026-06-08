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
  s.grade = s.total>=9?'Xuất sắc':s.total>=8?'Giỏi':s.total>=6.5?'Khá':s.total>=5?'TB':'Yếu'
}
function save() { saved.value = true; setTimeout(()=>saved.value=false, 3000) }

const gradeClass = g => g==='Xuất sắc'?'badge-teal':g==='Giỏi'?'badge-green':g==='Khá'?'badge-blue':g==='TB'?'badge-yellow':'badge-red'
const avgColor = v => v>=8?'text-green':v>=6.5?'text-blue':v>=5?'text-orange':'text-red'
const avatarColors = ['purple','green','orange','teal','blue','red']
const avgClass = computed(() => Math.round(scores.value.reduce((a,s)=>a+s.total,0)/scores.value.length*10)/10)
</script>

<template>
<div>
  <div class="page-header">
    <div><h2 class="page-title">Nhập điểm kiểm tra</h2><p class="page-desc">Tính điểm trung bình tự động theo 4 kỹ năng</p></div>
    <div class="btn-actions">
      <select v-model="selectedClass" style="border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:13px">
        <option v-for="c in courses.slice(0,4)" :key="c.id" :value="c.name">{{ c.name }}</option>
      </select>
      <select v-model="examType" style="border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:13px">
        <option value="midterm">📝 Kiểm tra giữa kỳ</option>
        <option value="final">📋 Kiểm tra cuối kỳ</option>
      </select>
      <button class="btn-outline">📥 Xuất điểm</button>
      <button class="btn-primary" @click="save">💾 Lưu điểm</button>
    </div>
  </div>

  <div v-if="saved" style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#166534;font-weight:500">✅ Đã lưu điểm thành công!</div>

  <div class="stat-cards cols-3" style="margin-bottom:20px">
    <div class="stat-card teal"><div class="label">ĐIỂM TB LỚP</div><div class="value" style="color:#0d9488">{{ avgClass }}</div></div>
    <div class="stat-card green"><div class="label">KHÁ + GIỎI</div><div class="value" style="color:#10b981">{{ scores.filter(s=>s.total>=6.5).length }}</div></div>
    <div class="stat-card red"><div class="label">CẦN CẢI THIỆN</div><div class="value" style="color:#ef4444">{{ scores.filter(s=>s.total<5).length }}</div></div>
  </div>

  <div class="card">
    <div style="margin-bottom:14px;display:flex;align-items:center;gap:12px">
      <div class="card-title">{{ selectedClass }} — {{ examType==='midterm'?'Giữa kỳ':'Cuối kỳ' }}</div>
      <div style="font-size:12px;color:#94a3b8;padding:4px 10px;background:#f1f5f9;border-radius:6px">Điểm tự tính = (L+R+W+S) ÷ 4</div>
    </div>
    <table class="data-table">
      <thead><tr><th>#</th><th>HỌ TÊN</th><th>MÃ HV</th><th>LISTENING</th><th>READING</th><th>WRITING</th><th>SPEAKING</th><th>TỔNG KẾT</th><th>XẾP LOẠI</th></tr></thead>
      <tbody>
        <tr v-for="(s,i) in scores" :key="s.id">
          <td class="text-muted">{{ i+1 }}</td>
          <td><div class="user-cell"><div class="avatar" :class="avatarColors[i%6]" style="width:30px;height:30px;font-size:11px">{{ s.name.split(' ').map(w=>w[0]).slice(-2).join('') }}</div><span class="text-bold">{{ s.name }}</span></div></td>
          <td class="text-muted">{{ s.code }}</td>
          <td><input class="input-score" v-model.number="s.listening" @input="calcTotal(s)" min="0" max="10" step="0.5" /></td>
          <td><input class="input-score" v-model.number="s.reading" @input="calcTotal(s)" min="0" max="10" step="0.5" /></td>
          <td><input class="input-score" v-model.number="s.writing" @input="calcTotal(s)" min="0" max="10" step="0.5" /></td>
          <td><input class="input-score" v-model.number="s.speaking" @input="calcTotal(s)" min="0" max="10" step="0.5" /></td>
          <td><span :class="avgColor(s.total)" style="font-size:20px;font-weight:700">{{ s.total }}</span></td>
          <td><span class="badge" :class="gradeClass(s.grade)">● {{ s.grade }}</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>
