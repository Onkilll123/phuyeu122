<template>
  <div class="p-8 space-y-6">

    <!-- TOAST NOTIFICATION -->
    <transition name="toast">
      <div v-if="toast.show" :class="['fixed top-6 right-6 z-[100] flex items-start space-x-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-sm backdrop-blur-sm transition-all', toastClass]">
        <span class="text-xl shrink-0 mt-0.5">{{ toast.icon }}</span>
        <div>
          <p class="font-bold text-sm">{{ toast.title }}</p>
          <p class="text-xs mt-0.5 opacity-80">{{ toast.message }}</p>
        </div>
        <button @click="toast.show = false" class="ml-2 opacity-50 hover:opacity-100 text-lg leading-none shrink-0">✕</button>
      </div>
    </transition>

    <!-- CONFLICT POPUP MODAL -->
    <transition name="modal-fade">
      <div v-if="conflictModal.show" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
          <!-- Header -->
          <div class="bg-gradient-to-r from-red-50 to-orange-50 px-8 py-6 border-b border-red-100">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">Phòng đang được sử dụng!</h3>
                <p class="text-xs text-red-500 font-medium mt-0.5">Phát hiện {{ conflictModal.conflicts.length }} xung đột lịch học</p>
              </div>
            </div>
          </div>
          <!-- Conflict List -->
          <div class="p-6 space-y-3 max-h-64 overflow-y-auto">
            <div v-for="(c, i) in conflictModal.conflicts" :key="i" class="flex items-start space-x-3 bg-red-50 rounded-2xl p-4 border border-red-100">
              <span class="text-red-400 font-black text-lg shrink-0">{{ i + 1 }}.</span>
              <div>
                <p class="font-bold text-gray-800 text-sm">{{ c.classCode }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Thứ {{ c.dayOfWeek }} · {{ c.startTime?.substring(0,5) }} – {{ c.endTime?.substring(0,5) }} · {{ sessionLabel(c.sessionOfDay) }}</p>
              </div>
            </div>
          </div>
          <div class="px-6 pb-6">
            <button @click="conflictModal.show = false" class="w-full py-3 bg-red-500 text-white rounded-2xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100">
              Đã hiểu, đóng thông báo
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý Phòng học</h1>
        <p class="text-sm text-gray-500 mt-1">Theo dõi trạng thái và phân bổ phòng học trong hệ thống</p>
      </div>
      <div class="flex items-center space-x-3">
        <button @click="openModal()" class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all flex items-center space-x-2">
          <span class="text-lg">+</span>
          <span>Thêm phòng mới</span>
        </button>
      </div>
    </div>

    <!-- STATS CARDS -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tổng phòng</p>
        <p class="text-3xl font-black text-gray-900">{{ rooms.length }}</p>
      </div>
      <div class="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm">
        <p class="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Trống</p>
        <p class="text-3xl font-black text-emerald-600">{{ rooms.filter(r => r.status === 'EMPTY').length }}</p>
      </div>
      <div class="bg-amber-50 rounded-2xl p-5 border border-amber-100 shadow-sm">
        <p class="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">Đang dùng</p>
        <p class="text-3xl font-black text-amber-600">{{ rooms.filter(r => r.status === 'IN_USE').length }}</p>
      </div>
      <div class="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm">
        <p class="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1">Bảo trì</p>
        <p class="text-3xl font-black text-red-500">{{ rooms.filter(r => r.status === 'MAINTENANCE').length }}</p>
      </div>
    </div>

    <!-- FILTER + SEARCH BAR -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div class="flex space-x-2 overflow-x-auto pb-1">
        <button v-for="f in statusFilters" :key="f.value"
          @click="currentFilter = f.value"
          :class="['px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all', currentFilter === f.value ? f.activeClass : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50']">
          {{ f.label }}
          <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]" :class="currentFilter === f.value ? 'bg-white/30' : 'bg-gray-100'">
            {{ f.value === 'ALL' ? rooms.length : rooms.filter(r => r.status === f.value).length }}
          </span>
        </button>
      </div>
      <div class="relative w-full max-w-xs">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </span>
        <input v-model="searchQuery" type="text" placeholder="Tìm tên phòng..."
          class="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 transition-all">
      </div>
    </div>

    <!-- ROOM TABLE -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="text-center py-16 text-gray-400">
        <svg class="animate-spin h-8 w-8 mx-auto mb-3 text-blue-400" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/70 border-b border-gray-100">
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID</th>
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tên phòng</th>
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Lớp đang dùng</th>
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="filteredRooms.length === 0">
            <td colspan="5" class="px-6 py-14 text-center">
              <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">🚪</div>
              <p class="text-gray-400 font-medium">Không tìm thấy phòng học nào</p>
            </td>
          </tr>
          <tr v-for="room in filteredRooms" :key="room.roomId" class="hover:bg-gray-50/50 transition-colors group">
            <td class="px-6 py-4 text-sm font-mono text-gray-400">#{{ room.roomId }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center space-x-3">
                <div :class="['w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0', getRoomIconClass(room.status)]">
                  {{ room.roomName.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ room.roomName }}</p>
                  <p class="text-[11px] text-gray-400 font-medium">{{ getClassesInRoom(room.roomId).length }} lớp phân công</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span :class="['inline-flex items-center space-x-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border', getStatusStyle(room.status)]">
                <span :class="['w-1.5 h-1.5 rounded-full', getStatusDotClass(room.status)]"></span>
                <span>{{ statusLabel(room.status) }}</span>
              </span>
            </td>
            <td class="px-6 py-4">
              <div v-if="getClassesInRoom(room.roomId).length > 0" class="flex flex-wrap gap-1.5">
                <span v-for="cls in getClassesInRoom(room.roomId).slice(0, 2)" :key="cls.id"
                  class="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100">
                  {{ cls.classCode }}
                </span>
                <span v-if="getClassesInRoom(room.roomId).length > 2"
                  class="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                  +{{ getClassesInRoom(room.roomId).length - 2 }} lớp
                </span>
              </div>
              <span v-else class="text-[11px] text-gray-300 font-medium">Chưa có lớp</span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="viewDetail(room)" class="text-[11px] font-bold text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">Xem</button>
                <button @click="checkAndOpenEdit(room)" class="text-[11px] font-bold text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all">Sửa</button>
                <button @click="deleteRoom(room)" class="text-[11px] font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all">Xóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ======== MODAL CHI TIẾT ======== -->
    <transition name="modal-fade">
      <div v-if="showDetailModal && selectedRoom" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="showDetailModal = false">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-in">
          <button @click="showDetailModal = false" class="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 z-10">✕</button>

          <!-- Header modal -->
          <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center space-x-4">
              <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg', getRoomIconClass(selectedRoom.status)]">
                {{ selectedRoom.roomName.charAt(0) }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ selectedRoom.roomName }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">ID Phòng: #{{ selectedRoom.roomId }}</p>
              </div>
            </div>
            <span :class="['mt-4 inline-flex items-center space-x-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border', getStatusStyle(selectedRoom.status)]">
              <span :class="['w-2 h-2 rounded-full', getStatusDotClass(selectedRoom.status)]"></span>
              <span>{{ statusLabel(selectedRoom.status) }}</span>
            </span>
          </div>

          <!-- Nội dung -->
          <div class="p-6 max-h-[60vh] overflow-y-auto bg-gray-50/50">
            <div v-if="getClassesInRoom(selectedRoom.roomId).length > 0" class="space-y-4">
              <!-- Nhóm theo từng lớp học -->
              <div v-for="cls in getClassesInRoom(selectedRoom.roomId)" :key="cls.id"
                class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                
                <!-- Thông tin cơ bản của lớp -->
                <div class="flex items-start justify-between mb-4 pb-4 border-b border-gray-50">
                  <div>
                    <div class="flex items-center space-x-2 mb-1.5">
                      <span class="font-black text-gray-900 text-lg">{{ cls.classCode }}</span>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">{{ getCourseTitle(cls.courseId) }}</span>
                    </div>
                    <div class="flex items-center space-x-4 text-xs font-medium text-gray-500">
                      <span class="flex items-center"><svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> {{ cls.teacherId }}</span>
                      <span class="flex items-center"><svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> {{ cls.maxStudents }} HV</span>
                    </div>
                  </div>
                  <span :class="['text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap', cls.status === 'OPENED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700']">
                    {{ cls.status === 'OPENED' ? 'Đang hoạt động' : 'Chờ duyệt' }}
                  </span>
                </div>

                <!-- Lịch học của lớp này -->
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">🗓️ Thời khóa biểu</p>
                  <div v-if="allSchedules.filter(s => s.classId === cls.id).length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div v-for="sch in allSchedules.filter(s => s.classId === cls.id)" :key="sch.id"
                      class="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                      <div class="flex items-center space-x-2">
                        <span class="text-indigo-600 font-bold text-[11px] bg-indigo-50 px-2 py-0.5 rounded-md">T{{ sch.dayOfWeek }}</span>
                        <span class="text-[11px] font-bold text-gray-700">{{ sch.startTime?.substring(0,5) }} - {{ sch.endTime?.substring(0,5) }}</span>
                      </div>
                      <span class="text-[9px] font-bold text-indigo-500 uppercase tracking-wide">{{ sessionLabel(sch.sessionOfDay) }}</span>
                    </div>
                  </div>
                  <p v-else class="text-xs text-amber-500 italic flex items-center">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Chưa xếp lịch
                  </p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900 mb-1">Phòng trống</h3>
              <p class="text-[11px] text-gray-500">Hiện tại chưa có lớp học nào được phân công sử dụng phòng này.</p>
            </div>
          </div>

          <div class="px-6 pb-6 flex space-x-3">
            <button @click="checkAndOpenEdit(selectedRoom); showDetailModal = false" class="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              ✏️ Chỉnh sửa phòng
            </button>
            <button @click="showDetailModal = false" class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ======== MODAL FORM THÊM / SỬA ======== -->
    <transition name="modal-fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
          <button @click="showModal = false" class="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 z-10">✕</button>

          <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Cập nhật phòng học' : 'Thêm phòng học mới' }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">{{ isEditing ? 'Chỉnh sửa thông tin phòng' : 'Điền thông tin phòng học mới' }}</p>
              </div>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="submit" class="p-6 space-y-4">
            <div>
              <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Tên phòng học</label>
              <input v-model="formData.roomName" placeholder="VD: Phòng A101" required
                class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none">
            </div>

            <div>
              <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Trạng thái</label>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" v-for="s in statusOptions" :key="s.value"
                  @click="formData.status = s.value"
                  :class="['py-2.5 rounded-xl text-xs font-bold border transition-all', formData.status === s.value ? s.activeClass : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100']">
                  {{ s.label }}
                </button>
              </div>
            </div>

            <!-- Cảnh báo nếu phòng đang có lớp mà đặt bảo trì -->
            <div v-if="formData.status === 'MAINTENANCE' && isEditing && getClassesInRoom(formData.roomId).length > 0"
              class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start space-x-2">
              <span class="text-amber-500 text-lg shrink-0">⚠️</span>
              <div>
                <p class="text-xs font-bold text-amber-700">Lưu ý: Phòng đang có {{ getClassesInRoom(formData.roomId).length }} lớp học!</p>
                <p class="text-[11px] text-amber-600 mt-0.5">Đặt phòng bảo trì khi đang có lớp có thể gây xung đột lịch dạy.</p>
              </div>
            </div>

            <div class="flex space-x-3 pt-2">
              <button type="button" @click="showModal = false" class="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Hủy</button>
              <button type="submit" class="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                {{ isEditing ? 'Lưu thay đổi' : 'Thêm phòng' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { N1 as api } from '../../data/api'
import { useNotification } from '../composables/useNotification'

const { addNotification, fetchNotifications } = useNotification()

// ======== STATE ========
const rooms = ref([])
const allClasses = ref([])
const allSchedules = ref([])
const courses = ref([])
const loading = ref(false)
const searchQuery = ref('')
const currentFilter = ref('ALL')
const showModal = ref(false)
const showDetailModal = ref(false)
const isEditing = ref(false)
const selectedRoom = ref(null)
const formData = ref({ roomId: null, roomName: '', status: 'EMPTY' })

// ======== TOAST ========
const toast = ref({ show: false, icon: '', title: '', message: '', type: '' })
const toastClass = computed(() => ({
  'bg-red-50 border-red-200 text-red-800': toast.value.type === 'error',
  'bg-emerald-50 border-emerald-200 text-emerald-800': toast.value.type === 'success',
  'bg-amber-50 border-amber-200 text-amber-800': toast.value.type === 'warning',
  'bg-blue-50 border-blue-200 text-blue-800': toast.value.type === 'info',
}))
let toastTimer = null
const showToast = (type, icon, title, message) => {
  clearTimeout(toastTimer)
  toast.value = { show: true, type, icon, title, message }
  toastTimer = setTimeout(() => { toast.value.show = false }, 4000)
}

// ======== CONFLICT POPUP ========
const conflictModal = ref({ show: false, conflicts: [] })
const showConflict = (conflicts) => {
  conflictModal.value = { show: true, conflicts }
}

// ======== FILTER OPTIONS ========
const statusFilters = [
  { label: 'Tất cả', value: 'ALL', activeClass: 'bg-blue-600 text-white border-blue-600' },
  { label: '🟢 Trống', value: 'EMPTY', activeClass: 'bg-emerald-500 text-white border-emerald-500' },
  { label: '🟡 Đang dùng', value: 'IN_USE', activeClass: 'bg-amber-500 text-white border-amber-500' },
  { label: '🔴 Bảo trì', value: 'MAINTENANCE', activeClass: 'bg-red-500 text-white border-red-500' },
]
const statusOptions = [
  { label: '🟢 Trống', value: 'EMPTY', activeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { label: '🟡 Đang dùng', value: 'IN_USE', activeClass: 'bg-amber-100 text-amber-700 border-amber-300' },
  { label: '🔴 Bảo trì', value: 'MAINTENANCE', activeClass: 'bg-red-100 text-red-600 border-red-300' },
]

// ======== HELPERS ========
const statusLabel = (s) => ({ EMPTY: 'Trống', IN_USE: 'Đang sử dụng', MAINTENANCE: 'Bảo trì' }[s] || s || 'N/A')
const sessionLabel = (s) => ({ MORNING: 'Sáng', AFTERNOON: 'Chiều', EVENING: 'Tối' }[s] || s || '—')

const getStatusStyle = (s) => ({
  EMPTY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  IN_USE: 'bg-amber-50 text-amber-700 border-amber-200',
  MAINTENANCE: 'bg-red-50 text-red-600 border-red-200',
}[s] || 'bg-gray-50 text-gray-500 border-gray-200')

const getStatusDotClass = (s) => ({
  EMPTY: 'bg-emerald-500',
  IN_USE: 'bg-amber-500 animate-pulse',
  MAINTENANCE: 'bg-red-500',
}[s] || 'bg-gray-400')

const getRoomIconClass = (s) => ({
  EMPTY: 'bg-emerald-100 text-emerald-700',
  IN_USE: 'bg-amber-100 text-amber-700',
  MAINTENANCE: 'bg-red-100 text-red-600',
}[s] || 'bg-gray-100 text-gray-600')

// Lấy danh sách lớp học đang dùng phòng này
const getClassesInRoom = (roomId) => {
  return allClasses.value.filter(c =>
    (c.roomId === roomId || c.roomId === Number(roomId)) &&
    c.status === 'OPENED'
  )
}

// Lấy lịch học của các lớp trong phòng này
const getSchedulesInRoom = (roomId) => {
  const classIds = getClassesInRoom(roomId).map(c => c.id)
  return allSchedules.value.filter(s => classIds.includes(s.classId))
}

const getCourseTitle = (courseId) => {
  const c = courses.value.find(x => x.id === courseId)
  return c ? (c.title || c.name) : 'N/A'
}

// ======== COMPUTED ========
const filteredRooms = computed(() => {
  let list = rooms.value
  if (currentFilter.value !== 'ALL') {
    list = list.filter(r => r.status === currentFilter.value)
  }
  const q = searchQuery.value.toLowerCase().trim()
  if (q) list = list.filter(r => r.roomName.toLowerCase().includes(q))
  return list
})

// ======== FETCH ========
const fetchAll = async () => {
  loading.value = true
  try {
    const [resRooms, resClasses, resSch, resCourses] = await Promise.all([
      api.getRooms(),
      api.getClasses(),
      api.getSchedules(),
      api.getCourses(),
    ])
    allClasses.value = resClasses.data
    allSchedules.value = resSch.data
    courses.value = resCourses.data
    rooms.value = resRooms.data.map(r => {
      if (r.status !== 'MAINTENANCE') {
        const hasClasses = resClasses.data.some(c => 
          (c.roomId === r.roomId || c.roomId === Number(r.roomId)) && c.status === 'OPENED'
        )
        r.status = hasClasses ? 'IN_USE' : 'EMPTY'
      }
      return r
    })
  } catch (err) {
    showToast('error', '❌', 'Lỗi tải dữ liệu', err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAll()
  fetchNotifications()
  window.addEventListener('db_changed', fetchAll)
})
onUnmounted(() => {
  window.removeEventListener('db_changed', fetchAll)
  clearTimeout(toastTimer)
})

// ======== MODAL LOGIC ========
const openModal = (room = null) => {
  if (room) {
    isEditing.value = true
    formData.value = { ...room }
  } else {
    isEditing.value = false
    formData.value = { roomId: null, roomName: '', status: 'EMPTY' }
  }
  showModal.value = true
}

const viewDetail = (room) => {
  selectedRoom.value = room
  showDetailModal.value = true
}

// Kiểm tra xung đột trước khi mở sửa
const checkAndOpenEdit = (room) => {
  const conflicts = getSchedulesInRoom(room.roomId)
  if (conflicts.length > 0 && room.status === 'MAINTENANCE') {
    showConflict(conflicts)
    showToast('warning', '⚠️', 'Phòng đang có lịch học', `Phòng "${room.roomName}" hiện có ${conflicts.length} ca học đang được dùng.`)
  }
  openModal(room)
}

// ======== KIỂM TRA TRÙNG LỚP + NGÀY ========
const checkRoomConflict = (roomId, excludeRoomId = null) => {
  // Kiểm tra phòng cùng tên đã tồn tại chưa
  if (!isEditing.value) {
    const sameName = rooms.value.find(r =>
      r.roomName.trim().toLowerCase() === formData.value.roomName.trim().toLowerCase()
    )
    if (sameName) return `Phòng "${formData.value.roomName}" đã tồn tại trong hệ thống!`
  }

  // Kiểm tra lịch học trùng: các lớp khác trong cùng phòng với cùng thứ + giờ
  const classesInRoom = getClassesInRoom(roomId)
  const schsInRoom = getSchedulesInRoom(roomId)

  // Nếu đang đặt bảo trì mà có lớp → cảnh báo
  if (formData.value.status === 'MAINTENANCE' && classesInRoom.length > 0) {
    return null // chỉ cảnh báo, không chặn
  }

  return null
}

// ======== SUBMIT ========
const submit = async () => {
  const nameConflict = rooms.value.find(r =>
    r.roomName.trim().toLowerCase() === formData.value.roomName.trim().toLowerCase() &&
    r.roomId !== formData.value.roomId
  )
  if (nameConflict) {
    showToast('error', '❌', 'Tên phòng đã tồn tại', `Phòng "${formData.value.roomName}" đã có trong hệ thống. Vui lòng dùng tên khác.`)
    return
  }

  // Cảnh báo nếu đặt bảo trì khi đang có lớp
  if (formData.value.status === 'MAINTENANCE' && isEditing.value) {
    const schConflicts = getSchedulesInRoom(formData.value.roomId)
    if (schConflicts.length > 0) {
      showConflict(schConflicts)
      showToast('warning', '⚠️', 'Cảnh báo bảo trì', `Phòng có ${schConflicts.length} ca học đang dùng. Đã lưu nhưng cần xử lý lịch!`)
    }
  }

  try {
    const payload = {
      roomId: formData.value.roomId || 0,
      roomName: formData.value.roomName.trim(),
      status: formData.value.status,
      classes: formData.value.classes || [],
    }

    if (isEditing.value) {
      await api.updateRoom(formData.value.roomId, payload)
      addNotification('edit', 'Admin', 'vừa cập nhật thông tin phòng học', payload.roomName)
      showToast('success', '✅', 'Cập nhật thành công', `Phòng "${payload.roomName}" đã được cập nhật.`)
    } else {
      await api.createRoom(payload)
      addNotification('add', 'Admin', 'vừa thêm phòng học mới vào hệ thống', payload.roomName)
      showToast('success', '✅', 'Thêm thành công', `Phòng "${payload.roomName}" đã được tạo.`)
    }

    showModal.value = false
    await fetchAll()
    window.dispatchEvent(new Event('db_changed'))
  } catch (err) {
    showToast('error', '❌', 'Lỗi lưu dữ liệu', err.response?.data?.message || err.message)
  }
}

// ======== DELETE ========
const deleteRoom = async (room) => {
  // Kiểm tra phòng có lớp đang dùng không
  const classesUsing = getClassesInRoom(room.roomId)
  if (classesUsing.length > 0) {
    const schConflicts = getSchedulesInRoom(room.roomId)
    showConflict(schConflicts)
    showToast('error', '🚫', 'Không thể xóa phòng', `Phòng "${room.roomName}" đang có ${classesUsing.length} lớp sử dụng. Vui lòng chuyển lớp trước khi xóa.`)
    return
  }

  if (!confirm(`Xóa phòng "${room.roomName}"? Hành động này không thể hoàn tác.`)) return

  try {
    await api.deleteRoom(room.roomId)
    addNotification('delete', 'Admin', 'vừa xóa phòng học khỏi hệ thống', room.roomName)
    showToast('success', '🗑️', 'Đã xóa phòng', `Phòng "${room.roomName}" đã được xóa thành công.`)
    await fetchAll()
    window.dispatchEvent(new Event('db_changed'))
  } catch (err) {
    showToast('error', '❌', 'Lỗi xóa phòng', err.response?.data?.message || err.message)
  }
}
</script>

<style scoped>
/* Modal animation */
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.94) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-modal-in { animation: modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

/* Modal fade transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Toast transition */
.toast-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(60px) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }
</style>
