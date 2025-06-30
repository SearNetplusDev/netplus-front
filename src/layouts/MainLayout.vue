<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-10 text-grey-1">
    <q-header reveal class="bg-primary">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>{{ route.meta.title }}</q-toolbar-title>

        <q-space />

        <!--   DataViewer filter template     -->
        <template v-if="useDataViewer.dataViewer.show">
          <q-btn
            flat
            :color="useDataViewer.dataViewer.filter ? 'warning' : 'white'"
            :icon="useDataViewer.dataViewer.filter ? 'search_off' : 'search'"
            @click="toggle"
          />
          <q-btn
            flat
            v-if="useDataViewer.dataViewer.allowCreate"
            color="white"
            icon="add"
            @click="create"
          />
        </template>
        <!--   End dataViewer filter template     -->

        <q-btn flat label="Logout" icon="mdi-power" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-footer reveal class="q-pa-none">
      <q-toolbar>
        <q-toolbar-title class="text-center text-subtitle2">
          ISP v{{ version }} || All rights reserved to Netplus 2021 - {{ currentYear }} &trade;
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="showDrawer"
      @mouseover="showDrawer = false"
      @mouseout="showDrawer = true"
      :breakpoint="300"
    >
      <q-scroll-area style="height: calc(100% - 153px); margin-top: 153px">
        <MenuComponent />
      </q-scroll-area>

      <q-img class="absolute-top" src="/images/wallpaper-002.png" style="height: 150px">
        <div class="absolute-bottom bg-transparent q-mini-drawer-hide" v-if="auth.user != null">
          <q-avatar size="56px" class="q-mb-sm">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="avatar image" />
            <!--            <q-icon name="mdi-account-circle" size="56px" />-->
          </q-avatar>
          <div class="text-weight-bold">
            {{ auth.user.name }}
          </div>
          <div>{{ auth.user.email }}</div>
          <div>Rol (próximamente será dinámico)</div>
        </div>
      </q-img>
    </q-drawer>

    <template v-if="showLogout">
      <LogoutDialog :visible="showLogout" @hide-dialog="showLogout = false" />
    </template>

    <q-page-container>
      <router-view class="background" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'stores/auth.js'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useRoute } from 'vue-router'
import LogoutDialog from 'pages/auth/LogoutDialog.vue'
import MenuComponent from 'components/menu/MenuComponent.vue'

const auth = useAuthStore()
const useDataViewer = useDataviewerStore()
const route = useRoute()
const version = ref('1.0.0')
const today = new Date()
const currentYear = ref(today.getFullYear())
const showDrawer = ref(false)
const leftDrawerOpen = ref(false)
const showLogout = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  showLogout.value = true
}

const toggle = () => {
  useDataViewer.setDataViewer({
    show: useDataViewer.dataViewer.show,
    filter: !useDataViewer.dataViewer.filter,
    allowCreate: useDataViewer.dataViewer.allowCreate,
    showForm: useDataViewer.dataViewer.showForm,
  })
}

const create = () => {
  useDataViewer.setDataViewer({
    show: useDataViewer.dataViewer.show,
    filter: useDataViewer.dataViewer.filter,
    allowCreate: useDataViewer.dataViewer.allowCreate,
    showForm: 1,
  })
}

onMounted(() => {
  useDataViewer.fetch()
})
</script>
<style lang="scss" scoped></style>
