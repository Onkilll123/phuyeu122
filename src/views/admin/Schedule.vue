<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Thời khóa biểu & Lịch học</h1>
        <p class="text-sm text-gray-500 mt-1">Quản lý toàn bộ lịch học của hệ thống</p>
      </div>

      <div class="flex items-center space-x-2 w-full md:w-auto">
        <!-- Tìm kiếm -->
        <div class="relative flex-1 md:w-56">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input v-model="searchQuery" type="text" placeholder="Tìm tên môn, mã lớp..."
                 class="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 transition-all">
        </div>

        <!-- Toggle View Mode -->
        <div class="flex items-center bg-gray-100 rounded-xl p-1">
          <button @click="viewMode = 'week'" :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all', viewMode === 'week' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600']">
            📆 Tuần
          </button>
          <button @click="viewMode = 'month'" :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all', viewMode === 'month' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600']">
            📅 Tháng
          </button>
        </div>

        <button @click="fetchData" class="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors" title="Làm mới dữ liệu">
          <svg :class="['w-4 h-4', loading ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>

        <button @click="showRequestsModal = true" class="relative p-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors" title="Đơn xin đổi lịch">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span v-if="pendingRequestsCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ pendingRequestsCount }}</span>
        </button>

        <button @click="openModal()" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all whitespace-nowrap">
          + Thiết lập lịch
        </button>
      </div>
    </div>

    <!-- NỘI DUNG LỊCH -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div v-if="loading" class="text-center py-10 text-gray-400 font-medium italic">Đang đồng bộ dữ liệu...</div>
      
      <!-- TUẦN -->
      <template v-else-if="viewMode === 'week'">
        <!-- Điều hướng -->
        <div class="flex items-center justify-between mb-5">
          <h2 class="schedule-title">
            <span class="schedule-title-italic">Lịch Tuần</span> — Tuần {{ currentWeekNumber }} ({{ weekRangeLabel }})
          </h2>
          <div class="flex items-center space-x-2">
            <button @click="prevWeek" class="week-nav-btn"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg></button>
            <button @click="currentWeekOffset = 0" class="week-nav-btn px-4 text-xs font-bold text-gray-600 w-auto">Tuần này</button>
            <button @click="nextWeek" class="week-nav-btn"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button>
          </div>
        </div>

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
                    :class="['schedule-card mb-2', getCardColorClass(sch.courseName)]"
                    @click="viewDetail(sch, getDateForDow(day.num))"
                  >
                    <div class="card-course-name text-center">{{ shortenCourseName(sch.courseName) }}</div>
                    <div class="text-[10px] opacity-90 text-center">{{ sch.classCode }}</div>
                    <div class="card-room">P.{{ getRoomName(sch.room) }}</div>
                    <div v-if="sch.isPendingReschedule" class="text-[8px] mt-1 bg-white/50 text-yellow-700 px-1 py-0.5 rounded font-bold uppercase text-center">Chờ đổi</div>
                    <div v-if="sch.isRescheduled" class="text-[8px] mt-1 bg-white/50 text-blue-700 px-1 py-0.5 rounded font-bold uppercase text-center">Bù/Đổi</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- THÁNG -->
      <template v-else>
        <!-- Tiêu đề + Điều hướng tháng -->
        <div class="flex items-center justify-between mb-5">
          <h2 class="schedule-title">
            <span class="schedule-title-italic">Lịch Tháng</span> — Tháng {{ currentMonthDisplay }} / {{ currentYearDisplay }}
          </h2>
          <div class="flex items-center space-x-2">
            <button @click="prevMonth" class="week-nav-btn"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg></button>
            <button @click="goToCurrentMonth" class="week-nav-btn px-4 text-xs font-bold text-gray-600 w-auto">Tháng này</button>
            <button @click="nextMonth" class="week-nav-btn"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button>
          </div>
        </div>

        <div class="space-y-4">
          <div v-if="monthScheduleDays.length === 0" class="text-center py-16 text-gray-400">
            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <p class="font-medium">Không có lịch học nào trong tháng này</p>
          </div>

          <div v-for="day in monthScheduleDays" :key="day.dateStr" class="month-day-card" :class="{ 'today-day-card': day.isToday }">
            <div class="month-day-header" :class="{ 'today-day-header': day.isToday }">
              <div class="flex items-center space-x-3">
                <div :class="['month-day-num', day.isToday ? 'today-day-num' : '']">{{ day.dayNum }}</div>
                <div>
                  <div class="text-sm font-bold" :class="day.isToday ? 'text-blue-700' : 'text-gray-700'">{{ day.dowLabel }}</div>
                  <div class="text-xs text-gray-400">{{ day.fullDate }}</div>
                </div>
              </div>
              <span v-if="day.isToday" class="text-[10px] font-black bg-blue-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">Hôm nay</span>
              <span class="text-[10px] font-bold text-gray-400">{{ day.total }} buổi học</span>
            </div>

            <div class="month-day-body">
              <!-- Sáng -->
              <div v-if="day.morning.length > 0" class="session-section">
                <div class="session-label session-morning">🌅 Sáng</div>
                <div class="session-items">
                  <div v-for="sch in day.morning" :key="sch.id || sch.classCode" :class="['month-card', getCardColorClass(sch.courseName)]" @click="viewDetail(sch, day.dateStr)">
                    <div class="month-card-time">{{ normalizeTime(sch.startTime) }} – {{ normalizeTime(sch.endTime) }}</div>
                    <div class="month-card-name">{{ sch.courseName }}</div>
                    <div class="month-card-sub">{{ sch.classCode }} · P.{{ getRoomName(sch.room) }}</div>
                  </div>
                </div>
              </div>

              <!-- Chiều -->
              <div v-if="day.afternoon.length > 0" class="session-section">
                <div class="session-label session-afternoon">☀️ Chiều</div>
                <div class="session-items">
                  <div v-for="sch in day.afternoon" :key="sch.id || sch.classCode" :class="['month-card', getCardColorClass(sch.courseName)]" @click="viewDetail(sch, day.dateStr)">
                    <div class="month-card-time">{{ normalizeTime(sch.startTime) }} – {{ normalizeTime(sch.endTime) }}</div>
                    <div class="month-card-name">{{ sch.courseName }}</div>
                    <div class="month-card-sub">{{ sch.classCode }} · P.{{ getRoomName(sch.room) }}</div>
                  </div>
                </div>
              </div>

              <!-- Tối -->
              <div v-if="day.evening.length > 0" class="session-section">
                <div class="session-label session-evening">🌙 Tối</div>
                <div class="session-items">
                  <div v-for="sch in day.evening" :key="sch.id || sch.classCode" :class="['month-card', getCardColorClass(sch.courseName)]" @click="viewDetail(sch, day.dateStr)">
                    <div class="month-card-time">{{ normalizeTime(sch.startTime) }} – {{ normalizeTime(sch.endTime) }}</div>
                    <div class="month-card-name">{{ sch.courseName }}</div>
                    <div class="month-card-sub">{{ sch.classCode }} · P.{{ getRoomName(sch.room) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Legend Tuần -->
      <div v-if="filteredTimetable.length > 0" class="schedule-legend mt-6">
        <div v-for="item in legendItems" :key="item.name" class="legend-item">
          <span :class="['legend-dot', item.colorClass]"></span>
          <span class="legend-text">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Chi Tiết Lịch -->
    <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative animate-modal-in">
        <button @click="showDetail = false" class="absolute top-6 right-6 text-gray-300 hover:text-gray-500">✕</button>
        <div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-1">{{ selectedItem?.courseName }}</h3>
        <p class="text-xs text-blue-500 font-black uppercase tracking-widest mb-6">Chi tiết lịch học</p>
        
        <div class="space-y-3">
          <div v-for="(val, label) in { 
            'Mã lớp': selectedItem?.classCode, 
            'Giảng viên': getTeacherName(getClassDetail(selectedItem?.classCode)?.teacherId),
            'Sĩ số': (getClassDetail(selectedItem?.classCode)?.maxStudents || 0) + ' học viên',
            'Giờ học': normalizeTime(selectedItem?.startTime) + ' - ' + normalizeTime(selectedItem?.endTime), 
            'Phòng': getRoomName(selectedItem?.room), 
            'Lịch': 'Thứ ' + selectedItem?.dayOfWeek + ' (' + sessionLabel(selectedItem?.session) + ')' 
          }" :key="label" class="flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{{ label }}</span>
            <span class="text-sm font-bold text-gray-700">{{ val }}</span>
          </div>
        </div>

        <div class="flex space-x-3 mt-6">
          <button @click="deleteScheduleAndClose(selectedItem?.id)" class="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all active:scale-95">Xóa</button>
          <button @click="editScheduleAndClose(selectedItem)" class="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Sửa lịch</button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Add/Edit) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-modal-in">
        <button @click="showModal = false" class="absolute top-6 right-6 text-gray-300 hover:text-gray-500">✕</button>
        <div class="px-8 py-6 border-b border-gray-50 bg-gray-50/50">
          <h2 class="text-xl font-bold text-gray-800">{{ isEditing ? 'Cập nhật lịch học' : 'Thiết lập lịch học' }}</h2>
        </div>

        <div v-if="conflictError" class="mx-8 mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold animate-shake">
          ⚠️ {{ conflictError }}
        </div>

        <form @submit.prevent="saveSchedule" class="p-8 space-y-5">
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-2 ml-1">Lớp học</label>
            <select v-model="formData.classId" :disabled="isEditing" required class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50 appearance-none cursor-pointer">
              <option disabled value="">-- Chọn lớp học --</option>
              <option v-for="c in activeClasses" :key="c.id" :value="c.id">
                {{ c.classCode }} (ID: {{ c.id.slice(0,8) }}...)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-2 ml-1">Ngày học bắt đầu</label>
            <input type="date" v-model="formData.scheduleDate" required class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <div v-if="formData.scheduleDate && computedDayLabel" class="mt-2 px-4 py-2 bg-blue-50/50 rounded-xl text-xs font-bold text-blue-700 flex items-center">
              <span class="mr-1.5">📅</span> {{ computedDayLabel }}
            </div>
          </div>

          <!-- Chọn Ca học -->
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-2 ml-1">Ca học</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" v-for="shift in timeSlots" :key="shift.id"
                @click="selectShift(shift)"
                :class="[
                  'py-2.5 px-3 border rounded-xl text-left transition-all relative overflow-hidden',
                  formData.startTime && formData.startTime.startsWith(shift.startTime)
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <span :class="['font-bold text-sm', formData.startTime && formData.startTime.startsWith(shift.startTime) ? 'text-blue-700' : 'text-gray-700']">{{ shift.label }}</span>
                  <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide', sessionColorClass(shift.session)]">{{ shift.sessionLabel }}</span>
                </div>
                <div class="text-[11px] text-gray-500 font-medium flex items-center space-x-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>{{ shift.startTime }} - {{ shift.endTime }}</span>
                </div>
                <!-- Checkmark -->
                <div v-if="formData.startTime && formData.startTime.startsWith(shift.startTime)" class="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-blue-500 border-l-transparent">
                  <svg class="absolute -top-[22px] -left-[10px] w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </button>
            </div>
            <input type="hidden" v-model="formData.sessionOfDay" required>
            <input type="hidden" v-model="formData.startTime" required>
            <input type="hidden" v-model="formData.endTime" required>
          </div>

          <div class="flex space-x-3 pt-6 border-t border-gray-100">
            <button type="button" @click="showModal = false" class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Hủy</button>
            <button type="submit" class="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Lưu lịch</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Xem Yêu Cầu Chuyển Lịch -->
    <div v-if="showRequestsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-modal-in flex flex-col max-h-[80vh]">
        <button @click="showRequestsModal = false" class="absolute top-6 right-6 text-gray-300 hover:text-gray-500">✕</button>
        <div class="px-8 py-6 border-b border-gray-50 bg-gray-50/50 shrink-0">
          <h2 class="text-xl font-bold text-gray-800">Danh sách đơn xin đổi lịch</h2>
        </div>
        <div class="p-8 overflow-y-auto flex-1 bg-gray-50/30">
          <div v-if="rescheduleRequests.length === 0" class="text-center text-gray-400 py-8">
            Chưa có đơn xin đổi lịch nào
          </div>
          <div v-else class="space-y-4">
            <div v-for="req in rescheduleRequests.slice().reverse()" :key="req.id" class="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="font-bold text-gray-800">{{ req.courseName }} ({{ req.classCode }})</h4>
                  <p class="text-xs text-gray-500">Giảng viên: <span class="font-bold text-gray-700">{{ req.teacherName }}</span></p>
                </div>
                <span :class="{'bg-yellow-100 text-yellow-700': req.status === 'PENDING', 'bg-green-100 text-green-700': req.status === 'APPROVED', 'bg-red-100 text-red-700': req.status === 'REJECTED'}" class="text-[10px] px-2 py-1 font-bold rounded uppercase">
                  {{ req.status === 'PENDING' ? 'Chờ duyệt' : (req.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối') }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3 text-sm">
                <div>
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Lịch cũ</p>
                  <p class="font-medium text-gray-700">{{ req.originalDate }}</p>
                  <p class="text-xs text-gray-500">{{ req.originalStartTime }} - {{ req.originalEndTime }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-blue-400 font-bold uppercase mb-1">Lịch mới xin chuyển</p>
                  <p class="font-medium text-blue-700">{{ req.newDate }}</p>
                  <p class="text-xs text-blue-600">{{ req.newStartTime }} - {{ req.newEndTime }} ({{ req.newSession }})</p>
                </div>
              </div>
              <p class="text-xs text-gray-600 mb-4 bg-gray-50/50 px-3 py-2 border border-gray-100 rounded-lg"><span class="font-bold">Lý do:</span> {{ req.reason }}</p>
              <div v-if="req.status === 'PENDING'" class="flex space-x-2">
                <button @click="handleRequest(req.id, 'APPROVED')" class="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors">Duyệt đổi lịch</button>
                <button @click="handleRequest(req.id, 'REJECTED')" class="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">Từ chối</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../../services/api'
import { useNotification } from '../composables/useNotification'

const { addNotification } = useNotification()

const timetable = ref([])
const allSchedules = ref([])
const allClasses = ref([])
const allRooms = ref([])
const allCourses = ref([])
const rescheduleRequests = ref([])
const searchQuery = ref('')
const loading = ref(false)
const showModal = ref(false)
const showDetail = ref(false)
const showRequestsModal = ref(false)
const isEditing = ref(false)
const selectedItem = ref(null)
const conflictError = ref(null)
const viewMode = ref('week')

const pendingRequestsCount = computed(() => rescheduleRequests.value.filter(r => r.status === 'PENDING').length)

const teachers = ref([
  { id: 'T1', name: 'Nguyễn Thị Lan' },
  { id: 'T2', name: 'Trần Văn Khang' },
  { id: 'admin', name: 'Chưa phân công (Admin)' }
])

// Mảng Ca Học thay vì chọn giờ tay
const timeSlots = [
  { id: 1, label: 'Ca 1', startTime: '07:30', endTime: '09:00', session: 'MORNING', sessionLabel: 'Sáng' },
  { id: 2, label: 'Ca 2', startTime: '09:30', endTime: '11:00', session: 'MORNING', sessionLabel: 'Sáng' },
  { id: 3, label: 'Ca 3', startTime: '14:00', endTime: '15:30', session: 'AFTERNOON', sessionLabel: 'Chiều' },
  { id: 4, label: 'Ca 4', startTime: '17:30', endTime: '19:00', session: 'EVENING', sessionLabel: 'Tối' },
]

// FORM DATA
const formData = ref({ classId: '', scheduleDate: '', sessionOfDay: '', startTime: '', endTime: '' })

const selectShift = (shift) => {
  formData.value.startTime = shift.startTime + ':00'
  formData.value.endTime = shift.endTime + ':00'
  formData.value.sessionOfDay = shift.session
  conflictError.value = checkConflict()
}

// Helpers
const getRoomName = (roomId) => {
  if (!roomId && roomId !== 0) return 'Chưa xếp'
  const found = allRooms.value.find(r => r.roomId === roomId || r.roomId === Number(roomId))
  return found ? found.roomName : `Phòng ${roomId}`
}

const getClassDetail = (classCode) => {
  return activeClasses.value.find(c => c.classCode === classCode) || {}
}

const getTeacherName = (id) => {
  const t = teachers.value.find(x => x.id === id)
  return t ? t.name : id || 'Chưa phân công'
}

const sessionLabel = (s) => ({ MORNING: 'Sáng', AFTERNOON: 'Chiều', EVENING: 'Tối' }[s] || s || '—')

const sessionColorClass = (s) => {
  if (s === 'MORNING') return 'bg-amber-100 text-amber-700'
  if (s === 'AFTERNOON') return 'bg-blue-100 text-blue-700'
  if (s === 'EVENING') return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-500'
}

const dayNames = { 0: 'Chủ nhật', 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7' }

const dateToDayOfWeek = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const jsDay = d.getDay()
  return jsDay === 0 ? 8 : jsDay + 1
}

const computedDayLabel = computed(() => {
  if (!formData.value.scheduleDate) return ''
  const d = new Date(formData.value.scheduleDate + 'T00:00:00')
  const dayName = dayNames[d.getDay()]
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const dow = dateToDayOfWeek(formData.value.scheduleDate)
  return `${dayName} — Ngày ${dd}/${mm}/${yyyy} (Thứ ${dow})`
})

// ======== LOGIC LỊCH TUẦN ========
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

const getDateForDow = (dayNum) => {
  const d = new Date(currentMonday.value)
  d.setDate(d.getDate() + (dayNum - 2))
  return d
}
const getDateLabel = (dayNum) => formatDate(getDateForDow(dayNum))

const isTodayDow = (dayNum) => {
  const jsDay = new Date().getDay()
  const todayDow = jsDay === 0 ? 8 : jsDay + 1
  return currentWeekOffset.value === 0 && dayNum === todayDow
}

// ======== LOGIC LỊCH THÁNG ========
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

// ======== DATA FETCHING ========
const activeClasses = computed(() => allClasses.value)

const fetchData = async () => {
  loading.value = true
  try {
    const [resInfo, resClasses, resSch, resRooms, resCourses, resReq] = await Promise.all([
      api.getCourseInfo(),
      api.getClasses(),
      api.getSchedules(),
      api.getRooms(),
      api.getCourses(),
      api.getRescheduleRequests()
    ])
    
    rescheduleRequests.value = resReq.data || []

    // Xây dựng timetable trực tiếp từ schedules và classes để đảm bảo dữ liệu luôn mới nhất,
    // thay vì phụ thuộc vào course-info (có thể bị cache hoặc trễ)
    const localTimetable = resSch.data.map(s => {
      const cls = resClasses.data.find(c => c.id === s.classId)
      const course = cls ? resCourses.data.find(c => c.id === cls.courseId) : null
      return {
        id: s.id,
        classId: s.classId,
        courseName: course ? (course.title || course.name) : 'Không rõ',
        classCode: cls ? cls.classCode : 'N/A',
        room: cls ? cls.roomId : null,
        dayOfWeek: s.dayOfWeek,
        session: s.sessionOfDay,
        startTime: s.startTime,
        endTime: s.endTime
      }
    }).filter(s => s.classCode !== 'N/A')

    // Lọc trùng
    const seen = new Set()
    timetable.value = localTimetable.reduce((acc, item, idx) => {
      const key = `${item.classCode}_${item.dayOfWeek}_${item.startTime}`
      if (!seen.has(key)) {
        seen.add(key)
        acc.push({ ...item }) 
      }
      return acc
    }, [])
    
    allClasses.value = resClasses.data
    allSchedules.value = resSch.data
    allRooms.value = resRooms.data
    allCourses.value = resCourses.data
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

onMounted(() => {
  fetchData()
  window.addEventListener('db_changed', fetchData)
})
onUnmounted(() => {
  window.removeEventListener('db_changed', fetchData)
})

const filteredTimetable = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return timetable.value
  return timetable.value.filter(item => 
    (item.courseName || '').toLowerCase().includes(query) ||
    (item.classCode || '').toLowerCase().includes(query)
  )
})

// CORE LOGIC: Kiểm tra lớp active trong ngày
const classInfoMap = computed(() => {
  const map = {}
  allClasses.value.forEach(c => { map[c.classCode] = c })
  return map
})

const isClassActiveOnDate = (classCode, targetDate) => {
  const cls = classInfoMap.value[classCode]
  if (!cls || !cls.startDate) return true

  const clsStart = new Date(cls.startDate); clsStart.setHours(0, 0, 0, 0)
  const target = new Date(targetDate); target.setHours(0, 0, 0, 0)

  if (clsStart > target) return false

  // Tính toán endDate linh động dựa vào khóa học để nếu Admin đổi số buổi, lịch sẽ ăn theo ngay lập tức
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

const normalizeTime = (t) => {
  if (!t) return ''
  const parts = t.split(':')
  return `${parts[0].padStart(2, '0')}:${(parts[1] || '00').padStart(2, '0')}`
}

const timeToMinutes = (t) => {
  const [h, m] = normalizeTime(t).split(':').map(Number)
  return h * 60 + m
}

const getWeekCellSchedules = (dayNum, slot) => {
  const targetDate = getDateForDow(dayNum)
  const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth()+1).padStart(2,'0')}-${String(targetDate.getDate()).padStart(2,'0')}`

  const slotStart = timeToMinutes(slot.startTime)
  const slotEnd = timeToMinutes(slot.endTime)

  const items = []

  filteredTimetable.value.forEach(s => {
    // Nếu có đơn đã duyệt chuyển lịch này ĐI chỗ khác -> ẩn lịch gốc
    const movedAway = rescheduleRequests.value.find(r => 
      r.status === 'APPROVED' && r.classId === s.classId && 
      r.originalDate === targetDateStr && r.originalStartTime === s.startTime
    )
    if (movedAway) return

    if (Number(s.dayOfWeek) === dayNum && isClassActiveOnDate(s.classCode, targetDateStr)) {
      const sStart = timeToMinutes(s.startTime)
      if (normalizeTime(s.startTime) === slot.startTime || (sStart >= slotStart && sStart < slotEnd)) {
        // Kiểm tra xem có đang chờ duyệt không
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
        const s = filteredTimetable.value.find(x => x.classId === r.classId) || {}
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
    filteredTimetable.value.forEach(s => {
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
        const s = filteredTimetable.value.find(x => x.classId === r.classId) || {}
        daySchedules.push({
          ...s,
          isRescheduled: true,
          startTime: r.newStartTime,
          endTime: r.newEndTime,
          session: r.newSession
        })
      }
    })

    if (daySchedules.length === 0) continue

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
      dateStr, dayNum: d, dowLabel: dowNames[jsDay],
      fullDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      isToday: dateStr === today, total: daySchedules.length,
      morning, afternoon, evening
    })
  }
  return days
})

// ======== COLORS ========
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
  filteredTimetable.value.forEach(s => {
    if (!seen.has(s.courseName)) {
      seen.add(s.courseName)
      items.push({ name: s.courseName, colorClass: 'legend-' + getCardColorClass(s.courseName) })
    }
  })
  return items
})

// ======== MODALS ========
const viewDetail = (item, dateOrStr) => {
  let schDateStr = '';
  if (typeof dateOrStr === 'string') {
    schDateStr = dateOrStr;
  } else if (dateOrStr instanceof Date) {
    schDateStr = `${dateOrStr.getFullYear()}-${String(dateOrStr.getMonth()+1).padStart(2,'0')}-${String(dateOrStr.getDate()).padStart(2,'0')}`;
  } else {
    const targetDate = getDateForDow(Number(item.dayOfWeek));
    schDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth()+1).padStart(2,'0')}-${String(targetDate.getDate()).padStart(2,'0')}`;
  }

  selectedItem.value = { ...item, originalDate: schDateStr }
  showDetail.value = true
}

const handleRequest = async (id, status) => {
  try {
    await api.updateRescheduleRequestStatus(id, status);
    fetchData(); // reload
    addNotification('edit', 'Admin', `đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} yêu cầu đổi lịch`, '');
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

const openModal = (item = null) => {
  conflictError.value = null
  if (item) {
    isEditing.value = true
    const originalSch = allSchedules.value.find(s => 
      s.classId === allClasses.value.find(c => c.classCode === item.classCode)?.id &&
      s.dayOfWeek === item.dayOfWeek &&
      s.startTime.startsWith(item.startTime)
    )
    
    const cls = allClasses.value.find(c => c.classCode === item.classCode)
    const classStartDate = cls?.startDate ? cls.startDate.split('T')[0] : ''
    
    formData.value = {
      id: originalSch?.id || item.id,
      classId: cls?.id || '',
      scheduleDate: classStartDate,
      sessionOfDay: item.session || '',
      startTime: item.startTime.substring(0, 5),
      endTime: item.endTime.substring(0, 5)
    }
  } else {
    isEditing.value = false
    const today = new Date()
    const localDateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    formData.value = { classId: '', scheduleDate: localDateStr, sessionOfDay: '', startTime: '', endTime: '' }
  }
  showModal.value = true
}

const editScheduleAndClose = (item) => {
  showDetail.value = false
  openModal(item)
}

const deleteScheduleAndClose = async (idOrPseudoId) => {
  if (confirm('Bạn chắc chắn muốn xóa lịch học này khỏi hệ thống?')) {
    try {
      let realId = idOrPseudoId
      if (typeof idOrPseudoId === 'number' && idOrPseudoId < 1000) {
        const item = timetable.value[idOrPseudoId]
        const originalSch = allSchedules.value.find(s => 
          s.classId === allClasses.value.find(c => c.classCode === item?.classCode)?.id &&
          s.dayOfWeek === item?.dayOfWeek &&
          s.startTime.startsWith(item?.startTime)
        )
        realId = originalSch?.id
      }
      if (!realId) throw new Error('Không tìm thấy ID lịch để xóa')
      
      const curSch = allSchedules.value.find(s => s.id === realId)
      const curClass = allClasses.value.find(c => c.id === curSch?.classId)
      
      await api.deleteSchedule(realId)
      addNotification('delete', 'Admin', 'vừa gỡ bỏ và thu hồi ca học của', curClass ? curClass.classCode : 'Lớp học')
      
      showDetail.value = false
      fetchData()
      window.dispatchEvent(new Event('db_changed'))
    } catch (err) { alert('Lỗi xóa lịch: ' + err.message) }
  }
}

const checkConflict = () => {
  const newStart = formData.value.startTime
  const newEnd = formData.value.endTime
  const newDay = dateToDayOfWeek(formData.value.scheduleDate)
  const newClassId = formData.value.classId

  if (!newStart || !newEnd || !newDay || !newClassId) return null

  const curClass = allClasses.value.find(c => c.id === newClassId)
  if (!curClass) return null

  for (const sch of allSchedules.value) {
    if (isEditing.value && sch.id === formData.value.id) continue
    if (Number(sch.dayOfWeek) === Number(newDay)) {
      const s = sch.startTime.substring(0,5)
      const e = sch.endTime.substring(0,5)
      const isOverlapping = (newStart < e) && (newEnd > s)
      if (isOverlapping) {
        const otherClass = allClasses.value.find(c => c.id === sch.classId)
        if (!otherClass || otherClass.status !== 'OPENED') continue
        if (otherClass.roomName === curClass.roomName) {
          return `Phòng ${curClass.roomName} đã bận bởi lớp ${otherClass.classCode}!`
        }
        if (otherClass.teacherId === curClass.teacherId) {
          return `Giảng viên ${curClass.teacherId} đã bận dạy lớp ${otherClass.classCode}!`
        }
      }
    }
  }
  return null
}

const saveSchedule = async () => {
  conflictError.value = checkConflict()
  if (conflictError.value) return
  if (!formData.value.startTime || !formData.value.endTime) {
    conflictError.value = 'Vui lòng chọn Ca học!'
    return
  }
  
  try {
    const computedDay = dateToDayOfWeek(formData.value.scheduleDate)
    if (!computedDay) {
      conflictError.value = 'Vui lòng chọn ngày học hợp lệ!'
      return
    }

    const payload = {
      classId: formData.value.classId,
      dayOfWeek: computedDay,
      sessionOfDay: formData.value.sessionOfDay,
      startTime: formData.value.startTime.length === 5 ? formData.value.startTime + ":00" : formData.value.startTime,
      endTime: formData.value.endTime.length === 5 ? formData.value.endTime + ":00" : formData.value.endTime
    }

    if (isEditing.value) {
      payload.id = formData.value.id
      await api.updateSchedule(formData.value.id, payload)
    } else {
      await api.createSchedule(payload)
    }

    // Cập nhật startDate và endDate
    const curClass = allClasses.value.find(c => c.id === payload.classId)
    if (curClass && formData.value.scheduleDate) {
      try {
        let endDate = null
        const course = allCourses.value.find(c => c.id === curClass.courseId)
        const numSessions = course ? (course.sessions || course.totalLessons) : null
        if (numSessions) {
          const d = new Date(formData.value.scheduleDate)
          d.setDate(d.getDate() + (numSessions - 1) * 7)
          const dd = String(d.getDate()).padStart(2, '0')
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const yyyy = d.getFullYear()
          endDate = `${yyyy}-${mm}-${dd}`
        }
        await api.updateClass(curClass.id, { 
          ...curClass, 
          startDate: formData.value.scheduleDate, 
          endDate,
          startTime: payload.startTime,
          endTime: payload.endTime,
          sessionOfDay: payload.sessionOfDay
        })
      } catch (e) { console.warn('Không thể cập nhật thông tin đồng bộ cho Lớp:', e) }
    }

    const classTxt = curClass ? curClass.classCode : 'Lớp học'
    addNotification(
      isEditing.value ? 'edit' : 'add',
      'Admin',
      isEditing.value ? 'vừa chỉnh sửa ca học / xếp lịch của' : 'vừa cấu hình thiết lập lịch học mới cho',
      classTxt
    )

    showModal.value = false
    fetchData()
    window.dispatchEvent(new Event('db_changed'))
  } catch (err) { alert('Lỗi: ' + (err.response?.data || err.message)) }
}
</script>

<style scoped>
/* ============ TITLE ============ */
.schedule-title { font-size: 1.2rem; font-weight: 600; color: #1a1a2e; letter-spacing: -0.01em; }
.schedule-title-italic { font-style: italic; font-weight: 700; color: #1d4ed8; }

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
  border-right: 1px solid #f5f5f5; transition: background 0.2s;
}
.schedule-th:last-child { border-right: none; }
.schedule-th-ca { width: 90px; color: #9ca3af; font-size: 0.75rem; font-weight: 600; }
.today-col { background: #eff6ff !important; }
.th-date { font-size: 0.7rem; font-weight: 500; color: #9ca3af; margin-top: 2px; }
.today-date { color: #2563eb; font-weight: 700; }
.today-badge {
  font-size: 0.6rem; font-weight: 800; color: #2563eb; background: #dbeafe;
  border-radius: 6px; padding: 1px 6px; display: inline-block; margin-top: 3px; text-transform: uppercase;
}
.schedule-row { border-bottom: 1px solid #f5f5f5; }
.schedule-row:last-child { border-bottom: none; }
.schedule-td-time {
  padding: 18px 12px; text-align: center; vertical-align: middle;
  border-right: 1px solid #f0f0f0; background: #fefefe;
}
.time-label-slot { font-size: 0.7rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px; }
.time-label { font-size: 0.82rem; font-weight: 600; color: #6b7280; line-height: 1.6; }
.schedule-td-cell {
  padding: 10px 7px; vertical-align: middle; text-align: center;
  border-right: 1px solid #f5f5f5; min-height: 90px; height: 100px; transition: background 0.2s;
}
.schedule-td-cell:last-child { border-right: none; }
.today-cell { background: #f8fafc; }

/* ============ CARDS ============ */
.schedule-card {
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 10px 6px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease;
  width: 100%; min-height: 64px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.schedule-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.card-course-name { font-size: 0.72rem; font-weight: 700; line-height: 1.3; margin-bottom: 2px; }
.card-room { font-size: 0.7rem; font-weight: 600; opacity: 0.75; margin-top: 2px; }

.card-blue { background: #dbeafe; color: #1e40af; border-left: 3px solid #2563eb; }
.card-green { background: #d1fae5; color: #065f46; border-left: 3px solid #059669; }
.card-yellow { background: #fef9c3; color: #854d0e; border-left: 3px solid #ca8a04; }
.card-cyan { background: #cffafe; color: #155e75; border-left: 3px solid #0891b2; }
.card-pink { background: #fce7f3; color: #9d174d; border-left: 3px solid #db2777; }
.card-purple { background: #e9d5ff; color: #6b21a8; border-left: 3px solid #9333ea; }
.card-orange { background: #ffedd5; color: #9a3412; border-left: 3px solid #ea580c; }

/* ============ LEGEND ============ */
.schedule-legend { display: flex; flex-wrap: wrap; gap: 20px; padding: 4px 8px; }
.legend-item { display: flex; align-items: center; gap: 8px; }
.legend-dot { width: 13px; height: 13px; border-radius: 4px; flex-shrink: 0; }
.legend-text { font-size: 0.82rem; font-weight: 500; color: #4b5563; }
.legend-card-blue { background: #3b82f6; }
.legend-card-green { background: #10b981; }
.legend-card-yellow { background: #f59e0b; }
.legend-card-cyan { background: #06b6d4; }
.legend-card-pink { background: #ec4899; }
.legend-card-purple { background: #a855f7; }
.legend-card-orange { background: #f97316; }

/* ============ THÁNG VIEW ============ */
.month-day-card {
  background: #fff; border-radius: 20px; border: 1px solid #f0f0f0;
  overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  transition: all 0.2s ease;
}
.month-day-card:hover { border-color: #dbeafe; box-shadow: 0 4px 16px rgba(37,99,235,0.06); }
.today-day-card { border-color: #bfdbfe; background: linear-gradient(to bottom right, #fff, #eff6ff); }

.month-day-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #f5f5f5; background: #fafafa;
}
.today-day-header { background: linear-gradient(to right, #eff6ff, #f8fafc); }

.month-day-num {
  width: 40px; height: 40px; border-radius: 12px; background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 800; color: #374151;
}
.today-day-num { background: #2563eb; color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

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
.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>