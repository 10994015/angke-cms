<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'

const stats = [
  { label: '宮廟數量', value: '—', icon: 'building', color: '#0891B2' },
  { label: '本月活動', value: '—', icon: 'calendar', color: '#3b82f6' },
  { label: '會員人數', value: '—', icon: 'users', color: '#10b981' },
  { label: '待審帳號', value: '—', icon: 'clock', color: '#f59e0b' },
]
</script>

<template>
  <AdminLayout title="帳戶首頁">
    <template #header-actions>
      <button class="btn-new">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        新增
      </button>
    </template>

    <!-- Section: Analytics -->
    <div class="section-header">
      <h2 class="section-title">Analytics</h2>
      <span class="section-period">Last 24 hours</span>
    </div>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon-wrap" :style="{ background: stat.color + '18' }">
          <!-- Building -->
          <svg v-if="stat.icon === 'building'" viewBox="0 0 20 20" fill="currentColor" :style="{ color: stat.color }" width="18" height="18">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
          </svg>
          <!-- Calendar -->
          <svg v-else-if="stat.icon === 'calendar'" viewBox="0 0 20 20" fill="currentColor" :style="{ color: stat.color }" width="18" height="18">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
          <!-- Users -->
          <svg v-else-if="stat.icon === 'users'" viewBox="0 0 20 20" fill="currentColor" :style="{ color: stat.color }" width="18" height="18">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
          <!-- Clock -->
          <svg v-else-if="stat.icon === 'clock'" viewBox="0 0 20 20" fill="currentColor" :style="{ color: stat.color }" width="18" height="18">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Section: Domains-like card -->
    <div class="cards-row">
      <div class="info-card">
        <div class="info-card-header">
          <span class="info-card-title">網域</span>
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="color:#9ca3af">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="domain-item">
          <span class="domain-status">●</span>
          <span class="domain-name">angkeinfo.com</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-header">
          <span class="info-card-title">最近活動</span>
        </div>
        <p class="empty-hint">尚無資料</p>
      </div>

      <div class="info-card">
        <div class="info-card-header">
          <span class="info-card-title">系統狀態</span>
        </div>
        <div class="status-item">
          <span class="status-dot ok"></span>
          <span class="status-text">所有系統運作正常</span>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped lang="scss">
.btn-new {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #0891B2;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;

  &:hover {
    background: #d04a20;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.section-period {
  font-size: 13px;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 4px 10px;
  background: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.cards-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 18px 20px;
}

.info-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.info-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.domain-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.domain-status {
  color: #10b981;
  font-size: 10px;
}

.domain-name {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.empty-hint {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.ok {
    background: #10b981;
  }
}

.status-text {
  font-size: 13px;
  color: #374151;
}
</style>
