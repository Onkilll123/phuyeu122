<script setup>
import { ref, computed, onMounted } from 'vue'
import { N1, N3, formatVND } from '../../data/api.js'

// ── Cross-service: Admin Revenue uses N3 Reports API ──
const stats = ref(null)
const revByCourse = ref([])
const revByMonth = ref([])
const topDebtors = ref([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true; error.value = ''
  try {
    const [s, byCourse, byMonth, debtors] = await Promise.all([
      N3.getDashboardStats(),
      N3.getRevenueByCourse(),
      N3.getRevenueByMonth(),
      N3.getTopDebtors()
    ])
    stats.value = s
    revByCourse.value = Array.isArray(byCourse) ? byCourse : []
    revByMonth.value = Array.isArray(byMonth) ? byMonth : []
    topDebtors.value = Array.isArray(debtors) ? debtors : []
  } catch(e) {
    error.value = e.message
    // Fallback mock
    stats.value = { totalOwed:45000000, totalPaid:38500000, totalDebt:6500000, collectionRate:86, invoiceCount:24, paidCount:18, pendingCount:6 }
    revByCourse.value = [
      { name:'TOEIC 600+', value:18000000 },
      { name:'Tiếng Anh Giao Tiếp', value:12500000 },
      { name:'IELTS Foundation', value:8000000 }
    ]
    revByMonth.value = [
      { month:'04/2025', revenue:12000000 },
      { month:'05/2025', revenue:15500000 },
      { month:'06/2025', revenue:11000000 }
    ]
    topDebtors.value = [
      { studentCode:'HV-0502', studentName:'Lê Hoàng Sơn', className:'Lớp B', totalDebt:2800000 },
      { studentCode:'HV-0451', studentName:'Trần Thị Mai', className:'Lớp A', totalDebt:1750000 }
    ]
  } finally { loading.value = false }
}

const maxRevCourse = computed(() => revByCourse.value.length ? Math.max(...revByCourse.value.map(r=>r.value)) : 1)
const maxRevMonth = computed(() => revByMonth.value.length ? Math.max(...revByMonth.value.map(r=>r.revenue)) : 1)

onMounted(load)
</script>

<template>
<div class="page-container">
  <div class="page-header-premium">
    <div>
      <h2 class="page-title">Báo Cáo Doanh Thu</h2>
      <p class="page-desc">Thống kê thu chi học phí — dữ liệu từ <strong>N3 Finance API</strong> (http://180.93.36.113:5000)</p>
    </div>
    <button class="btn-outline" @click="load">🔄 Làm mới</button>
  </div>

  <div v-if="error && !loading" class="error-state mb-5">⚠️ N3 API chưa kết nối — hiển thị dữ liệu mẫu: {{ error }}</div>
  <div v-if="loading" class="loading-state mb-5">⏳ Đang tải từ N3...</div>

  <!-- KPI Cards -->
  <div v-if="stats" class="stat-cards cols-4 mb-6">
    <div class="kpi-card">
      <div class="kpi-icon blue">💰</div>
      <div class="kpi-info">
        <div class="kpi-label">Tổng học phí</div>
        <div class="kpi-val">{{ formatVND(stats.totalOwed) }}</div>
        <div class="kpi-sub">{{ stats.invoiceCount }} hóa đơn</div>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon green">✅</div>
      <div class="kpi-info">
        <div class="kpi-label">Đã thu được</div>
        <div class="kpi-val green">{{ formatVND(stats.totalPaid) }}</div>
        <div class="kpi-sub">{{ stats.paidCount }} đã thanh toán</div>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon red">⚠️</div>
      <div class="kpi-info">
        <div class="kpi-label">Còn tồn đọng</div>
        <div class="kpi-val red">{{ formatVND(stats.totalDebt) }}</div>
        <div class="kpi-sub">{{ stats.pendingCount }} chưa thanh toán</div>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon teal">📊</div>
      <div class="kpi-info">
        <div class="kpi-label">Tỷ lệ thu</div>
        <div class="kpi-val">{{ stats.collectionRate }}%</div>
        <div class="progress-bar"><div class="progress-fill" :style="{width:stats.collectionRate+'%'}"></div></div>
      </div>
    </div>
  </div>

  <div class="two-cols mb-6">
    <!-- Revenue by Course -->
    <div class="premium-card">
      <div class="card-hdr border-bot"><h3 class="card-title">💹 Doanh thu theo Khóa học</h3></div>
      <div class="chart-area">
        <div v-for="c in revByCourse" :key="c.name" class="bar-row">
          <div class="bar-label">{{ c.name }}</div>
          <div class="bar-track">
            <div class="bar-fill blue-fill" :style="{width:(c.value/maxRevCourse*100)+'%'}"></div>
          </div>
          <div class="bar-val">{{ formatVND(c.value) }}</div>
        </div>
        <div v-if="revByCourse.length===0" class="empty-chart">Chưa có dữ liệu</div>
      </div>
    </div>

    <!-- Revenue by Month -->
    <div class="premium-card">
      <div class="card-hdr border-bot"><h3 class="card-title">📅 Doanh thu theo Tháng</h3></div>
      <div class="chart-area">
        <div v-for="m in revByMonth" :key="m.month" class="bar-row">
          <div class="bar-label">{{ m.month }}</div>
          <div class="bar-track">
            <div class="bar-fill green-fill" :style="{width:(m.revenue/maxRevMonth*100)+'%'}"></div>
          </div>
          <div class="bar-val">{{ formatVND(m.revenue) }}</div>
        </div>
        <div v-if="revByMonth.length===0" class="empty-chart">Chưa có dữ liệu</div>
      </div>
    </div>
  </div>

  <!-- Top Debtors -->
  <div class="premium-card">
    <div class="card-hdr border-bot"><h3 class="card-title">🔴 Top học viên nợ nhiều nhất</h3></div>
    <div class="debtor-table">
      <table class="premium-table">
        <thead><tr><th>#</th><th>HỌC VIÊN</th><th>MÃ HV</th><th>LỚP</th><th class="text-right">SỐ NỢ</th></tr></thead>
        <tbody>
          <tr v-for="(d,i) in topDebtors" :key="d.studentCode">
            <td><span class="rank" :class="i===0?'r1':i===1?'r2':'r3'">{{ i+1 }}</span></td>
            <td class="u-name">{{ d.studentName }}</td>
            <td class="u-code">{{ d.studentCode }}</td>
            <td class="u-code">{{ d.className }}</td>
            <td class="text-right debt-amount">{{ formatVND(d.totalDebt) }}</td>
          </tr>
          <tr v-if="topDebtors.length===0"><td colspan="5" class="empty-cell">Không có nợ tồn đọng.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<style scoped>
.page-container{max-width:1300px;margin:0 auto;animation:fadeIn .3s}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.page-header-premium{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px}
.page-title{font-size:26px;font-weight:800;color:#0f172a;margin-bottom:4px}
.page-desc{font-size:13px;color:#64748b}
.mb-5{margin-bottom:20px}.mb-6{margin-bottom:24px}

.loading-state,.error-state{padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500}
.loading-state{background:#eff6ff;color:#1e40af}.error-state{background:#fff7ed;color:#c2410c}

/* KPI Cards */
.stat-cards{display:grid;gap:16px}.cols-4{grid-template-columns:repeat(4,1fr)}
.kpi-card{background:#fff;border-radius:16px;padding:20px;display:flex;align-items:center;gap:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05);border:1px solid #f1f5f9;transition:.2s}
.kpi-card:hover{box-shadow:0 8px 15px -3px rgba(0,0,0,.08);transform:translateY(-2px)}
.kpi-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.kpi-icon.blue{background:#dbeafe}.kpi-icon.green{background:#dcfce7}.kpi-icon.red{background:#fee2e2}.kpi-icon.teal{background:#ccfbf1}
.kpi-label{font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.kpi-val{font-size:20px;font-weight:800;color:#0f172a;margin-bottom:4px}
.kpi-val.green{color:#10b981}.kpi-val.red{color:#ef4444}
.kpi-sub{font-size:12px;color:#94a3b8}
.progress-bar{height:6px;background:#f1f5f9;border-radius:3px;margin-top:6px;overflow:hidden}
.progress-fill{height:100%;background:#0d9488;border-radius:3px;transition:width 1s}

/* Layout */
.two-cols{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.premium-card{background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 4px 6px -1px rgba(0,0,0,.05);overflow:hidden}
.card-hdr{padding:20px 24px}.border-bot{border-bottom:1px solid #f1f5f9}
.card-title{font-size:17px;font-weight:700;color:#0f172a;margin:0}

/* Bar Charts */
.chart-area{padding:20px 24px;display:flex;flex-direction:column;gap:16px}
.bar-row{display:flex;align-items:center;gap:12px}
.bar-label{font-size:13px;font-weight:500;color:#475569;min-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-track{flex:1;height:10px;background:#f1f5f9;border-radius:5px;overflow:hidden}
.bar-fill{height:100%;border-radius:5px;transition:width .8s cubic-bezier(.4,0,.2,1)}
.blue-fill{background:linear-gradient(90deg,#3b82f6,#60a5fa)}
.green-fill{background:linear-gradient(90deg,#10b981,#34d399)}
.bar-val{font-size:12px;font-weight:700;color:#0f172a;min-width:110px;text-align:right}
.empty-chart{text-align:center;color:#94a3b8;font-style:italic;padding:20px}

/* Table */
.debtor-table{overflow:auto}
.premium-table{width:100%;border-collapse:collapse}
.premium-table th{background:#f8fafc;padding:13px 20px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0}
.premium-table td{padding:13px 20px;border-bottom:1px solid #f1f5f9}
.rank{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-weight:800;font-size:13px}
.r1{background:#fef9c3;color:#854d0e}.r2{background:#f1f5f9;color:#475569}.r3{background:#fef3c7;color:#c2410c}
.u-name{font-weight:600;color:#0f172a;font-size:14px}
.u-code{font-size:13px;color:#94a3b8}
.debt-amount{font-weight:800;color:#ef4444;font-size:15px}
.text-right{text-align:right}
.empty-cell{text-align:center;padding:32px;color:#94a3b8;font-style:italic}

.btn-outline{padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;background:#fff;border:1px solid #cbd5e1;color:#475569}
.btn-outline:hover{background:#f8fafc}
</style>
