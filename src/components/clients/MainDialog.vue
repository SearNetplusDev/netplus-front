<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import GeneralData from 'components/clients/data/general/GeneralData.vue'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const $q = useQuasar()
const props = defineProps({
  id: Number,
})
const id = ref(props.id)
const drawer = ref(false)
const title = ref('Registar Cliente')
const menuList = reactive([
  {
    id: 1,
    icon: 'contacts',
    label: 'Datos Personales',
    state: false,
  },
  {
    id: 2,
    icon: 'mdi-account-cash',
    label: 'Datos de Facturación',
    state: false,
  },
  {
    id: 3,
    icon: 'mdi-card-account-details',
    label: 'Documentos Personales',
    state: false,
  },
  {
    id: 4,
    icon: 'mdi-card-account-phone',
    label: 'Telefónos',
    state: false,
  },
  {
    id: 5,
    icon: 'mdi-card-account-mail',
    label: 'Correos electrónicos',
    state: false,
  },
  {
    id: 6,
    icon: 'mdi-map-marker-account',
    label: 'Direcciones',
    state: false,
  },
  {
    id: 7,
    icon: 'mdi-file-account',
    label: 'Contratos',
    state: false,
  },
  {
    id: 8,
    icon: 'mdi-account-multiple-plus',
    label: 'Referencias Personales',
    state: false,
  },
])
const setMenu = (itm) => {
  menuList.forEach((el) => {
    itm === el.id ? (el.state = true) : (el.state = false)
  })
}
const handleRegister = (regID) => {
  id.value = regID
}
onMounted(() => {
  menuList[0].state = true

  if (props.id > 0) {
    title.value = 'Editar información'
  }
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-header class="q-header">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" v-if="id > 0" round dense icon="menu" />
        <q-toolbar-title>{{ title }}</q-toolbar-title>

        <q-btn v-close-popup round dense icon="close" />
      </q-toolbar>
    </q-header>

    <FooterComponent />

    <q-drawer
      dark
      v-model="drawer"
      show-if-above
      :width="300"
      :breakpoint="600"
      :class="$q.dark.isActive ? 'bg-blue-grey-10' : 'bg-grey-3'"
      v-if="id > 0"
    >
      <q-scroll-area class="fit">
        <q-list padding dark class="menu-list">
          <q-item
            clickable
            v-for="item in menuList"
            :key="item.id"
            v-ripple
            :active="item.state"
            active-class="bg-blue-grey-9 text-grey-4"
            @click="setMenu(item.id)"
          >
            <q-item-section>
              <q-item-label>
                <q-icon :name="item.icon" size="2em" class="q-mr-md" />
                {{ item.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding class="q-pa-md bg-dark">
        <q-card class="custom-cards q-pa-sm" flat>
          <q-card-section v-if="menuList[0].state === true">
            <GeneralData :client="id" @loadDrawer="handleRegister" />
          </q-card-section>
          <q-card-section v-if="menuList[1].state === true">Facturación</q-card-section>
          <q-card-section v-if="menuList[2].state === true">Documentos Personales</q-card-section>
          <q-card-section v-if="menuList[3].state === true">Telefonos</q-card-section>
          <q-card-section v-if="menuList[4].state === true">Correos electronicos</q-card-section>
          <q-card-section v-if="menuList[5].state === true">Direcciones</q-card-section>
          <q-card-section v-if="menuList[6].state === true">Contratos</q-card-section>
          <q-card-section v-if="menuList[7].state === true">Referencias</q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="sass">
.menu-list .q-item
  border-radius: 0
</style>
