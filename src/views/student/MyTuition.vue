<script setup>
import { ref, computed, onMounted } from 'vue'
import { N3, formatVND, invoiceStatusLabel, invoiceStatusClass } from '../../data/api.js'

// Student only sees their own invoices (API filters by JWT StudentCode claim)
const invoices = ref([])
const receipts = ref([])
const loading = ref(false)
const error = ref('')
const activeTab = ref('invoices')

async function load() {
  loading.value = true; error.value = ''
  try {
    const [inv, rec] = await Promise.all([N3.getInvoices(), N3.getReceipts()])
    invoices.value = Array.isArray(inv) ? inv : []
    receipts.value = Array.isArray(rec) ? rec : []
  } catch(e) {
    error.value = e.message
    // Fallback mock for student HV-0312
    invoices.value = [
      { id:1, invoiceNumber:'INV-2025-0001', studentCode:'HV-0312', studentName:'Nguyễn Văn An', courseName:'TOEIC 600+', className:'Lớp A', amount:3500000, paidAmount:3500000, debtAmount:0, status:'Paid', dueDate:'2025-06-30', createdDate:'2025-05-01' },
    ]
    receipts.value = [
      { id:1, receiptNumber:'REC-2025-0001', invoiceId:1, amountPaid:1750000, paymentDate:'2025-05-10', paymentMethod:'Cash', createdBy:'Nguyễn Thu' },
      { id:2, receiptNumber:'REC-2025-0002', invoiceId:1, amountPaid:1750000, paymentDate:'2025-06-01', paymentMethod:'BankTransfer', transactionReference:'VCB-123456', createdBy:'Nguyễn Thu' },
    ]
  } finally { loading.value = false }
}

const summary = computed(() => ({
  total: invoices.value.reduce((s,i)=>s+i.amount,0),
  paid: invoices.value.reduce((s,i)=>s+i.paidAmount,0),
  debt: invoices.value.reduce((s,i)=>s+i.debtAmount,0),
}))

const methodLabel = m => ({ Cash:'Tiền mặt', BankTransfer:'Chuyển khoản', MoMo:'MoMo', ZaloPay:'ZaloPay' }[m]||m)

onMounted(load)
</script>

<template>
<div class="page-container">
  <div class="page-header-premium">
    <div><h2 class="page-title">Học Phí Của Tôi</h2><p class="page-desc">Xem hóa đơn học phí và lịch sử thanh toán của bạn</p></div>
    <button class="btn-outline" @click="load">🔄 Tải lại</button>
  </div>

  <div v-if="error && !loading" class="error-state mb-4">⚠️ Không kết nối N3 API (đang dùng dữ liệu mẫu)</div>
  <div v-if="loading" class="loading-state mb-4">⏳ Đang tải...</div>

  <!-- Summary Cards -->
  <div class="stat-cards cols-3 mb-6">
    <div class="stat-card blue"><div class="label">TỔNG HỌC PHÍ</div><div class="value">{{ formatVND(summary.total) }}</div></div>
    <div class="stat-card green"><div class="label">ĐÃ THANH TOÁN</div><div class="value">{{ formatVND(summary.paid) }}</div></div>
    <div class="stat-card" :class="summary.debt>0?'red':'teal'">
      <div class="label">CÒN NỢ</div>
      <div class="value">{{ formatVND(summary.debt) }}</div>
      <div class="sub" v-if="summary.debt===0">✓ Đã đóng đủ học phí</div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs mb-4">
    <button class="tab" :class="{active:activeTab==='invoices'}" @click="activeTab='invoices'">🧾 Hóa đơn học phí ({{ invoices.length }})</button>
    <button class="tab" :class="{active:activeTab==='receipts'}" @click="activeTab='receipts'">📋 Lịch sử thanh toán ({{ receipts.length }})</button>
  </div>

  <!-- Invoices Tab -->
  <div v-if="activeTab==='invoices'" class="premium-card">
    <div class="list-items">
      <div v-for="inv in invoices" :key="inv.id" class="invoice-item">
        <div class="inv-left">
          <div class="inv-icon" :class="inv.status==='Paid'?'icon-green':inv.status==='PartiallyPaid'?'icon-yellow':'icon-red'">
            {{ inv.status==='Paid'?'✓':inv.status==='PartiallyPaid'?'½':'!' }}
          </div>
          <div class="inv-details">
            <div class="inv-number">{{ inv.invoiceNumber }}</div>
            <div class="inv-course">{{ inv.courseName }} · {{ inv.className }}</div>
            <div class="inv-date">Hạn nộp: {{ inv.dueDate?.slice(0,10) }}</div>
          </div>
        </div>
        <div class="inv-right">
          <div class="inv-amounts">
            <div class="amt-row"><span class="amt-label">Học phí:</span><span class="amt-val">{{ formatVND(inv.amount) }}</span></div>
            <div class="amt-row"><span class="amt-label">Đã trả:</span><span class="amt-val green">{{ formatVND(inv.paidAmount) }}</span></div>
            <div v-if="inv.debtAmount>0" class="amt-row"><span class="amt-label">Còn nợ:</span><span class="amt-val red">{{ formatVND(inv.debtAmount) }}</span></div>
          </div>
          <span class="badge" :class="invoiceStatusClass(inv.status)">{{ invoiceStatusLabel(inv.status) }}</span>
        </div>
      </div>
      <div v-if="invoices.length===0" class="empty-state">📂 Chưa có hóa đơn học phí nào.</div>
    </div>
  </div>

  <!-- Receipts Tab -->
  <div v-if="activeTab==='receipts'" class="premium-card">
    <div class="list-items">
      <div v-for="r in receipts" :key="r.id" class="receipt-item">
        <div class="rec-icon">💳</div>
        <div class="rec-info">
          <div class="rec-num">{{ r.receiptNumber }}</div>
          <div class="rec-meta">{{ new Date(r.paymentDate).toLocaleDateString('vi-VN') }} · {{ methodLabel(r.paymentMethod) }}</div>
          <div v-if="r.transactionReference" class="rec-txn">Mã GD: {{ r.transactionReference }}</div>
          <div class="rec-by">Thu bởi: {{ r.createdBy }}</div>
        </div>
        <div class="rec-amount">{{ formatVND(r.amountPaid) }}</div>
      </div>
      <div v-if="receipts.length===0" class="empty-state">📭 Chưa có giao dịch thanh toán nào.</div>
    </div>
  </div>
</div>
</template>

<style scoped>
.page-container{max-width:900px;margin:0 auto;animation:fadeIn .3s}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.page-header-premium{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px}
.page-title{font-size:26px;font-weight:800;color:#0f172a;margin-bottom:4px}
.page-desc{font-size:13px;color:#64748b}
.mb-6{margin-bottom:24px}.mb-4{margin-bottom:16px}

.stat-cards{display:grid;gap:16px}.cols-3{grid-template-columns:repeat(3,1fr)}
.stat-card{background:#fff;border-radius:12px;padding:20px;border-top:3px solid transparent;box-shadow:0 2px 4px rgba(0,0,0,.04)}
.stat-card .label{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase}
.stat-card .value{font-size:22px;font-weight:700;color:#0f172a;margin:6px 0 4px}
.stat-card .sub{font-size:12px;color:#10b981}
.stat-card.blue{border-top-color:#3b82f6}.stat-card.green{border-top-color:#10b981}.stat-card.red{border-top-color:#ef4444}.stat-card.teal{border-top-color:#0d9488}

.loading-state,.error-state{padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500}
.loading-state{background:#eff6ff;color:#1e40af}.error-state{background:#fff7ed;color:#c2410c}

.tabs{display:flex;gap:0;border-bottom:2px solid #e2e8f0}
.tab{padding:10px 24px;font-size:14px;font-weight:500;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;background:none;border-top:none;border-left:none;border-right:none;transition:.15s}
.tab.active{color:#0d9488;border-bottom-color:#0d9488;font-weight:700}

.premium-card{background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 4px 6px -1px rgba(0,0,0,.05);overflow:hidden}
.list-items{display:flex;flex-direction:column}

/* Invoice item */
.invoice-item{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid #f8fafc;gap:16px;transition:background .15s}
.invoice-item:hover{background:#f8fafc}.invoice-item:last-child{border:none}
.inv-left{display:flex;align-items:center;gap:16px}
.inv-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;flex-shrink:0}
.icon-green{background:#dcfce7;color:#166534}.icon-yellow{background:#fef9c3;color:#854d0e}.icon-red{background:#fee2e2;color:#991b1b}
.inv-number{font-family:monospace;font-size:14px;font-weight:700;color:#0f172a;margin-bottom:4px}
.inv-course{font-size:14px;color:#475569;margin-bottom:2px}
.inv-date{font-size:12px;color:#94a3b8}

.inv-right{display:flex;align-items:center;gap:24px}
.inv-amounts{display:flex;flex-direction:column;gap:4px;text-align:right}
.amt-row{display:flex;justify-content:flex-end;align-items:center;gap:12px}
.amt-label{font-size:12px;color:#94a3b8;white-space:nowrap}
.amt-val{font-size:14px;font-weight:700;color:#0f172a}
.amt-val.green{color:#10b981}.amt-val.red{color:#ef4444}

.badge{padding:6px 14px;border-radius:16px;font-size:12px;font-weight:700;white-space:nowrap}
.badge-green{background:#dcfce7;color:#166534}.badge-yellow{background:#fef9c3;color:#854d0e}.badge-red{background:#fee2e2;color:#991b1b}.badge-gray{background:#f1f5f9;color:#64748b}

/* Receipt item */
.receipt-item{display:flex;align-items:center;gap:16px;padding:20px 24px;border-bottom:1px solid #f8fafc;transition:background .15s}
.receipt-item:hover{background:#f8fafc}.receipt-item:last-child{border:none}
.rec-icon{width:44px;height:44px;background:#f0fdfa;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.rec-info{flex:1}
.rec-num{font-family:monospace;font-size:14px;font-weight:700;color:#0f172a;margin-bottom:4px}
.rec-meta{font-size:13px;color:#475569;margin-bottom:2px}
.rec-txn{font-size:12px;color:#0d9488;font-weight:500}
.rec-by{font-size:12px;color:#94a3b8}
.rec-amount{font-size:20px;font-weight:800;color:#0d9488;white-space:nowrap}

.empty-state{text-align:center;padding:48px;color:#94a3b8;font-size:15px}

.btn-outline{padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;background:#fff;border:1px solid #cbd5e1;color:#475569}
.btn-outline:hover{background:#f8fafc}
</style>
