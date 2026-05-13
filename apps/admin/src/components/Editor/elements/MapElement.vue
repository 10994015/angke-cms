<template>
  <div class="el-map">
    <div class="el-map-display">
      <div class="el-map-pin">🗺️</div>
      <p class="el-map-hint">Google 地圖</p>
      <p v-if="val.lat && val.lng" class="el-map-coords">{{ val.lat }}, {{ val.lng }}</p>
    </div>
    <div v-if="val.address" class="el-map-info">
      <span class="el-map-icon">📍</span>
      <span class="el-map-addr">{{ val.address }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  val:  { type: Object, default: () => ({}) },
  meta: { type: Object, default: () => ({}) },
})
</script>

<style scoped lang="scss">
.el-map {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #f5f5f5;
}

.el-map-display {
  width: 100%;
  height: 200px;
  background: #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.el-map-pin   { font-size: 36px; opacity: 0.5; }
.el-map-hint  { font-size: 13px; color: #9ca3af; margin: 0; }
.el-map-coords { font-size: 11px; color: #9ca3af; margin: 0; }

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
