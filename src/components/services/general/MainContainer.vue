<script setup>
import { ref, reactive, watch, onMounted, defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'
import GeneralitiesForm from 'components/services/general/GeneralitiesForm.vue'

const InternetCredentialsForm = defineAsyncComponent(
  () => import('components/services/internet/InternetCredentialsForm.vue'),
)
const EquipmentDataTable = defineAsyncComponent(
  () => import('components/services/equipments/EquipmentDataTable.vue'),
)
const props = defineProps({
  data: Object,
  showDrawer: { type: Boolean, default: true },
})
const $q = useQuasar()
const drawer = ref(false)
const currentService = ref({})
const isNewService = ref(false)
const menu = reactive([
  { id: 1, icon: 'mdi-clipboard-outline', label: 'Datos generales', state: true },
  { id: 2, icon: 'mdi-cloud-key', label: 'Credenciales de internet', state: false },
  { id: 3, icon: 'mdi-router-wireless', label: 'Equipos instalados', state: false },
  { id: 4, icon: 'mdi-set-top-box', label: 'Información STB', state: false },
  { id: 5, icon: 'add', label: 'Nuevo servicio', state: false },
])
const emit = defineEmits(['service-updated'])
const createNewServiceObject = () => ({
  client_id: props.data?.client_id ?? props.data?.id ?? null,
})
const updateCurrentService = () => {
  if (isNewService.value) {
    currentService.value = createNewServiceObject()
  } else if (props.data?.id) {
    currentService.value = props.data
  } else {
    currentService.value = createNewServiceObject()
  }
}
const setMenu = (itm) => {
  menu.forEach((el) => (el.state = el.id === itm))
  if (itm === 5) {
    isNewService.value = true
    currentService.value = createNewServiceObject()
  } else {
    isNewService.value = false
    updateCurrentService()
  }
}
const handleRecordCreated = (payload) => {
  currentService.value = { ...currentService.value, ...payload }
  emit('service-updated', currentService.value)
  if (isNewService.value) {
    isNewService.value = false
    setMenu(1)
  }
  drawer.value = true
}
watch(
  () => props.showDrawer,
  (val) => (drawer.value = val),
  { immediate: true },
)
watch(
  () => props.data?.id,
  (newId, oldId) => {
    if (newId !== oldId) updateCurrentService()
  },
)
onMounted(() => {
  drawer.value = props.showDrawer
  updateCurrentService()
})
</script>
<template>
  <div class="row">
    <q-drawer
      dark
      v-model="drawer"
      show-if-above
      :width="300"
      :breakpoint="600"
      :class="$q.dark.isActive ? 'custom-secondary-drawer' : 'bg-grey-3'"
      v-if="drawer"
    >
      <q-scroll-area class="fit">
        <q-list padding dark>
          <q-item
            clickable
            v-ripple
            active-class="bg-blue-grey-9 text-grey-4"
            v-for="item in menu"
            :key="item.id"
            :active="item.state"
            @click="setMenu(item.id)"
          >
            <q-item-section>
              <q-item-label>
                <q-icon :name="item.icon" size="1.5em" class="q-mr-md" />
                {{ item.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-card class="custom-cards full-width" flat style="border: none !important">
      <q-card-section v-if="menu[0].state">
        <GeneralitiesForm :service="currentService" @record-created="handleRecordCreated" />
      </q-card-section>

      <q-card-section v-if="menu[1].state">
        <InternetCredentialsForm :service="currentService.id" />
      </q-card-section>

      <q-card-section v-if="menu[2].state">
        <EquipmentDataTable :service="currentService.id" />
      </q-card-section>

      <q-card-section v-if="menu[3].state">
        Información STB
      </q-card-section>

      <q-card-section v-if="menu[4].state">
        <GeneralitiesForm :service="currentService" @record-created="handleRecordCreated" />
      </q-card-section>
    </q-card>
  </div>
</template>
<style lang="sass" scoped></style>
