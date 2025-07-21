<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import DUIForm from 'components/clients/data/general/DUIForm.vue'
import GeneralData from 'components/clients/data/general/GeneralData.vue'
import PersonalDocuments from 'components/clients/data/general/documents/PersonalDocuments.vue'
import PhonesDataTable from 'components/clients/data/general/phones/PhonesDataTable.vue'
import AddressDataTable from 'components/clients/data/general/address/AddressDataTable.vue'
import EmailDataTable from 'components/clients/data/general/emails/EmailDataTable.vue'
import ReferencesTable from 'components/clients/data/general/references/ReferencesTable.vue'
import BillingDataForm from 'components/clients/data/general/billing/BillingDataForm.vue'
import ContractDataTable from 'components/clients/data/general/contracts/ContractDataTable.vue'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const $q = useQuasar()
const props = defineProps({
  id: Number,
})
const id = ref(props.id)
const drawer = ref(false)
const title = ref('Registrar cliente')
const menuList = reactive([
  {
    id: 1,
    icon: 'contacts',
    label: 'Datos Personales',
    state: false,
  },
  {
    id: 2,
    icon: 'mdi-card-account-details',
    label: 'Documentos Personales',
    state: false,
  },
  {
    id: 3,
    icon: 'mdi-card-account-phone',
    label: 'Telefónos',
    state: false,
  },
  {
    id: 4,
    icon: 'mdi-map-marker-account',
    label: 'Direcciones',
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
    icon: 'mdi-account-cash',
    label: 'Datos de Facturación',
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
const setTitle = (name) => {
  title.value = `Editar información de: ${name}`
}
const showDUIForm = ref(true)
onMounted(() => {
  menuList[0].state = true
  if (props.id > 0) showDUIForm.value = false
  // getName(props.id)
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
        <template v-if="showDUIForm">
          <DUIForm :visible="showDUIForm" @hideDuiDialog="handleRegister" />
        </template>

        <q-card class="custom-cards q-pa-sm" flat>
          <q-card-section v-if="menuList[0].state === true">
            <GeneralData :client="id" @loadDrawer="handleRegister" @updateTitle="setTitle" />
          </q-card-section>
          <q-card-section v-if="menuList[1].state === true">
            <PersonalDocuments :client="id" />
          </q-card-section>
          <q-card-section v-if="menuList[2].state === true">
            <PhonesDataTable :client="id" />
          </q-card-section>
          <q-card-section v-if="menuList[3].state === true">
            <AddressDataTable :client="id" />
          </q-card-section>
          <q-card-section v-if="menuList[4].state === true">
            <EmailDataTable :client="id" />
          </q-card-section>
          <q-card-section v-if="menuList[5].state === true">
            <BillingDataForm :client="id" />
          </q-card-section>
          <q-card-section v-if="menuList[6].state === true">
            <ContractDataTable :client="id" />
          </q-card-section>
          <q-card-section v-if="menuList[7].state === true">
            <ReferencesTable :client="id" />
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
