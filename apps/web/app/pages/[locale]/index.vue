<script setup lang="ts">
const route  = useRoute()
const config = useRuntimeConfig()
await navigateTo(`/${route.params.locale}/${config.public.defaultSlug}`, { replace: true })
</script>
