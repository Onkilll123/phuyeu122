<template>
  <div class="relative" ref="bellRef">
    <button @click="toggleNoti" class="relative p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 rounded-xl transition-all shadow-sm">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
      <span v-if="displayUnreadCount > 0" class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
        {{ displayUnreadCount }}
      </span>
    </button>

    <!-- Dropdown dùng fixed để không bị overflow clip -->
    <Teleport to="body">
      <div v-if="showNoti" class="fixed z-[9999]" :style="dropdownStyle">
        <!-- Overlay bắt click outside -->
        <div class="fixed inset-0" @click="showNoti = false"></div>
        
        <div class="relative w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span class="font-bold text-gray-800 text-sm">Lịch sử hệ thống</span>
            <button @click="clearAllNotifications" class="text-[11px] text-red-600 font-bold hover:underline">Xóa tất cả</button>
          </div>
          <div class="max-h-96 overflow-y-auto bg-white">
            <div v-for="n in displayNotifications" :key="n.id" :class="['p-4 border-b border-gray-50 flex items-start gap-3 transition-all relative group bg-white', n.read ? 'opacity-60' : 'bg-blue-50/20']">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm mt-0.5', getNotiIconClass(n.type)]">
                {{ getNotiIcon(n.type) }}
              </div>
              <div class="flex-1 pr-6">
                <p class="text-[13px] text-gray-700 leading-snug">
                  <span class="font-bold text-gray-900">{{ n.actor }}</span> {{ n.action }} <span class="font-bold text-indigo-600">{{ n.target }}</span>
                </p>
                <p class="text-[10px] text-gray-400 mt-1.5 font-medium">{{ n.time }}</p>
              </div>
              <button @click.stop="deleteNotification(n.id)" class="absolute right-3 top-4 text-gray-300 hover:text-red-500 p-1 rounded-md transition-colors text-xs opacity-0 group-hover:opacity-100">✕</button>
            </div>
            <div v-if="displayNotifications.length === 0" class="p-8 text-center text-xs text-gray-400 font-medium">Chưa có thông báo nào</div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useNotification } from '../composables/useNotification'

const props = defineProps({
  role: { type: String, default: 'admin' },
  teacherId: { type: String, default: null },
  teacherName: { type: String, default: null }
})

const bellRef = ref(null)
const showNoti = ref(false)
const dropdownStyle = ref({})

const { notifications, fetchNotifications, deleteNotification, clearAllNotifications, getNotiIcon, getNotiIconClass, markAllRead } = useNotification()

const displayNotifications = computed(() => {
  if (props.role === 'teacher') {
    return notifications.value.filter(n => {
      // Nếu có metadata teacherId khớp
      if (n.metadata && (n.metadata.teacherId === props.teacherId || n.metadata.teacherId === props.teacherName)) {
        return true;
      }
      // Fallback cho thông báo cũ không có metadata nhưng dành cho giảng viên
      if (!n.metadata?.teacherId) {
        return ['approve', 'reject'].includes(n.type) || 
               (n.type === 'edit' && n.action.includes('lớp')) ||
               (n.type === 'delete' && n.action.includes('lớp')) ||
               (n.type === 'add' && n.action.includes('xếp lịch'))
      }
      return false;
    })
  }
  return notifications.value
})

const displayUnreadCount = computed(() => displayNotifications.value.filter(n => !n.read).length)

const updateDropdownPosition = () => {
  if (!bellRef.value) return
  const rect = bellRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + 12}px`,
    right: `${window.innerWidth - rect.right}px`
  }
}

const toggleNoti = async () => {
  showNoti.value = !showNoti.value
  if (showNoti.value) {
    // Đánh dấu đã đọc tất cả thông báo hiển thị khi mở
    const unreadIds = displayNotifications.value.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length > 0) {
      notifications.value.forEach(n => {
        if (unreadIds.includes(n.id)) n.read = true
      })
      localStorage.setItem('edu_notifications', JSON.stringify(notifications.value))
      window.dispatchEvent(new Event('db_changed'))
    }
    
    await nextTick()
    updateDropdownPosition()
  }
}

const handleStorage = (e) => { if (e.key === 'edu_notifications') fetchNotifications() }

onMounted(() => {
  window.addEventListener('db_changed', fetchNotifications)
  window.addEventListener('storage', handleStorage)
})
onUnmounted(() => {
  window.removeEventListener('db_changed', fetchNotifications)
  window.removeEventListener('storage', handleStorage)
})
</script>