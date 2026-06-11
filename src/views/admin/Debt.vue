<script setup>
import { ref, computed, onMounted } from 'vue'
import { N3, formatVND } from '../../data/api.js'

const debts = ref([])
const topDebtors = ref([])
const debtSummary = ref(null)
const loading = ref(false)
const error = ref('')
const search = ref('')
const filterStatus = ref('')

async function load() {
  loading.value = true; error.value = ''
  try {
    const [dList, top, summary] = await Promise.all([
      N3.getDebts(), N3.getTopDebtors(), N3.getDebtSummary()
    ])
    debts.value = Array.isArray(dList) ? dList : []
    topDebtors.value = Array.isArray(top) ? top : []
    debtSummary.value = summary
  } catch(e) {
    error.value = e.message
    debts.value = [
      { id:1, studentCode:'HV-0502', studentName:'Lê Hoàng Sơn', courseName:'Tiếng Anh Giao Tiếp', className:'Lớp B', totalAmount:2800000, paidAmount:0, debtAmount:2800000, status:'Unpaid', dueDate:'2025-06-15', createdDate:'2025-05-10' },
      { id:2, studentCode:'HV-0451', studentName:'Trần Thị Mai', courseName:'TOEIC 600+', className:'Lớp A', totalAmount:3500000, paidAmount:1750000, debtAmount:1750000, status:'Partial', dueDate:'2025-07-01', createdDate:'2025-05-05' },
    ]
    debtSummary.value = { totalOwed:6300000, totalPaid:1750000, totalDebt:4550000, unpaidCount:1, partiallyPaidCount:1, paidCount:0 }
    topDebtors.value = [
      { studentCode:'HV-0502', studentName:'Lê Hoàng Sơn', className:'Lớp B', totalDebt:2800000 },
      { studentCode:'HV-0451', studentName:'Trần Thị Mai', className:'Lớp A', totalDebt:1750000 }
    ]
  } finally { loading.value = false }
}

const statusLabel = s => ({Unpaid:'Chưa trả', Partial:'Trả một phần', PartiallyPaid:'Trả một phần', Paid:'Đã trả'}[s]||s)
const statusClass = s => ({Paid:'badge-green', Partial:'badge-yellow', PartiallyPaid:'badge-yellow', Unpaid:'badge-red'}[s]||'badge-gray')

const filtered = computed(() => debts.value.filter(d => {
  const q = search.value.toLowerCase()
  return (!q || d.studentName?.toLowerCase().includes(q) || d.studentCode?.toLowerCase().includes(q))
      && (!filterStatus.value || d.status === filterStatus.value)
}))

const maxDebt = computed(() => topDebtors.value.length ? topDebtors.value[0].totalDebt : 1)

onMounted(load)
</script>

<template>
<div class="page-container">
  <div class="page-header-premium">
    <div><h2 class="page-title">Quản lý Công Nợ</h2><p class="page-desc">Theo dõi học phí tồn đọng & học viên chưa thanh toán</p></div>
    <button class="btn-outline" @click="load">🔄 Tải lại</button>
  </div>

  <div v-if="error && !loading" class="error-state">⚠️ API N3 chưa kết nối (đang dùng dữ liệu mẫu): {{ error }}</div>
  <div v-if="loading" class="loading-state">⏳ Đang tải dữ liệu công nợ từ N3...</div>

  <!-- Summary Stats -->
  <div v-if="debtSummary" class="stat-cards cols-3 mb-6">
    <div class="stat-card red"><div class="label">TỔNG NỢ CHƯA THU</div><div class="value">{{ formatVND(debtSummary.totalDebt) }}</div><div class="sub">{{ debtSummary.unpaidCount }} HV chưa trả + {{ debtSummary.partiallyPaidCount }} trả một phần</div></div>
    <div class="stat-card green"><div class="label">ĐÃ THU ĐƯỢC</div><div class="value">{{ formatVND(debtSummary.totalPaid) }}</div><div class="sub">Tổng học phí: {{ formatVND(debtSummary.totalOwed) }}</div></div>
    <div class="stat-card orange"><div class="label">TỶ LỆ NỢ</div><div class="value">{{ debtSummary.totalOwed ? Math.round(debtSummary.totalDebt/debtSummary.totalOwed*100) : 0 }}%</div><div class="sub">Đã trả đủ: {{ debtSummary.paidCount }} HV</div></div>
  </div>

  <div class="grid-layout mb-6">
    <!-- Left: Table -->
    <div class="premium-card">
      <div class="card-hdr border-bot">
        <h3 class="card-title">Danh sách công nợ</h3>
        <div class="filter-row mt-3">
          <div class="search-wrap"><svg class="s-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input v-model="search" placeholder="Tìm học viên..." class="s-input"/></div>
          <select v-model="filterStatus" class="filter-select">
            <option value="">Tất cả</option>
            <option value="Unpaid">Chưa trả</option>
            <option value="Partial">Trả một phần</option>
            <option value="Paid">Đã trả</option>
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table class="premium-table">
          <thead><tr>
            <th>HỌC VIÊN</th><th>KHÓA / LỚP</th>
            <th class="text-right">HỌC PHÍ</th><th class="text-right">ĐÃ TRẢ</th><th class="text-right">CÒN NỢ</th>
            <th>HẠN NỘP</th><th>TRẠNG THÁI</th>
          </tr></thead>
          <tbody>
            <tr v-for="d in filtered" :key="d.id" class="t-row">
              <td>
                <div class="user-cell">
                  <div class="av" :class="d.status==='Unpaid'?'av-red':'av-blue'">{{ d.studentName?.charAt(0) }}</div>
                  <div><div class="u-name">{{ d.studentName }}</div><div class="u-code">{{ d.studentCode }}</div></div>
                </div>
              </td>
              <td><div class="u-name">{{ d.courseName }}</div><div class="u-code">{{ d.className }}</div></td>
              <td class="text-right money-text">{{ formatVND(d.totalAmount) }}</td>
              <td class="text-right money-text green">{{ formatVND(d.paidAmount) }}</td>
              <td class="text-right money-text" :class="d.debtAmount>0?'red':''">{{ formatVND(d.debtAmount) }}</td>
              <td class="text-muted">{{ d.dueDate?.slice(0,10) }}</td>
              <td><span class="badge" :class="statusClass(d.status)">{{ statusLabel(d.status) }}</span></td>
            </tr>
            <tr v-if="filtered.length===0"><td colspan="7" class="empty-cell">Không có công nợ nào.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Right: Top Debtors -->
    <div class="premium-card side-card">
      <div class="card-hdr border-bot"><h3 class="card-title">🔴 Nợ nhiều nhất</h3></div>
      <div class="debtors-list">
        <div v-for="(d,i) in topDebtors" :key="d.studentCode" class="debtor-item">
          <div class="debtor-rank" :class="i===0?'rank-1':i===1?'rank-2':'rank-3'">{{ i+1 }}</div>
          <div class="debtor-info">
            <div class="u-name">{{ d.studentName }}</div>
            <div class="u-code">{{ d.studentCode }} · {{ d.className }}</div>
            <div class="debt-bar-row">
              <div class="debt-bar-track"><div class="debt-bar-fill" :style="{width:(d.totalDebt/maxDebt*100)+'%'}"></div></div>
              <span class="debt-amount">{{ formatVND(d.totalDebt) }}</span>
            </div>
          </div>
        </div>
        <div v-if="topDebtors.length===0" class="empty-cell">Không có công nợ nổi bật.</div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.page-container{max-width:1400px;margin:0 auto;animation:fadeIn .3s}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.page-header-premium{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px}
.page-title{font-size:26px;font-weight:800;color:#0f172a;margin-bottom:4px}
.page-desc{font-size:13px;color:#64748b}.mb-6{margin-bottom:24px}

.stat-cards{display:grid;gap:16px}.cols-3{grid-template-columns:repeat(3,1fr)}
.stat-card{background:#fff;border-radius:12px;padding:20px;border-top:3px solid transparent;box-shadow:0 2px 4px rgba(0,0,0,.04)}
.stat-card .label{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}
.stat-card .value{font-size:22px;font-weight:700;color:#0f172a;margin:6px 0 4px}
.stat-card .sub{font-size:12px;color:#94a3b8}
.stat-card.red{border-top-color:#ef4444}.stat-card.green{border-top-color:#10b981}.stat-card.orange{border-top-color:#f59e0b}

.loading-state,.error-state{padding:12px 20px;border-radius:10px;margin-bottom:20px;font-size:14px;font-weight:500}
.loading-state{background:#eff6ff;color:#1e40af}.error-state{background:#fff7ed;color:#c2410c}

.grid-layout{display:grid;grid-template-columns:1fr 360px;gap:20px}
.premium-card{background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 4px 6px -1px rgba(0,0,0,.05);overflow:hidden}
.side-card{height:fit-content}
.card-hdr{padding:20px 24px}.border-bot{border-bottom:1px solid #f1f5f9}
.card-title{font-size:17px;font-weight:700;color:#0f172a;margin:0}
.mt-3{margin-top:12px}

.filter-row{display:flex;gap:12px}
.search-wrap{position:relative;flex:1}.s-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8}
.s-input{width:100%;padding:9px 16px 9px 40px;border:1px solid #cbd5e1;border-radius:9px;font-size:14px;outline:none}
.s-input:focus{border-color:#2563eb}
.filter-select{padding:9px 14px;border:1px solid #cbd5e1;border-radius:9px;font-size:14px;outline:none}

.table-wrap{overflow-x:auto}
.premium-table{width:100%;border-collapse:collapse}
.premium-table th{background:#f8fafc;padding:13px 20px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0}
.premium-table td{padding:13px 20px;border-bottom:1px solid #f1f5f9;font-size:14px}
.t-row:hover td{background:#f8fafc}
.text-right{text-align:right}.text-muted{color:#94a3b8;font-size:13px}

.user-cell{display:flex;align-items:center;gap:10px}
.av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff}
.av-blue{background:#3b82f6}.av-red{background:#ef4444}
.u-name{font-weight:600;color:#0f172a;font-size:14px}.u-code{font-size:12px;color:#94a3b8}
.money-text{font-weight:700}.money-text.green{color:#10b981}.money-text.red{color:#ef4444}

.badge{padding:4px 10px;border-radius:14px;font-size:12px;font-weight:600}
.badge-green{background:#dcfce7;color:#166534}.badge-yellow{background:#fef9c3;color:#854d0e}.badge-red{background:#fee2e2;color:#991b1b}

.empty-cell{text-align:center;padding:32px;color:#94a3b8;font-style:italic}

/* Top Debtors */
.debtors-list{padding:16px 20px;display:flex;flex-direction:column;gap:16px}
.debtor-item{display:flex;gap:14px;align-items:flex-start}
.debtor-rank{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}
.rank-1{background:#fef9c3;color:#854d0e}.rank-2{background:#f1f5f9;color:#475569}.rank-3{background:#fef3c7;color:#c2410c}
.debtor-info{flex:1}
.debt-bar-row{display:flex;align-items:center;gap:10px;margin-top:8px}
.debt-bar-track{flex:1;height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden}
.debt-bar-fill{height:100%;background:#ef4444;border-radius:3px;transition:width .5s}
.debt-amount{font-size:13px;font-weight:700;color:#ef4444;white-space:nowrap}

.btn-outline{padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;background:#fff;border:1px solid #cbd5e1;color:#475569}
.btn-outline:hover{background:#f8fafc}
</style>
