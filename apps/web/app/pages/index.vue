<script setup lang="ts">
const config = useRuntimeConfig()
await navigateTo(`/${config.public.defaultLocale}/${config.public.defaultSlug}`, { replace: true })
</script>
