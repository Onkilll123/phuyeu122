<script setup>
import { ref, computed } from 'vue'
import { scoresAdmin, courses } from '../../data/mockData.js'

const tab = ref('midterm')
const selectedClass = ref('Tiếng Anh B1 — Lớp A')
const saved = ref(false)
const scores = ref(scoresAdmin.map(s => ({...s, midWriting:s.writing, midListening:s.listening, midSpeaking:s.speaking, midAvg:s.average, finalWriting:8, finalListening:7.5, finalSpeaking:8.5, finalAvg:8.0})))

function calcAvg(s) {
  if (tab.value === 'midterm') {
    const arr = [parseFloat(s.midWriting||0), parseFloat(s.midListening||0), parseFloat(s.midSpeaking||0)]
    s.midAvg = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length * 10) / 10
    s.average = s.midAvg
  } else {
    const arr = [parseFloat(s.finalWriting||0), parseFloat(s.finalListening||0), parseFloat(s.finalSpeaking||0)]
    s.finalAvg = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length * 10) / 10
    s.average = Math.round((s.midAvg * 0.4 + s.finalAvg * 0.6) * 10) / 10
  }
  // Auto grade
  const avg = tab.value === 'midterm' ? s.midAvg : s.average
  s.grade = avg >= 9 ? 'Xuất sắc' : avg >= 8 ? 'Giỏi' : avg >= 6.5 ? 'Khá' : avg >= 5 ? 'Trung bình' : 'Yếu'
}

function saveScores() { saved.value = true; setTimeout(() => saved.value = false, 3000) }

const gradeClass = g => g==='Xuất sắc'?'badge-teal':g==='Giỏi'?'badge-green':g==='Khá'?'badge-blue':g==='Trung bình'?'badge-yellow':'badge-red'
const avgColor = v => v>=8?'text-green':v>=6.5?'text-blue':v>=5?'text-orange':'text-red'
const avatarColors = ['blue','green','purple','orange','teal','red']

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
<div>
  <div class="page-header">
    <div><h2 class="page-title">Kết quả học tập</h2><p class="page-desc">Nhập và quản lý điểm kiểm tra học viên</p></div>
    <div class="btn-actions">
      <select v-model="selectedClass" style="border:1px solid #cbd5e1;border-radius:8px;padding:8px 14px;font-size:14px">
        <option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option>
      </select>
      <button class="btn-outline">📥 Xuất điểm</button>
      <button class="btn-primary" @click="saveScores">💾 Lưu điểm</button>
    </div>
  </div>

  <div v-if="saved" style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#166534;font-weight:500">✅ Đã lưu điểm thành công!</div>

  <div class="card">
    <div class="tabs">
      <div class="tab" :class="{active:tab==='midterm'}" @click="tab='midterm'">📝 Điểm giữa kỳ</div>
      <div class="tab" :class="{active:tab==='final'}" @click="tab='final'">📋 Điểm cuối kỳ</div>
      <div class="tab" :class="{active:tab==='summary'}" @click="tab='summary'">📊 Tổng kết</div>
    </div>

    <!-- Midterm -->
    <table v-if="tab==='midterm'" class="data-table">
      <thead><tr><th>#</th><th>HỌC VIÊN</th><th>BÀI VIẾT (0-10)</th><th>BÀI NGHE (0-10)</th><th>BÀI NÓI (0-10)</th><th>ĐIỂM TB</th><th>XẾP LOẠI</th></tr></thead>
      <tbody>
        <tr v-for="(s,i) in scores" :key="s.id">
          <td class="text-muted">{{ i+1 }}</td>
          <td><div class="user-cell"><div class="avatar" :class="avatarColors[i%6]">{{ s.name.split(' ').map(w=>w[0]).slice(-2).join('') }}</div><div><div class="name">{{ s.name }}</div><div class="code">{{ s.code }}</div></div></div></td>
          <td><input class="input-score" v-model.number="s.midWriting" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
          <td><input class="input-score" v-model.number="s.midListening" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
          <td><input class="input-score" v-model.number="s.midSpeaking" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
          <td><span :class="avgColor(s.midAvg)" style="font-size:20px;font-weight:700">{{ s.midAvg }}</span></td>
          <td><span class="badge" :class="gradeClass(s.grade)">● {{ s.grade }}</span></td>
        </tr>
      </tbody>
    </table>

    <!-- Final -->
    <table v-else-if="tab==='final'" class="data-table">
      <thead><tr><th>#</th><th>HỌC VIÊN</th><th>BÀI VIẾT (0-10)</th><th>BÀI NGHE (0-10)</th><th>BÀI NÓI (0-10)</th><th>ĐTB CUỐI KỲ</th><th>ĐTB TỔNG KẾT</th><th>XẾP LOẠI</th></tr></thead>
      <tbody>
        <tr v-for="(s,i) in scores" :key="s.id">
          <td class="text-muted">{{ i+1 }}</td>
          <td><div class="user-cell"><div class="avatar" :class="avatarColors[i%6]">{{ s.name.split(' ').map(w=>w[0]).slice(-2).join('') }}</div><span class="text-bold">{{ s.name }}</span></div></td>
          <td><input class="input-score" v-model.number="s.finalWriting" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
          <td><input class="input-score" v-model.number="s.finalListening" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
          <td><input class="input-score" v-model.number="s.finalSpeaking" @input="calcAvg(s)" min="0" max="10" step="0.5" /></td>
          <td><span :class="avgColor(s.finalAvg)" style="font-size:18px;font-weight:700">{{ s.finalAvg }}</span></td>
          <td><span :class="avgColor(s.average)" style="font-size:18px;font-weight:700">{{ s.average }}</span><div style="font-size:10px;color:#94a3b8">GK×40% + CK×60%</div></td>
          <td><span class="badge" :class="gradeClass(s.grade)">● {{ s.grade }}</span></td>
        </tr>
      </tbody>
    </table>

    <!-- Summary -->
    <div v-else>
      <div class="stat-cards cols-3" style="margin-bottom:16px">
        <div class="stat-card teal"><div class="label">ĐIỂM TB LỚP</div><div class="value" style="color:#0d9488">{{ summary.avgClass }}</div></div>
        <div class="stat-card green"><div class="label">GIỎI + XUẤT SẮC</div><div class="value" style="color:#10b981">{{ summary.xuat_sac + summary.gioi }}</div></div>
        <div class="stat-card red"><div class="label">TRUNG BÌNH + YẾU</div><div class="value" style="color:#ef4444">{{ summary.tb + summary.yeu }}</div></div>
      </div>
      <table class="data-table">
        <thead><tr><th>#</th><th>HỌC VIÊN</th><th>ĐTB GIỮA KỲ</th><th>ĐTB CUỐI KỲ</th><th>TỔNG KẾT</th><th>XẾP LOẠI</th><th>KẾT QUẢ</th></tr></thead>
        <tbody>
          <tr v-for="(s,i) in scores" :key="s.id">
            <td class="text-muted">{{ i+1 }}</td>
            <td><div class="user-cell"><div class="avatar" :class="avatarColors[i%6]">{{ s.name.split(' ').map(w=>w[0]).slice(-2).join('') }}</div><div><div class="name">{{ s.name }}</div><div class="code">{{ s.code }}</div></div></div></td>
            <td><span style="font-weight:600">{{ s.midAvg }}</span></td>
            <td><span style="font-weight:600">{{ s.finalAvg }}</span></td>
            <td><span :class="avgColor(s.average)" style="font-size:20px;font-weight:700">{{ s.average }}</span></td>
            <td><span class="badge" :class="gradeClass(s.grade)">{{ s.grade }}</span></td>
            <td><span class="badge" :class="s.average>=5?'badge-green':'badge-red'">{{ s.average>=5?'✓ Đạt':'✗ Không đạt' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>
