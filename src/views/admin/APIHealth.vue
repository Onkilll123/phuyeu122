<script setup>
import { ref } from 'vue'
import { N1_BASE, N2_BASE, N3_BASE } from '../../data/api.js'

// Danh sách tất cả endpoint cần kiểm tra
const endpoints = ref([
  // ──────── N1 ────────
  { service:'N1', method:'GET', url:`${N1_BASE}/courses`,       label:'GET /courses',         status:'idle', latency:null, data:null, error:null },
  { service:'N1', method:'GET', url:`${N1_BASE}/classes`,       label:'GET /classes',         status:'idle', latency:null, data:null, error:null },
  { service:'N1', method:'GET', url:`${N1_BASE}/teachers`,      label:'GET /teachers',        status:'idle', latency:null, data:null, error:null },
  { service:'N1', method:'GET', url:`${N1_BASE}/schedules`,      label:'GET /schedules',        status:'idle', latency:null, data:null, error:null },
  { service:'N1', method:'GET', url:`${N1_BASE}/curriculum`,    label:'GET /curriculum',      status:'idle', latency:null, data:null, error:null },
  // ──────── N2 ────────
  { service:'N2', method:'GET', url:`${N2_BASE}/students`,      label:'GET /students',        status:'idle', latency:null, data:null, error:null },
  { service:'N2', method:'GET', url:`${N2_BASE}/registrations`, label:'GET /registrations',   status:'idle', latency:null, data:null, error:null },
  { service:'N2', method:'GET', url:`${N2_BASE}/attendance`,    label:'GET /attendance',      status:'idle', latency:null, data:null, error:null },
  { service:'N2', method:'GET', url:`${N2_BASE}/scores`,        label:'GET /scores',          status:'idle', latency:null, data:null, error:null },
  { service:'N2', method:'GET', url:`${N2_BASE}/leave-requests`,label:'GET /leave-requests',  status:'idle', latency:null, data:null, error:null },
  // ──────── N3 ────────
  { service:'N3', method:'GET', url:`${N3_BASE}/payment/invoices`,  label:'GET /payment/invoices',  status:'idle', latency:null, data:null, error:null },
  { service:'N3', method:'GET', url:`${N3_BASE}/payment/payments`,  label:'GET /payment/payments',  status:'idle', latency:null, data:null, error:null },
  { service:'N3', method:'GET', url:`${N3_BASE}/receipts`,          label:'GET /receipts',          status:'idle', latency:null, data:null, error:null },
  { service:'N3', method:'GET', url:`${N3_BASE}/debts`,             label:'GET /debts',             status:'idle', latency:null, data:null, error:null },
  { service:'N3', method:'GET', url:`${N3_BASE}/reports/dashboard`, label:'GET /reports/dashboard', status:'idle', latency:null, data:null, error:null },
  { service:'N3', method:'GET', url:`${N3_BASE}/reports/revenue-by-course`,  label:'GET /reports/revenue-by-course',  status:'idle', latency:null, data:null, error:null },
  { service:'N3', method:'GET', url:`${N3_BASE}/reports/revenue-by-month`,   label:'GET /reports/revenue-by-month',   status:'idle', latency:null, data:null, error:null },
  { service:'N3', method:'GET', url:`${N3_BASE}/reports/top-debtors`,        label:'GET /reports/top-debtors',        status:'idle', latency:null, data:null, error:null },
])

const token = ref(localStorage.getItem('auth_token') || '')
const isRunning = ref(false)
const expandedIdx = ref(null)

const serviceColors = { N1:'#3b82f6', N2:'#10b981', N3:'#8b5cf6' }
const serviceBase = { N1: N1_BASE, N2: N2_BASE, N3: N3_BASE }

async function testOne(ep) {
  ep.status = 'loading'
  ep.data = null
  ep.error = null
  ep.latency = null
  const t0 = Date.now()
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`
    const res = await fetch(ep.url, { method: ep.method, headers, signal: AbortSignal.timeout(8000) })
    ep.latency = Date.now() - t0
    if (res.ok) {
      const json = await res.json().catch(() => null)
      ep.data = json
      ep.status = 'ok'
    } else {
      ep.error = `HTTP ${res.status} ${res.statusText}`
      ep.status = 'error'
    }
  } catch(e) {
    ep.latency = Date.now() - t0
    ep.error = e.message || 'Network error / CORS / Timeout'
    ep.status = 'error'
  }
}

async function runAll() {
  isRunning.value = true
  endpoints.value.forEach(e => { e.status = 'idle'; e.data = null; e.error = null })
  await Promise.allSettled(endpoints.value.map(e => testOne(e)))
  isRunning.value = false
}

async function runByService(svc) {
  const group = endpoints.value.filter(e => e.service === svc)
  await Promise.allSettled(group.map(e => testOne(e)))
}

function toggleExpand(i) {
  expandedIdx.value = expandedIdx.value === i ? null : i
}

function saveToken() {
  localStorage.setItem('auth_token', token.value)
  alert('Đã lưu JWT token vào localStorage!')
}

const summary = (svc) => {
  const group = endpoints.value.filter(e => e.service === svc)
  const ok = group.filter(e => e.status === 'ok').length
  const err = group.filter(e => e.status === 'error').length
  return { total: group.length, ok, err }
}

function formatData(d) {
  if (!d) return 'null'
  const s = JSON.stringify(d, null, 2)
  return s.length > 800 ? s.slice(0, 800) + '\n... (truncated)' : s
}
</script>

<template>
<div class="page-container">
  <div class="page-header">
    <div>
      <h2 class="page-title">🔬 Kiểm tra API — N1 / N2 / N3</h2>
      <p class="page-desc">Test trực tiếp kết nối các microservice từ trình duyệt</p>
    </div>
    <button class="btn-run" :disabled="isRunning" @click="runAll">
      {{ isRunning ? '⏳ Đang test...' : '▶ Chạy tất cả test' }}
    </button>
  </div>

  <!-- JWT Token Input -->
  <div class="token-panel">
    <div class="token-label">🔑 JWT Token (để test các endpoint cần auth)</div>
    <div class="token-row">
      <input v-model="token" type="password" class="token-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
      <button class="btn-save" @click="saveToken">Lưu</button>
    </div>
    <div class="token-note">Token sẽ được gửi kèm header <code>Authorization: Bearer &lt;token&gt;</code> cho mọi request</div>
  </div>

  <!-- Summary cards -->
  <div class="summary-row mb-5">
    <div v-for="svc in ['N1','N2','N3']" :key="svc" class="summary-card" :style="{borderTopColor: serviceColors[svc]}">
      <div class="svc-name" :style="{color: serviceColors[svc]}">{{ svc }}</div>
      <div class="svc-base">{{ serviceBase[svc] }}</div>
      <div class="svc-stats">
        <span class="stat-ok">✅ {{ summary(svc).ok }}</span>
        <span class="stat-err">❌ {{ summary(svc).err }}</span>
        <span class="stat-tot">/ {{ summary(svc).total }}</span>
      </div>
      <button class="btn-svc" :style="{background: serviceColors[svc]}" @click="runByService(svc)">Test {{ svc }}</button>
    </div>
  </div>

  <!-- Endpoint list grouped by service -->
  <div v-for="svc in ['N1','N2','N3']" :key="svc" class="service-group mb-5">
    <div class="group-header" :style="{borderLeftColor: serviceColors[svc]}">
      <span class="group-title">{{ svc }}</span>
      <span class="group-url">{{ serviceBase[svc] }}</span>
    </div>

    <div class="endpoint-list">
      <div v-for="(ep, i) in endpoints.filter(e=>e.service===svc)" :key="ep.url" class="endpoint-card" :class="ep.status">
        <div class="ep-main" @click="toggleExpand(endpoints.indexOf(ep))">
          <!-- Status indicator -->
          <div class="status-dot-wrap">
            <div v-if="ep.status==='idle'" class="dot dot-gray"></div>
            <div v-else-if="ep.status==='loading'" class="dot dot-spin"></div>
            <div v-else-if="ep.status==='ok'" class="dot dot-green"></div>
            <div v-else class="dot dot-red"></div>
          </div>

          <span class="method-badge">{{ ep.method }}</span>
          <span class="ep-label">{{ ep.label }}</span>

          <div class="ep-meta">
            <span v-if="ep.latency" class="latency" :class="ep.latency>2000?'lat-slow':ep.latency>500?'lat-warn':'lat-fast'">
              {{ ep.latency }}ms
            </span>
            <span v-if="ep.status==='ok' && Array.isArray(ep.data)" class="count-badge">
              {{ ep.data.length }} records
            </span>
            <span v-if="ep.error" class="err-badge" :title="ep.error">{{ ep.error.slice(0,40) }}{{ ep.error.length>40?'...':'' }}</span>
          </div>

          <button class="btn-retry" @click.stop="testOne(ep)">{{ ep.status==='loading'?'...' :'↻' }}</button>
          <span class="chevron">{{ expandedIdx===endpoints.indexOf(ep)?'▲':'▼' }}</span>
        </div>

        <!-- Expanded detail -->
        <transition name="expand">
          <div v-if="expandedIdx===endpoints.indexOf(ep)" class="ep-detail">
            <div class="detail-row">
              <span class="detail-label">Full URL:</span>
              <code class="detail-url">{{ ep.url }}</code>
            </div>
            <div v-if="ep.error" class="detail-error">
              <div class="detail-label">❌ Lỗi:</div>
              <pre class="code-block error-block">{{ ep.error }}</pre>
              <div class="hint" v-if="ep.error.includes('fetch') || ep.error.includes('Network')">
                💡 <strong>Khả năng nguyên nhân:</strong> Server chưa chạy, sai IP/port, hoặc CORS chưa bật ở backend (cần thêm <code>AllowAnyOrigin()</code> trong ASP.NET).
              </div>
              <div class="hint" v-if="ep.error.includes('401') || ep.error.includes('403')">
                💡 <strong>Cần Auth:</strong> Nhập JWT token hợp lệ ở ô trên và thử lại.
              </div>
            </div>
            <div v-if="ep.data !== null" class="detail-data">
              <div class="detail-label">✅ Response:</div>
              <pre class="code-block">{{ formatData(ep.data) }}</pre>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.page-container{max-width:1100px;margin:0 auto;animation:fadeIn .3s}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.page-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px}
.page-title{font-size:24px;font-weight:800;color:#0f172a;margin-bottom:4px}
.page-desc{font-size:13px;color:#64748b}
.mb-5{margin-bottom:20px}

/* JWT Token Panel */
.token-panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px 24px;margin-bottom:24px;box-shadow:0 2px 4px rgba(0,0,0,.03)}
.token-label{font-size:13px;font-weight:700;color:#475569;margin-bottom:10px}
.token-row{display:flex;gap:10px;margin-bottom:8px}
.token-input{flex:1;padding:10px 14px;border:1px solid #cbd5e1;border-radius:9px;font-family:monospace;font-size:13px;outline:none}
.token-input:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
.token-note{font-size:12px;color:#94a3b8}
.token-note code{background:#f1f5f9;padding:1px 6px;border-radius:4px;font-size:11px}
.btn-save{padding:10px 16px;background:#2563eb;color:#fff;border:none;border-radius:9px;font-weight:600;font-size:13px;cursor:pointer}

/* Summary Row */
.summary-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.summary-card{background:#fff;border-radius:14px;padding:18px;border:1px solid #f1f5f9;border-top:3px solid;box-shadow:0 2px 4px rgba(0,0,0,.03);display:flex;flex-direction:column;gap:8px}
.svc-name{font-size:22px;font-weight:900;letter-spacing:-0.5px}
.svc-base{font-size:11px;color:#94a3b8;font-family:monospace;word-break:break-all}
.svc-stats{display:flex;gap:10px;font-size:14px;font-weight:600}
.stat-ok{color:#10b981}.stat-err{color:#ef4444}.stat-tot{color:#94a3b8}
.btn-svc{padding:8px 14px;border:none;border-radius:8px;color:#fff;font-weight:600;font-size:13px;cursor:pointer;margin-top:4px;transition:.15s}
.btn-svc:hover{opacity:.85}

/* Group Header */
.service-group{}
.group-header{padding:10px 14px;border-left:4px solid;background:#f8fafc;border-radius:0 8px 8px 0;margin-bottom:12px;display:flex;align-items:center;gap:16px}
.group-title{font-size:15px;font-weight:800;color:#0f172a}
.group-url{font-size:12px;color:#64748b;font-family:monospace}

/* Endpoint Card */
.endpoint-list{display:flex;flex-direction:column;gap:8px}
.endpoint-card{background:#fff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;transition:.2s}
.endpoint-card:hover{border-color:#cbd5e1}
.endpoint-card.ok{border-left:3px solid #10b981}
.endpoint-card.error{border-left:3px solid #ef4444}
.endpoint-card.loading{border-left:3px solid #f59e0b}
.ep-main{display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;user-select:none}
.status-dot-wrap{flex-shrink:0;width:14px;display:flex;align-items:center;justify-content:center}
.dot{width:10px;height:10px;border-radius:50%}
.dot-gray{background:#cbd5e1}.dot-green{background:#10b981}.dot-red{background:#ef4444}
.dot-spin{width:12px;height:12px;border:2px solid #cbd5e1;border-top-color:#f59e0b;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.method-badge{font-size:11px;font-weight:700;background:#dbeafe;color:#1e40af;padding:3px 8px;border-radius:5px;flex-shrink:0}
.ep-label{font-size:14px;font-weight:600;color:#334155;flex:1;font-family:monospace}
.ep-meta{display:flex;align-items:center;gap:8px;margin-right:8px}
.latency{font-size:12px;font-weight:700;padding:2px 7px;border-radius:6px}
.lat-fast{background:#dcfce7;color:#166534}.lat-warn{background:#fef9c3;color:#854d0e}.lat-slow{background:#fee2e2;color:#991b1b}
.count-badge{font-size:12px;background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:6px;font-weight:600}
.err-badge{font-size:11px;color:#ef4444;background:#fee2e2;padding:2px 8px;border-radius:6px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.btn-retry{padding:4px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:7px;cursor:pointer;font-size:14px;color:#475569;flex-shrink:0}
.btn-retry:hover{background:#f1f5f9}
.chevron{font-size:11px;color:#94a3b8;flex-shrink:0}

/* Detail Panel */
.ep-detail{padding:16px 20px;border-top:1px solid #f1f5f9;background:#fafafa;display:flex;flex-direction:column;gap:12px}
.detail-row{display:flex;align-items:center;gap:10px}
.detail-label{font-size:13px;font-weight:700;color:#475569;min-width:80px}
.detail-url{font-size:12px;font-family:monospace;color:#2563eb;background:#eff6ff;padding:3px 8px;border-radius:6px;word-break:break-all}
.code-block{background:#1e293b;color:#e2e8f0;padding:14px;border-radius:10px;font-size:12px;font-family:monospace;overflow-x:auto;white-space:pre-wrap;margin:4px 0}
.error-block{background:#1e293b;color:#fca5a5}
.hint{background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;font-size:13px;color:#854d0e}
.hint code{background:#fef3c7;padding:1px 6px;border-radius:4px;font-size:11px;font-family:monospace}

.expand-enter-active,.expand-leave-active{transition:all .25s ease}
.expand-enter-from,.expand-leave-to{opacity:0;max-height:0}
.expand-enter-to,.expand-leave-from{opacity:1;max-height:800px}

.btn-run{padding:12px 24px;background:#0f172a;color:#fff;border:none;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;transition:.15s}
.btn-run:hover:not(:disabled){background:#1e293b}
.btn-run:disabled{opacity:.5;cursor:not-allowed}
</style>
