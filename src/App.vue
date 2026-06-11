<script setup>
import { ref, computed, onMounted } from 'vue'
import NotificationBell from './views/composables/NotificationBell.vue'
import Login from './views/Login.vue'

// Pages - Admin (N1: CourseList, ClassList, Schedule, RoomList | N2: Students, Attendance, Scores | N3: Tuition, Debt, Revenue)
import AdminDashboard from './views/admin/Dashboard.vue'
import AdminCourseList from './views/admin/CourseList.vue'
import AdminClassList from './views/admin/ClassList.vue'
import AdminSchedule from './views/admin/Schedule.vue'
import AdminRoomList from './views/admin/RoomList.vue'
import AdminStudentList from './views/admin/StudentList.vue'
import AdminRegistration from './views/admin/Registration.vue'
import AdminAttendance from './views/admin/Attendance.vue'
import AdminScores from './views/admin/Scores.vue'
import AdminTuition from './views/admin/Tuition.vue'
import AdminDebt from './views/admin/Debt.vue'
import AdminRevenue from './views/admin/Revenue.vue'
import AdminAPIHealth from './views/admin/APIHealth.vue'
// Pages - Teacher (N1: TeacherClasses, TeacherSchedule, TeacherCourses | N2: Attendance, Scores)
import TeacherDashboard from './views/teacher/Dashboard.vue'
import TeacherClasses from './views/teacher/TeacherClasses.vue'
import TeacherAttendance from './views/teacher/Attendance.vue'
import TeacherScores from './views/teacher/Scores.vue'
import TeacherSchedule from './views/teacher/TeacherSchedule.vue'
import TeacherCurriculum from './views/teacher/TeacherCourses.vue'
import TeacherLeave from './views/teacher/LeaveRequests.vue'
import TeacherStudentList from './views/teacher/StudentList.vue'
// Pages - Student (N1: StudentSchedule, ClassInfo | N2: AttStats, Overview | N3: MyTuition)
import StudentOverview from './views/student/Overview.vue'
import StudentClassInfo from './views/student/ClassInfo.vue'
import StudentAttStats from './views/student/AttendanceStats.vue'
import StudentTeacher from './views/student/TeacherProfile.vue'
import StudentCurriculum from './views/student/Curriculum.vue'
import StudentSchedule from './views/student/StudentSchedule.vue'
import StudentLeave from './views/student/LeaveRequest.vue'
import StudentRules from './views/student/Rules.vue'
import StudentRegistration from './views/student/CourseRegistration.vue'
import StudentMyTuition from './views/student/MyTuition.vue'

const isAuthenticated = ref(false)
const role = ref('')
const authUsername = ref('')
const page = ref('dashboard')

onMounted(() => {
  const savedRole = localStorage.getItem('auth_role')
  if (savedRole) {
    isAuthenticated.value = true
    role.value = savedRole
    authUsername.value = localStorage.getItem('auth_username') || ''
    page.value = defaultPages[savedRole] || 'dashboard'
  }
})

const pageMap = {
  admin: {
    dashboard: AdminDashboard,
    // N1: Khóa học & Lịch học
    courseList: AdminCourseList, classList: AdminClassList,
    schedule: AdminSchedule, roomList: AdminRoomList,
    // N2: Học viên & Điểm danh
    studentList: AdminStudentList, registration: AdminRegistration,
    attendance: AdminAttendance, scores: AdminScores,
    // N3: Tài chính
    tuition: AdminTuition, debt: AdminDebt, revenue: AdminRevenue,
    // Hệ thống
    apiHealth: AdminAPIHealth
  },
  teacher: {
    dashboard: TeacherDashboard,
    // N1: Lớp học & Lịch
    myClasses: TeacherClasses, schedule: TeacherSchedule, curriculum: TeacherCurriculum,
    // N2: Điểm danh & Điểm
    attendance: TeacherAttendance, scores: TeacherScores,
    leave: TeacherLeave, studentList: TeacherStudentList
  },
  student: {
    overview: StudentOverview,
    // N1: Thông tin lớp & Lịch
    classInfo: StudentClassInfo, schedule: StudentSchedule, curriculum: StudentCurriculum,
    // N2: Điểm danh & Giáo viên
    attStats: StudentAttStats, teacherProfile: StudentTeacher,
    leave: StudentLeave, rules: StudentRules,
    // Đăng ký & Tài chính
    registration: StudentRegistration, myTuition: StudentMyTuition
  }
}

const currentPage = computed(() => {
  const m = pageMap[role.value]
  return m[page.value] || Object.values(m)[0]
})

const adminMenu = [
  { group:'TỔNG QUAN', items:[{key:'dashboard',icon:'⊞',label:'Dashboard'}] },
  { group:'N1 · KHÓA HỌC & LỊCH', items:[
    {key:'courseList',icon:'📘',label:'Danh sách khóa học'},
    {key:'classList',icon:'🏫',label:'Lớp học'},
    {key:'schedule',icon:'📅',label:'Lịch học'},
    {key:'roomList',icon:'🚪',label:'Phòng học'}
  ]},
  { group:'N2 · HỌC VIÊN', items:[
    {key:'studentList',icon:'👤',label:'Danh sách học viên'},
    {key:'registration',icon:'📝',label:'Đăng ký khóa học',badge:3},
    {key:'attendance',icon:'✓',label:'Điểm danh'},
    {key:'scores',icon:'📊',label:'Kết quả học tập'}
  ]},
  { group:'N3 · TÀI CHÍNH', items:[
    {key:'tuition',icon:'💳',label:'Thu học phí',badge:5},
    {key:'debt',icon:'⏰',label:'Công nợ'},
    {key:'revenue',icon:'📈',label:'Báo cáo doanh thu'}
  ]},
  { group:'HỆ THỐNG', items:[
    {key:'apiHealth',icon:'🔬',label:'Kiểm tra API N1/N2/N3'}
  ]}
]

const teacherMenu = [
  { group:'TỔNG QUAN', items:[{key:'dashboard',icon:'⊞',label:'Dashboard'}] },
  { group:'N1 · LỚP & LỊCH HỌC', items:[
    {key:'myClasses',icon:'📚',label:'Lớp học của tôi'},
    {key:'schedule',icon:'📅',label:'Thời khoá biểu'},
    {key:'curriculum',icon:'📖',label:'Khóa học của tôi'}
  ]},
  { group:'N2 · QUẢN LÝ LỚP', items:[
    {key:'attendance',icon:'✓',label:'Điểm danh',tagText:'Hôm nay'},
    {key:'scores',icon:'⭐',label:'Nhập điểm'},
    {key:'leave',icon:'📋',label:'Đơn xin nghỉ',badge:2}
  ]},
  { group:'KHÁC', items:[{key:'studentList',icon:'👥',label:'Danh sách học viên'}] }
]

const studentMenu = [
  { group:'N1 · THÔNG TIN LỚP & LỊCH', items:[
    {key:'overview',icon:'⊞',label:'Tổng quan'},
    {key:'classInfo',icon:'📚',label:'Thông tin lớp học'},
    {key:'schedule',icon:'📅',label:'Thời khoá biểu'},
    {key:'curriculum',icon:'📖',label:'Giáo trình'}
  ]},
  { group:'N2 · HỌC TẬP', items:[
    {key:'attStats',icon:'📊',label:'Thống kê điểm danh'},
    {key:'teacherProfile',icon:'👤',label:'Giáo viên lớp'},
    {key:'leave',icon:'✈',label:'Xin nghỉ phép'},
    {key:'rules',icon:'📋',label:'Nội quy'},
    {key:'registration',icon:'🛒',label:'Đăng ký khóa học',badge:'New'}
  ]},
  { group:'N3 · TÀI CHÍNH', items:[
    {key:'myTuition',icon:'💳',label:'Học phí của tôi'}
  ]}
]

const menus = { admin: adminMenu, teacher: teacherMenu, student: studentMenu }
const currentMenu = computed(() => menus[role.value])
const defaultPages = { admin:'dashboard', teacher:'dashboard', student:'overview' }

function onLoginSuccess(r) {
  role.value = r
  isAuthenticated.value = true
  page.value = defaultPages[r]
  authUsername.value = localStorage.getItem('auth_username') || ''
}

function logout() {
  localStorage.removeItem('auth_role')
  localStorage.removeItem('auth_username')
  isAuthenticated.value = false
  role.value = ''
  authUsername.value = ''
}

const brandName = computed(() => role.value === 'admin' ? 'EduCore' : 'EduHub')
const roleLabel = computed(() => ({ admin:'', teacher:'Giáo viên', student:'Học viên' }[role.value]))
const accentClass = computed(() => `role-${role.value}`)
</script>

<template>
<Login v-if="!isAuthenticated" @login-success="onLoginSuccess" />
<div v-else class="app-layout" :class="accentClass">
  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">📘</div>
      <div>
        <div class="brand-name">{{ brandName }}</div>
        <span v-if="roleLabel" class="role-badge">{{ roleLabel }}</span>
        <span v-else class="pro-badge">Pro</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div v-for="section in currentMenu" :key="section.group" class="nav-section">
        <div v-if="section.group" class="nav-group-label">{{ section.group }}</div>
        <button v-for="item in section.items" :key="item.key"
          class="nav-item" :class="{active: page === item.key}"
          @click="page = item.key">
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.tagText" class="nav-tag">{{ item.tagText }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">{{ role === 'admin' ? 'AD' : role === 'teacher' ? 'T' : 'VA' }}</div>
        <div>
          <div class="user-name">{{ role === 'admin' ? 'Quản trị viên' : role === 'teacher' ? 'Nguyễn Thị Lan' : 'Nguyễn Văn An' }}</div>
          <div class="user-role">{{ role === 'admin' ? 'ADMIN' : role === 'teacher' ? 'Giáo viên Tiếng Anh' : 'HV-0312 · TOEIC 600+' }}</div>
        </div>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main-content">
    <header class="topbar">
      <div class="topbar-left">
        <div class="breadcrumb-icon">{{ role === 'admin' ? '⊞' : role === 'teacher' ? '📚' : '🎓' }}</div>
        <div class="breadcrumb-info">
          <div class="breadcrumb-main">{{ currentMenu.flatMap(s=>s.items).find(i=>i.key===page)?.label || 'Dashboard' }}</div>
          <div class="breadcrumb-sub">{{ brandName }}</div>
        </div>
      </div>
      <div class="topbar-right">
        <button v-if="role==='student'" class="topbar-btn topbar-btn-leave" @click="page='leave'">✈ Xin nghỉ</button>
        <!-- Real Notification Bell -->
        <NotificationBell :role="role" />
        <!-- Logout Button -->
        <button class="topbar-btn btn-logout" @click="logout">Đăng xuất</button>
      </div>
    </header>
    <div class="page-content">
      <component :is="currentPage" @navigate="p => page = p" />
    </div>
  </main>
</div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8fafc;color:#334155}

.app-layout{display:flex;min-height:100vh}

/* SIDEBAR */
.sidebar{width:260px;background:#fff;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.sidebar-brand{display:flex;align-items:center;gap:10px;padding:20px;border-bottom:1px solid #f1f5f9}
.brand-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px}
.role-admin .brand-icon{background:#2563eb;color:#fff}
.role-teacher .brand-icon{background:#7c3aed;color:#fff}
.role-student .brand-icon{background:#0d9488;color:#fff}
.brand-name{font-weight:700;font-size:18px;color:#0f172a}
.pro-badge{font-size:10px;background:#e0e7ff;color:#4338ca;padding:2px 6px;border-radius:4px;font-weight:600}
.role-badge{font-size:10px;padding:2px 8px;border-radius:4px;font-weight:600}
.role-teacher .role-badge{background:#ede9fe;color:#7c3aed}
.role-student .role-badge{background:#ccfbf1;color:#0d9488}

.sidebar-nav{flex:1;overflow-y:auto;padding:8px 0}
.nav-group-label{font-size:11px;font-weight:600;color:#94a3b8;padding:16px 20px 6px;text-transform:uppercase;letter-spacing:0.5px}
.nav-item{display:flex;align-items:center;gap:10px;width:100%;border:none;background:none;padding:10px 20px;cursor:pointer;font-size:14px;color:#64748b;text-align:left;transition:all .15s;border-left:3px solid transparent}
.nav-item:hover{background:#f8fafc;color:#334155}
.nav-item.active{color:#0f172a;font-weight:600;background:#f0f5ff}
.role-admin .nav-item.active{border-left-color:#2563eb;color:#2563eb;background:#eff6ff}
.role-teacher .nav-item.active{border-left-color:#7c3aed;color:#7c3aed;background:#f5f3ff}
.role-student .nav-item.active{border-left-color:#0d9488;color:#0d9488;background:#f0fdfa}
.nav-icon{font-size:16px;width:20px;text-align:center}
.nav-label{flex:1}
.nav-badge{font-size:11px;font-weight:600;color:#fff;padding:2px 8px;border-radius:10px}
.role-admin .nav-badge{background:#2563eb}
.role-teacher .nav-badge{background:#7c3aed}
.role-student .nav-badge{background:#0d9488}
.nav-tag{font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600}
.role-teacher .nav-tag{background:#fef3c7;color:#d97706}
.role-admin .nav-tag{background:#fef3c7;color:#d97706}

.sidebar-footer{border-top:1px solid #f1f5f9;padding:12px 16px}
.user-role{font-size:12px;color:#94a3b8;margin-top:2px;max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-info{display:flex;align-items:center;gap:10px;padding:8px 0}
.user-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff}
.role-admin .user-avatar{background:#2563eb}
.role-teacher .user-avatar{background:#7c3aed}
.role-student .user-avatar{background:#0d9488}
.user-name{font-weight:600;font-size:13px;color:#0f172a}

/* TOPBAR */
.main-content{margin-left:260px;flex:1;display:flex;flex-direction:column;min-height:100vh}
.topbar{display:flex;justify-content:space-between;align-items:center;padding:10px 28px;background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:50;gap:16px}
.topbar-left{display:flex;align-items:center;gap:12px}
.breadcrumb-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.role-admin .breadcrumb-icon{background:#eff6ff}
.role-teacher .breadcrumb-icon{background:#f5f3ff}
.role-student .breadcrumb-icon{background:#f0fdfa}
.breadcrumb-main{font-size:15px;font-weight:700;color:#0f172a;line-height:1.2}
.breadcrumb-sub{font-size:11px;color:#94a3b8;font-weight:500}
.topbar-right{display:flex;align-items:center;gap:10px;margin-left:auto}
.topbar-btn-leave{background:#fee2e2;color:#b91c1c;border:none;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s;white-space:nowrap}
.topbar-btn-leave:hover{background:#fecaca}
.btn-logout{background:#f1f5f9;color:#64748b;font-weight:600;border:1px solid #e2e8f0;padding:8px 14px;border-radius:8px;cursor:pointer}
.btn-logout:hover{background:#fee2e2;color:#ef4444;border-color:#fecaca}

/* PAGE */
.page-content{padding:24px 32px;flex:1;overflow-y:auto;background:#f8fafc}

/* SHARED */
.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-bottom:20px}
.card-title{font-size:16px;font-weight:700;color:#0f172a;margin-bottom:4px}
.card-subtitle{font-size:13px;color:#94a3b8}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
.page-title{font-size:22px;font-weight:700;color:#0f172a}
.page-desc{font-size:13px;color:#94a3b8;margin-top:4px}
.btn-actions{display:flex;gap:10px}

.btn-primary{padding:10px 20px;border-radius:8px;border:none;font-weight:500;font-size:13px;cursor:pointer;color:#fff;transition:.15s}
.role-admin .btn-primary{background:#2563eb}
.role-teacher .btn-primary{background:#7c3aed}
.role-student .btn-primary{background:#0d9488}
.btn-outline{padding:10px 20px;border-radius:8px;background:#fff;border:1px solid #cbd5e1;font-weight:500;font-size:13px;cursor:pointer;color:#334155}

table.data-table{width:100%;border-collapse:collapse}
table.data-table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #e2e8f0;letter-spacing:.5px}
table.data-table td{padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:middle;font-size:14px}

.avatar{width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;flex-shrink:0}
.avatar.blue{background:#3b82f6}.avatar.green{background:#10b981}.avatar.purple{background:#8b5cf6}
.avatar.orange{background:#f59e0b}.avatar.red{background:#ef4444}.avatar.teal{background:#0d9488}
.user-cell{display:flex;align-items:center;gap:10px}
.user-cell .name{font-weight:600;color:#0f172a;font-size:14px}
.user-cell .code{font-size:12px;color:#94a3b8}

.badge{padding:4px 10px;border-radius:16px;font-size:11px;font-weight:600;white-space:nowrap}
.badge-green{background:#dcfce7;color:#166534}
.badge-yellow{background:#fef9c3;color:#854d0e}
.badge-red{background:#fee2e2;color:#991b1b}
.badge-blue{background:#dbeafe;color:#1e40af}
.badge-purple{background:#ede9fe;color:#6d28d9}
.badge-orange{background:#ffedd5;color:#c2410c}
.badge-teal{background:#ccfbf1;color:#0d9488}
.badge-gray{background:#f1f5f9;color:#64748b}

.progress-row{display:flex;align-items:center;gap:8px}
.progress-bar{flex:1;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;min-width:60px}
.progress-fill{height:100%;border-radius:3px;transition:width .3s}
.progress-fill.green{background:#10b981}
.progress-fill.blue{background:#3b82f6}
.progress-fill.orange{background:#f59e0b}
.progress-fill.red{background:#ef4444}
.progress-fill.purple{background:#8b5cf6}
.progress-fill.teal{background:#0d9488}
.progress-text{font-size:13px;font-weight:500;min-width:36px}

.stat-cards{display:grid;gap:16px;margin-bottom:24px}
.stat-cards.cols-4{grid-template-columns:repeat(4,1fr)}
.stat-cards.cols-3{grid-template-columns:repeat(3,1fr)}
.stat-card{background:#fff;border-radius:12px;padding:20px;border-top:3px solid transparent}
.stat-card .label{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}
.stat-card .value{font-size:28px;font-weight:700;color:#0f172a;margin-top:4px}
.stat-card .sub{font-size:12px;color:#94a3b8;margin-top:2px}
.stat-card.blue{border-top-color:#3b82f6}
.stat-card.green{border-top-color:#10b981}
.stat-card.orange{border-top-color:#f59e0b}
.stat-card.red{border-top-color:#ef4444}
.stat-card.purple{border-top-color:#8b5cf6}
.stat-card.teal{border-top-color:#0d9488}

.grid-2{display:grid;grid-template-columns:2fr 1fr;gap:20px}
.grid-2-equal{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.grid-2x2{display:grid;grid-template-columns:1fr 1fr;gap:20px}

.toggle-group{display:flex;gap:6px}
.toggle-btn{width:36px;height:32px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;font-weight:700;font-size:13px;cursor:pointer;transition:.15s}
.toggle-btn:hover{background:#f1f5f9}
.toggle-btn.active-p{background:#dcfce7;border-color:#10b981;color:#10b981}
.toggle-btn.active-a{background:#fee2e2;border-color:#ef4444;color:#ef4444}
.toggle-btn.active-l{background:#fef9c3;border-color:#eab308;color:#eab308}

.btn-approve{border:1px solid #10b981;background:#dcfce7;color:#166534;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
.btn-reject{border:1px solid #ef4444;background:#fee2e2;color:#991b1b;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;margin-left:6px}

.input-score{width:52px;text-align:center;border:1px solid #cbd5e1;border-radius:6px;padding:6px;font-size:14px;outline:none}
.input-score:focus{border-color:#3b82f6}
.input-ghost{border:none;background:transparent;width:100%;outline:none;font-size:13px;color:#64748b}

.tabs{display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin-bottom:20px}
.tab{padding:10px 20px;font-size:14px;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;font-weight:500;transition:.15s}
.tab.active{color:#2563eb;border-bottom-color:#2563eb;font-weight:600}
.role-teacher .tab.active{color:#7c3aed;border-bottom-color:#7c3aed}
.role-student .tab.active{color:#0d9488;border-bottom-color:#0d9488}

.text-muted{color:#94a3b8;font-size:13px}
.text-bold{font-weight:600;color:#0f172a}
.text-green{color:#10b981}.text-red{color:#ef4444}.text-orange{color:#f59e0b}.text-blue{color:#2563eb}
.money{font-weight:700;font-size:15px}
.money.green{color:#10b981}.money.red{color:#ef4444}.money.orange{color:#f59e0b}

.filter-bar{display:flex;gap:12px;margin-bottom:20px;align-items:center}
.filter-bar select,.filter-bar input{border:1px solid #cbd5e1;border-radius:6px;padding:8px 12px;font-size:13px;outline:none;background:#fff}
.filter-bar input{min-width:220px}
.filter-bar .spacer{flex:1}

.legend{margin-top:12px;font-size:12px;color:#94a3b8;display:flex;gap:12px;align-items:center}
</style>
