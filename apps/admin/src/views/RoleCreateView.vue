<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { usePermissionStore } from '@/stores/permission'

const router = useRouter()
const store  = usePermissionStore()

const form = reactive({ name: '', status: 'OPEN' })

// allPerms: [{ id, category, name, mode: ['FULL','READONLY'] }]
// formPerms: [{ id, category, name, mode: '' (選擇的值) }]
const allPerms  = ref([])
const formPerms = ref([])

const error  = ref('')
const saving = ref(false)

const MODE_LABELS = { FULL: '完整', READONLY: '唯讀', Full: '完整', Readonly: '唯讀' }

const groupedPerms = computed(() => {
  const map = {}
  for (const p of allPerms.value) {
    if (!map[p.category]) map[p.category] = []
    map[p.category].push(p)
  }
  return Object.entries(map).map(([category, items]) => ({ category, items }))
})

const getFormPerm = (id) => formPerms.value.find(p => p.id === id)

const applyPerms = (cats) => {
  allPerms.value  = cats
  formPerms.value = cats.map(p => ({ id: p.id, category: p.category, name: p.name, mode: '' }))
}

onMounted(async () => {
  if (store.permissionCategories.length > 0) {
    applyPerms(store.permissionCategories)
    return
  }
  applyPerms(await store.fetchPermissionCategories())
})

const handleSave = async () => {
  if (!form.name.trim()) { error.value = '請輸入角色名稱'; return }
  saving.value = true
  error.value  = ''
  try {
    const res = await store.createRole({
      name:        form.name.trim(),
      status:      form.status,
      permissions: formPerms.value,
    })
    if (res.statusCode === 200 || res.statusCode === 201) {
      router.push('/backend/roles')
    } else {
      error.value = res.message || '新增失敗'
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '網路錯誤'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminLayout title="新增角色">
    <template #header-actions>
      <button class="btn-back" @click="router.push('/backend/roles')">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        返回列表
      </button>
    </template>

    <div class="form-layout">
      <!-- 左：基本資料 -->
      <div class="form-card">
        <div class="form-section">
          <h3 class="section-title">基本資訊</h3>
          <div class="field-group">
            <label class="field-label">角色名稱 <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="field-input" placeholder="例：系統管理員" autofocus />
          </div>
          <div class="field-group">
            <label class="field-label">狀態</label>
            <div class="toggle-group">
              <button class="toggle-btn" :class="{ active: form.status === 'OPEN' }" @click="form.status = 'OPEN'">啟用</button>
              <button class="toggle-btn" :class="{ active: form.status === 'INVALID' }" @click="form.status = 'INVALID'">停用</button>
            </div>
          </div>
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <div class="form-actions">
          <button class="btn-cancel" @click="router.push('/backend/roles')">取消</button>
          <button class="btn-save" :disabled="saving" @click="handleSave">
            {{ saving ? '新增中...' : '新增角色' }}
          </button>
        </div>
      </div>

      <!-- 右：權限設定 -->
      <div class="form-card perm-card">
        <div class="form-section">
          <h3 class="section-title">權限設定</h3>

          <div class="perm-groups">
            <div v-for="group in groupedPerms" :key="group.category" class="perm-group">
              <div class="perm-group-title">{{ group.category }}</div>
              <div class="perm-items">
                <div v-for="item in group.items" :key="item.id" class="perm-item">
                  <span class="perm-name">{{ item.name }}</span>
                  <select
                    v-if="getFormPerm(item.id)"
                    v-model="getFormPerm(item.id).mode"
                    class="mode-select"
                  >
                    <option value="">無權限</option>
                    <option v-for="m in (Array.isArray(item.mode) ? item.mode : ['FULL','READONLY'])" :key="m" :value="m">
                      {{ MODE_LABELS[m] || m }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  &:hover { border-color: #9ca3af; background: #f9fafb; }
}

.form-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  width: 360px;
  flex-shrink: 0;
  &.perm-card { flex: 1; width: auto; }
}

.form-section {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}

.field-group { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  .required { color: #0891B2; }
}

.field-input {
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  outline: none;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: #0891B2; box-shadow: 0 0 0 3px rgba(8,145,178,0.1); }
}

.toggle-group { display: flex; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
.toggle-btn {
  flex: 1;
  padding: 9px 0;
  font-size: 13px;
  font-family: inherit;
  border: none;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  & + & { border-left: 1px solid #d1d5db; }
  &.active { background: #0891B2; color: #fff; font-weight: 600; }
}

.form-error { margin: 0 24px; font-size: 12px; color: #dc2626; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.btn-cancel {
  padding: 9px 18px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f3f4f6; }
}
.btn-save {
  padding: 9px 22px;
  border: none;
  border-radius: 8px;
  background: #0891B2;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: #0E7490; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}


.perm-groups { display: flex; flex-direction: column; gap: 12px; }
.perm-group { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.perm-group-title {
  padding: 8px 14px;
  background: #f9fafb;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}
.perm-items { display: flex; flex-direction: column; }
.perm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  border-bottom: 1px solid #f9fafb;
  gap: 12px;
  &:last-child { border-bottom: none; }
}
.perm-name { font-size: 13px; color: #374151; flex: 1; }

.mode-select {
  padding: 5px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  background: #fff;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  min-width: 90px;
  transition: border-color 0.15s;
  &:focus { border-color: #0891B2; }
  &:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }
}
</style>
