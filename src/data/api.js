// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED API SERVICE — N2 (Student) + N3 (Finance/Payment)
// ─────────────────────────────────────────────────────────────────────────────
import { courses } from './mockData.js'

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
    const res = await fetch(url, { ...options, headers })
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
      if (url.includes('/courses')) {
        // Map courses mock data format to N1 API expected format
        const mockCourses = courses.map(c => ({
          id: c.id, name: c.name, title: c.name, category: c.level, 
          tuitionFee: c.fee, totalLessons: c.weeks, status: 'Đang mở'
        }))
        return { data: mockCourses }
      }
      if (url.includes('/classes')) {
        const mockClasses = courses.map(c => ({
          id: c.id, courseId: c.id, classCode: c.code, teacherId: c.teacher,
          roomId: c.room, maxStudents: c.maxStudents, startDate: '2025-05-10', status: 'OPENED',
          startTime: c.time.split(' – ')[0], endTime: c.time.split(' – ')[1]
        }))
        return { data: mockClasses }
      }
      if (url.includes('/rooms')) {
        return { data: [
          { roomId: 1, roomName: 'Phòng 101' }, { roomId: 2, roomName: 'Phòng 102' },
          { roomId: 3, roomName: 'Lab 1' }, { roomId: 4, roomName: 'Lab 2' }
        ] }
      }
      if (url.includes('/schedule')) {
        const mockSchedules = courses.map(c => ({
          id: c.id, classId: c.id, dayOfWeek: 2, sessionOfDay: 'MORNING', 
          startTime: c.time.split(' – ')[0], endTime: c.time.split(' – ')[1]
        }))
        return { data: mockSchedules }
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
  getSchedule: ()             => apiFetch(`${N1_BASE}/schedule`),
  getScheduleByClass: (cid)   => apiFetch(`${N1_BASE}/schedule?classId=${cid}`),
  getScheduleByTeacher: (tid) => apiFetch(`${N1_BASE}/schedule?teacherId=${tid}`),
  getScheduleByStudent: (sid) => apiFetch(`${N1_BASE}/schedule?studentId=${sid}`),
  createSchedule: (data)      => apiFetch(`${N1_BASE}/schedule`, { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id, data)  => apiFetch(`${N1_BASE}/schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSchedule: (id)        => apiFetch(`${N1_BASE}/schedule/${id}`, { method: 'DELETE' }),

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

  // ── Scores / Grades ──
  getScores: (classId)           => apiFetch(`${N2_BASE}/scores?classId=${classId}`),
  saveScore: (data)              => apiFetch(`${N2_BASE}/scores`, { method: 'POST', body: JSON.stringify(data) }),
  updateScore: (id, data)        => apiFetch(`${N2_BASE}/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Leave Requests ──
  getLeaveRequests: ()           => apiFetch(`${N2_BASE}/leave-requests`),
  createLeaveRequest: (data)     => apiFetch(`${N2_BASE}/leave-requests`, { method: 'POST', body: JSON.stringify(data) }),
  approveLeave: (id)             => apiFetch(`${N2_BASE}/leave-requests/${id}/approve`, { method: 'PUT' }),
  rejectLeave: (id)              => apiFetch(`${N2_BASE}/leave-requests/${id}/reject`, { method: 'PUT' }),

  // ── Courses ──
  getCourses: ()                 => apiFetch(`${N2_BASE}/courses`),
  getCourse: (id)                => apiFetch(`${N2_BASE}/courses/${id}`),
  createCourse: (data)           => apiFetch(`${N2_BASE}/courses`, { method: 'POST', body: JSON.stringify(data) }),
}

// ═════════════════════════════════════════════════════════════════════════════
// N3 — Finance / Payment Service (http://180.93.36.113:5000)
// ═════════════════════════════════════════════════════════════════════════════

export const N3 = {
  // ── Auth ──
  login: (credentials) => apiFetch(`${N3_BASE}/auth/login`, { method: 'POST', body: JSON.stringify(credentials) }),

  // ── Invoices (Hóa đơn học phí / Phiếu thu) ──
  getInvoices: ()         => apiFetch(`${N3_BASE}/tuition`),
  getInvoice: (id)        => apiFetch(`${N3_BASE}/tuition/${id}`),
  createInvoice: (data)   => apiFetch(`${N3_BASE}/tuition`, { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id, data) => apiFetch(`${N3_BASE}/tuition/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvoice: (id)     => apiFetch(`${N3_BASE}/tuition/${id}`, { method: 'DELETE' }),

  // ── Payments / Receipts (Biên lai thanh toán) ──
  // GET  /api/payment/payments  — list payments
  getPayments: ()         => apiFetch(`${N3_BASE}/payment/payments`),
  getPayment: (id)        => apiFetch(`${N3_BASE}/payment/payments/${id}`),
  // POST /api/payment/payments  — Admin/Staff: record a payment against an invoice
  recordPayment: (data)   => apiFetch(`${N3_BASE}/payment/payments`, { method: 'POST', body: JSON.stringify(data) }),

  // ── Receipts (Phiếu thu chi tiết) ──
  getReceipts: ()         => apiFetch(`${N3_BASE}/receipts`),
  getReceipt: (id)        => apiFetch(`${N3_BASE}/receipts/${id}`),

  // ── Debts (Công nợ) ──
  getDebts: ()            => apiFetch(`${N3_BASE}/debt`),
  getDebt: (id)           => apiFetch(`${N3_BASE}/debt/${id}`),
  checkStudentPaymentStatus: (studentCode, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`${N3_BASE}/debt/status/${studentCode}${qs ? '?' + qs : ''}`)
  },

  // ── Reports (Báo cáo doanh thu) ──
  getDashboardStats: ()    => apiFetch(`${N3_BASE}/revenue`),
  getRevenueByCourse: ()   => apiFetch(`${N3_BASE}/revenue/by-course`),
  getRevenueByMonth: ()    => apiFetch(`${N3_BASE}/revenue/by-month`),
  getDebtSummary: ()       => apiFetch(`${N3_BASE}/debt/summary`),
  getTopDebtors: ()        => apiFetch(`${N3_BASE}/debt/top-debtors`),
  getPaymentStatusStats: ()=> apiFetch(`${N3_BASE}/tuition/status-stats`),
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
