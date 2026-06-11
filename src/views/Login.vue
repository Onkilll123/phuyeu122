<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login-success'])

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const login = async () => {
  if (!username.value || !password.value) {
    errorMsg.value = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.'
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  // Mock Authentication Logic
  setTimeout(() => {
    isLoading.value = false
    let userRole = null

    if (username.value === 'admin' && password.value === 'admin') {
      userRole = 'admin'
    } else if (username.value === 'teacher' && password.value === 'teacher') {
      userRole = 'teacher'
    } else if (username.value === 'student' && password.value === 'student') {
      userRole = 'student'
    }

    if (userRole) {
      localStorage.setItem('auth_role', userRole)
      localStorage.setItem('auth_username', username.value)
      emit('login-success', userRole)
    } else {
      errorMsg.value = 'Tài khoản hoặc mật khẩu không chính xác.'
    }
  }, 1200) // fake delay
}
</script>

<template>
  <div class="login-container">
    <!-- Left Side: Visual/Branding -->
    <div class="login-banner">
      <div class="banner-content">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
          <span class="logo-text">EduCore Pro</span>
        </div>
        <h1 class="banner-title">Hệ thống Quản lý Học tập & Tài chính Toàn diện</h1>
        <p class="banner-desc">Giải pháp công nghệ đồng bộ từ Quản lý khóa học, Điểm danh đến Thu học phí.</p>
        
        <div class="demo-accounts">
          <p class="demo-title">Tài khoản trải nghiệm:</p>
          <div class="demo-card admin">
            <span class="demo-role">Quản trị viên (Admin)</span>
            <span class="demo-cred">admin / admin</span>
          </div>
          <div class="demo-card teacher">
            <span class="demo-role">Giảng viên (Teacher)</span>
            <span class="demo-cred">teacher / teacher</span>
          </div>
          <div class="demo-card student">
            <span class="demo-role">Học viên (Student)</span>
            <span class="demo-cred">student / student</span>
          </div>
        </div>
      </div>
      <!-- Background Abstract Shapes -->
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <!-- Right Side: Login Form -->
    <div class="login-form-wrapper">
      <div class="login-form-inner">
        <h2 class="form-title">Đăng nhập hệ thống</h2>
        <p class="form-subtitle">Chào mừng bạn quay trở lại EduCore Pro</p>

        <form @submit.prevent="login" class="auth-form">
          <div class="input-group">
            <label for="username">Tên đăng nhập</label>
            <div class="input-icon-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input id="username" type="text" v-model="username" placeholder="Nhập tên đăng nhập" required />
            </div>
          </div>

          <div class="input-group">
            <label for="password">Mật khẩu</label>
            <div class="input-icon-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input id="password" type="password" v-model="password" placeholder="Nhập mật khẩu" required />
            </div>
          </div>

          <div v-if="errorMsg" class="error-msg">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errorMsg }}
          </div>

          <button type="submit" class="btn-login" :disabled="isLoading">
            <span v-if="isLoading" class="loader"></span>
            <span v-else>Đăng nhập</span>
          </button>
        </form>
        
        <div class="login-footer">
          <p>© 2026 EduCore Pro by Group 3. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  background-color: #f8fafc;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* LEFT BANNER */
.login-banner {
  flex: 1;
  background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: white;
}

.banner-content {
  position: relative;
  z-index: 10;
  max-width: 480px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  color: #60a5fa;
}

.logo-text {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.banner-title {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
}

.banner-desc {
  font-size: 16px;
  color: #93c5fd;
  line-height: 1.6;
  margin-bottom: 48px;
}

.demo-accounts {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
}

.demo-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #bfdbfe;
  margin-bottom: 16px;
}

.demo-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 8px;
}

.demo-card:last-child {
  margin-bottom: 0;
}

.demo-role {
  font-size: 14px;
  font-weight: 600;
}

.demo-cred {
  font-size: 13px;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 8px;
  border-radius: 4px;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  top: -100px;
  left: -100px;
}

.shape-2 {
  width: 500px;
  height: 500px;
  background: #8b5cf6;
  bottom: -150px;
  right: -100px;
}

/* RIGHT FORM */
.login-form-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.login-form-inner {
  width: 100%;
  max-width: 400px;
  padding: 0 24px;
}

.form-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 32px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}

.input-icon-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.input-icon-wrapper input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.input-icon-wrapper input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.error-icon {
  width: 16px;
  height: 16px;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
}

.btn-login:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 40px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .login-banner {
    display: none;
  }
}
</style>
