<script setup>
import { ref, computed } from 'vue'
import { registrations, courses } from '../../data/mockData.js'

const regs = ref([...registrations])
const filterStatus = ref('')
const search = ref('')
const showAddModal = ref(false)
const form = ref({ studentName:'', courseName:'', requestClass:'Ca sáng', note:'', registerDate: new Date().toLocaleDateString('vi-VN') })

const filtered = computed(() => regs.value.filter(r => {
  const matchS = !filterStatus.value || r.status === filterStatus.value
  const matchQ = !search.value || r.studentName.toLowerCase().includes(search.value.toLowerCase()) || r.courseName.toLowerCase().includes(search.value.toLowerCase())
  return matchS && matchQ
}))

const pending = computed(() => regs.value.filter(r=>r.status==='Chờ duyệt').length)
const approved = computed(() => regs.value.filter(r=>r.status==='Đã duyệt').length)
const rejected = computed(() => regs.value.filter(r=>r.status==='Từ chối').length)

function approve(r) { r.status = 'Đã duyệt' }
function reject(r) { r.status = 'Từ chối' }
function addReg() {
  if (!form.value.studentName || !form.value.courseName) { alert('Vui lòng nhập đủ thông tin!'); return }
  regs.value.unshift({ id: Date.now(), ...form.value, status:'Chờ duyệt' })
  showAddModal.value = false
  form.value = { studentName:'', courseName:'', requestClass:'Ca sáng', note:'', registerDate: new Date().toLocaleDateString('vi-VN') }
}
const statusClass = s => s==='Đã duyệt'?'badge-green':s==='Từ chối'?'badge-red':'badge-yellow'
</script>

<template>
<!-- Add Modal -->
<div v-if="showAddModal" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:center;justify-content:center" @click.self="showAddModal=false">
  <div style="background:#fff;border-radius:16px;width:480px;padding:28px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h3 style="font-weight:700;font-size:18px">Tạo đăng ký mới</h3>
      <button @click="showAddModal=false" style="border:none;background:none;font-size:20px;cursor:pointer;color:#94a3b8">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div><label style="font-size:13px;font-weight:500;display:block;margin-bottom:5px">Tên học viên *</label><input v-model="form.studentName" placeholder="Nguyễn Văn A" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:14px;outline:none" /></div>
      <div><label style="font-size:13px;font-weight:500;display:block;margin-bottom:5px">Khóa học *</label>
        <select v-model="form.courseName" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:14px;outline:none">
          <option value="">-- Chọn khóa học --</option><option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
      </div>
      <div><label style="font-size:13px;font-weight:500;display:block;margin-bottom:5px">Ca học</label><select v-model="form.requestClass" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:14px;outline:none"><option>Ca sáng</option><option>Ca chiều</option><option>Ca tối</option><option>Cuối tuần</option></select></div>
      <div><label style="font-size:13px;font-weight:500;display:block;margin-bottom:5px">Ghi chú</label><textarea v-model="form.note" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:14px;outline:none;resize:vertical;min-height:64px" placeholder="(tuỳ chọn)"></textarea></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
      <button class="btn-outline" @click="showAddModal=false">Huỷ</button>
      <button class="btn-primary" @click="addReg">✅ Tạo đăng ký</button>
    </div>
  </div>
</div>

<div>
  <div class="page-header">
    <div><h2 class="page-title">Đăng ký khóa học</h2><p class="page-desc">Duyệt và quản lý đăng ký của học viên</p></div>
    <div class="btn-actions">
      <button class="btn-outline" @click="showAddModal=true">+ Tạo đăng ký</button>
      <span class="badge badge-yellow" style="font-size:14px;padding:8px 16px">⏳ {{ pending }} chờ duyệt</span>
    </div>
  </div>

  <!-- Stats -->
  <div class="stat-cards cols-3">
    <div class="stat-card orange"><div class="label">CHỜ DUYỆT</div><div class="value" style="color:#f59e0b">{{ pending }}</div></div>
    <div class="stat-card green"><div class="label">ĐÃ DUYỆT</div><div class="value" style="color:#10b981">{{ approved }}</div></div>
    <div class="stat-card red"><div class="label">TỪ CHỐI</div><div class="value" style="color:#ef4444">{{ rejected }}</div></div>
  </div>

  <!-- Filters -->
  <div class="card" style="margin-bottom:16px">
    <div class="filter-bar">
      <label>Trạng thái:</label>
      <select v-model="filterStatus"><option value="">Tất cả</option><option>Chờ duyệt</option><option>Đã duyệt</option><option>Từ chối</option></select>
      <div class="spacer"></div>
      <input placeholder="🔍 Tìm học viên, khóa học..." v-model="search" style="min-width:240px" />
    </div>
  </div>

  <div class="card">
    <table class="data-table">
      <thead><tr><th>HỌC VIÊN</th><th>KHÓA HỌC</th><th>CA HỌC</th><th>NGÀY ĐK</th><th>GHI CHÚ</th><th>TRẠNG THÁI</th><th>HÀNH ĐỘNG</th></tr></thead>
      <tbody>
        <tr v-for="r in filtered" :key="r.id">
          <td><div class="user-cell"><div class="avatar orange">{{ r.studentName.split(' ').map(w=>w[0]).slice(-2).join('') }}</div><span class="text-bold">{{ r.studentName }}</span></div></td>
          <td>{{ r.courseName }}</td>
          <td><span class="badge badge-blue">{{ r.requestClass }}</span></td>
          <td class="text-muted">{{ r.registerDate }}</td>
          <td class="text-muted">{{ r.note || '—' }}</td>
          <td><span class="badge" :class="statusClass(r.status)">{{ r.status }}</span></td>
          <td>
            <div v-if="r.status==='Chờ duyệt'" style="display:flex;gap:6px">
              <button class="btn-approve" @click="approve(r)">✓ Duyệt</button>
              <button class="btn-reject" @click="reject(r)">✗ Từ chối</button>
            </div>
            <button v-else class="btn-outline" style="padding:5px 10px;font-size:12px" @click="r.status='Chờ duyệt'">↩ Hoàn tác</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="filtered.length===0" style="text-align:center;padding:30px;color:#94a3b8">Không có đơn đăng ký nào.</div>
  </div>
</div>
</template>
