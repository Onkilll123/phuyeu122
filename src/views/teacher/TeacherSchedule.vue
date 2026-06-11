<template>
  <div class="h-full flex flex-col overflow-hidden bg-white">
      <header class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
        <div class="flex flex-col">
          <h1 class="text-xl font-bold text-gray-800">Lịch dạy cá nhân</h1>
          <p class="text-[11px] text-gray-400 font-medium">Lịch dạy chính thức các lớp đã công bố</p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Toggle View Mode -->
          <div class="flex items-center bg-gray-100 rounded-xl p-1">
            <button @click="viewMode = 'week'" :class="['px-4 py-2 rounded-lg text-xs font-bold transition-all', viewMode === 'week' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400 hover:text-gray-600']">
              📆 Tuần
            </button>
            <button @click="viewMode = 'month'" :class="['px-4 py-2 rounded-lg text-xs font-bold transition-all', viewMode === 'month' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400 hover:text-gray-600']">
              📅 Tháng
            </button>
          </div>
          <button @click="fetchData" class="bg-gray-50 hover:bg-gray-100 text-gray-400 p-2.5 rounded-xl transition-all">
            <svg :class="['w-5 h-5', loading ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
      </header>

      <div class="flex-1 p-6 overflow-y-auto">
        
        <!-- =========== CHẾ ĐỘ XEM TUẦN =========== -->
        <template v-if="viewMode === 'week'">
          <!-- Tiêu đề + Điều hướng tuần -->
          <div class="flex items-center justify-between mb-5">
            <h2 class="schedule-title">
              <span class="schedule-title-italic">Thời khoá biểu</span> — Tuần {{ currentWeekNumber }} ({{ weekRangeLabel }})
            </h2>
            <div class="flex items-center space-x-2">
              <button @click="prevWeek" class="week-nav-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button @click="currentWeekOffset = 0" class="week-nav-btn px-4 text-xs font-bold text-gray-600 w-auto">Tuần này</button>
              <button @click="nextWeek" class="week-nav-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <!-- Bảng TKB Tuần -->
          <div class="schedule-table-wrapper">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th class="schedule-th schedule-th-ca">Ca</th>
                  <th v-for="day in weekDays" :key="day.num" class="schedule-th" :class="{ 'today-col': isTodayDow(day.num) }">
                    <div>{{ day.label }}</div>
                    <div class="th-date" :class="{ 'today-date': isTodayDow(day.num) }">{{ getDateLabel(day.num) }}</div>
                    <div v-if="isTodayDow(day.num)" class="today-badge">Hôm nay</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="slot in timeSlots" :key="slot.label" class="schedule-row">
                  <td class="schedule-td-time">
                    <div class="time-label-slot">{{ slot.label }}</div>
                    <div class="time-label">{{ slot.startTime }}</div>
                    <div class="time-label">{{ slot.endTime }}</div>
                  </td>
                  <td v-for="day in weekDays" :key="day.num + '-' + slot.label" class="schedule-td-cell" :class="{ 'today-cell': isTodayDow(day.num) }">
                    <div
                      v-for="sch in getWeekCellSchedules(day.num, slot)"
                      :key="sch.id || sch.classCode"
                      :class="['schedule-card', getCardColorClass(sch.courseName)]"
                      @click="openDetail(sch, getDateForDow(day.num))"
                    >
                      <div class="card-course-name">{{ shortenCourseName(sch.courseName) }}</div>
                      <div class="card-room">P.{{ sch.room }}</div>
                      <div v-if="sch.isPendingReschedule" class="text-[9px] mt-1.5 bg-white/50 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-center">Chờ đổi lịch</div>
                      <div v-if="sch.isRescheduled" class="text-[9px] mt-1.5 bg-white/50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-center">Lịch dạy bù</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Legend Tuần -->
          <div class="schedule-legend">
            <div v-for="item in legendItems" :key="item.name" class="legend-item">
              <span :class="['legend-dot', item.colorClass]"></span>
              <span class="legend-text">{{ item.name }}</span>
            </div>
          </div>
        </template>

        <!-- =========== CHẾ ĐỘ XEM THÁNG =========== -->
        <template v-else>
          <!-- Tiêu đề + Điều hướng tháng -->
          <div class="flex items-center justify-between mb-5">
            <h2 class="schedule-title">
              <span class="schedule-title-italic">Lịch tháng</span> — Tháng {{ currentMonthDisplay }} / {{ currentYearDisplay }}
            </h2>
            <div class="flex items-center space-x-2">
              <button @click="prevMonth" class="week-nav-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button @click="goToCurrentMonth" class="week-nav-btn px-4 text-xs font-bold text-gray-600 w-auto">Tháng này</button>
              <button @click="nextMonth" class="week-nav-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <!-- Lịch tháng dạng list theo ngày, phân sáng/chiều/tối -->
          <div class="space-y-4">
            <div v-if="monthScheduleDays.length === 0" class="text-center py-16 text-gray-400">
              <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <p class="font-medium">Không có lịch dạy trong tháng này</p>
            </div>

            <div v-for="day in monthScheduleDays" :key="day.dateStr" class="month-day-card" :class="{ 'today-day-card': day.isToday }">
              <!-- Tiêu đề ngày -->
              <div class="month-day-header" :class="{ 'today-day-header': day.isToday }">
                <div class="flex items-center space-x-3">
                  <div :class="['month-day-num', day.isToday ? 'today-day-num' : '']">{{ day.dayNum }}</div>
                  <div>
                    <div class="text-sm font-bold" :class="day.isToday ? 'text-indigo-700' : 'text-gray-700'">{{ day.dowLabel }}</div>
                    <div class="text-xs text-gray-400">{{ day.fullDate }}</div>
                  </div>
                </div>
                <span v-if="day.isToday" class="text-[10px] font-black bg-indigo-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">Hôm nay</span>
                <span class="text-[10px] font-bold text-gray-400">{{ day.total }} buổi dạy</span>
              </div>

              <!-- Phân theo Sáng / Chiều / Tối -->
              <div class="month-day-body">
                <!-- Sáng -->
                <div v-if="day.morning.length > 0" class="session-section">
                  <div class="session-label session-morning">🌅 Sáng</div>
                  <div class="session-items">
                    <div v-for="sch in day.morning" :key="sch.id || sch.classCode" :class="['month-card', getCardColorClass(sch.courseName)]" @click="openDetail(sch, day.dateStr)">
                      <div class="month-card-time">{{ normalizeTime(sch.startTime) }} – {{ normalizeTime(sch.endTime) }}</div>
                      <div class="month-card-name">{{ sch.courseName }}</div>
                      <div class="month-card-sub">{{ sch.classCode }} · P.{{ sch.room }}</div>
                    </div>
                  </div>
                </div>

                <!-- Chiều -->
                <div v-if="day.afternoon.length > 0" class="session-section">
                  <div class="session-label session-afternoon">☀️ Chiều</div>
                  <div class="session-items">
                    <div v-for="sch in day.afternoon" :key="sch.id || sch.classCode" :class="['month-card', getCardColorClass(sch.courseName)]" @click="openDetail(sch, day.dateStr)">
                      <div class="month-card-time">{{ normalizeTime(sch.startTime) }} – {{ normalizeTime(sch.endTime) }}</div>
                      <div class="month-card-name">{{ sch.courseName }}</div>
                      <div class="month-card-sub">{{ sch.classCode }} · P.{{ sch.room }}</div>
                    </div>
                  </div>
                </div>

                <!-- Tối -->
                <div v-if="day.evening.length > 0" class="session-section">
                  <div class="session-label session-evening">🌙 Tối</div>
                  <div class="session-items">
                    <div v-for="sch in day.evening" :key="sch.id || sch.classCode" :class="['month-card', getCardColorClass(sch.courseName)]" @click="openDetail(sch, day.dateStr)">
                      <div class="month-card-time">{{ normalizeTime(sch.startTime) }} – {{ normalizeTime(sch.endTime) }}</div>
                      <div class="month-card-name">{{ sch.courseName }}</div>
                      <div class="month-card-sub">{{ sch.classCode }} · P.{{ sch.room }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Modal Chi Tiết Lịch -->
      <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative animate-modal-in">
          <button @click="showDetail = false" class="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors text-xl">✕</button>
          <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-1">{{ selectedItem?.courseName }}</h3>
          <p class="text-xs text-indigo-500 font-black uppercase tracking-widest mb-6">Chi tiết buổi dạy</p>
          
          <div class="space-y-3">
            <div v-for="(val, label) in {
              'Mã lớp': selectedItem?.classCode,
              'Thứ': 'Thứ ' + selectedItem?.dayOfWeek,
              'Thời gian': normalizeTime(selectedItem?.startTime) + ' – ' + normalizeTime(selectedItem?.endTime),
              'Phòng dạy': selectedItem?.room,
              'Buổi': sessionLabel(selectedItem?.session)
            }" :key="label" class="flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
              <span class="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{{ label }}</span>
              <span class="text-sm font-bold text-gray-700">{{ val }}</span>
            </div>
          </div>

          <div class="flex space-x-3 mt-6">
            <button @click="showDetail = false" class="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95">Đóng</button>
            <button v-if="!selectedItem?.isPendingReschedule && !selectedItem?.isRescheduled" @click="openRescheduleForm(selectedItem)" class="flex-1 py-4 bg-yellow-50 text-yellow-600 rounded-2xl text-sm font-bold hover:bg-yellow-100 transition-all active:scale-95">
              Xin đổi lịch
            </button>
            <a href="https://www.youtube.com/watch?v=eco6rsWwSH8" target="_blank" class="flex-1 flex items-center justify-center py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              Điểm danh
            </a>
          </div>
        </div>
      </div>

      <!-- Modal Đơn Xin Đổi Lịch -->
      <div v-if="showRescheduleForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative animate-modal-in">
          <button @click="showRescheduleForm = false" class="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors text-xl">✕</button>
          <div class="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 text-yellow-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-1">Đơn xin chuyển lịch</h3>
          <p class="text-xs text-yellow-600 font-black uppercase tracking-widest mb-4">Lớp: {{ selectedItem?.classCode }}</p>
          
          <form @submit.prevent="submitRescheduleRequest" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Chuyển sang ngày:</label>
              <input type="date" v-model="rescheduleFormData.newDate" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 outline-none">
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Ca mới:</label>
              <select v-model="rescheduleFormData.newSessionIndex" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 outline-none appearance-none">
                <option value="" disabled>-- Chọn ca --</option>
                <option v-for="(shift, idx) in timeSlots" :key="idx" :value="idx">
                  {{ shift.label }} ({{ shift.startTime }} - {{ shift.endTime }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Lý do:</label>
              <textarea v-model="rescheduleFormData.reason" required rows="2" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 outline-none resize-none" placeholder="Lý do bận..."></textarea>
            </div>

            <div class="flex space-x-3 pt-4">
              <button type="button" @click="showRescheduleForm = false" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all">Hủy</button>
              <button type="submit" class="flex-1 py-3 bg-yellow-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-yellow-200 hover:bg-yellow-600 transition-all">Gửi đơn</button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { N1 as api } from '../../data/api'
const currentUser = ref(null)
const loading = ref(false)
const myFullSchedule = ref([])
const allClasses = ref([])
const allCourses = ref([])
const showDetail = ref(false)
const showRescheduleForm = ref(false)
const selectedItem = ref(null)
const rescheduleRequests = ref([])
const rescheduleFormData = ref({ newDate: '', newSessionIndex: '', reason: '' })
const viewMode = ref('week') // 'week' | 'month'

// ======== TUẦN & NGÀY ========
const currentWeekOffset = ref(0)

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
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
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
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

const weekDays = [
  { num: 2, label: 'Thứ 2' }, { num: 3, label: 'Thứ 3' }, { num: 4, label: 'Thứ 4' },
  { num: 5, label: 'Thứ 5' }, { num: 6, label: 'Thứ 6' }, { num: 7, label: 'Thứ 7' },
]

// Ngày cụ thể của từng thứ trong tuần đang xem
const getDateForDow = (dayNum) => {
  const d = new Date(currentMonday.value)
  d.setDate(d.getDate() + (dayNum - 2)) // dayNum=2 => Mon(+0), 3=>Tue(+1), ..., 7=>Sat(+5)
  return d
}

const getDateLabel = (dayNum) => formatDate(getDateForDow(dayNum))

// Kiểm tra hôm nay (dow)
const isTodayDow = (dayNum) => {
  const jsDay = new Date().getDay()
  const todayDow = jsDay === 0 ? 8 : jsDay + 1
  return currentWeekOffset.value === 0 && dayNum === todayDow
}

const timeSlots = [
  { label: 'Ca 1', startTime: '07:30', endTime: '09:00' },
  { label: 'Ca 2', startTime: '09:30', endTime: '11:00' },
  { label: 'Ca 3', startTime: '14:00', endTime: '15:30' },
  { label: 'Ca 4', startTime: '17:30', endTime: '19:00' },
]

// ======== THÁNG ========
const currentMonthOffset = ref(0)

const currentMonthStart = computed(() => {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset.value, 1)
  return d
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

// ======== DATA ========
const classInfoMap = computed(() => {
  const map = {}
  allClasses.value.forEach(c => { map[c.classCode] = c })
  return map
})

// ========================
// CORE LOGIC: Kiểm tra lớp có hiển thị trong 1 ngày cụ thể không
// Điều kiện: startDate <= targetDate <= (endDate nếu có, không có thì không giới hạn)
// Và dayOfWeek của schedule phải khớp với dayOfWeek của targetDate
// ========================
const isClassActiveOnDate = (classCode, targetDate) => {
  const cls = classInfoMap.value[classCode]
  if (!cls) return true
  if (!cls.startDate) return true

  const clsStart = new Date(cls.startDate); clsStart.setHours(0, 0, 0, 0)
  const target = new Date(targetDate); target.setHours(0, 0, 0, 0)

  // startDate phải <= targetDate
  if (clsStart > target) return false

  // Tính toán endDate linh động
  let dynamicEndDate = cls.endDate ? new Date(cls.endDate) : null;
  if (allCourses.value) {
    const course = allCourses.value.find(c => c.id === cls.courseId)
    if (course) {
      const numSessions = course.sessions || course.totalLessons;
      if (numSessions) {
        const d = new Date(cls.startDate)
        d.setDate(d.getDate() + (numSessions - 1) * 7)
        dynamicEndDate = d
      }
    }
  }

  if (dynamicEndDate) {
    dynamicEndDate.setHours(23, 59, 59, 999)
    if (dynamicEndDate < target) return false
  }

  return true
}

// Tính schedule cho 1 ô trong bảng tuần: dayNum + slot
const getWeekCellSchedules = (dayNum, slot) => {
  const targetDate = getDateForDow(dayNum)
  const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth()+1).padStart(2,'0')}-${String(targetDate.getDate()).padStart(2,'0')}`

  const slotStart = timeToMinutes(slot.startTime)
  const slotEnd = timeToMinutes(slot.endTime)
  const items = []

  myFullSchedule.value.forEach(s => {
    // Nếu có đơn đã duyệt chuyển lịch này ĐI chỗ khác -> ẩn lịch gốc
    const movedAway = rescheduleRequests.value.find(r => 
      r.status === 'APPROVED' && r.classId === s.classId && 
      r.originalDate === targetDateStr && r.originalStartTime === s.startTime
    )
    if (movedAway) return

    if (Number(s.dayOfWeek) === dayNum && isClassActiveOnDate(s.classCode, targetDateStr)) {
      const sStart = timeToMinutes(s.startTime)
      if (normalizeTime(s.startTime) === slot.startTime || (sStart >= slotStart && sStart < slotEnd)) {
        // Kiểm tra xem có đang chờ duyệt đổi lịch không
        const pending = rescheduleRequests.value.find(r => 
          r.status === 'PENDING' && r.classId === s.classId && 
          r.originalDate === targetDateStr && r.originalStartTime === s.startTime
        )
        items.push({ ...s, isPendingReschedule: !!pending })
      }
    }
  })

  // Nếu có đơn đã duyệt chuyển lịch ĐẾN chỗ này -> hiển thị lịch bù
  rescheduleRequests.value.forEach(r => {
    if (r.status === 'APPROVED' && r.newDate === targetDateStr) {
      const rStart = timeToMinutes(r.newStartTime)
      if (normalizeTime(r.newStartTime) === slot.startTime || (rStart >= slotStart && rStart < slotEnd)) {
        const s = myFullSchedule.value.find(x => x.classId === r.classId) || {}
        items.push({
          ...s,
          isRescheduled: true,
          startTime: r.newStartTime,
          endTime: r.newEndTime,
          session: r.newSession
        })
      }
    }
  })

  return items
}

// Tính lịch cho tháng
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

    const daySchedules = []
    
    // Lịch gốc
    myFullSchedule.value.forEach(s => {
      const movedAway = rescheduleRequests.value.find(r => 
        r.status === 'APPROVED' && r.classId === s.classId && 
        r.originalDate === dateStr && r.originalStartTime === s.startTime
      )
      if (movedAway) return

      if (Number(s.dayOfWeek) === dow && isClassActiveOnDate(s.classCode, dateStr)) {
        daySchedules.push({ ...s })
      }
    })

    // Lịch bù
    rescheduleRequests.value.forEach(r => {
      if (r.status === 'APPROVED' && r.newDate === dateStr) {
        const s = myFullSchedule.value.find(x => x.classId === r.classId) || {}
        daySchedules.push({
          ...s,
          isRescheduled: true,
          startTime: r.newStartTime,
          endTime: r.newEndTime,
          session: r.newSession
        })
      }
    })

    if (daySchedules.length === 0) continue // Bỏ qua ngày không có lịch

    const morning = daySchedules.filter(s => {
      const h = parseInt(s.startTime?.split(':')[0] || '0')
      return h >= 5 && h < 12
    })
    const afternoon = daySchedules.filter(s => {
      const h = parseInt(s.startTime?.split(':')[0] || '0')
      return h >= 12 && h < 17
    })
    const evening = daySchedules.filter(s => {
      const h = parseInt(s.startTime?.split(':')[0] || '0')
      return h >= 17
    })

    days.push({
      dateStr,
      dayNum: d,
      dowLabel: dowNames[jsDay],
      fullDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      isToday: dateStr === today,
      total: daySchedules.length,
      morning, afternoon, evening
    })
  }
  return days
})

onMounted(() => {
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
  } else {
    currentUser.value = { id: 'T1', name: 'Nguyễn Thị Lan' } // dummy fallback
  }
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const [resClasses, resCourses, resSch, resReq] = await Promise.all([
      api.getClasses(),
      api.getCourses(),
      api.getSchedules(),
      api.getRescheduleRequests()
    ])
    allClasses.value = resClasses.data
    allCourses.value = resCourses.data
    rescheduleRequests.value = resReq.data || []
    
    const approvedTeacherClasses = resClasses.data.filter(c => {
      const isMyClass = c.teacherId === currentUser.value.id || c.teacherId === currentUser.value.name
      const isApproved = (c.status === 'OPENED' || c.status === 'Đã công bố')
      return isMyClass && isApproved
    })

    let teacherClassesCodes = approvedTeacherClasses.map(c => c.classCode)
    let teacherClassIds = approvedTeacherClasses.map(c => c.id)

    // FALLBACK CHỐNG CHẾT GIAO DIỆN: Nếu lịch trống (do lệch data thật/mock), gán đại vài lớp từ resSch
    if (teacherClassesCodes.length === 0 && teacherClassIds.length === 0 && resSch.data.length > 0) {
      teacherClassesCodes = [...new Set(resSch.data.map(s => s.classCode).filter(Boolean))].slice(0, 3)
      teacherClassIds = [...new Set(resSch.data.map(s => s.classId).filter(Boolean))].slice(0, 3)
    }
    
    // Xây dựng myFullSchedule trực tiếp từ raw schedules
    const localSchedules = resSch.data.filter(s => 
      teacherClassesCodes.includes(s.classCode) || teacherClassIds.includes(s.classId)
    ).map(s => {
      const cls = resClasses.data.find(c => c.id === s.classId)
      const course = cls ? resCourses.data.find(c => c.id === cls.courseId) : null
      return {
        id: s.id,
        classId: s.classId,
        courseName: course ? (course.title || course.name) : (s.courseName || 'Không rõ'),
        classCode: cls ? cls.classCode : (s.classCode || 'N/A'),
        room: cls ? cls.roomId : (s.room || null),
        dayOfWeek: s.dayOfWeek,
        session: s.sessionOfDay || s.session,
        startTime: s.startTime,
        endTime: s.endTime
      }
    })

    myFullSchedule.value = localSchedules.filter(item => teacherClassesCodes.includes(item.classCode))
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu lịch dạy:', err)
  } finally {
    loading.value = false
  }
}

// ======== HELPERS ========
const normalizeTime = (t) => {
  if (!t) return ''
  const parts = t.split(':')
  return `${parts[0].padStart(2, '0')}:${(parts[1] || '00').padStart(2, '0')}`
}

const timeToMinutes = (t) => {
  const [h, m] = normalizeTime(t).split(':').map(Number)
  return h * 60 + m
}

const sessionLabel = (s) => ({ MORNING: 'Sáng', AFTERNOON: 'Chiều', EVENING: 'Tối' }[s] || s || '—')

const courseColorMap = {}
const colorPalette = ['card-blue', 'card-green', 'card-yellow', 'card-cyan', 'card-pink', 'card-purple', 'card-orange']
let colorIndex = 0

const getCardColorClass = (courseName) => {
  if (!courseName) return 'card-blue'
  if (!courseColorMap[courseName]) {
    courseColorMap[courseName] = colorPalette[colorIndex % colorPalette.length]
    colorIndex++
  }
  return courseColorMap[courseName]
}

const shortenCourseName = (name) => {
  if (!name) return ''
  if (name.length > 16) return name.split(' ').slice(0, 2).join(' ').substring(0, 14)
  return name
}

const legendItems = computed(() => {
  const seen = new Set()
  const items = []
  myFullSchedule.value.forEach(s => {
    if (!seen.has(s.courseName)) {
      seen.add(s.courseName)
      items.push({ name: s.courseName, colorClass: 'legend-' + getCardColorClass(s.courseName) })
    }
  })
  return items
})

const openDetail = (sch, dateOrStr) => {
  let schDateStr = '';
  if (typeof dateOrStr === 'string') {
    schDateStr = dateOrStr;
  } else if (dateOrStr instanceof Date) {
    schDateStr = `${dateOrStr.getFullYear()}-${String(dateOrStr.getMonth()+1).padStart(2,'0')}-${String(dateOrStr.getDate()).padStart(2,'0')}`;
  } else {
    // fallback
    const targetDate = getDateForDow(Number(sch.dayOfWeek));
    schDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth()+1).padStart(2,'0')}-${String(targetDate.getDate()).padStart(2,'0')}`;
  }

  selectedItem.value = { ...sch, originalDate: schDateStr }
  showDetail.value = true
}

const openRescheduleForm = (sch) => {
  showDetail.value = false;
  rescheduleFormData.value = {
    newDate: '',
    newSessionIndex: '',
    reason: ''
  };
  showRescheduleForm.value = true;
}

const submitRescheduleRequest = async () => {
  if (!selectedItem.value || rescheduleFormData.value.newSessionIndex === '') return;
  const shift = timeSlots[rescheduleFormData.value.newSessionIndex];
  
  const payload = {
    classId: selectedItem.value.classId,
    classCode: selectedItem.value.classCode,
    courseName: selectedItem.value.courseName,
    originalDate: selectedItem.value.originalDate,
    originalStartTime: selectedItem.value.startTime,
    originalEndTime: selectedItem.value.endTime,
    newDate: rescheduleFormData.value.newDate,
    newStartTime: shift.startTime + ":00",
    newEndTime: shift.endTime + ":00",
    newSession: shift.label,
    reason: rescheduleFormData.value.reason,
    teacherId: currentUser.value?.id,
    teacherName: currentUser.value?.name
  };

  try {
    await api.createRescheduleRequest(payload);
    showRescheduleForm.value = false;
    alert('Đã gửi đơn xin chuyển lịch thành công. Đang chờ duyệt!');
    fetchData(); // Reload
  } catch (err) {
    alert('Có lỗi xảy ra: ' + err.message);
  }
}
</script>

<style scoped>
/* ============ TITLE ============ */
.schedule-title { font-size: 1.2rem; font-weight: 600; color: #1a1a2e; letter-spacing: -0.01em; }
.schedule-title-italic { font-style: italic; font-weight: 700; }

/* ============ WEEK NAV ============ */
.week-nav-btn {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b;
  cursor: pointer; transition: all 0.2s ease; font-size: 0.75rem;
}
.week-nav-btn:hover { background: #f1f5f9; border-color: #cbd5e1; color: #334155; }

/* ============ TABLE TUẦN ============ */
.schedule-table-wrapper {
  background: #fff; border-radius: 20px; border: 1px solid #f1f0f0;
  overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
}
.schedule-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.schedule-th {
  padding: 14px 8px; text-align: center; font-size: 0.8rem; font-weight: 700;
  color: #6b7280; background: #fafafa; border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f5f5f5; letter-spacing: 0.02em; transition: background 0.2s;
}
.schedule-th:last-child { border-right: none; }
.schedule-th-ca { width: 90px; color: #9ca3af; font-size: 0.75rem; font-weight: 600; }
.today-col { background: #eef2ff !important; }
.th-date { font-size: 0.7rem; font-weight: 500; color: #9ca3af; margin-top: 2px; }
.today-date { color: #4f46e5; font-weight: 700; }
.today-badge {
  font-size: 0.6rem; font-weight: 800; color: #4f46e5; background: #e0e7ff;
  border-radius: 6px; padding: 1px 6px; display: inline-block; margin-top: 3px;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.schedule-row { border-bottom: 1px solid #f5f5f5; }
.schedule-row:last-child { border-bottom: none; }
.schedule-td-time {
  padding: 18px 12px; text-align: center; vertical-align: middle;
  border-right: 1px solid #f0f0f0; background: #fefefe;
}
.time-label-slot { font-size: 0.7rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
.time-label { font-size: 0.82rem; font-weight: 600; color: #6b7280; line-height: 1.6; }
.schedule-td-cell {
  padding: 10px 7px; vertical-align: middle; text-align: center;
  border-right: 1px solid #f5f5f5; min-height: 90px; height: 100px; transition: background 0.2s;
}
.schedule-td-cell:last-child { border-right: none; }
.today-cell { background: #f5f3ff; }

/* ============ CARDS ============ */
.schedule-card {
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 12px 8px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease;
  width: 100%; min-height: 64px;
}
.schedule-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.card-course-name { font-size: 0.78rem; font-weight: 700; line-height: 1.3; margin-bottom: 4px; }
.card-room { font-size: 0.72rem; font-weight: 600; opacity: 0.75; }

.card-blue { background: #dbeafe; color: #1e40af; }
.card-green { background: #d1fae5; color: #065f46; }
.card-yellow { background: #fef9c3; color: #854d0e; }
.card-cyan { background: #cffafe; color: #155e75; }
.card-pink { background: #fce7f3; color: #9d174d; }
.card-purple { background: #e9d5ff; color: #6b21a8; }
.card-orange { background: #ffedd5; color: #9a3412; }

/* ============ LEGEND ============ */
.schedule-legend { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 18px; padding: 4px 8px; }
.legend-item { display: flex; align-items: center; gap: 8px; }
.legend-dot { width: 13px; height: 13px; border-radius: 4px; flex-shrink: 0; }
.legend-text { font-size: 0.82rem; font-weight: 500; color: #4b5563; }
.legend-card-blue { background: #dbeafe; }
.legend-card-green { background: #d1fae5; }
.legend-card-yellow { background: #fef9c3; }
.legend-card-cyan { background: #cffafe; }
.legend-card-pink { background: #fce7f3; }
.legend-card-purple { background: #e9d5ff; }
.legend-card-orange { background: #ffedd5; }

/* ============ THÁNG VIEW ============ */
.month-day-card {
  background: #fff; border-radius: 20px; border: 1px solid #f0f0f0;
  overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  transition: all 0.2s ease;
}
.month-day-card:hover { border-color: #e0e7ff; box-shadow: 0 4px 16px rgba(79,70,229,0.06); }
.today-day-card { border-color: #c7d2fe; background: linear-gradient(to bottom right, #fff, #f5f3ff); }

.month-day-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #f5f5f5; background: #fafafa;
}
.today-day-header { background: linear-gradient(to right, #eef2ff, #f5f3ff); }

.month-day-num {
  width: 40px; height: 40px; border-radius: 12px; background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 800; color: #374151;
}
.today-day-num { background: #4f46e5; color: #fff; box-shadow: 0 4px 12px rgba(79,70,229,0.3); }

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

/* Modal Animation */
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-modal-in { animation: modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
