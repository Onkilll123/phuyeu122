import { ref, computed } from 'vue'

const notifications = ref(JSON.parse(localStorage.getItem('edu_notifications') || '[]'))

export function useNotification() {
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  const fetchNotifications = () => {
    notifications.value = JSON.parse(localStorage.getItem('edu_notifications') || '[]')
  }

  // Giảng viên hoặc Admin đều dùng chung hàm này để bắn thông báo
  const addNotification = (type, actor, action, target, metadata = {}) => {
    notifications.value.unshift({
      id: Date.now() + Math.random(),
      type,
      actor,
      action,
      target,
      metadata,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      read: false
    })
    localStorage.setItem('edu_notifications', JSON.stringify(notifications.value))
    window.dispatchEvent(new Event('db_changed'))
  }

  // Xóa 1 thông báo đơn lẻ
  const deleteNotification = (id) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
    localStorage.setItem('edu_notifications', JSON.stringify(notifications.value))
    window.dispatchEvent(new Event('db_changed'))
  }

  // Xóa sạch thông báo
  const clearAllNotifications = () => {
    notifications.value = []
    localStorage.setItem('edu_notifications', JSON.stringify([]))
    window.dispatchEvent(new Event('db_changed'))
  }

  const markAllRead = () => {
    notifications.value.forEach(n => n.read = true)
    localStorage.setItem('edu_notifications', JSON.stringify(notifications.value))
    window.dispatchEvent(new Event('db_changed'))
  }

  const getNotiIcon = (type) => {
    return { add: '📝', edit: '🔄', delete: '🗑️', approve: '✅', reject: '❌', pending: '⏳' }[type] || '🔔'
  }

  const getNotiIconClass = (type) => {
    return { 
      add: 'bg-blue-100 text-blue-600', 
      edit: 'bg-amber-100 text-amber-600', 
      delete: 'bg-red-100 text-red-600', 
      approve: 'bg-emerald-100 text-emerald-700', 
      reject: 'bg-gray-200 text-gray-600', 
      pending: 'bg-indigo-100 text-indigo-600' 
    }[type] || 'bg-blue-100 text-blue-600'
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    addNotification,
    deleteNotification,
    clearAllNotifications,
    markAllRead,
    getNotiIcon,
    getNotiIconClass
  }
}
