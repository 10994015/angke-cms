<script setup>
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { setUnauthorizedHandler } from '@/axios'

const router = useRouter()
const authStore = useAuthStore()

setUnauthorizedHandler(() => {
  authStore.forceLogout()
  if (router.currentRoute.value.path !== '/login') {
    router.replace('/login')
  }
})
</script>

<template>
  <RouterView />
</template>
