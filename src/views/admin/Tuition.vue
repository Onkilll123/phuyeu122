<script setup>
import { ref, computed, onMounted } from 'vue'
import { N3, formatVND, invoiceStatusLabel, invoiceStatusClass } from '../../data/api.js'

const invoices = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const showPayModal = ref(false)
const selectedInvoice = ref(null)
const toast = ref({ show: false, msg: '', type: 'success' })

const form = ref({ studentCode:'', studentName:'', courseName:'', className:'', amount:'', dueDate:'', description:'' })
const payForm = ref({ amount:'', paymentMethod:'Cash', transactionReference:'', notes:'' })

async function loadInvoices() {
  loading.value = true; error.value = ''
  try {
    const data = await N3.getInvoices()
    invoices.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e.message
    // fallback mock
    invoices.value = [
      { id:1, invoiceNumber:'INV-2025-0001', studentCode:'HV-0312', studentName:'Nguyễn Văn An', courseName:'TOEIC 600+', className:'Lớp A', amount:3500000, paidAmount:3500000, debtAmount:0, status:'Paid', dueDate:'2025-06-30', createdDate:'2025-05-01' },
      { id:2, invoiceNumber:'INV-2025-0002', studentCode:'HV-0451', studentName:'Trần Thị Mai', courseName:'TOEIC 600+', className:'Lớp A', amount:3500000, paidAmount:1750000, debtAmount:1750000, status:'PartiallyPaid', dueDate:'2025-06-30', createdDate:'2025-05-05' },
      { id:3, invoiceNumber:'INV-2025-0003', studentCode:'HV-0502', studentName:'Lê Hoàng Sơn', courseName:'Tiếng Anh Giao Tiếp', className:'Lớp B', amount:2800000, paidAmount:0, debtAmount:2800000, status:'Unpaid', dueDate:'2025-06-15', createdDate:'2025-05-10' },
    ]
  } finally { loading.value = false }
}

const filtered = computed(() => invoices.value.filter(inv => {
  const q = search.value.toLowerCase()
  const matchQ = !q || inv.studentName?.toLowerCase().includes(q) || inv.studentCode?.toLowerCase().includes(q) || inv.invoiceNumber?.toLowerCase().includes(q)
  const matchS = !filterStatus.value || inv.status === filterStatus.value
  return matchQ && matchS
}))

const stats = computed(() => ({
  total: invoices.value.reduce((s,i) => s+i.amount, 0),
  paid: invoices.value.reduce((s,i) => s+i.paidAmount, 0),
  debt: invoices.value.reduce((s,i) => s+i.debtAmount, 0),
  rate: invoices.value.length ? Math.round(invoices.value.filter(i=>i.status==='Paid').length/invoices.value.length*100) : 0
}))

function showToast(msg, type='success') {
  toast.value = { show:true, msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

async function createInvoice() {
  if (!form.value.studentCode || !form.value.amount) { alert('Điền đủ thông tin bắt buộc!'); return }
  try {
    await N3.createInvoice({ ...form.value, amount: Number(form.value.amount), dueDate: form.value.dueDate || new Date().toISOString() })
    showToast('Tạo hóa đơn thành công!')
    showModal.value = false
    form.value = { studentCode:'', studentName:'', courseName:'', className:'', amount:'', dueDate:'', description:'' }
    await loadInvoices()
  } catch(e) { showToast(e.message, 'error') }
}

function openPayModal(inv) { selectedInvoice.value = inv; payForm.value = { amount:'', paymentMethod:'Cash', transactionReference:'', notes:'' }; showPayModal.value = true }

async function recordPayment() {
  if (!payForm.value.amount || Number(payForm.value.amount) <= 0) { alert('Nhập số tiền hợp lệ!'); return }
  try {
    await N3.recordPayment({ invoiceId: selectedInvoice.value.id, amount: Number(payForm.value.amount), paymentMethod: payForm.value.paymentMethod, transactionReference: payForm.value.transactionReference, notes: payForm.value.notes })
    showToast('Ghi nhận thanh toán thành công!')
    showPayModal.value = false
    await loadInvoices()
  } catch(e) { showToast(e.message, 'error') }
}

async function deleteInvoice(inv) {
  if (!confirm(`Xóa hóa đơn ${inv.invoiceNumber}?`)) return
  try { await N3.deleteInvoice(inv.id); showToast('Đã xóa hóa đơn'); await loadInvoices() } catch(e) { showToast(e.message,'error') }
}

onMounted(loadInvoices)
</script>

<template>
<div class="page-container">
  <!-- Toast -->
  <transition name="slide-down">
    <div v-if="toast.show" class="toast" :class="toast.type==='error'?'toast-error':'toast-success'">
      {{ toast.msg }}
    </div>
  </transition>

  <!-- Create Invoice Modal -->
  <transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal-box">
        <div class="modal-hdr"><h3>Tạo Hóa Đơn Học Phí</h3><button @click="showModal=false" class="close-btn">✕</button></div>
        <div class="modal-body form-grid">
          <div class="form-group"><label>Mã học viên *</label><input v-model="form.studentCode" class="form-input" placeholder="HV-xxxx"/></div>
          <div class="form-group"><label>Tên học viên</label><input v-model="form.studentName" class="form-input" placeholder="Nguyễn Văn A"/></div>
          <div class="form-group"><label>Khóa học</label><input v-model="form.courseName" class="form-input" placeholder="TOEIC 600+"/></div>
          <div class="form-group"><label>Tên lớp</label><input v-model="form.className" class="form-input" placeholder="Lớp A"/></div>
          <div class="form-group"><label>Học phí (VNĐ) *</label><input type="number" v-model="form.amount" class="form-input" placeholder="3500000"/></div>
          <div class="form-group"><label>Hạn đóng</label><input type="date" v-model="form.dueDate" class="form-input"/></div>
          <div class="form-group full"><label>Ghi chú</label><textarea v-model="form.description" class="form-input form-textarea" placeholder="Ghi chú..."/></div>
        </div>
        <div class="modal-ftr"><button class="btn-sec" @click="showModal=false">Hủy</button><button class="btn-pri" @click="createInvoice">Tạo hóa đơn</button></div>
      </div>
    </div>
  </transition>

  <!-- Pay Modal -->
  <transition name="fade">
    <div v-if="showPayModal && selectedInvoice" class="modal-overlay" @click.self="showPayModal=false">
      <div class="modal-box">
        <div class="modal-hdr"><h3>Ghi Nhận Thanh Toán</h3><button @click="showPayModal=false" class="close-btn">✕</button></div>
        <div class="modal-body">
          <div class="pay-info-box">
            <div class="pay-info-row"><span>Học viên:</span><strong>{{ selectedInvoice.studentName }}</strong></div>
            <div class="pay-info-row"><span>Hóa đơn:</span><strong>{{ selectedInvoice.invoiceNumber }}</strong></div>
            <div class="pay-info-row"><span>Còn nợ:</span><strong class="text-red">{{ formatVND(selectedInvoice.debtAmount) }}</strong></div>
          </div>
          <div class="form-grid mt-4">
            <div class="form-group"><label>Số tiền thanh toán *</label><input type="number" v-model="payForm.amount" class="form-input" :placeholder="selectedInvoice.debtAmount"/></div>
            <div class="form-group"><label>Phương thức</label>
              <select v-model="payForm.paymentMethod" class="form-input">
                <option>Cash</option><option>BankTransfer</option><option>MoMo</option><option>ZaloPay</option>
              </select>
            </div>
            <div class="form-group full"><label>Mã giao dịch</label><input v-model="payForm.transactionReference" class="form-input" placeholder="TXN-xxx (nếu có)"/></div>
            <div class="form-group full"><label>Ghi chú</label><textarea v-model="payForm.notes" class="form-input form-textarea" placeholder="Ghi chú..."/></div>
          </div>
        </div>
        <div class="modal-ftr"><button class="btn-sec" @click="showPayModal=false">Hủy</button><button class="btn-pri" @click="recordPayment">Xác nhận thu tiền</button></div>
      </div>
    </div>
  </transition>

  <!-- Header -->
  <div class="page-header-premium">
    <div><h2 class="page-title">Thu Học Phí</h2><p class="page-desc">Quản lý hóa đơn & ghi nhận thanh toán • N3 API: {{ $options.__apiUrl || 'http://180.93.36.113:5000' }}</p></div>
    <div class="header-actions">
      <button class="btn-outline" @click="loadInvoices">🔄 Tải lại</button>
      <button class="btn-pri" @click="showModal=true">+ Tạo hóa đơn</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="stat-cards cols-4 mb-6">
    <div class="stat-card blue"><div class="label">TỔNG HỌC PHÍ</div><div class="value">{{ formatVND(stats.total) }}</div></div>
    <div class="stat-card green"><div class="label">ĐÃ THU</div><div class="value">{{ formatVND(stats.paid) }}</div></div>
    <div class="stat-card red"><div class="label">CÒN NỢ</div><div class="value">{{ formatVND(stats.debt) }}</div></div>
    <div class="stat-card teal"><div class="label">TỶ LỆ THU</div><div class="value">{{ stats.rate }}%</div></div>
  </div>

  <!-- Loading/Error -->
  <div v-if="loading" class="loading-state">⏳ Đang tải từ N3 API...</div>
  <div v-if="error && !loading" class="error-state">⚠️ Không kết nối được API (đang dùng dữ liệu mẫu): {{ error }}</div>

  <!-- Table -->
  <div class="premium-card">
    <div class="card-hdr">
      <div class="filter-row">
        <div class="search-wrap"><svg class="s-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input v-model="search" placeholder="Tìm học viên, mã HĐ..." class="s-input"/></div>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="Paid">Đã thanh toán</option>
          <option value="PartiallyPaid">Trả một phần</option>
          <option value="Unpaid">Chưa thanh toán</option>
        </select>
      </div>
    </div>

    <div class="table-wrap">
      <table class="premium-table">
        <thead><tr>
          <th>SỐ HĐ</th><th>HỌC VIÊN</th><th>KHÓA / LỚP</th>
          <th class="text-right">HỌC PHÍ</th><th class="text-right">ĐÃ TRẢ</th><th class="text-right">CÒN NỢ</th>
          <th>HẠN NỘP</th><th>TRẠNG THÁI</th><th class="text-right">THAO TÁC</th>
        </tr></thead>
        <tbody>
          <tr v-for="inv in filtered" :key="inv.id" class="t-row">
            <td><span class="inv-num">{{ inv.invoiceNumber }}</span></td>
            <td>
              <div class="user-cell">
                <div class="av">{{ inv.studentName?.charAt(0) }}</div>
                <div><div class="u-name">{{ inv.studentName }}</div><div class="u-code">{{ inv.studentCode }}</div></div>
              </div>
            </td>
            <td><div class="u-name">{{ inv.courseName }}</div><div class="u-code">{{ inv.className }}</div></td>
            <td class="text-right money-cell">{{ formatVND(inv.amount) }}</td>
            <td class="text-right money-cell green">{{ formatVND(inv.paidAmount) }}</td>
            <td class="text-right money-cell" :class="inv.debtAmount>0?'red':''">{{ formatVND(inv.debtAmount) }}</td>
            <td class="text-muted">{{ inv.dueDate?.slice(0,10) }}</td>
            <td><span class="badge" :class="invoiceStatusClass(inv.status)">{{ invoiceStatusLabel(inv.status) }}</span></td>
            <td class="text-right">
              <div class="act-group">
                <button v-if="inv.status!=='Paid'" class="btn-act-pay" @click="openPayModal(inv)">💳 Thu tiền</button>
                <button class="btn-act-del" @click="deleteInvoice(inv)">🗑</button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length===0"><td colspan="9" class="empty-cell">Không có hóa đơn nào phù hợp.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<style scoped>
.page-container{max-width:1400px;margin:0 auto;animation:fadeIn .3s}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.page-header-premium{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px}
.page-title{font-size:26px;font-weight:800;color:#0f172a;margin-bottom:4px}
.page-desc{font-size:13px;color:#64748b}
.header-actions{display:flex;gap:12px}
.mb-6{margin-bottom:24px}

.stat-cards{display:grid;gap:16px;margin-bottom:24px}
.cols-4{grid-template-columns:repeat(4,1fr)}
.stat-card{background:#fff;border-radius:12px;padding:20px;border-top:3px solid transparent;box-shadow:0 2px 4px rgba(0,0,0,.04)}
.stat-card .label{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}
.stat-card .value{font-size:20px;font-weight:700;color:#0f172a;margin-top:6px}
.stat-card.blue{border-top-color:#3b82f6}.stat-card.green{border-top-color:#10b981}
.stat-card.red{border-top-color:#ef4444}.stat-card.teal{border-top-color:#0d9488}

.loading-state,.error-state{padding:16px 20px;border-radius:10px;margin-bottom:20px;font-size:14px;font-weight:500}
.loading-state{background:#eff6ff;color:#1e40af}.error-state{background:#fff7ed;color:#c2410c}

.premium-card{background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 4px 6px -1px rgba(0,0,0,.05);overflow:hidden}
.card-hdr{padding:20px 24px;border-bottom:1px solid #f1f5f9}
.filter-row{display:flex;gap:12px;align-items:center}
.search-wrap{position:relative;flex:1}.s-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8}
.s-input{width:100%;padding:10px 16px 10px 40px;border:1px solid #cbd5e1;border-radius:10px;font-size:14px;outline:none}
.s-input:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
.filter-select{padding:10px 16px;border:1px solid #cbd5e1;border-radius:10px;font-size:14px;outline:none;min-width:160px}

.table-wrap{overflow-x:auto}
.premium-table{width:100%;border-collapse:collapse}
.premium-table th{background:#f8fafc;padding:14px 20px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0}
.premium-table td{padding:14px 20px;border-bottom:1px solid #f1f5f9;vertical-align:middle;font-size:14px}
.t-row:hover td{background:#f8fafc}
.text-right{text-align:right}.text-muted{color:#94a3b8;font-size:13px}

.inv-num{font-family:monospace;font-size:13px;font-weight:600;color:#475569;background:#f1f5f9;padding:3px 8px;border-radius:6px}
.user-cell{display:flex;align-items:center;gap:10px}
.av{width:34px;height:34px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px}
.u-name{font-weight:600;color:#0f172a;font-size:14px}.u-code{font-size:12px;color:#94a3b8}
.money-cell{font-weight:700;font-size:14px}.money-cell.green{color:#10b981}.money-cell.red{color:#ef4444}

.badge{padding:4px 10px;border-radius:14px;font-size:12px;font-weight:600}
.badge-green{background:#dcfce7;color:#166534}.badge-yellow{background:#fef9c3;color:#854d0e}.badge-red{background:#fee2e2;color:#991b1b}.badge-gray{background:#f1f5f9;color:#64748b}

.act-group{display:flex;gap:6px;justify-content:flex-end}
.btn-act-pay{padding:6px 12px;background:#0d9488;color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer}
.btn-act-pay:hover{background:#0f766e}
.btn-act-del{padding:6px 8px;background:#fff;border:1px solid #fca5a5;color:#ef4444;border-radius:7px;cursor:pointer}
.btn-act-del:hover{background:#fef2f2}
.empty-cell{text-align:center;padding:40px;color:#94a3b8;font-style:italic}

.btn-pri,.btn-sec,.btn-outline{padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;border:none;transition:all .15s}
.btn-pri{background:#2563eb;color:#fff}.btn-pri:hover{background:#1d4ed8}
.btn-sec{background:#fff;color:#334155;border:1px solid #cbd5e1}.btn-sec:hover{background:#f8fafc}
.btn-outline{background:#fff;color:#475569;border:1px solid #cbd5e1}.btn-outline:hover{background:#f8fafc}

.modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal-box{background:#fff;border-radius:20px;width:100%;max-width:580px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;animation:slideUp .3s ease-out}
@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
.modal-hdr{padding:20px 24px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center}
.modal-hdr h3{font-size:17px;font-weight:700;color:#0f172a}
.close-btn{background:none;border:none;font-size:20px;color:#94a3b8;cursor:pointer}.close-btn:hover{color:#ef4444}
.modal-body{padding:24px;overflow-y:auto}.modal-ftr{padding:16px 24px;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:10px;background:#f8fafc}

.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-group{display:flex;flex-direction:column;gap:6px}.form-group.full{grid-column:1/-1}
.form-group label{font-size:13px;font-weight:600;color:#475569}
.form-input{padding:10px 14px;border:1px solid #cbd5e1;border-radius:9px;font-size:14px;outline:none}
.form-input:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
.form-textarea{min-height:80px;resize:vertical}
.mt-4{margin-top:16px}

.pay-info-box{background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0}
.pay-info-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;border-bottom:1px solid #f1f5f9}
.pay-info-row:last-child{border:none}.text-red{color:#ef4444}

.toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:2000;box-shadow:0 10px 15px rgba(0,0,0,.1)}
.toast-success{background:#dcfce7;color:#166534;border:1px solid #86efac}
.toast-error{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5}
.fade-enter-active,.fade-leave-active{transition:opacity .3s}.fade-enter-from,.fade-leave-to{opacity:0}
.slide-down-enter-active,.slide-down-leave-active{transition:all .3s}.slide-down-enter-from,.slide-down-leave-to{opacity:0;transform:translate(-50%,-20px)}
</style>
