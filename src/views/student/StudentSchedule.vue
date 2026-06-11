<template>
  <div class="h-full flex flex-col overflow-hidden bg-white">
      <!-- Header -->
      <header class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
        <div class="flex flex-col">
          <h1 class="text-xl font-bold text-gray-800">Lịch học cá nhân</h1>
          <p class="text-[11px] text-gray-400 font-medium">Thời khóa biểu của các lớp đã đăng ký</p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Toggle View Mode -->
          <div class="flex items-center bg-gray-100 rounded-xl p-1">
            <button @click="viewMode = 'week'" :class="['px-4 py-2 rounded-lg text-xs font-bold transition-all', viewMode === 'week' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400 hover:text-gray-600']">
              📆 Tuần
            </button>
            <button @click="viewMode = 'month'" :class="['px-4 py-2 rounded-lg text-xs font-bold transition-all', viewMode === 'month' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400 hover:text-gray-600']">
              📅 Tháng
            </button>
          </div>
          <button @click="fetchData" class="bg-gray-50 hover:bg-gray-100 text-gray-400 p-2.5 rounded-xl transition-all">
            <svg :class="['w-5 h-5', loading ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Body -->
      <div class="flex-1 p-8 overflow-y-auto">

        <!-- =========== CHẾ ĐỘ XEM TUẦN =========== -->
        <template v-if="viewMode === 'week'">
        <div class="flex items-center justify-between mb-6">
          <h2 class="schedule-title">
            <span class="schedule-title-italic">Thời khoá biểu</span>
            — Tuần {{ currentWeekNumber }} ({{ weekRangeLabel }})
          </h2>
          <div class="flex items-center space-x-2">
            <button @click="prevWeek" class="week-nav-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button @click="goToCurrentWeek" class="week-nav-btn px-3 text-xs font-bold text-gray-500 w-auto">
              Tuần này
            </button>
            <button @click="nextWeek" class="week-nav-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <svg class="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <p class="text-sm text-gray-400 italic">Đang tải thời khóa biểu...</p>
        </div>

        <!-- Bảng TKB -->
        <div v-else class="schedule-table-wrapper">
          <table class="schedule-table">
            <thead>
              <tr>
                <th class="schedule-th schedule-th-ca">Ca</th>
                <th v-for="day in weekDays" :key="day.num" class="schedule-th"
                  :class="{ 'today-col': isTodayCol(day.num) }">
                  <div>{{ day.label }}</div>
                  <div class="th-date" :class="{ 'today-date': isTodayCol(day.num) }">
                    {{ getDateLabel(day.num) }}
                  </div>
                  <div v-if="isTodayCol(day.num)" class="today-badge">Hôm nay</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in timeSlots" :key="slot.label" class="schedule-row">
                <!-- Cột Ca -->
                <td class="schedule-td-time">
                  <div class="time-label-slot">{{ slot.label }}</div>
                  <div class="time-label">{{ slot.startTime }}</div>
                  <div class="time-label">{{ slot.endTime }}</div>
                </td>
                <!-- Các cột ngày -->
                <td v-for="day in weekDays" :key="day.num + '-' + slot.label" class="schedule-td-cell"
                  :class="{ 'today-cell': isTodayCol(day.num) }">
                  <div
                    v-for="sch in getCellSchedules(day.num, slot)"
                    :key="sch.id || sch.classCode"
                    :class="['schedule-card', getCardColorClass(sch.courseName)]"
                    @click="openDetail(sch)"
                  >
                    <div class="card-course-name">{{ shortenCourseName(sch.courseName) }}</div>
                    <div class="card-meta">{{ sch.classCode }}</div>
                    <div class="card-room">📍 {{ getRoomName(sch.room) }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Legend -->
        <div v-if="legendItems.length > 0" class="schedule-legend">
          <div v-for="item in legendItems" :key="item.name" class="legend-item">
            <span :class="['legend-dot', item.colorClass]"></span>
            <span class="legend-text">{{ item.name }}</span>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!loading && weekSchedules.length === 0" class="mt-6 text-center py-10">
          <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p class="text-sm text-gray-400 font-medium">Tuần này không có lịch học</p>
          <p class="text-xs text-gray-300 mt-1">Thử chuyển sang tuần khác hoặc kiểm tra đăng ký lớp học</p>
        </div>
        </template>

        <!-- =========== CHẾ ĐỘ XEM THÁNG =========== -->
        <template v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="schedule-title">
            <span class="schedule-title-italic">Lịch tháng</span> — Tháng {{ currentMonthDisplay }} / {{ currentYearDisplay }}
          </h2>
          <div class="flex items-center space-x-2">
            <button @click="prevMonth" class="week-nav-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button @click="goToCurrentMonth" class="week-nav-btn px-3 text-xs font-bold text-gray-500 w-auto">Tháng này</button>
            <button @click="nextMonth" class="week-nav-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div v-if="monthScheduleDays.length === 0" class="text-center py-16 text-gray-400">
            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <p class="font-medium">Không có lịch học trong tháng này</p>
          </div>

          <div v-for="day in monthScheduleDays" :key="day.dateStr" class="month-day-card" :class="{ 'today-day-card': day.isToday }">
            <div class="month-day-header" :class="{ 'today-day-header': day.isToday }">
              <div class="flex items-center space-x-3">
                <div :class="['month-day-num', day.isToday ? 'today-day-num' : '']">{{ day.dayNum }}</div>
                <div>
                  <div class="text-sm font-bold" :class="day.isToday ? 'text-emerald-700' : 'text-gray-700'">{{ day.dowLabel }}</div>
                  <div class="text-xs text-gray-400">{{ day.fullDate }}</div>
                </div>
              </div>
              <span v-if="day.isToday" class="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">Hôm nay</span>
              <span class="text-[10px] font-bold text-gray-400">{{ day.total }} buổi học</span>
            </div>

            <div class="month-day-body">
              <div v-if="day.morning.length > 0" class="session-section">
                <div class="session-label session-morning">🌅 Sáng</div>
                <div class="session-items">
                  <div v-for="sch in day.morning" :key="sch.id || sch.classCode" :class="['month-card', getCardColorClass(sch.courseName)]" @click="openDetail(sch)">
                    <div class="month-card-time">{{ normalizeTime(sch.startTime) }} – {{ normalizeTime(sch.endTime) }}</div>
                    <div class="month-card-name">{{ sch.courseName }}</div>
                    <div class="month-card-sub">{{ sch.classCode }} · {{ getRoomName(sch.room) }}</div>
                  </div>
                </div>
              </div>
              <div v-if="day.afternoon.length > 0" class="session-section">
                <div class="session-label session-afternoon">☀️ Chiều</div>
                <div class="session-items">
                  <div v-for="sch in day.afternoon" :key="sch.id || sch.classCode" :class="['month-card', getCardColorClass(sch.courseName)]" @click="openDetail(sch)">
                    <div class="month-card-time">{{ normalizeTime(sch.startTime) }} – {{ normalizeTime(sch.endTime) }}</div>
                    <div class="month-card-name">{{ sch.courseName }}</div>
                    <div class="month-card-sub">{{ sch.classCode }} · {{ getRoomName(sch.room) }}</div>
                  </div>
                </div>
              </div>
              <div v-if="day.evening.length > 0" class="session-section">
                <div class="session-label session-evening">🌙 Tối</div>
                <div class="session-items">
                  <div v-for="sch in day.evening" :key="sch.id || sch.classCode" :class="['month-card', getCardColorClass(sch.courseName)]" @click="openDetail(sch)">
                    <div class="month-card-time">{{ normalizeTime(sch.startTime) }} – {{ normalizeTime(sch.endTime) }}</div>
                    <div class="month-card-name">{{ sch.courseName }}</div>
                    <div class="month-card-sub">{{ sch.classCode }} · {{ getRoomName(sch.room) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </template>

        <!-- Modal Chi Tiết -->
        <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div class="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative">
            <button @click="showDetail = false" class="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors text-xl">✕</button>
            
            <!-- Header modal -->
            <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-white', getCardColorClass(selectedItem?.courseName)]"
              style="filter: saturate(1.4)">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">{{ selectedItem?.courseName }}</h3>
            <p class="text-xs text-emerald-500 font-black uppercase tracking-widest mb-6">Chi tiết buổi học</p>

            <div class="space-y-3">
              <div v-for="(val, label) in {
                'Mã lớp': selectedItem?.classCode,
                'Thứ': 'Thứ ' + selectedItem?.dayOfWeek,
                'Thời gian': (selectedItem?.startTime || '') + ' – ' + (selectedItem?.endTime || ''),
                'Phòng học': getRoomName(selectedItem?.room),
                'Buổi': sessionLabel(selectedItem?.session)
              }" :key="label" class="flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                <span class="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{{ label }}</span>
                <span class="text-sm font-bold text-gray-700">{{ val }}</span>
              </div>
            </div>

            <button @click="showDetail = false"
              class="w-full mt-6 py-4 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95">
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'
const currentUser = ref(null)
const loading = ref(false)
const myFullSchedule = ref([])
const allClasses = ref([])
const allRooms = ref([])
const showDetail = ref(false)
const selectedItem = ref(null)
const viewMode = ref('week') // 'week' | 'month'

// ======== TUẦN & NGÀY ========
const currentWeekOffset = ref(0)

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff); d.setHours(0,0,0,0)
  return d
}

const currentMonday = computed(() => {
  const today = new Date()
  const monday = getMonday(today)
  monday.setDate(monday.getDate() + currentWeekOffset.value * 7)
  return monday
})

const currentSaturday = computed(() => {
  const sat = new Date(currentMonday.value)
  sat.setDate(sat.getDate() + 5)
  return sat
})

const formatDate = (d) => {
  const dd = String(d.getDate()).padStart(2,'0')
  const mm = String(d.getMonth()+1).padStart(2,'0')
  return `${dd}/${mm}`
}

const weekRangeLabel = computed(() => `${formatDate(currentMonday.value)} - ${formatDate(currentSaturday.value)}`)

const currentWeekNumber = computed(() => {
  const startOfYear = new Date(currentMonday.value.getFullYear(), 0, 1)
  const diff = currentMonday.value - startOfYear
  return Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7)
})

const prevWeek = () => { currentWeekOffset.value-- }
const nextWeek = () => { currentWeekOffset.value++ }
const goToCurrentWeek = () => { currentWeekOffset.value = 0 }

// Các thứ Thứ 2 → Thứ 7
const weekDays = [
  { num: 2, label: 'Thứ 2' },
  { num: 3, label: 'Thứ 3' },
  { num: 4, label: 'Thứ 4' },
  { num: 5, label: 'Thứ 5' },
  { num: 6, label: 'Thứ 6' },
  { num: 7, label: 'Thứ 7' },
]

const getDateLabel = (dayNum) => {
  const d = new Date(currentMonday.value)
  d.setDate(d.getDate() + (dayNum - 2))
  return formatDate(d)
}

// Kiểm tra cột hôm nay (dayNum backend: Mon=2, ..., Sat=7, Sun=8)
const isTodayCol = (dayNum) => {
  const jsDay = new Date().getDay() // 0=Sun, 1=Mon,...
  const todayDow = jsDay === 0 ? 8 : jsDay + 1
  return currentWeekOffset.value === 0 && dayNum === todayDow
}

// Các ca học cố định
const timeSlots = [
  { label: 'Ca 1', startTime: '07:30', endTime: '09:00' },
  { label: 'Ca 2', startTime: '09:30', endTime: '11:00' },
  { label: 'Ca 3', startTime: '14:00', endTime: '15:30' },
  { label: 'Ca 4', startTime: '17:30', endTime: '19:00' },
]

// ======== AUTH & DATA ========
onMounted(() => {
  const saved = localStorage.getItem('currentUser')
  if (saved) {
    currentUser.value = JSON.parse(saved)
  } else {
    currentUser.value = { id: 'ST1', name: 'Nguyễn Văn A', studentCode: 'STU001', role: 'student', classCode: 'JAVA_2024_01' } // dummy fallback
  }
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const [resInfo, resClasses, resRooms] = await Promise.all([
      api.getCourseInfo(),
      api.getClasses(),
      api.getRooms()
    ])
    allClasses.value = resClasses.data
    allRooms.value = resRooms.data

    const user = currentUser.value
    const studentClassCodes = user.classCode ? [user.classCode] : (user.classCodes || [])

    const myActiveClasses = resClasses.data.filter(c =>
      studentClassCodes.includes(c.classCode) &&
      (c.status === 'OPENED' || c.status === 'Đã công bố')
    )
    const classCodes = myActiveClasses.map(c => c.classCode)

    // Lọc trùng: API course-info có thể trả về duplicate rows
    const seen = new Set()
    myFullSchedule.value = resInfo.data.filter(s => {
      if (!classCodes.includes(s.classCode)) return false
      const key = `${s.classCode}_${s.dayOfWeek}_${s.startTime}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Debug
    console.log('=== DEBUG STUDENT TKB ===')
    console.log('👤 Học sinh:', user.name, '| Lớp:', studentClassCodes)
    console.log('✅ Lớp active:', myActiveClasses.map(c => c.classCode))
    console.log('📅 Schedule items:', myFullSchedule.value.length)

  } catch (err) {
    console.error('Lỗi fetch dữ liệu học sinh:', err)
  } finally {
    loading.value = false
  }
}

// Helper: lấy tên phòng từ roomId (API /course-info trả về room là số int = roomId)
const getRoomName = (roomId) => {
  if (!roomId && roomId !== 0) return 'Chưa xếp'
  const found = allRooms.value.find(r => r.roomId === roomId || r.roomId === Number(roomId))
  return found ? found.roomName : `Phòng ${roomId}`
}

// Map classCode → class data
const classInfoMap = computed(() => {
  const map = {}
  allClasses.value.forEach(c => { map[c.classCode] = c })
  return map
})

// ======== CORE: Kiểm tra lớp active trên MỘT ngày cụ thể ========
// startDate <= targetDate <= endDate (nếu có)
const isClassActiveOnDate = (classCode, targetDateStr) => {
  const cls = classInfoMap.value[classCode]
  if (!cls) return true
  if (!cls.startDate) return true

  const clsStart = new Date(cls.startDate); clsStart.setHours(0,0,0,0)
  const target = new Date(targetDateStr); target.setHours(0,0,0,0)

  if (clsStart > target) return false
  if (cls.endDate) {
    const clsEnd = new Date(cls.endDate); clsEnd.setHours(23,59,59,999)
    if (clsEnd < target) return false
  }
  return true
}

// Tính ngày cụ thể cho dayNum trong tuần đang xem
const getDateForDow = (dayNum) => {
  const d = new Date(currentMonday.value)
  d.setDate(d.getDate() + (dayNum - 2)) // dayNum=2=>Mon(+0), 7=>Sat(+5)
  return d
}

const getDateStrForDow = (dayNum) => {
  const d = getDateForDow(dayNum)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// weekSchedules: tất cả schedule của tuần, mỗi ô sẽ tự lọc theo ngày
const weekSchedules = computed(() => myFullSchedule.value)

// ======== MAPPING ô bảng ========
const normalizeTime = (t) => {
  if (!t) return ''
  const parts = t.split(':')
  return `${parts[0].padStart(2,'0')}:${(parts[1]||'00').padStart(2,'0')}`
}
const timeToMinutes = (t) => {
  const [h, m] = normalizeTime(t).split(':').map(Number)
  return h * 60 + m
}

// MONTH VIEW
const currentMonthOffset = ref(0)
const currentMonthStart = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + currentMonthOffset.value, 1)
})
const currentMonthDisplay = computed(() => currentMonthStart.value.getMonth() + 1)
const currentYearDisplay = computed(() => currentMonthStart.value.getFullYear())
const prevMonth = () => { currentMonthOffset.value-- }
const nextMonth = () => { currentMonthOffset.value++ }
const goToCurrentMonth = () => { currentMonthOffset.value = 0 }

const todayStr = () => {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
}

const monthScheduleDays = computed(() => {
  const year = currentMonthStart.value.getFullYear()
  const month = currentMonthStart.value.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = todayStr()
  const dowNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

  const days = []
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const jsDay = date.getDay()
    const dow = jsDay === 0 ? 8 : jsDay + 1
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

    const daySchedules = myFullSchedule.value.filter(s => {
      if (Number(s.dayOfWeek) !== dow) return false
      return isClassActiveOnDate(s.classCode, dateStr)
    })
    if (daySchedules.length === 0) continue

    const morning = daySchedules.filter(s => { const h = parseInt(s.startTime?.split(':')[0] || '0'); return h >= 5 && h < 12 })
    const afternoon = daySchedules.filter(s => { const h = parseInt(s.startTime?.split(':')[0] || '0'); return h >= 12 && h < 17 })
    const evening = daySchedules.filter(s => { const h = parseInt(s.startTime?.split(':')[0] || '0'); return h >= 17 })

    days.push({
      dateStr, dayNum: d, dowLabel: dowNames[jsDay],
      fullDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      isToday: dateStr === today,
      total: daySchedules.length,
      morning, afternoon, evening
    })
  }
  return days
})

const getCellSchedules = (dayNum, slot) => {
  const slotStart = timeToMinutes(slot.startTime)
  const slotEnd = timeToMinutes(slot.endTime)
  const dateStr = getDateStrForDow(dayNum)

  return myFullSchedule.value.filter(s => {
    const dayMatch = Number(s.dayOfWeek) === dayNum
    if (!dayMatch) return false
    if (!isClassActiveOnDate(s.classCode, dateStr)) return false
    const sStart = timeToMinutes(s.startTime)
    const timeMatch = normalizeTime(s.startTime) === slot.startTime ||
                      (sStart >= slotStart && sStart < slotEnd)
    return timeMatch
  })
}

// ======== MÀU SẮC ========
const courseColorMap = {}
const colorPalette = [
  'card-emerald','card-blue','card-violet','card-yellow','card-pink','card-cyan','card-orange'
]
let colorIndex = 0
const getCardColorClass = (courseName) => {
  if (!courseName) return 'card-emerald'
  if (!courseColorMap[courseName]) {
    courseColorMap[courseName] = colorPalette[colorIndex++ % colorPalette.length]
  }
  return courseColorMap[courseName]
}

const shortenCourseName = (name) => {
  if (!name) return ''
  if (name.length > 16) return name.split(' ').slice(0,2).join(' ').substring(0,14)
  return name
}

// Legend
const legendItems = computed(() => {
  const seen = new Set(); const items = []
  weekSchedules.value.forEach(s => {
    if (!seen.has(s.courseName)) {
      seen.add(s.courseName)
      items.push({ name: s.courseName, colorClass: 'legend-' + getCardColorClass(s.courseName) })
    }
  })
  return items
})

const openDetail = (sch) => { selectedItem.value = sch; showDetail.value = true }
const sessionLabel = (s) => ({ MORNING: 'Sáng', AFTERNOON: 'Chiều', EVENING: 'Tối' }[s] || s || '—')
</script>

<style scoped>
/* ============ TITLE ============ */
.schedule-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: -0.01em;
}
.schedule-title-italic {
  font-style: italic;
  font-weight: 700;
}

/* ============ WEEK NAV ============ */
.week-nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}
.week-nav-btn:hover {
  background: #f0fdf4;
  border-color: #6ee7b7;
  color: #059669;
}

/* ============ TABLE ============ */
.schedule-table-wrapper {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f1f0f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
}
.schedule-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.schedule-th {
  padding: 14px 8px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #6b7280;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f5f5f5;
  letter-spacing: 0.02em;
  transition: background 0.2s;
}
.schedule-th:last-child { border-right: none; }
.schedule-th-ca { width: 90px; color: #9ca3af; font-size: 0.75rem; font-weight: 600; }

.today-col { background: #f0fdf4 !important; }
.th-date { font-size: 0.7rem; font-weight: 500; color: #9ca3af; margin-top: 2px; }
.today-date { color: #059669; font-weight: 700; }
.today-badge {
  font-size: 0.6rem;
  font-weight: 800;
  color: #059669;
  background: #d1fae5;
  border-radius: 6px;
  padding: 1px 6px;
  display: inline-block;
  margin-top: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.schedule-row { border-bottom: 1px solid #f5f5f5; }
.schedule-row:last-child { border-bottom: none; }

.schedule-td-time {
  padding: 18px 12px;
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid #f0f0f0;
  background: #fefefe;
}
.time-label-slot {
  font-size: 0.7rem;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.time-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #6b7280;
  line-height: 1.6;
}
.schedule-td-cell {
  padding: 10px 7px;
  vertical-align: middle;
  text-align: center;
  border-right: 1px solid #f5f5f5;
  min-height: 90px;
  height: 105px;
  transition: background 0.2s;
}
.schedule-td-cell:last-child { border-right: none; }
.today-cell { background: #f9fefb; }

/* ============ CARDS ============ */
.schedule-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s ease;
  width: 100%;
  min-height: 68px;
  gap: 2px;
}
.schedule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}
.card-course-name {
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
}
.card-meta {
  font-size: 0.65rem;
  font-weight: 600;
  opacity: 0.6;
}
.card-room {
  font-size: 0.68rem;
  font-weight: 600;
  opacity: 0.75;
}

/* Card colors */
.card-emerald { background: #d1fae5; color: #065f46; }
.card-blue    { background: #dbeafe; color: #1e40af; }
.card-violet  { background: #ede9fe; color: #5b21b6; }
.card-yellow  { background: #fef9c3; color: #854d0e; }
.card-pink    { background: #fce7f3; color: #9d174d; }
.card-cyan    { background: #cffafe; color: #155e75; }
.card-orange  { background: #ffedd5; color: #9a3412; }

/* ============ LEGEND ============ */
.schedule-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 18px;
  padding: 4px 8px;
}
.legend-item { display: flex; align-items: center; gap: 7px; }
.legend-dot { width: 13px; height: 13px; border-radius: 4px; flex-shrink: 0; }
.legend-text { font-size: 0.82rem; font-weight: 500; color: #4b5563; }

.legend-card-emerald { background: #d1fae5; }
.legend-card-blue    { background: #dbeafe; }
.legend-card-violet  { background: #ede9fe; }
.legend-card-yellow  { background: #fef9c3; }
.legend-card-pink    { background: #fce7f3; }
.legend-card-cyan    { background: #cffafe; }
.legend-card-orange  { background: #ffedd5; }

/* ============ THÁNG VIEW ============ */
.month-day-card {
  background: #fff; border-radius: 20px; border: 1px solid #f0f0f0;
  overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.03); transition: all 0.2s ease;
}
.month-day-card:hover { border-color: #d1fae5; box-shadow: 0 4px 16px rgba(5,150,105,0.06); }
.today-day-card { border-color: #a7f3d0; background: linear-gradient(to bottom right, #fff, #f0fdf4); }

.month-day-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #f5f5f5; background: #fafafa;
}
.today-day-header { background: linear-gradient(to right, #f0fdf4, #ecfdf5); }

.month-day-num {
  width: 40px; height: 40px; border-radius: 12px; background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 800; color: #374151;
}
.today-day-num { background: #059669; color: #fff; box-shadow: 0 4px 12px rgba(5,150,105,0.3); }

.month-day-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }

.session-section { display: flex; flex-direction: column; gap: 8px; }
.session-label {
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
  padding: 4px 10px; border-radius: 8px; display: inline-flex; align-items: center; width: fit-content;
}
.session-morning { background: #fef3c7; color: #92400e; }
.session-afternoon { background: #dbeafe; color: #1e40af; }
.session-evening { background: #e9d5ff; color: #6b21a8; }

.session-items { display: flex; flex-wrap: wrap; gap: 10px; padding-left: 4px; }

.month-card {
  display: flex; flex-direction: column; padding: 12px 16px; border-radius: 14px;
  cursor: pointer; transition: all 0.2s ease; min-width: 180px; flex: 1;
}
.month-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
.month-card-time { font-size: 0.72rem; font-weight: 600; opacity: 0.7; margin-bottom: 4px; }
.month-card-name { font-size: 0.88rem; font-weight: 700; line-height: 1.3; margin-bottom: 3px; }
.month-card-sub { font-size: 0.7rem; font-weight: 600; opacity: 0.65; }
</style>
