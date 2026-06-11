<template>
  <div class="p-8 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Danh sách Khóa học</h1>
        <p class="text-sm text-gray-500">Quản lý nội dung và thông tin các khóa học</p>
      </div>
      <div class="flex items-center space-x-4">
        <button @click="openModal()" class="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all flex items-center">
          <span class="mr-2">+</span> Thêm khóa học
        </button>
      </div>
    </div>

    <!-- Thanh Tìm Kiếm -->
    <div class="relative w-full max-w-md mb-6">
      <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </span>
      <input v-model="searchQuery" type="text" placeholder="Tìm theo tên khóa học hoặc mô tả..." 
             class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm">
    </div>

    <!-- Bảng danh sách khóa học -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100">
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tên khóa học</th>
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trình độ</th>
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Số buổi</th>
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Học phí</th>
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mô tả</th>
            <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="course in filteredCourses" :key="course.id" class="hover:bg-gray-50/50 transition-colors group">
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ course.name }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ course.level }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ course.sessions }}</td>
            <td class="px-6 py-4 text-sm font-medium text-emerald-600">{{ formatPrice(course.fee) }}đ</td>
            <td class="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{{ course.description || 'Chưa có mô tả' }}</td>
            <td class="px-6 py-4 text-right space-x-3">
              <button @click="viewDetails(course)" class="text-gray-400 hover:text-blue-600 text-xs font-bold transition-colors">Xem chi tiết</button>
              <button @click="openModal(course)" class="text-gray-400 hover:text-gray-900 text-xs font-bold transition-colors">Sửa</button>
              <button @click="deleteCourse(course.id)" class="text-gray-400 hover:text-red-600 text-xs font-bold transition-colors">Xóa</button>
            </td>
          </tr>
          <tr v-if="filteredCourses.length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-gray-400 text-sm">Không tìm thấy khóa học nào phù hợp.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Xem Chi Tiết -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
        <button @click="showDetailModal = false" class="absolute top-6 right-6 text-gray-400 hover:text-gray-600">✕</button>
        <h2 class="text-2xl font-bold mb-6 text-blue-600">{{ selectedCourse.name }}</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-2xl">
              <p class="text-[10px] font-bold text-gray-400 uppercase">Trình độ</p>
              <p class="font-bold">{{ selectedCourse.level }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-2xl">
              <p class="text-[10px] font-bold text-gray-400 uppercase">Học phí</p>
              <p class="font-bold text-emerald-600">{{ formatPrice(selectedCourse.fee) }}đ</p>
            </div>
          </div>
          <div class="p-4 bg-gray-50 rounded-2xl">
            <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Mô tả khóa học</p>
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{{ selectedCourse.description || 'Không có mô tả chi tiết cho khóa học này.' }}</p>
          </div>
          <p class="text-[10px] text-gray-400">ID: {{ selectedCourse.id }}</p>
        </div>
      </div>
    </div>

    <!-- Modal Form (Thêm/Sửa) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 class="text-xl font-bold mb-6 flex justify-between">
          {{ isEditing ? 'Cập nhật khóa học' : 'Thêm khóa học mới' }}
          <button @click="showModal = false" class="text-gray-300 hover:text-gray-500 font-normal">✕</button>
        </h2>
        
        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Tên khóa học</label>
            <input v-model="formData.name" placeholder="VD: Lập trình Java chuyên sâu" required class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Trình độ</label>
              <select v-model="formData.level" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                <option>Sơ cấp</option><option>Trung cấp</option><option>Chuyên sâu</option><option>Advanced</option><option>Beginner</option><option>Intermediate</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Số buổi</label>
              <input v-model="formData.sessions" type="number" required class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Học phí (VND)</label>
            <input v-model="formData.fee" type="number" required class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Mô tả khóa học</label>
            <textarea v-model="formData.description" rows="4" placeholder="Nhập tóm tắt nội dung khóa học..." class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"></textarea>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Hủy bỏ</button>
            <button type="submit" class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              {{ isEditing ? 'Lưu thay đổi' : 'Tạo khóa học' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../../services/api'
import { useNotification } from '../composables/useNotification'

const { addNotification, fetchNotifications } = useNotification()

const courses = ref([])
const searchQuery = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const isEditing = ref(false)
const selectedCourse = ref(null)
const formData = ref({ name: '', level: 'Beginner', sessions: 24, fee: 3600000, description: '' })

const fetchCourses = async () => {
  try {
    const response = await api.getCourses()
    courses.value = response.data.map(c => ({
      ...c,
      name: c.name || c.title,
      sessions: c.sessions || c.totalLessons,
      fee: c.fee || c.tuitionFee
    }))
  } catch (err) { console.error('Lỗi khi tải:', err) }
}

onMounted(fetchCourses)

const filteredCourses = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return courses.value
  return courses.value.filter(c => 
    c.name.toLowerCase().includes(query) || 
    (c.description && c.description.toLowerCase().includes(query))
  )
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price)
}

const viewDetails = (course) => {
  selectedCourse.value = course
  showDetailModal.value = true
}

const openModal = (course = null) => {
  if (course) {
    isEditing.value = true
    formData.value = { ...course }
  } else {
    isEditing.value = false
    formData.value = { name: '', level: 'Sơ cấp', sessions: 12, fee: 1000000, description: '' }
  }
  showModal.value = true
}

const submit = async () => {
  try {
    const payload = {
      ...formData.value,
      id: isEditing.value ? formData.value.id : crypto.randomUUID(),
      title: formData.value.name,
      totalLessons: Number(formData.value.sessions),
      tuitionFee: Number(formData.value.fee),
      description: formData.value.description
    }

    if (isEditing.value) {
      await api.updateCourse(payload.id, payload)
    } else {
      await api.createCourse(payload)
    }

    // BAN THONG BAO
    addNotification(
      isEditing.value ? 'edit' : 'add',
      'Admin',
      isEditing.value ? 'vừa chỉnh sửa cập nhật thông tin khóa học' : 'vừa thêm khóa học hệ thống mới',
      payload.title
    )
    
    await fetchCourses()
    showModal.value = false
    window.dispatchEvent(new Event('db_changed'))
  } catch (err) { alert('Lỗi: ' + (err.response?.data || err.message)) }
}

const deleteCourse = async (id) => {
  if (confirm('Xóa khóa học này và các lớp liên quan?')) {
    try {
      const c = courses.value.find(x => x.id === id)
      await api.deleteCourse(id)
      addNotification('delete', 'Admin', 'vừa xóa bỏ hoàn toàn khóa học', c ? c.name : 'Khóa học')
      await fetchCourses()
      window.dispatchEvent(new Event('db_changed'))
    } catch (err) { alert('Lỗi: ' + err.message) }
  }
}
</script>