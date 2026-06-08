<script setup>
import { ref, computed } from 'vue'
import { studentScheduleWeek, notifications, scoresTeacher } from '../../data/mockData.js'

// My scores - lấy học viên Nguyễn Văn An (HV-0312)
const myScore = ref(scoresTeacher[0])

const notifIcon = t => t==='exam'?'📢':t==='system'?'🔔':'📖'
const notifColor = t => t==='exam'?'#eff6ff':t==='system'?'#ecfdf5':'#fefce8'
const notifBorder = t => t==='exam'?'#3b82f6':t==='system'?'#10b981':'#f59e0b'

const gradeClass = g => g==='Giỏi'?'badge-green':g==='Khá'?'badge-blue':g==='TB'?'badge-yellow':'badge-red'
</script>

<template>
<div>
  <!-- Profile Banner -->
  <div style="background:linear-gradient(135deg,#0d9488 0%,#0891b2 100%);border-radius:16px;padding:28px 32px;color:#fff;margin-bottom:24px;position:relative;overflow:hidden">
    <div style="position:absolute;top:-30px;right:-30px;width:180px;height:180px;background:rgba(255,255,255,.07);border-radius:50%"></div>
    <div style="position:absolute;bottom:-20px;right:80px;width:100px;height:100px;background:rgba(255,255,255,.05);border-radius:50%"></div>
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="width:72px;height:72px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;border:3px solid rgba(255,255,255,.4);flex-shrink:0">VA</div>
      <div style="flex:1">
        <div style="font-size:22px;font-weight:700">Nguyễn Văn An</div>
        <div style="opacity:.85;margin-top:2px;font-size:14px">HV-0312 · TOEIC 600+ · Lớp Thứ 3,5,7</div>
        <div style="margin-top:10px;display:inline-block;background:rgba(255,255,255,.2);padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600">🎓 88 ngày đến tốt nghiệp</div>
      </div>
      <div style="display:flex;gap:0;background:rgba(255,255,255,.1);border-radius:12px;overflow:hidden">
        <div v-for="(item,i) in [{val:'92%',label:'Điểm danh'},{val:'7.6',label:'Điểm TB'},{val:'Khá',label:'Xếp loại'},{val:'1/3',label:'Phép đã dùng'}]" :key="i"
          :style="{textAlign:'center',padding:'12px 20px',borderLeft:i>0?'1px solid rgba(255,255,255,.2)':'none'}">
          <div style="font-size:22px;font-weight:700">{{ item.val }}</div>
          <div style="font-size:11px;opacity:.8;margin-top:2px">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <!-- Schedule + Notifications left -->
    <div>
      <!-- Lịch tuần -->
      <div class="card" style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div class="card-title">📅 Lịch học tuần này</div>
          <span class="badge badge-teal">Tuần 6/12</span>
        </div>
        <div v-for="(s,i) in studentScheduleWeek" :key="i"
          :style="{padding:'12px 14px',marginBottom:'8px',borderRadius:'10px',
            background:s.slots[0].status==='Hôm nay'?'#f0fdfa':'#f8fafc',
            border:s.slots[0].status==='Hôm nay'?'1px solid #99f6e4':'1px solid #f1f5f9',
            display:'flex',justifyContent:'space-between',alignItems:'center'}">
          <div style="display:flex;align-items:center;gap:12px">
            <span :style="{width:'10px',height:'10px',borderRadius:'50%',background:s.slots[0].status==='Hôm nay'?'#0d9488':s.slots[0].status.includes('✓')?'#10b981':'#cbd5e1',display:'inline-block',flexShrink:0}"></span>
            <div>
              <div class="text-bold">{{ s.slots[0].name }}</div>
              <div class="text-muted">{{ s.day }} · {{ s.slots[0].time }} · {{ s.slots[0].room }}</div>
            </div>
          </div>
          <span class="badge" :class="s.slots[0].status==='Hôm nay'?'badge-teal':s.slots[0].status.includes('✓')?'badge-green':'badge-gray'">
            {{ s.slots[0].status || 'Sắp tới' }}
          </span>
        </div>
      </div>

      <!-- Điểm TB mini -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="card-title">📊 Điểm học tập</div>
          <span class="badge" :class="gradeClass(myScore.grade)">{{ myScore.grade }}</span>
        </div>
        <div v-for="(item,i) in [{label:'Listening',val:myScore.listening,color:'#3b82f6'},{label:'Reading',val:myScore.reading,color:'#10b981'},{label:'Writing',val:myScore.writing,color:'#8b5cf6'},{label:'Speaking',val:myScore.speaking,color:'#f59e0b'}]" :key="i" style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px"><span class="text-muted">{{ item.label }}</span><span style="font-weight:600" :style="{color:item.color}">{{ item.val }}/10</span></div>
          <div class="progress-bar"><div class="progress-fill" :style="{width:(item.val/10*100)+'%',background:item.color}"></div></div>
        </div>
        <div style="margin-top:12px;padding:10px;background:#f0fdfa;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
          <span class="text-muted">Điểm trung bình</span>
          <span style="font-size:24px;font-weight:700;color:#0d9488">{{ myScore.total }}</span>
        </div>
      </div>
    </div>

    <!-- Notifications right -->
    <div class="card">
      <div class="card-title" style="margin-bottom:16px">🔔 Thông báo mới nhất</div>
      <div v-for="(n,i) in notifications" :key="i"
        :style="{padding:'14px',marginBottom:'10px',borderRadius:'10px',background:notifColor(n.type),borderLeft:'3px solid '+notifBorder(n.type)}">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <span style="font-size:18px">{{ notifIcon(n.type) }}</span>
          <div><div style="font-weight:600;font-size:14px;color:#0f172a">{{ n.text }}</div><div class="text-muted" style="margin-top:3px">{{ n.from }}</div></div>
        </div>
      </div>

      <!-- Nhắc nhở nhanh -->
      <div style="margin-top:20px;border-top:1px solid #f1f5f9;padding-top:16px">
        <div class="card-title" style="margin-bottom:12px;font-size:14px">📌 Nhắc nhở</div>
        <div v-for="(item,i) in [
          {icon:'📝',text:'Bài tập Unit 7 — hạn nộp: 31/05/2025',color:'#fef9c3'},
          {icon:'🎯',text:'Kiểm tra giữa kỳ — ngày 10/06/2025',color:'#fee2e2'},
          {icon:'💳',text:'Học phí đã thanh toán đủ ✓',color:'#dcfce7'},
        ]" :key="i" :style="{display:'flex',gap:'10px',alignItems:'center',padding:'10px 12px',borderRadius:'8px',background:item.color,marginBottom:'8px'}">
          <span>{{ item.icon }}</span>
          <span style="font-size:13px;font-weight:500;color:#334155">{{ item.text }}</span>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
