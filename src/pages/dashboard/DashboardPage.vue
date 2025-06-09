<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from 'stores/auth.js'
import { useNotifications } from 'src/utils/notification.js'

const auth = useAuthStore()
const { showNotification } = useNotifications()
onMounted(() => {
  showNotification(`Welcome ${auth.user.name}`, '', 'green-10')
})
</script>

<template>
  <div class="text-h6 text-teal-10">Welcome {{ auth.user.name }}</div>
</template>

<style scoped></style>
