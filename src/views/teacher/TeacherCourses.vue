<template>
  <div class="space-y-6 pb-10">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Khóa học & Đề xuất</h1>
        <p class="text-sm text-gray-500 mt-1">Xem danh sách các khóa học hiện có và đề xuất khóa học mới</p>
      </div>
      <button @click="openModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all flex items-center">
        <span class="mr-2 text-lg leading-none">+</span> Đề xuất khóa học
      </button>
    </div>

    <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50/50">
              <th class="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/3">Tên khóa học</th>
              <th class="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Trình độ</th>
              <th class="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Số buổi</th>
              <th class="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-sm text-gray-600">
            <tr v-for="course in courses" :key="course.id" class="hover:bg-indigo-50/30 transition-colors group">
              <td class="py-4 px-6 font-bold text-gray-900">
                {{ course.name }}
                <p class="text-[11px] font-normal text-gray-400 mt-1">{{ course.description }}</p>
              </td>
              <td class="py-4 px-6 font-medium">{{ course.level }}</td>
              <td class="py-4 px-6 font-medium">{{ course.sessions }}</td>
              <td class="py-4 px-6">
                <span :class="['flex items-center font-bold text-sm', getStatusClass(course.status)]">
                  <span :class="['w-1.5 h-1.5 rounded-full mr-2', getStatusDot(course.status)]"></span>
                  {{ course.status }}
                </span>
              </td>
            </tr>

            <tr v-if="courses.length === 0">
              <td colspan="4" class="py-12 text-center">
                <div class="flex flex-col items-center justify-center">
                  <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                  <p class="text-sm font-bold text-gray-500">Chưa có khóa học nào</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Đề xuất -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Đề xuất khóa học mới</h2>
            <p class="text-xs text-gray-500 mt-0.5">Yêu cầu sẽ được gửi tới Admin để phê duyệt</p>
          </div>
          <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form @submit.prevent="submitCourse" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Tên khóa học đề xuất</label>
            <input v-model="formData.name" type="text" placeholder="VD: Lập trình Python Cơ bản" required 
                   class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Trình độ</label>
              <select v-model="formData.level" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer">
                <option value="Sơ cấp">Sơ cấp</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Cao cấp">Cao cấp</option>
                <option value="Mọi trình độ">Mọi trình độ</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Số buổi</label>
              <input v-model="formData.sessions" type="number" min="1" placeholder="VD: 24" required 
                     class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Mô tả lý do đề xuất</label>
            <textarea v-model="formData.description" placeholder="Giải thích vì sao nên mở khóa học này..." rows="3"
                   class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"></textarea>
          </div>

          <div class="pt-5 flex justify-end space-x-3 border-t border-gray-100 mt-6">
            <button type="button" @click="closeModal" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              Hủy bỏ
            </button>
            <button type="submit" class="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md transition-colors">
              Gửi đề xuất
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const courses = ref([])

onMounted(() => {
  const dbCourses = localStorage.getItem('edu_courses')
  if (dbCourses) {
    courses.value = JSON.parse(dbCourses)
  }
})

const getStatusClass = (status) => {
  if (status === 'Đang mở') return 'text-emerald-600'
  if (status === 'Tạm đóng') return 'text-gray-400'
  return 'text-amber-500' // Chờ duyệt
}

const getStatusDot = (status) => {
  if (status === 'Đang mở') return 'bg-emerald-500'
  if (status === 'Tạm đóng') return 'bg-gray-400'
  return 'bg-amber-500' // Chờ duyệt
}

// LOGIC MODAL
const showModal = ref(false)
const formData = ref({
  name: '', level: 'Sơ cấp', sessions: '', fee: 0, status: 'Chờ duyệt', description: ''
})

const openModal = () => {
  formData.value = { name: '', level: 'Sơ cấp', sessions: '', fee: 0, status: 'Chờ duyệt', description: '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitCourse = () => {
  const newId = courses.value.length > 0 ? Math.max(...courses.value.map(c => c.id)) + 1 : 1
  courses.value.unshift({ id: newId, ...formData.value })
  
  localStorage.setItem('edu_courses', JSON.stringify(courses.value))
  
  alert('Đã gửi đề xuất khóa học tới Admin thành công!')
  closeModal()
}
</script>
