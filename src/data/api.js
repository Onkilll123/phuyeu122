// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED API SERVICE — N2 (Student) + N3 (Finance/Payment)
// ─────────────────────────────────────────────────────────────────────────────
import { courses, students, registrations, attendanceToday, scoresAdmin, leaveRequests, notifications } from './mockData.js'

// ── Base URLs ──
export const N1_BASE = 'http://180.93.36.113:8081/api' // N1: Courses & Classes
export const N2_BASE = 'http://172.16.68.127:5210/api' // N2: Students & Attendance
export const N3_BASE = 'http://180.93.36.113:5000/api'  // N3: Finance/Payment

// ── Auth token helpers ──
export function getToken() {
  return localStorage.getItem('auth_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJhZG1pbiIsInJvbGUiOiJBZG1pbiIsIkZ1bGxOYW1lIjoiTmd1eeG7hW4gVGjhur8gSHV5IEhvw6BuZyAoUXXhuqNuIHRy4buLIHZpw6puKSIsIlN0dWRlbnRDb2RlIjoiIiwiVGVhY2hlckNvZGUiOiIiLCJUZWFjaGVySWQiOiIiLCJuYmYiOjE3ODA4OTA5NzMsImV4cCI6MTc4MTQ5NTc3MywiaWF0IjoxNzgwODkwOTczLCJpc3MiOiJETlVGaW5hbmNlIiwiYXVkIjoiRE5VQXVkaWVuY2UifQ.1oxW77XWdw-8svsx6-CtUEoiv48vAwvA0Dy1PCN4Eh8'
}
export function setToken(token) {
  localStorage.setItem('auth_token', token)
}
export function clearToken() {
  localStorage.removeItem('auth_token')
}

// ── Base fetch wrapper ──
async function apiFetch(url, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 1500)
    
    const res = await fetch(url, { ...options, headers, signal: controller.signal })
    clearTimeout(id)
    
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(errBody?.message || `HTTP ${res.status}`)
    }
    if (res.status === 204) return null
    let data = await res.json()
    
    // Normalize array data wrapped by .NET backend
    if (data && data.$values !== undefined) {
      data = data.$values;
    } else if (data && data.value !== undefined && Array.isArray(data.value)) {
      data = data.value;
    }
    
    // To match legacy axios behavior where the payload was wrapped in `.data` 
    // when we returned from our methods, we wrap it in an object.
    return { data }
  } catch (err) {
    console.warn(`[API WARNING] ${url} failed, using fallback data. Error: ${err.message}`)
    
    // Fallback logic for N1 API when server is down
    if (url.includes(N1_BASE)) {
        if (url.includes('/courses') && !url.includes('/course-info')) {
          let storedCourses = JSON.parse(localStorage.getItem('mockCourses') || 'null')
          if (!storedCourses) {
            storedCourses = courses.map(c => ({
              id: c.id,
              name: c.name,
              level: c.level || 'Sơ cấp',
              sessions: c.sessions || 12,
              fee: c.fee || 1000000,
              description: c.description || 'Khóa học tiêu chuẩn'
            }))
            localStorage.setItem('mockCourses', JSON.stringify(storedCourses))
          }

          if (options.method === 'POST') {
            const body = JSON.parse(options.body)
            const newCourse = { ...body, id: body.id || Date.now() }
            storedCourses.push(newCourse)
            localStorage.setItem('mockCourses', JSON.stringify(storedCourses))
            return { data: newCourse }
          }

          if (options.method === 'PUT') {
            const id = url.split('/').pop()
            const index = storedCourses.findIndex(c => c.id == id)
            if (index > -1) {
              storedCourses[index] = { ...storedCourses[index], ...JSON.parse(options.body) }
              localStorage.setItem('mockCourses', JSON.stringify(storedCourses))
              return { data: storedCourses[index] }
            }
          }

          if (options.method === 'DELETE') {
            const id = url.split('/').pop()
            storedCourses = storedCourses.filter(c => c.id != id)
            localStorage.setItem('mockCourses', JSON.stringify(storedCourses))
            return { data: { success: true } }
          }

          return { data: storedCourses }
        }

        if (url.includes('/course-info')) {
        // Create a mock list combining classes and schedules
        const mockInfo = courses.map(c => {
          const parts = c.time ? c.time.split(/[-–]/).map(t => t.trim()) : ['07:30', '09:00']
          return {
            classCode: c.code,
            courseName: c.name,
            room: c.room || 1,
            dayOfWeek: 2, // Monday
            startTime: parts[0] || '07:30',
            endTime: parts[1] || '09:00',
            session: 'MORNING'
          }
        })
        // duplicate to multiple days to make schedule look full
        const duplicate = mockInfo.map(i => ({ ...i, dayOfWeek: 4 })) // Wed
        return { data: [...mockInfo, ...duplicate] }
      }
      if (url.includes('/classes')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
        const now = new Date()
        const startMonth = String(now.getMonth() + 1).padStart(2, '0') // current month
        const mockClasses = courses.map((c, index) => {
          const parts = c.time ? c.time.split(/[-–]/).map(t => t.trim()) : ['07:30', '09:00']
          return {
            id: c.id, courseId: c.id, classCode: c.code, 
            teacherId: index % 2 === 0 ? (currentUser.id || currentUser.name || c.teacher) : c.teacher,
            roomId: c.room, maxStudents: c.maxStudents, startDate: `${now.getFullYear()}-${startMonth}-01`, status: 'OPENED',
            startTime: parts[0] || '07:30', endTime: parts[1] || '09:00'
          }
        })
        return { data: mockClasses }
      }
      if (url.includes('/rooms')) {
        return { data: [
          { roomId: 1, roomName: 'Phòng 101' }, { roomId: 2, roomName: 'Phòng 102' },
          { roomId: 3, roomName: 'Lab 1' }, { roomId: 4, roomName: 'Lab 2' }
        ] }
      }
      if (url.includes('/schedules')) {
        const mockSchedules = courses.map(c => {
          const parts = c.time ? c.time.split(/[-–]/).map(t => t.trim()) : ['07:30', '09:00']
          return {
            id: c.id, classId: c.id, classCode: c.code, courseName: c.name, dayOfWeek: 2, sessionOfDay: 'MORNING', 
            startTime: parts[0] || '07:30', endTime: parts[1] || '09:00'
          }
        })
        // add Wednesday duplicates
        const duplicate = mockSchedules.map(s => ({ ...s, dayOfWeek: 4, id: s.id + 100 }))
        return { data: [...mockSchedules, ...duplicate] }
      }
    }
    
    // Fallback logic for N2 API when server is down
    if (url.includes(N2_BASE)) {
      if (url.includes('/students')) {
        return { data: students.map(s => ({...s, id: s.id, courseId: 1, enrollDate: '01/01/2026', attendance: 100, feeStatus: 'Đã hoàn thành', status: 'Đang học'})) }
      }
      if (url.includes('/registrations')) {
        let storedRegs = JSON.parse(localStorage.getItem('mockRegistrations') || 'null')
        if (!storedRegs) { storedRegs = registrations; localStorage.setItem('mockRegistrations', JSON.stringify(storedRegs)) }

        if (options.method === 'POST') {
          const body = JSON.parse(options.body)
          const newReg = { ...body, id: Date.now(), status: 'Chờ duyệt', registerDate: new Date().toLocaleDateString('vi-VN'), studentName: 'Nguyễn Văn An', studentCode: 'HV-0312', phone: '0901234567' }
          storedRegs.unshift(newReg)
          localStorage.setItem('mockRegistrations', JSON.stringify(storedRegs))
          return { data: newReg }
        }

        if (options.method === 'PUT') {
          const id = url.split('/').slice(-2)[0]
          const isApprove = url.endsWith('/approve')
          const reqIndex = storedRegs.findIndex(r => r.id == id)
          if (reqIndex > -1) {
            storedRegs[reqIndex].status = isApprove ? 'Đã duyệt' : 'Đã hủy'
            localStorage.setItem('mockRegistrations', JSON.stringify(storedRegs))
            
            // Notification injection
            let storedNots = JSON.parse(localStorage.getItem('mockNotifications') || 'null')
            if (!storedNots) storedNots = notifications || []
            storedNots.unshift({
                text: `Đơn đăng ký khóa học ${storedRegs[reqIndex].course} đã ${isApprove ? 'được duyệt' : 'bị từ chối'}`,
                from: 'Hệ thống · Vừa xong',
                type: 'system'
            })
            localStorage.setItem('mockNotifications', JSON.stringify(storedNots))

            return { data: storedRegs[reqIndex] }
          }
        }
        
        return { data: storedRegs }
      }
      if (url.includes('/attendance')) {
        return { data: attendanceToday }
      }
      if (url.includes('/scores')) {
        return { data: scoresAdmin }
      }
      if (url.includes('/leave-requests')) {
        let stored = JSON.parse(localStorage.getItem('mockLeaveRequests') || 'null')
        if (!stored) {
          stored = leaveRequests // Initial mock data
          localStorage.setItem('mockLeaveRequests', JSON.stringify(stored))
        }

        if (options.method === 'POST') {
          const body = JSON.parse(options.body)
          const newReq = { ...body, id: Date.now(), status: 'Chờ duyệt', dateSubmitted: new Date().toLocaleDateString('vi-VN'), studentName: 'Nguyễn Văn An', code: 'HV-0312', class: 'Lập trình Java Web & Spring Boot' }
          stored.unshift(newReq)
          localStorage.setItem('mockLeaveRequests', JSON.stringify(stored))
          return { data: newReq }
        }
        
        if (options.method === 'PUT') {
          const id = url.split('/').slice(-2)[0]
          const isApprove = url.endsWith('/approve')
          const reqIndex = stored.findIndex(r => r.id == id)
          if (reqIndex > -1) {
            stored[reqIndex].status = isApprove ? 'Đã duyệt' : 'Từ chối'
            if (!isApprove && options.body) {
                stored[reqIndex].reply = JSON.parse(options.body).reason || 'Không hợp lệ'
            }
            localStorage.setItem('mockLeaveRequests', JSON.stringify(stored))
            
            // Notification injection
            let storedNots = JSON.parse(localStorage.getItem('mockNotifications') || 'null')
            if (!storedNots) storedNots = notifications || []
            storedNots.unshift({
                text: `Đơn xin nghỉ ngày ${stored[reqIndex].date} đã ${isApprove ? 'được duyệt' : 'bị từ chối'}`,
                from: 'Hệ thống · Vừa xong',
                type: 'system'
            })
            localStorage.setItem('mockNotifications', JSON.stringify(storedNots))

            return { data: stored[reqIndex] }
          }
        }
        
        if (options.method === 'DELETE') {
          const id = url.split('/').pop()
          stored = stored.filter(r => r.id != id)
          localStorage.setItem('mockLeaveRequests', JSON.stringify(stored))
          return { data: { success: true } }
        }

        return { data: stored }
      }
      
      if (url.includes('/notifications')) {
        let storedNots = JSON.parse(localStorage.getItem('mockNotifications') || 'null')
        if (!storedNots) {
          storedNots = notifications // Initial mock data
          localStorage.setItem('mockNotifications', JSON.stringify(storedNots))
        }
        return { data: storedNots }
      }
    }
    
    throw err
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// N1 — Course & Class Management Service (http://180.93.36.113:8081)
// ═════════════════════════════════════════════════════════════════════════════

export const N1 = {
  // ── Courses (Khóa học) ──
  getCourses: ()              => apiFetch(`${N1_BASE}/courses`),
  getCourse: (id)             => apiFetch(`${N1_BASE}/courses/${id}`),
  createCourse: (data)        => apiFetch(`${N1_BASE}/courses`, { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id, data)    => apiFetch(`${N1_BASE}/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id)          => apiFetch(`${N1_BASE}/courses/${id}`, { method: 'DELETE' }),

  getCourseInfo: ()           => apiFetch(`${N1_BASE}/course-info`),

  // ── Rooms (Phòng học) ──
  getRooms: ()                => apiFetch(`${N1_BASE}/rooms`),

  // ── Classes (Lớp học) ──
  getClasses: ()              => apiFetch(`${N1_BASE}/classes`),
  getClass: (id)              => apiFetch(`${N1_BASE}/classes/${id}`),
  createClass: (data)         => apiFetch(`${N1_BASE}/classes`, { method: 'POST', body: JSON.stringify(data) }),
  updateClass: (id, data)     => apiFetch(`${N1_BASE}/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClass: (id)           => apiFetch(`${N1_BASE}/classes/${id}`, { method: 'DELETE' }),
  // Get classes by teacher (used in Teacher dashboard)
  getClassesByTeacher: (tid)  => apiFetch(`${N1_BASE}/classes?teacherId=${tid}`),
  // Get classes by student (used in Student dashboard)
  getClassesByStudent: (sid)  => apiFetch(`${N1_BASE}/classes?studentId=${sid}`),

  // ── Teachers (Giáo viên) — N1 manages teacher profiles ──
  getTeachers: ()             => apiFetch(`${N1_BASE}/teachers`),
  getTeacher: (id)            => apiFetch(`${N1_BASE}/teachers/${id}`),

  // ── Schedule (Lịch học) ──
  getSchedules: ()            => apiFetch(`${N1_BASE}/schedules`),
  getSchedule: ()             => apiFetch(`${N1_BASE}/schedules`),
  getScheduleByClass: (cid)   => apiFetch(`${N1_BASE}/schedules?classId=${cid}`),
  getScheduleByTeacher: (tid) => apiFetch(`${N1_BASE}/schedules?teacherId=${tid}`),
  getScheduleByStudent: (sid) => apiFetch(`${N1_BASE}/schedules?studentId=${sid}`),
  createSchedule: (data)      => apiFetch(`${N1_BASE}/schedules`, { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id, data)  => apiFetch(`${N1_BASE}/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSchedule: (id)        => apiFetch(`${N1_BASE}/schedules/${id}`, { method: 'DELETE' }),

  // ── Reschedule Requests (Mock) ──
  getRescheduleRequests: async () => {
    const requests = JSON.parse(localStorage.getItem('rescheduleRequests') || '[]')
    return { data: requests }
  },
  createRescheduleRequest: async (data) => {
    const requests = JSON.parse(localStorage.getItem('rescheduleRequests') || '[]')
    const newRequest = { ...data, id: Date.now().toString(), status: 'PENDING', createdAt: new Date().toISOString() }
    requests.push(newRequest)
    localStorage.setItem('rescheduleRequests', JSON.stringify(requests))
    return { data: newRequest }
  },
  updateRescheduleRequestStatus: async (id, status) => {
    const requests = JSON.parse(localStorage.getItem('rescheduleRequests') || '[]')
    const index = requests.findIndex(r => r.id === id)
    if (index !== -1) {
      requests[index].status = status
      localStorage.setItem('rescheduleRequests', JSON.stringify(requests))
      return { data: requests[index] }
    }
    throw new Error('Request not found')
  },

  // ── Curriculum (Giáo trình) ──
  getCurriculum: (courseId)   => apiFetch(`${N1_BASE}/curriculum?courseId=${courseId}`),
}

// ═════════════════════════════════════════════════════════════════════════════
// N2 — Student & Attendance Service (http://172.16.68.127:5210)
// ═════════════════════════════════════════════════════════════════════════════

export const N2 = {
  // ── Students ──
  getStudents: ()                => apiFetch(`${N2_BASE}/students`),
  getStudent: (id)               => apiFetch(`${N2_BASE}/students/${id}`),
  createStudent: (data)          => apiFetch(`${N2_BASE}/students`, { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data)      => apiFetch(`${N2_BASE}/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id)            => apiFetch(`${N2_BASE}/students/${id}`, { method: 'DELETE' }),

  // ── Registrations ──
  getRegistrations: ()           => apiFetch(`${N2_BASE}/registrations`),
  createRegistration: (data)     => apiFetch(`${N2_BASE}/registrations`, { method: 'POST', body: JSON.stringify(data) }),
  approveRegistration: (id)      => apiFetch(`${N2_BASE}/registrations/${id}/approve`, { method: 'PUT' }),
  rejectRegistration: (id)       => apiFetch(`${N2_BASE}/registrations/${id}/reject`, { method: 'PUT' }),

  // ── Attendance ──
  getAttendance: (classId, date) => apiFetch(`${N2_BASE}/attendance?classId=${classId}&date=${date}`),
  saveAttendance: (data)         => apiFetch(`${N2_BASE}/attendance`, { method: 'POST', body: JSON.stringify(data) }),
  getAttendanceStats: (studentId)=> apiFetch(`${N2_BASE}/attendance/stats/${studentId}`),
  getNotifications: ()           => apiFetch(`${N2_BASE}/notifications`),

  // ── Scores / Grades ──
  getScores: (classId)           => apiFetch(`${N2_BASE}/scores?classId=${classId}`),
  saveScore: (data)              => apiFetch(`${N2_BASE}/scores`, { method: 'POST', body: JSON.stringify(data) }),
  updateScore: (id, data)        => apiFetch(`${N2_BASE}/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Leave Requests ──
  getLeaveRequests: ()           => apiFetch(`${N2_BASE}/leave-requests`),
  createLeaveRequest: (data)     => apiFetch(`${N2_BASE}/leave-requests`, { method: 'POST', body: JSON.stringify(data) }),
  approveLeave: (id)             => apiFetch(`${N2_BASE}/leave-requests/${id}/approve`, { method: 'PUT' }),
  rejectLeave: (id, data)        => apiFetch(`${N2_BASE}/leave-requests/${id}/reject`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLeaveRequest: (id)       => apiFetch(`${N2_BASE}/leave-requests/${id}`, { method: 'DELETE' }),

}

// ═════════════════════════════════════════════════════════════════════════════
// N3 — Finance / Payment Service (http://180.93.36.113:5000)
// ═════════════════════════════════════════════════════════════════════════════

export const N3 = {
  // ── Auth ──
  login: (credentials) => apiFetch(`${N3_BASE}/auth/login`, { method: 'POST', body: JSON.stringify(credentials) }),

  // ── Invoices (Hóa đơn học phí) ──
  getInvoices: ()         => apiFetch(`${N3_BASE}/invoices`),
  getInvoice: (id)        => apiFetch(`${N3_BASE}/invoices/${id}`),
  createInvoice: (data)   => apiFetch(`${N3_BASE}/invoices`, { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id, data) => apiFetch(`${N3_BASE}/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvoice: (id)     => apiFetch(`${N3_BASE}/invoices/${id}`, { method: 'DELETE' }),

  // ── Payments (Giao dịch) ──
  getPayments: ()         => apiFetch(`${N3_BASE}/payments`),
  getPayment: (id)        => apiFetch(`${N3_BASE}/payments/${id}`),
  recordPayment: (data)   => apiFetch(`${N3_BASE}/payment/payments`, { method: 'POST', body: JSON.stringify(data) }),

  // ── Receipts (Biên lai) ──
  getReceipts: ()         => apiFetch(`${N3_BASE}/receipts`),
  getReceipt: (id)        => apiFetch(`${N3_BASE}/receipts/${id}`),

  // ── Debts (Công nợ) ──
  getDebts: ()            => apiFetch(`${N3_BASE}/debts`),
  getDebt: (id)           => apiFetch(`${N3_BASE}/debts/${id}`),
  checkStudentPaymentStatus: (studentCode, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`${N3_BASE}/debts/status/${studentCode}${qs ? '?' + qs : ''}`)
  },

  // ── Reports ──
  getDashboardStats: ()    => apiFetch(`${N3_BASE}/reports/dashboard`),
  getRevenueByCourse: ()   => apiFetch(`${N3_BASE}/reports/revenue-by-course`),
  getRevenueByMonth: ()    => apiFetch(`${N3_BASE}/reports/revenue-by-month`),
  getDebtSummary: ()       => apiFetch(`${N3_BASE}/reports/debt-summary`),
  getTopDebtors: ()        => apiFetch(`${N3_BASE}/reports/top-debtors`),
  getPaymentStatusStats: ()=> apiFetch(`${N3_BASE}/reports/payment-status`),
}

// ── Utility: format VND ──
export function formatVND(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

// ── Utility: invoice status display ──
export function invoiceStatusLabel(status) {
  const map = { Paid: 'Đã thanh toán', PartiallyPaid: 'Trả một phần', Unpaid: 'Chưa thanh toán' }
  return map[status] || status
}
export function invoiceStatusClass(status) {
  const map = { Paid: 'badge-green', PartiallyPaid: 'badge-yellow', Unpaid: 'badge-red' }
  return map[status] || 'badge-gray'
}
