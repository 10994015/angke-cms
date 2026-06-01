export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:chunkError', ({ error }) => {
    console.error('[route-chunk-error]', error)
    reloadNuxtApp({ force: true })
  })
})
