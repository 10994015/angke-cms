<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { setUnauthorizedHandler } from '@/axios'

const authStore = useAuthStore()

setUnauthorizedHandler(() => {
  authStore.forceLogout()
})
</script>

<template>
  <RouterView />
</template>
