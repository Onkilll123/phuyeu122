<template>
  <div class="p-8 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold">Quản lý Lớp học</h1>
        <p class="text-sm text-gray-500">Xét duyệt và quản lý lớp trên hệ thống</p>
      </div>
      
      <!-- Nhóm Nút Mở Lớp & Thông Báo -->
      <div class="flex items-center space-x-5">
        <button @click="openModal()" class="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">
          + Mở lớp mới
        </button>
      </div>
    </div>

    <!-- THANH BỘ LỌC & TÌM KIẾM -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div class="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
        <button v-for="filter in filters" :key="filter.value" 
                @click="currentFilter = filter.value"
                :class="['px-5 py-2 rounded-full text-sm font-bold border whitespace-nowrap transition-all', currentFilter === filter.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50']">
          {{ filter.label }}
        </button>
      </div>
      <div class="relative w-full max-w-xs">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </span>
        <input v-model="searchQuery" type="text" placeholder="Tìm theo mã lớp, giảng viên..." class="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 transition-all">
      </div>
    </div>

    <!-- Danh sách Lớp -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="cls in filteredClasses" :key="cls.id" class="group bg-white p-6 rounded-2xl border shadow-sm relative hover:shadow-md border-l-4"
           :class="cls.status === 'PENDING' ? 'border-l-blue-400' : cls.status === 'OPENED' ? 'border-l-emerald-400' : 'border-l-gray-300'">
        
        <div class="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" v-if="cls.status !== 'CANCELLED'">
          <button @click="openModal(cls)" class="text-blue-500 text-xs font-bold hover:underline bg-blue-50 px-2 py-1 rounded">Sửa</button>
          <button @click="deleteClass(cls.id)" class="text-red-500 text-xs font-bold hover:underline bg-red-50 px-2 py-1 rounded">Xóa</button>
        </div>

        <h3 class="font-bold text-lg text-gray-900 pr-12">{{ getCourseTitle(cls.courseId) || cls.name || 'Lớp học' }}</h3>
        <p class="text-sm text-gray-400 mb-4 font-medium">{{ cls.classCode || cls.code }}</p>

        <div class="grid grid-cols-2 gap-y-3 mb-6 text-xs text-gray-600">
          <div>👥 {{ cls.maxStudents || cls.students }} HV</div>
          <div v-if="cls.status === 'PENDING' || cls.status === 'Chờ duyệt'" class="flex items-center">
            <span class="mr-1">👨‍🏫</span>
            <select v-model="cls.teacherId" @change="quickSaveTeacher(cls)" class="px-1 py-0.5 border border-gray-200 rounded text-[11px] bg-blue-50 text-blue-700 font-bold cursor-pointer max-w-[120px] truncate">
              <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div v-else>👨‍🏫 {{ getTeacherName(cls.teacherId) }}</div>
          <div>📍 {{ getRoomName(cls.roomId) }}</div>
          <div>📅 {{ formatDate(cls.startDate) }}</div>
        </div>

        <div v-if="cls.status === 'PENDING' || cls.status === 'Chờ duyệt'" class="flex space-x-2 mt-4">
          <button @click="updateStatus(cls, 'CANCELLED')" class="flex-1 py-2 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg hover:bg-red-100">Từ chối</button>
          <button @click="updateStatus(cls, 'OPENED')" class="flex-1 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700">Duyệt & Công bố</button>
        </div>
        <div v-else class="mt-4"><span class="text-[11px] font-bold px-3 py-1 rounded-full" :class="statusClass(cls.status)">{{ statusLabel(cls.status) }}</span></div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl relative">
        <button @click="showModal = false" class="absolute top-6 right-6 text-gray-300 hover:text-gray-500">✕</button>
        <h2 class="text-xl font-bold mb-6">{{ isEditing ? 'Cập nhật thông tin phòng & lớp' : 'Mở lớp mới' }}</h2>
        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1">Khóa học</label>
            <select v-model="formData.courseId" class="w-full p-2.5 bg-gray-50 border rounded-xl text-sm" :disabled="isEditing">
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title || c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1">Mã lớp</label>
            <input v-model="formData.classCode" class="w-full p-2.5 bg-gray-50 border rounded-xl text-sm">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1">Giảng viên phụ trách</label>
            <select v-model="formData.teacherId" class="w-full p-2.5 bg-gray-50 border rounded-xl text-sm cursor-pointer">
              <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }} ({{ t.id }})</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1">Ngày bắt đầu</label>
            <input v-model="formData.startDate" type="date" required class="w-full p-2.5 bg-gray-50 border rounded-xl text-sm">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1">Ca học</label>
            <select v-model="formData.shiftId" @change="onShiftChange" class="w-full p-2.5 bg-gray-50 border rounded-xl text-sm cursor-pointer" required>
              <option disabled value="">-- Chọn ca học --</option>
              <option v-for="s in SHIFTS" :key="s.id" :value="s.id">{{ s.label }} ({{ s.start }} - {{ s.end }})</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1">Phòng học</label>
              <select v-model="formData.roomId" class="w-full p-2.5 bg-gray-50 border rounded-xl text-sm">
                <option v-for="r in allRooms" :key="r.roomId" :value="r.roomId">{{ r.roomName }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1">Sĩ số</label>
              <input v-model="formData.maxStudents" type="number" class="w-full p-2.5 bg-gray-50 border rounded-xl text-sm">
            </div>
          </div>
          <div class="flex space-x-3 pt-2">
            <button type="button" @click="showModal = false" class="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { N1 as api } from '../../data/api'
import { useNotification } from '../composables/useNotification'

const { notifications, unreadCount, addNotification, fetchNotifications, deleteNotification, clearAllNotifications, getNotiIcon, getNotiIconClass } = useNotification()

const allClasses = ref([])
const courses = ref([])
const allRooms = ref([])
const teachers = ref([
  { id: 'T1', name: 'Nguyễn Thị Lan' },
  { id: 'T2', name: 'Trần Văn Khang' },
  { id: 'admin', name: 'Chưa phân công (Admin)' }
])

const SHIFTS = [
  { id: 1, label: 'Ca 1', start: '07:30', end: '09:00', session: 'MORNING' },
  { id: 2, label: 'Ca 2', start: '09:30', end: '11:00', session: 'MORNING' },
  { id: 3, label: 'Ca 3', start: '14:00', end: '15:30', session: 'AFTERNOON' },
  { id: 4, label: 'Ca 4', start: '17:30', end: '19:00', session: 'EVENING' },
]
const searchQuery = ref('')
const currentFilter = ref('Tất cả')
const showModal = ref(false)
const showNoti = ref(false)
const isEditing = ref(false)
const formData = ref({})

const filters = [ { label: 'Tất cả', value: 'Tất cả' }, { label: 'Chờ duyệt', value: 'PENDING' }, { label: 'Đã công bố', value: 'OPENED' }, { label: 'Đã hủy', value: 'CANCELLED' } ]
const statusLabel = (s) => ({ 'PENDING': 'Chờ duyệt', 'OPENED': 'Đã công bố', 'CANCELLED': 'Không duyệt' }[s] || s)
const statusClass = (s) => (s === 'OPENED' ? 'bg-emerald-100 text-emerald-700' : s === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')

const fetchClasses = async () => { try { const res = await api.getClasses(); allClasses.value = res.data } catch (e) { console.error(e) } }
const fetchCourses = async () => { try { const res = await api.getCourses(); courses.value = res.data } catch (e) { console.error(e) } }
const fetchRooms = async () => { try { const res = await api.getRooms(); allRooms.value = res.data } catch (e) { console.error(e) } }

// Helper: lấy tên phòng từ roomId
const getRoomName = (roomId) => {
  if (!roomId && roomId !== 0) return 'Chưa xếp'
  const found = allRooms.value.find(r => r.roomId === roomId || r.roomId === Number(roomId))
  return found ? found.roomName : `Phòng ${roomId}`
}

const getTeacherName = (id) => {
  const t = teachers.value.find(x => x.id === id)
  return t ? t.name : id || 'Trống'
}

const quickSaveTeacher = async (cls) => {
  try {
    await api.updateClass(cls.id, cls)
    const className = getCourseTitle(cls.courseId) || cls.classCode
    addNotification('edit', 'Admin', 'vừa phân công nhanh giảng viên cho', className, { teacherId: cls.teacherId })
  } catch (e) {
    console.error(e)
  }
}

const filteredClasses = computed(() => {
  let list = allClasses.value
  if (currentFilter.value !== 'Tất cả') list = list.filter(c => c.status === currentFilter.value)
  const q = searchQuery.value.toLowerCase().trim()
  if (q) list = list.filter(c => (c.classCode || '').toLowerCase().includes(q) || (c.teacherId || '').toLowerCase().includes(q) || (getCourseTitle(c.courseId) || '').toLowerCase().includes(q))
  return list
})

const getCourseTitle = (id) => { const c = courses.value.find(x => x.id === id); return c ? (c.title || c.name) : null }
const formatDate = (d) => {
  if (!d) return 'N/A'
  const str = typeof d === 'string' ? d.split('T')[0] : new Date(d).toISOString().split('T')[0]
  const [y, m, day] = str.split('-')
  return `${parseInt(day)}/${parseInt(m)}/${y}`
}

const onShiftChange = () => {
  const s = SHIFTS.find(x => x.id === formData.value.shiftId)
  if (s) {
    formData.value.startTime = s.start
    formData.value.endTime = s.end
    formData.value.sessionOfDay = s.session
  }
}

onMounted(async () => {
  await fetchCourses()
  await fetchClasses()
  await fetchRooms()
  fetchNotifications()
  
  window.addEventListener('db_changed', fetchNotifications)
  window.addEventListener('storage', fetchNotifications)
})

onUnmounted(() => {
  window.removeEventListener('db_changed', fetchNotifications)
  window.removeEventListener('storage', fetchNotifications)
})

const openModal = (cls = null) => {
  if (cls) { 
    isEditing.value = true; 
    formData.value = { ...cls, startDate: cls.startDate ? cls.startDate.split('T')[0] : '' } 
    if (cls.startTime) {
      const match = SHIFTS.find(s => s.start === cls.startTime.substring(0,5))
      if (match) formData.value.shiftId = match.id
    }
  }
  else { 
    isEditing.value = false; 
    // Fix timezone off-by-one bug when generating today's date
    const today = new Date();
    const localDateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    formData.value = { 
      courseId: '', classCode: '', teacherId: 'admin', 
      roomId: allRooms.value[0]?.roomId || 1, maxStudents: 20, status: 'PENDING', 
      startDate: localDateStr, endDate: '', shiftId: '' 
    } 
  }
  showModal.value = true
}

const submit = async () => {
  try {
    const payload = { 
      ...formData.value, 
      id: isEditing.value ? formData.value.id : crypto.randomUUID(), 
      maxStudents: Number(formData.value.maxStudents),
      startDate: formData.value.startDate || null,
      endDate: formData.value.endDate || null,
      startTime: formData.value.startTime ? (formData.value.startTime.length === 5 ? formData.value.startTime + ':00' : formData.value.startTime) : null,
      endTime: formData.value.endTime ? (formData.value.endTime.length === 5 ? formData.value.endTime + ':00' : formData.value.endTime) : null,
    }
    delete payload.shiftId // Xóa shiftId vì API backend có thể không chấp nhận trường lạ
    
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

    const className = getCourseTitle(payload.courseId) || payload.classCode

    if (isEditing.value) {
      const oldData = allClasses.value.find(c => c.id === payload.id)
      let changes = []
      if (oldData) {
        if (Number(oldData.roomId) !== Number(payload.roomId)) changes.push(`phòng học (${getRoomName(oldData.roomId)} ➤ ${getRoomName(payload.roomId)})`)
        if (Number(oldData.maxStudents) !== payload.maxStudents) changes.push(`sĩ số (${oldData.maxStudents || 0} ➤ ${payload.maxStudents} HV)`)
      }
      const actionText = changes.length > 0 ? `vừa đổi nội dung lớp: ${changes.join(', ')} của` : `vừa cập nhật thông tin lớp`
      
      await api.updateClass(payload.id, payload)
      addNotification('edit', 'Admin', actionText, className, { teacherId: payload.teacherId })
    } else {
      await api.createClass(payload)
      addNotification('add', 'Admin', 'vừa mở trực tiếp lớp mới cho', className, { teacherId: payload.teacherId })
    }
    
    await fetchClasses(); showModal.value = false; window.dispatchEvent(new Event('db_changed'))
  } catch (err) { alert(err.message) }
}

const deleteClass = async (id) => {
  if (confirm("Xóa lớp này?")) {
    try {
      const cls = allClasses.value.find(c => c.id === id)
      const className = cls ? (getCourseTitle(cls.courseId) || cls.classCode) : 'Lớp học'
      
      await api.deleteClass(id)
      addNotification('delete', 'Admin', 'vừa xóa và thu hồi dữ liệu của lớp', className, { teacherId: cls.teacherId })
      
      await fetchClasses(); window.dispatchEvent(new Event('db_changed'))
    } catch (e) { alert(e.message) }
  }
}

const updateStatus = async (cls, status) => {
  try {
    await api.updateClass(cls.id, { ...cls, status })
    const className = getCourseTitle(cls.courseId) || cls.classCode
    
    if (status === 'OPENED') {
      addNotification('approve', 'Admin', 'vừa phê duyệt đề xuất và công bố lớp', className, { teacherId: cls.teacherId })
      
      // Auto-schedule logic
      if (cls.startDate && cls.startTime && cls.endTime) {
        const d = new Date(cls.startDate)
        const jsDay = d.getDay()
        const computedDay = jsDay === 0 ? 8 : jsDay + 1
        
        try {
          await api.createSchedule({
            classId: cls.id,
            dayOfWeek: computedDay,
            sessionOfDay: cls.sessionOfDay || 'MORNING',
            startTime: cls.startTime.length === 5 ? cls.startTime + ":00" : cls.startTime,
            endTime: cls.endTime.length === 5 ? cls.endTime + ":00" : cls.endTime
          })
          addNotification('add', 'Hệ thống', 'tự động xếp lịch học cho', className, { teacherId: cls.teacherId })
        } catch (scheduleErr) {
          console.error("Lỗi khi tự động xếp lịch:", scheduleErr)
        }
      }
      
    } else if (status === 'CANCELLED') {
      addNotification('reject', 'Admin', 'vừa từ chối phê duyệt lớp', className, { teacherId: cls.teacherId })
    }
    
    await fetchClasses(); window.dispatchEvent(new Event('db_changed'))
  } catch (e) { alert(e.message) }
}
</script>
