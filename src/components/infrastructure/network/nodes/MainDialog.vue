<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import GeneralData from 'components/infrastructure/network/nodes/general/GeneralData.vue'
import ContactDataTable from 'components/infrastructure/network/nodes/contacts/ContactDataTable.vue'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const $q = useQuasar()
const props = defineProps({
  id: Number,
})
const id = ref(props.id)
const drawer = ref(false)
const title = ref('Registrar Nodo')
const menuList = reactive([
  { id: 1, icon: 'mdi-book-account-outline', label: 'Información General', state: false },
  { id: 2, icon: 'mdi-clipboard-account-outline', label: 'Contactos', state: false },
])
const setMenu = (itm) => {
  menuList.forEach((el) => {
    itm === el.id ? (el.state = true) : (el.state = false)
  })
}
const setID = (updatedID) => {
  id.value = updatedID
}
const setTitle = (name) => {
  title.value = `Modificar datos del Nodo: ${name}`
}
onMounted(() => {
  menuList[0].state = true
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-header class="q-header">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="drawer = !drawer" v-if="id > 0" />
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
      :class="$q.dark.isActive ? 'custom-secondary-drawer' : 'bg-grey-3'"
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
            <GeneralData :node="id" @loadDrawer="setID" @updateTitle="setTitle" />
          </q-card-section>
          <q-card-section v-if="menuList[1].state === true">
            <ContactDataTable :node="id" />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="sass">
.menu-list .q-item
  border-radius: 0
</style>
