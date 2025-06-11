<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'stores/auth.js'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const props = defineProps({
  visible: Boolean,
})
const isVisible = ref(props.visible)
const logout = async () => {
  await auth.logout()
  await router.push('/login')
}
</script>

<template>
  <q-dialog
    dark
    v-model="isVisible"
    @hide="$emit('hide-dialog')"
    persistent
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark class="my-custom-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-subtitle1 text-white text-amber">Netplus ISP Manager</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>
      <q-card-section class="q-pt-lg text-center text-h6">¿Deseas Cerrar Sesión?</q-card-section>
      <q-card-actions align="between">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-separator />
        <q-btn flat label="Salir" color="red" v-close-popup @click="logout" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.my-custom-card {
  width: 450px;
  max-width: 60vh;
}
</style>
