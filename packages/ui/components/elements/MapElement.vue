<template>
  <div class="el-map">
    <iframe
      v-if="val.lat && val.lng"
      :src="`https://maps.google.com/maps?q=${val.lat},${val.lng}&output=embed&z=${val.zoom || 15}`"
      class="el-map-iframe"
      frameborder="0"
      allowfullscreen
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    />
    <div v-else class="el-map-placeholder">
      <span>🗺️</span>
      <p>{{ val.address || 'Google 地圖' }}</p>
    </div>

    <div v-if="val.address" class="el-map-info">
      <span class="el-map-icon">📍</span>
      <span class="el-map-addr">{{ val.address }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ val: Record<string, any>; meta?: Record<string, any> }>()
</script>

<style scoped>
.el-map { width: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.el-map-iframe { width: 100%; height: 300px; display: block; border: none; }

.el-map-placeholder {
  width: 100%;
  height: 200px;
  background: #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.el-map-placeholder span { font-size: 36px; opacity: 0.5; }
.el-map-placeholder p    { font-size: 13px; color: #9ca3af; margin: 0; }

.el-map-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}
.el-map-icon { font-size: 18px; flex-shrink: 0; }
.el-map-addr { font-size: 13px; color: #4b5563; line-height: 1.4; }
</style>
