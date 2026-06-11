<template>
  <div class="h-full flex flex-col overflow-hidden bg-white">
      <header class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
        <h1 class="text-xl font-bold text-gray-800">Lớp học của {{ currentUser?.name.split(' ').pop() || 'tôi' }}</h1>
        <div class="flex items-center space-x-4">
          <div class="relative">
            <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input v-model="searchQuery" type="text" placeholder="Tìm tên lớp, mã lớp..." class="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm w-64 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all">
          </div>
          <button @click="openModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 flex items-center transition-all hover:-translate-y-0.5">
            <span class="mr-1.5">+</span> Tạo đề xuất lớp
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="p-8 overflow-y-auto flex-1 bg-gray-50/30">
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
           <svg class="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           Đang đồng bộ dữ liệu với Backend...
        </div>

        <div v-else-if="filteredClasses.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div v-for="cls in filteredClasses" :key="cls.id" 
               class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col hover:shadow-xl hover:border-indigo-100 transition-all group relative">
            
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center space-x-4">
                <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                  {{ getCourseTitle(cls.courseId) ? getCourseTitle(cls.courseId).charAt(0) : 'L' }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-lg leading-tight">{{ getCourseTitle(cls.courseId) }}</h3>
                  <p class="text-xs text-gray-400 mt-1 font-bold tracking-widest uppercase">{{ cls.classCode }}</p>
                </div>
              </div>
              
              <span :class="['text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm border', getStatusStyle(cls.status)]">
                {{ statusLabel(cls.status) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-[13px] font-medium text-gray-600 mb-5 px-2">
              <span class="flex items-center"><span class="mr-2.5">👥</span> {{ cls.maxStudents }} học viên</span>
              <span class="flex items-center"><span class="mr-2.5">📍</span> {{ getRoomName(cls.roomId) }}</span>
              <span class="flex items-center"><span class="mr-2.5">📅</span> {{ formatDate(cls.startDate) }}</span>
              <span class="flex items-center"><span class="mr-2.5">🏁</span> {{ cls.endDate ? formatDate(cls.endDate) : 'Chưa xác định' }}</span>
              <span class="flex items-center col-span-2">
                <span class="mr-2.5">🕐</span>
                <span v-if="cls.startTime" class="font-bold text-indigo-700">
                  {{ cls.startTime?.substring(0,5) }} – {{ cls.endTime?.substring(0,5) }}
                </span>
                <span v-else class="text-gray-400">Chưa có giờ học</span>
                <span v-if="cls.sessionOfDay" class="ml-2 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{{ sessionLabel(cls.sessionOfDay) }}</span>
              </span>
            </div>

            <!-- Thao tác cho đề xuất -->
            <div v-if="cls.status === 'PENDING'" class="mt-auto pt-4 border-t border-gray-50 flex space-x-2">
              <button @click="openDetailModal(cls)" class="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold transition-all border border-transparent">Xem chi tiết</button>
              <button @click="openEditModal(cls)" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2.5 rounded-xl text-xs font-bold transition-all border border-transparent">Cập nhật</button>
              <button @click="deleteClass(cls.id)" class="bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-xl transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
            
            <div v-else-if="cls.status === 'OPENED'" class="mt-auto pt-4 border-t border-gray-50 space-y-2">
              <div class="flex justify-between items-center bg-indigo-50 px-4 py-3 rounded-2xl border border-indigo-100">
                <span class="text-indigo-700 text-xs font-bold flex items-center">
                   <span class="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-ping"></span>
                   Lớp đã sẵn sàng giảng dạy
                </span>
                <span class="text-[10px] bg-white text-indigo-500 px-2 py-1 rounded-lg font-black uppercase">Đang tuyển sinh</span>
              </div>
              <button @click="openDetailModal(cls)" class="w-full py-2.5 bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-2xl text-xs font-bold transition-all">👁 Xem chi tiết lớp học</button>
            </div>

            <div v-else-if="cls.status === 'CANCELLED'" class="mt-auto pt-4 border-t border-gray-50 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-red-500 text-xs font-bold">Admin không phê duyệt lớp này</span>
                <button @click="deleteClass(cls.id)" class="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase underline">Xóa đề xuất</button>
              </div>
              <button @click="openDetailModal(cls)" class="w-full py-2.5 bg-white border border-gray-100 hover:border-gray-200 text-gray-500 rounded-2xl text-xs font-bold transition-all">👁 Xem chi tiết</button>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-32">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p class="text-lg font-bold text-gray-700">Chưa có lớp học nào được phân công</p>
          <p class="text-sm text-gray-400 mt-1">Đề xuất lớp mới hoặc đợi Admin phê duyệt.</p>
        </div>
      </div>
    </div>

    <!-- ============ MODAL CHI TIẾT ============ -->
    <div v-if="showDetailModal && selectedClass" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="showDetailModal = false">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-modal-in">
        <button @click="showDetailModal = false" class="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all z-10">✕</button>
        
        <!-- Header modal -->
        <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200">
              {{ getCourseTitle(selectedClass.courseId).charAt(0) }}
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900">{{ getCourseTitle(selectedClass.courseId) }}</h2>
              <p class="text-xs text-gray-500 mt-0.5 font-bold tracking-widest uppercase">{{ selectedClass.classCode }}</p>
            </div>
          </div>
          <span :class="['mt-3 inline-block text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-tighter border', getStatusStyle(selectedClass.status)]">{{ statusLabel(selectedClass.status) }}</span>
        </div>

        <!-- Thông tin chi tiết -->
        <div class="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <!-- Hàng 1: Học viên + Phòng học -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-2xl p-4">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">👥 Số học viên</p>
              <p class="font-bold text-gray-800 text-lg">{{ selectedClass.maxStudents }}</p>
              <p class="text-[11px] text-gray-400">học viên tối đa</p>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">📍 Phòng học</p>
              <p class="font-bold text-gray-800 text-lg">{{ getRoomName(selectedClass.roomId) }}</p>
              <p class="text-[11px] text-gray-400">địa điểm học</p>
            </div>
          </div>

          <!-- Hàng 2: Ngày bắt đầu + Ngày kết thúc -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-blue-50 rounded-2xl p-4">
              <p class="text-[10px] font-bold text-blue-400 uppercase mb-1">📅 Ngày bắt đầu</p>
              <p class="font-bold text-blue-700">{{ formatDate(selectedClass.startDate) }}</p>
            </div>
            <div class="bg-purple-50 rounded-2xl p-4">
              <p class="text-[10px] font-bold text-purple-400 uppercase mb-1">🏁 Ngày kết thúc</p>
              <p class="font-bold text-purple-700">{{ selectedClass.endDate ? formatDate(selectedClass.endDate) : 'Chưa xác định' }}</p>
            </div>
          </div>

          <!-- Hàng 3: Giờ học -->
          <div class="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
            <p class="text-[10px] font-bold text-indigo-400 uppercase mb-2">🕐 Giờ học</p>
            <div class="flex items-center space-x-3">
              <div v-if="selectedClass.startTime" class="flex items-center space-x-2">
                <div class="bg-white rounded-xl px-4 py-2 shadow-sm">
                  <p class="text-[10px] text-gray-400 font-bold">BẮT ĐẦU</p>
                  <p class="font-black text-indigo-700 text-lg">{{ selectedClass.startTime?.substring(0,5) }}</p>
                </div>
                <span class="text-gray-400 font-bold text-lg">→</span>
                <div class="bg-white rounded-xl px-4 py-2 shadow-sm">
                  <p class="text-[10px] text-gray-400 font-bold">KẾT THÚC</p>
                  <p class="font-black text-indigo-700 text-lg">{{ selectedClass.endTime?.substring(0,5) }}</p>
                </div>
              </div>
              <span v-else class="text-gray-400 text-sm">Chưa có giờ học</span>
              <span v-if="selectedClass.sessionOfDay" :class="['text-xs font-bold px-3 py-1 rounded-full', sessionColorClass(selectedClass.sessionOfDay)]">{{ sessionLabel(selectedClass.sessionOfDay) }}</span>
            </div>
          </div>

          <!-- Giáo viên -->
          <div class="bg-emerald-50 rounded-2xl p-4">
            <p class="text-[10px] font-bold text-emerald-400 uppercase mb-1">👨‍🏫 Giảng viên phụ trách</p>
            <p class="font-bold text-emerald-700">{{ currentUser?.name || 'N/A' }}</p>
            <p class="text-[11px] text-emerald-500 mt-0.5">{{ currentUser?.subject || currentUser?.email || '' }}</p>
          </div>

          <!-- ID lớp -->
          <div class="bg-gray-50 rounded-2xl px-4 py-3">
            <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">🔑 Mã định danh lớp</p>
            <p class="text-xs font-mono text-gray-500 break-all">{{ selectedClass.id }}</p>
          </div>
        </div>

        <div class="px-6 pb-6">
          <button @click="showDetailModal = false" class="w-full py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ============ MODAL FORM ============ -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-modal-in">
        <button @click="showModal = false" class="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all z-10">✕</button>
        
        <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Cập nhật đề xuất' : 'Đề xuất mở lớp mới' }}</h2>
              <p class="text-xs text-gray-500 mt-0.5">Thông tin sẽ được gửi tới Admin phê duyệt</p>
            </div>
          </div>
        </div>

        <!-- Conflict Error Banner -->
        <div v-if="conflictError" class="mx-6 mt-5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start space-x-3 conflict-banner">
          <div class="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-red-700">Trùng lịch học!</p>
            <p class="text-xs text-red-600 mt-0.5">{{ conflictError }}</p>
          </div>
        </div>

        <form @submit.prevent="submit" class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <!-- Môn học -->
          <div class="form-group">
            <label class="form-label">Chọn môn học</label>
            <select v-model="formData.courseId" required class="form-input">
              <option disabled value="">-- Danh sách môn học --</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.title }}
              </option>
            </select>
          </div>
          
          <!-- Mã lớp -->
          <div class="form-group">
            <label class="form-label">Mã lớp dự kiến</label>
            <input v-model="formData.classCode" placeholder="VD: JAVA_2024_01" required class="form-input">
          </div>

          <!-- Phòng + Sĩ số -->
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
               <label class="form-label">Phòng đề xuất</label>
               <select v-model="formData.roomId" required class="form-input">
                 <option v-for="r in allRooms" :key="r.roomId" :value="r.roomId">{{ r.roomName }}</option>
               </select>
            </div>
            <div class="form-group">
               <label class="form-label">Số sinh viên</label>
               <input v-model="formData.maxStudents" type="number" min="1" required class="form-input">
            </div>
          </div>

          <!-- Ngày bắt đầu + Ngày kết thúc -->
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">📅 Ngày bắt đầu</label>
              <input v-model="formData.startDate" type="date" required class="form-input" @change="onStartDateChange">
            </div>
            <div class="form-group">
              <label class="form-label">🏁 Ngày kết thúc</label>
              <input v-model="formData.endDate" type="date" :min="formData.startDate" class="form-input">
            </div>
          </div>

          <!-- Thứ ngày (tính tự động) -->
          <div v-if="formData.startDate" class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center space-x-2">
            <span class="text-blue-500 text-sm">📆</span>
            <span class="text-xs font-bold text-blue-700">{{ computedDayLabel }}</span>
          </div>

          <!-- Chọn Ca học -->
          <div>
            <label class="form-label mb-3 block">🕐 Chọn Ca học</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" v-for="shift in SHIFTS" :key="shift.id"
                @click="selectShift(shift)"
                :class="[
                  'py-2.5 px-3 border rounded-xl text-left transition-all relative overflow-hidden',
                  formData.startTime && formData.startTime.startsWith(shift.start)
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <span :class="['font-bold text-sm', formData.startTime && formData.startTime.startsWith(shift.start) ? 'text-blue-700' : 'text-gray-700']">{{ shift.label }}</span>
                  <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide', sessionColorClass(shift.session)]">{{ shift.sessionLabel }}</span>
                </div>
                <div class="text-[11px] text-gray-500 font-medium flex items-center space-x-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>{{ shift.start }} - {{ shift.end }}</span>
                </div>
                <!-- Checkmark cho ca đang chọn -->
                <div v-if="formData.startTime && formData.startTime.startsWith(shift.start)" class="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-blue-500 border-l-transparent">
                  <svg class="absolute -top-[22px] -left-[10px] w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Buổi học (auto) -->
          <input type="hidden" v-model="formData.sessionOfDay">

          <div class="pt-4 flex space-x-3 border-t border-gray-100">
             <button type="button" @click="showModal = false" class="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all">Hủy</button>
             <button type="submit" :disabled="!!conflictError" class="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
               {{ isEditing ? 'Cập nhật' : 'Gửi yêu cầu' }}
             </button>
          </div>
        </form>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { N1 as api } from '../../data/api'
const currentUser = ref(null)
const allClasses = ref([])
const courses = ref([])
const allRooms = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedClass = ref(null)
const isEditing = ref(false)
const formData = ref({})
const conflictError = ref(null)

// ======== THỜI GIAN ========
const dayNames = { 0: 'Chủ nhật', 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7' }

const computedDayLabel = computed(() => {
  if (!formData.value.startDate) return ''
  const d = new Date(formData.value.startDate + 'T00:00:00')
  const dayName = dayNames[d.getDay()]
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dayName} — ${dd}/${mm}/${yyyy}`
})

const SHIFTS = [
  { id: 1, label: 'Ca 1', start: '07:30', end: '09:00', session: 'MORNING', sessionLabel: 'Sáng' },
  { id: 2, label: 'Ca 2', start: '09:30', end: '11:00', session: 'MORNING', sessionLabel: 'Sáng' },
  { id: 3, label: 'Ca 3', start: '14:00', end: '15:30', session: 'AFTERNOON', sessionLabel: 'Chiều' },
  { id: 4, label: 'Ca 4', start: '17:30', end: '19:00', session: 'EVENING', sessionLabel: 'Tối' }
]

const selectShift = (shift) => {
  formData.value.startTime = shift.start + ':00'
  formData.value.endTime = shift.end + ':00'
  formData.value.sessionOfDay = shift.session
  conflictError.value = checkConflict()
}

const onStartDateChange = () => {
  // reset conflict khi thay đổi ngày
  conflictError.value = checkConflict()
}

// ======== KIỂM TRA TRÙNG LỊCH ========
const timeToMinutes = (t) => {
  if (!t) return 0
  const parts = t.split(':')
  return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0)
}

const checkConflict = () => {
  if (!formData.value.startDate || !formData.value.startTime || !formData.value.endTime) return null

  const newStart = timeToMinutes(formData.value.startTime)
  const newEnd = timeToMinutes(formData.value.endTime)
  const newDate = formData.value.startDate
  const newSession = formData.value.sessionOfDay

  if (newStart >= newEnd) return 'Giờ kết thúc phải sau giờ bắt đầu!'

  // Lấy các lớp khác của chính giảng viên này (bỏ qua lớp đang sửa)
  const otherClasses = allClasses.value.filter(c => {
    const isMyClass = c.teacherId === currentUser.value?.id || c.teacherId === currentUser.value?.name
    const isNotCurrentEdit = !isEditing.value || c.id !== formData.value.id
    return isMyClass && isNotCurrentEdit && c.status === 'OPENED'
  })

  for (const cls of otherClasses) {
    if (!cls.startDate || !cls.startTime) continue

    // Kiểm tra cùng ngày
    const clsDate = cls.startDate?.split('T')[0]
    if (clsDate !== newDate) continue

    // Kiểm tra trùng buổi (sáng/chiều/tối)
    if (cls.sessionOfDay && cls.sessionOfDay === newSession) {
      const clsStart = timeToMinutes(cls.startTime)
      const clsEnd = timeToMinutes(cls.endTime || '23:59')
      const isOverlap = newStart < clsEnd && newEnd > clsStart

      if (isOverlap) {
        const courseName = getCourseTitle(cls.courseId) || cls.classCode
        return `Lớp "${courseName}" đã chiếm buổi ${sessionLabel(newSession)} hôm đó (${cls.startTime?.substring(0,5)} – ${cls.endTime?.substring(0,5)})!`
      }
    }
  }
  return null
}

// ======== HELPERS ========
const sessionLabel = (s) => ({ MORNING: 'Sáng', AFTERNOON: 'Chiều', EVENING: 'Tối' }[s] || s || '—')
const sessionColorClass = (s) => ({
  MORNING: 'bg-amber-100 text-amber-700',
  AFTERNOON: 'bg-blue-100 text-blue-700',
  EVENING: 'bg-purple-100 text-purple-700',
}[s] || 'bg-gray-100 text-gray-500')

const sendNotiToAdmin = (type, action, target) => {
  const notifications = JSON.parse(localStorage.getItem('edu_notifications') || '[]')
  const teacherName = currentUser.value ? currentUser.value.name : 'Giảng viên T1'
  
  notifications.unshift({
    id: Date.now() + Math.random(),
    type,
    actor: `Giảng viên ${teacherName}`,
    action,
    target,
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    read: false
  })
  localStorage.setItem('edu_notifications', JSON.stringify(notifications))
  window.dispatchEvent(new Event('db_changed')) 
}

const fetchInitData = async () => {
  loading.value = true
  try {
    const [resClasses, resCourses, resRooms] = await Promise.all([
      api.getClasses(),
      api.getCourses(),
      api.getRooms()
    ])
    allClasses.value = resClasses.data
    courses.value = resCourses.data
    allRooms.value = resRooms.data
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

// Helper: lấy tên phòng từ roomId
const getRoomName = (roomId) => {
  if (!roomId && roomId !== 0) return 'Chưa xếp'
  const found = allRooms.value.find(r => r.roomId === roomId || r.roomId === Number(roomId))
  return found ? found.roomName : `Phòng ${roomId}`
}

onMounted(() => {
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) currentUser.value = JSON.parse(savedUser)
  else currentUser.value = { id: 'T1', name: 'Nguyễn Thị Lan' } // dummy fallback
  
  fetchInitData()
})

const filteredClasses = computed(() => {
  if (!currentUser.value) return []
  let myClasses = allClasses.value.filter(c => c.teacherId === currentUser.value.id || c.teacherId === currentUser.value.name)
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    myClasses = myClasses.filter(c => 
      c.classCode.toLowerCase().includes(q) || 
      getCourseTitle(c.courseId).toLowerCase().includes(q)
    )
  }
  return myClasses
})

const getCourseTitle = (courseId) => {
  const c = courses.value.find(x => x.id === courseId)
  return c ? c.title : 'N/A'
}

const statusLabel = (status) => {
  if (status === 'OPENED') return 'Đã công bố'
  if (status === 'PENDING') return 'Đang chờ duyệt'
  if (status === 'CANCELLED') return 'Bị từ chối'
  return status
}

const statusClass = (status) => {
  if (status === 'OPENED') return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  if (status === 'PENDING') return 'bg-amber-50 text-amber-600 border-amber-100'
  if (status === 'CANCELLED') return 'bg-red-50 text-red-600 border-red-100'
  return 'bg-gray-50 text-gray-500 border-gray-100'
}

const getStatusStyle = statusClass

// Fix timezone: parse YYYY-MM-DD manually to avoid UTC offset issue
const formatDate = (d) => {
  if (!d) return 'N/A'
  const str = typeof d === 'string' ? d.split('T')[0] : new Date(d).toISOString().split('T')[0]
  const [y, m, day] = str.split('-')
  return `${parseInt(day)}/${parseInt(m)}/${y}`
}

const logout = () => { localStorage.removeItem('currentUser') }

const openDetailModal = (cls) => {
  selectedClass.value = cls
  showDetailModal.value = true
}

const openModal = () => {
  isEditing.value = false
  conflictError.value = null
  const today = new Date()
  const localDateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  formData.value = {
    courseId: '', classCode: '', teacherId: currentUser.value.id,
    roomId: allRooms.value[0]?.roomId || 1, maxStudents: 20, status: 'PENDING',
    startDate: localDateStr,
    endDate: '',
    startTime: '07:30',
    endTime: '09:00',
    sessionOfDay: 'MORNING'
  }
  showModal.value = true
}

const openEditModal = (cls) => {
  isEditing.value = true
  conflictError.value = null
  formData.value = {
    ...cls,
    startDate: cls.startDate?.split('T')[0] || '',
    endDate: cls.endDate?.split('T')[0] || '',
    startTime: cls.startTime?.substring(0,5) || '07:30',
    endTime: cls.endTime?.substring(0,5) || '09:00',
  }
  // Check conflict on open for edit
  conflictError.value = checkConflict()
  showModal.value = true
}

const submit = async () => {
  // Final conflict check before submit
  const conflict = checkConflict()
  if (conflict) {
    conflictError.value = conflict
    return
  }

  try {
    const payload = {
      ...formData.value,
      maxStudents: Number(formData.value.maxStudents),
      sessionOfDay: formData.value.sessionOfDay,
      // Gửi null thay vì chuỗi rỗng để backend .NET hiểu đúng
      startDate: formData.value.startDate || null,
      endDate: formData.value.endDate || null,
      startTime: formData.value.startTime ? (formData.value.startTime.length === 5 ? formData.value.startTime + ':00' : formData.value.startTime) : null,
      endTime: formData.value.endTime ? (formData.value.endTime.length === 5 ? formData.value.endTime + ':00' : formData.value.endTime) : null,
    }

    // Tính toán ngày kết thúc (endDate) dựa trên số buổi học của Khóa học (sessions)
    const course = courses.value.find(c => c.id === payload.courseId)
    const numSessions = course ? (course.sessions || course.totalLessons) : null
    if (numSessions && payload.startDate) {
      const d = new Date(payload.startDate)
      // Cộng thêm (số buổi - 1) * 7 ngày
      d.setDate(d.getDate() + (numSessions - 1) * 7)
      
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      payload.endDate = `${yyyy}-${mm}-${dd}`
    }

    // DEBUG: kiểm tra payload gửi lên
    console.log('=== SUBMIT PAYLOAD ===', JSON.stringify(payload, null, 2))

    const className = getCourseTitle(payload.courseId) || payload.classCode

    if (isEditing.value) {
      const oldData = allClasses.value.find(c => c.id === payload.id)
      let changes = []
      
      if (oldData) {
        if (Number(oldData.roomId) !== Number(payload.roomId)) changes.push(`phòng học (${getRoomName(oldData.roomId)} ➤ ${getRoomName(payload.roomId)})`)
        if (Number(oldData.maxStudents) !== payload.maxStudents) changes.push(`sĩ số (${oldData.maxStudents || 0} ➤ ${payload.maxStudents} HV)`)
        const oldDate = oldData.startDate ? oldData.startDate.split('T')[0] : ''
        if (oldDate !== payload.startDate) changes.push(`ngày KG (${oldDate || 'N/A'} ➔ ${payload.startDate})`)
        if (oldData.startTime?.substring(0,5) !== payload.startTime?.substring(0,5)) changes.push(`giờ học (${oldData.startTime?.substring(0,5)} ➔ ${payload.startTime?.substring(0,5)})`)
      }

      const actionText = changes.length > 0 
        ? `vừa sửa lớp xong. Chi tiết thay đổi: ${changes.join(', ')} của lớp` 
        : `vừa cập nhật thông tin lớp`

      await api.updateClass(payload.id, { ...payload, status: 'PENDING' })
      sendNotiToAdmin('edit', actionText, className)

      // Cập nhật local state ngay để hiển thị đúng (không phụ thuộc backend)
      const idx = allClasses.value.findIndex(c => c.id === payload.id)
      if (idx !== -1) {
        allClasses.value[idx] = { ...allClasses.value[idx], ...payload, status: 'PENDING' }
      }
    } else {
      payload.id = crypto.randomUUID()
      payload.status = 'PENDING'
      await api.createClass(payload)
      sendNotiToAdmin('pending', 'vừa gửi yêu cầu mở lớp học mới (Đang chờ duyệt) cho', className)

      // Thêm vào local state ngay
      allClasses.value.push({ ...payload })
    }
    
    showModal.value = false
    // Vẫn refetch để đồng bộ dữ liệu thật từ server
    fetchInitData()
    window.dispatchEvent(new Event('db_changed'))
  } catch (err) { alert('Lỗi: ' + err.message) }
}

const deleteClass = async (id) => {
  if (confirm("Xóa đề xuất lớp này?")) {
    try {
      const cls = allClasses.value.find(c => c.id === id)
      const className = cls ? (getCourseTitle(cls.courseId) || cls.classCode) : 'Lớp học'
      
      await api.deleteClass(id)
      sendNotiToAdmin('delete', 'vừa xóa lớp xong (Hủy yêu cầu đề xuất)', className)
      
      await fetchInitData()
      window.dispatchEvent(new Event('db_changed'))
    } catch (err) { alert(err.message) }
  }
}
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
}
.form-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
  margin-left: 2px;
}
.form-input {
  width: 100%;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1.5px solid #f0f0f0;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #1f2937;
  outline: none;
  transition: all 0.2s;
}
.form-input:focus {
  background: #fff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-modal-in {
  animation: modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.conflict-banner {
  animation: shake 0.4s ease;
}
</style>
