<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import GeneralitiesForm from 'components/services/general/GeneralitiesForm.vue'

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
const setMenu = (itm) => {
  menu.forEach((el) => {
    itm === el.id ? (el.state = true) : (el.state = false)
  })
}
const service = ref(props.data.id)
const client = ref(props.data.client_id)
const showDrawerOnCreate = (payload) => {
  drawer.value = true
  service.value = payload.id
  client.value = payload.client_id
}
watch(
  () => props.showDrawer,
  (newVal) => {
    drawer.value = newVal
  },
  { immediate: true },
)
onMounted(() => {
  menu[0].state = true
  drawer.value = props.showDrawer
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
        <GeneralitiesForm :service="props.data" @record-created="showDrawerOnCreate" />
      </q-card-section>
      <q-card-section v-if="menu[1].state === true">Credenciales internet</q-card-section>
      <q-card-section v-if="menu[2].state === true">Equipos instalados</q-card-section>
      <q-card-section v-if="menu[3].state === true">Nuevo servicio</q-card-section>
    </q-card>
  </div>
</template>

<style scoped></style>
