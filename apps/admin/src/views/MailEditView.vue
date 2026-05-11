<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import axiosClient from '@/axios'

const router = useRouter()

const mail     = history.state?.mail || null
const id       = mail?.id
const error    = ref('')
const deleting = ref(false)
const testing  = ref(false)

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const handleSendTest = async () => {
  testing.value = true
  error.value   = ''
  try {
    const res = await axiosClient.post(`/backend/mail/${id}/test`)
    if (res.data.statusCode === 200 || res.data.statusCode === 202) {
      alert('測試信件已發送，請確認信箱。')
    } else {
      error.value = res.data.message || '測試發送失敗'
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    testing.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('確定要刪除此寄信帳號嗎？此操作無法復原。')) return
  deleting.value = true
  error.value    = ''
  try {
    const res = await axiosClient.delete(`/backend/mail/${id}`)
    if (res.data.statusCode === 200) {
      router.push('/mail')
    } else {
      error.value = res.data.message || '刪除失敗'
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  if (!mail) router.replace('/mail')
})
</script>

<template>
  <AdminLayout title="寄信帳號詳情">
    <template #header-actions>
      <button class="btn-back" @click="router.push('/mail')">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        返回列表
      </button>
    </template>

    <div v-if="mail" class="detail-card">
      <!-- 帳號資訊 -->
      <div class="detail-section">
        <h3 class="section-title">帳號資訊</h3>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">名稱</span>
            <span class="info-value">{{ mail.name || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value mono">{{ mail.email || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- SMTP 設定 -->
      <div class="detail-section">
        <h3 class="section-title">SMTP 設定</h3>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">SMTP 伺服器</span>
            <span class="info-value mono">{{ mail.smtpServer || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">連接埠</span>
            <span class="port-badge">{{ mail.smtpPort || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- 時間資訊 -->
      <div class="detail-section">
        <h3 class="section-title">時間資訊</h3>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">建立時間</span>
            <span class="info-value dim">{{ formatDate(mail.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">更新時間</span>
            <span class="info-value dim">{{ formatDate(mail.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>

      <!-- 操作 -->
      <div class="detail-actions">
        <button class="btn-danger" :disabled="deleting" @click="handleDelete">
          {{ deleting ? '刪除中...' : '刪除帳號' }}
        </button>
        <button class="btn-test" :disabled="testing" @click="handleSendTest">
          <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
          {{ testing ? '發送中...' : '發送測試信' }}
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped lang="scss">
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover { border-color: #9ca3af; background: #f9fafb; }
}

.detail-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  max-width: 640px;
}

.detail-section {
  padding: 20px 24px;
  & + .detail-section { border-top: 1px solid #f3f4f6; }
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 14px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.info-value {
  font-size: 13px;
  color: #111827;
  &.mono { font-family: 'Courier New', monospace; color: #4b5563; }
  &.dim  { color: #9ca3af; }
}

.port-badge {
  display: inline-block;
  padding: 2px 10px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.form-error {
  margin: 0 24px;
  font-size: 12px;
  color: #dc2626;
}

.detail-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.btn-test {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  background: #eff6ff;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover:not(:disabled) { background: #3b82f6; color: #fff; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-danger {
  padding: 9px 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff;
  color: #dc2626;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover:not(:disabled) { background: #fef2f2; border-color: #dc2626; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>
