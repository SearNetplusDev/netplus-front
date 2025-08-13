<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import GeneralitiesForm from 'components/services/general/GeneralitiesForm.vue'
import InternetCredentialsForm from 'components/services/internet/InternetCredentialsForm.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => {},
  },
  showDrawer: {
    type: Boolean,
    default: true,
  },
})
const $q = useQuasar()
const drawer = ref(false)
const menu = reactive([
  { id: 1, icon: 'mdi-clipboard-outline', label: 'Datos generales', state: false },
  { id: 2, icon: 'mdi-cloud-key', label: 'Credenciales de internet', state: false },
  { id: 3, icon: 'mdi-router-wireless', label: 'Equipos instalados', state: false },
  { id: 4, icon: 'add', label: 'Nuevo servicio', state: false },
])
const currentService = ref({})
const isNewService = ref(false)
const createNewServiceObject = () => {
  let clientId = null
  if (props.data.client_id) {
    clientId = props.data.client_id
  } else if (props.data.id) {
    clientId = props.data.id
  } else if (typeof props.data === Object && Object.keys(props.data).length > 0) {
    clientId = Object.values(props.data).find(
      (val) => typeof val === 'number' || (typeof val === 'string' && !isNaN(val)),
    )
  }
  return {
    client_id: clientId,
  }
}
const emit = defineEmits(['service-updated'])
const updateCurrentService = () => {
  if (isNewService.value) {
    currentService.value = createNewServiceObject()
  } else {
    if (props.data.id) {
      currentService.value = props.data
    } else {
      currentService.value = createNewServiceObject()
    }
  }
}
const setMenu = (itm) => {
  menu.forEach((el) => {
    itm === el.id ? (el.state = true) : (el.state = false)
  })

  if (itm === 4) {
    isNewService.value = true
    currentService.value = createNewServiceObject()
  } else {
    isNewService.value = false
    updateCurrentService()
  }
}
const handleRecordCreated = (payload) => {
  currentService.value = {
    ...currentService.value,
    id: payload.id,
    client_id: payload.client_id,
  }
  emit('service-updated', currentService.value)
  if (isNewService.value) {
    isNewService.value = false
    setMenu(1)
  }
  drawer.value = true
}
watch(
  () => props.showDrawer,
  (newVal) => {
    drawer.value = newVal
  },
  { immediate: true },
)
watch(
  () => props.data,
  (newData, oldData) => {
    console.log('props.data cambió de: ', oldData, 'a: ', newData)
    updateCurrentService()
  },
  { deep: true, immediate: false },
)
onMounted(() => {
  menu[0].state = true
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

    <q-card class="custom-cards full-width" flat style="border: 0">
      <q-card-section v-if="menu[0].state === true">
        <GeneralitiesForm :service="currentService" @record-created="handleRecordCreated" />
      </q-card-section>

      <q-card-section v-if="menu[1].state === true">
        <InternetCredentialsForm :service="currentService.id" />
      </q-card-section>

      <q-card-section v-if="menu[2].state === true">Equipos instalados</q-card-section>

      <q-card-section v-if="menu[3].state === true">
        <GeneralitiesForm :service="currentService" @record-created="handleRecordCreated" />
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped></style>
