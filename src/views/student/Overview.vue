<script setup>
import { ref } from 'vue'
import { studentScheduleWeek, notifications, scoresTeacher } from '../../data/mockData.js'

// My scores - lấy học viên Nguyễn Văn An (HV-0312)
const myScore = ref(scoresTeacher[0])

const notifIcon = t => t==='exam'?'📢':t==='system'?'🔔':'📖'
const notifColor = t => t==='exam'?'#eff6ff':t==='system'?'#ecfdf5':'#fefce8'
const notifBorder = t => t==='exam'?'#3b82f6':t==='system'?'#10b981':'#f59e0b'

const gradeClass = g => g==='Giỏi'?'badge-green':g==='Khá'?'badge-blue':g==='TB'?'badge-yellow':'badge-red'
</script>

<template>
<div class="page-container">
  <!-- Premium Profile Banner -->
  <div class="profile-banner glass-panel">
    <div class="banner-decor decor-1"></div>
    <div class="banner-decor decor-2"></div>
    
    <div class="banner-content">
      <div class="avatar-wrapper">
        <div class="avatar-text">VA</div>
      </div>
      
      <div class="student-info">
        <h1 class="student-name">Nguyễn Văn An</h1>
        <div class="student-meta">
          <span class="meta-item">🔖 HV-0312</span>
          <span class="meta-item">📘 TOEIC 600+</span>
          <span class="meta-item">📅 Lớp Thứ 3,5,7</span>
        </div>
        <div class="graduation-pill">
          🎓 88 ngày đến tốt nghiệp
        </div>
      </div>
      
      <div class="quick-stats-glass">
        <div class="q-stat">
          <div class="q-val">92%</div>
          <div class="q-label">Điểm danh</div>
        </div>
        <div class="q-stat">
          <div class="q-val">7.6</div>
          <div class="q-label">Điểm TB</div>
        </div>
        <div class="q-stat">
          <div class="q-val">Khá</div>
          <div class="q-label">Xếp loại</div>
        </div>
        <div class="q-stat no-border">
          <div class="q-val">1/3</div>
          <div class="q-label">Phép đã dùng</div>
        </div>
      </div>
    </div>
  </div>

  <div class="dashboard-grid">
    <!-- Left Column: Schedule & Scores -->
    <div class="left-col">
      <!-- Weekly Schedule -->
      <div class="premium-card mb-6">
        <div class="card-header">
          <h3 class="card-title">📅 Lịch học tuần này</h3>
          <span class="week-badge">Tuần 6/12</span>
        </div>
        
        <div class="schedule-list">
          <div v-for="(s,i) in studentScheduleWeek" :key="i" class="schedule-item" :class="{'is-today': s.slots[0].status==='Hôm nay'}">
            <div class="schedule-main">
              <div class="status-dot" :class="s.slots[0].status==='Hôm nay'?'dot-today':s.slots[0].status.includes('✓')?'dot-done':'dot-upcoming'"></div>
              <div class="schedule-details">
                <div class="course-title">{{ s.slots[0].name }}</div>
                <div class="course-meta">{{ s.day }} • {{ s.slots[0].time }} • {{ s.slots[0].room }}</div>
              </div>
            </div>
            <span class="status-badge" :class="s.slots[0].status==='Hôm nay'?'badge-teal':s.slots[0].status.includes('✓')?'badge-green':'badge-gray'">
              {{ s.slots[0].status || 'Sắp tới' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Mini Scores Chart -->
      <div class="premium-card">
        <div class="card-header">
          <h3 class="card-title">📊 Tiến độ học tập</h3>
          <span class="grade-pill" :class="gradeClass(myScore.grade)">{{ myScore.grade }}</span>
        </div>
        
        <div class="skills-chart">
          <div v-for="(item,i) in [{label:'Listening',val:myScore.listening,color:'#3b82f6'},{label:'Reading',val:myScore.reading,color:'#10b981'},{label:'Writing',val:myScore.writing,color:'#8b5cf6'},{label:'Speaking',val:myScore.speaking,color:'#f59e0b'}]" :key="i" class="skill-row">
            <div class="skill-header">
              <span class="skill-label">{{ item.label }}</span>
              <span class="skill-score" :style="{color:item.color}">{{ item.val }} <span class="max-score">/ 10</span></span>
            </div>
            <div class="skill-track">
              <div class="skill-fill" :style="{width:(item.val/10*100)+'%', background:item.color}"></div>
            </div>
          </div>
        </div>
        
        <div class="total-score-box">
          <div class="total-label">Điểm trung bình</div>
          <div class="total-val">{{ myScore.total }}</div>
        </div>
      </div>
    </div>

    <!-- Right Column: Notifications & Reminders -->
    <div class="right-col">
      <div class="premium-card full-height">
        <h3 class="card-title mb-4">🔔 Thông báo mới nhất</h3>
        
        <div class="notifications-list">
          <div v-for="(n,i) in notifications" :key="i" class="notif-item" :style="{background:notifColor(n.type), borderLeft:'4px solid '+notifBorder(n.type)}">
            <div class="notif-icon-wrap">{{ notifIcon(n.type) }}</div>
            <div class="notif-content">
              <div class="notif-text">{{ n.text }}</div>
              <div class="notif-time">{{ n.from }}</div>
            </div>
          </div>
        </div>

        <!-- Reminders -->
        <div class="reminders-section">
          <h3 class="card-title small-title">📌 Nhắc nhở của tôi</h3>
          <div class="reminder-list">
            <div v-for="(item,i) in [
              {icon:'📝',text:'Bài tập Unit 7 — hạn nộp: 31/05/2025',bg:'#fef9c3', color:'#854d0e'},
              {icon:'🎯',text:'Kiểm tra giữa kỳ — ngày 10/06/2025',bg:'#fee2e2', color:'#991b1b'},
              {icon:'💳',text:'Học phí đã thanh toán đủ ✓',bg:'#dcfce7', color:'#166534'},
            ]" :key="i" class="reminder-item" :style="{background:item.bg}">
              <span class="reminder-icon">{{ item.icon }}</span>
              <span class="reminder-text" :style="{color:item.color}">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
/* ── PREMIUM STYLES FOR STUDENT OVERVIEW ── */
.page-container { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

/* Profile Banner with Glassmorphism */
.profile-banner {
  position: relative;
  background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%);
  border-radius: 24px;
  padding: 32px 40px;
  color: white;
  margin-bottom: 32px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(13, 148, 136, 0.4);
}

.banner-decor { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.08); }
.decor-1 { width: 300px; height: 300px; top: -100px; right: -50px; }
.decor-2 { width: 150px; height: 150px; bottom: -40px; right: 200px; }

.banner-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.avatar-wrapper {
  width: 88px;
  height: 88px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  transform: rotate(-3deg);
  transition: transform 0.3s;
}
.profile-banner:hover .avatar-wrapper { transform: rotate(0); }

.avatar-text { font-size: 32px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }

.student-info { flex: 1; min-width: 250px; }
.student-name { font-size: 28px; font-weight: 800; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.student-meta { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.meta-item { background: rgba(0,0,0,0.15); padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; backdrop-filter: blur(4px); }

.graduation-pill { display: inline-block; background: rgba(255, 255, 255, 0.9); color: #0f766e; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

.quick-stats-glass { display: flex; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(12px); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.2); overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.q-stat { padding: 16px 24px; text-align: center; border-right: 1px solid rgba(255, 255, 255, 0.2); }
.q-stat.no-border { border-right: none; }
.q-val { font-size: 24px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1); line-height: 1.2; }
.q-label { font-size: 12px; font-weight: 500; opacity: 0.9; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

/* Grid Layout */
.dashboard-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start; }
@media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }

/* Cards */
.premium-card { background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; transition: transform 0.2s, box-shadow 0.2s; }
.premium-card:hover { transform: translateY(-2px); box-shadow: 0 12px 25px -5px rgba(0,0,0,0.08); }
.mb-6 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 16px; }
.full-height { height: 100%; display: flex; flex-direction: column; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
.small-title { font-size: 15px; margin-bottom: 16px; }
.week-badge { background: #f0fdfa; color: #0d9488; padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 700; border: 1px solid #ccfbf1; }

/* Schedule List */
.schedule-list { display: flex; flex-direction: column; gap: 12px; }
.schedule-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; transition: all 0.2s; }
.schedule-item.is-today { background: #f0fdfa; border-color: #99f6e4; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.05); }
.schedule-item:hover { transform: translateX(4px); }

.schedule-main { display: flex; align-items: center; gap: 16px; }
.status-dot { width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 4px white; }
.dot-today { background: #0d9488; box-shadow: 0 0 0 4px #ccfbf1; animation: pulse-teal 2s infinite; }
.dot-done { background: #10b981; }
.dot-upcoming { background: #cbd5e1; }

@keyframes pulse-teal { 0% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(13, 148, 136, 0); } 100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); } }

.course-title { font-weight: 700; color: #0f172a; font-size: 15px; margin-bottom: 4px; }
.course-meta { font-size: 13px; color: #64748b; font-weight: 500; }

.status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.badge-teal { background: #0d9488; color: white; }
.badge-green { background: #dcfce7; color: #166534; }
.badge-gray { background: #f1f5f9; color: #64748b; }

/* Scores Chart */
.grade-pill { padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 800; }
.badge-green { background: #dcfce7; color: #166534; }
.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-yellow { background: #fef9c3; color: #854d0e; }
.badge-red { background: #fee2e2; color: #991b1b; }

.skills-chart { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.skill-row { display: flex; flex-direction: column; gap: 8px; }
.skill-header { display: flex; justify-content: space-between; align-items: flex-end; }
.skill-label { font-size: 14px; font-weight: 600; color: #475569; }
.skill-score { font-size: 16px; font-weight: 800; }
.max-score { font-size: 12px; color: #94a3b8; font-weight: 500; }

.skill-track { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.skill-fill { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

.total-score-box { background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); padding: 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #99f6e4; }
.total-label { font-size: 15px; font-weight: 700; color: #0f766e; }
.total-val { font-size: 32px; font-weight: 900; color: #0d9488; text-shadow: 0 2px 4px rgba(13, 148, 136, 0.2); }

/* Notifications */
.notifications-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.notif-item { padding: 16px; border-radius: 12px; display: flex; gap: 16px; align-items: flex-start; transition: transform 0.2s; }
.notif-item:hover { transform: translateX(4px); }
.notif-icon-wrap { font-size: 20px; background: white; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.notif-content { flex: 1; }
.notif-text { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px; line-height: 1.4; }
.notif-time { font-size: 12px; color: #64748b; font-weight: 500; }

/* Reminders */
.reminders-section { margin-top: auto; border-top: 1px solid #f1f5f9; padding-top: 24px; }
.reminder-list { display: flex; flex-direction: column; gap: 10px; }
.reminder-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; transition: transform 0.2s; }
.reminder-item:hover { transform: scale(1.02); }
.reminder-icon { font-size: 16px; }
.reminder-text { font-size: 13px; font-weight: 600; line-height: 1.4; }
</style>
