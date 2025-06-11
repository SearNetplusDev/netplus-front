<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-10 text-grey-1">
    <q-header reveal class="bg-primary">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-space />

        <!--   DataViewer template     -->

        <q-btn flat label="Logout" icon="mdi-power" to="/logout" />
      </q-toolbar>
    </q-header>

    <q-footer reveal class="q-py-sm">
      <q-toolbar-title class="text-center text-subtitle2">
        ISP v{{ version }} || All rights reserved to Netplus 2021 - {{ currentYear }} &trade;
      </q-toolbar-title>
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
      <q-scroll-area style="height: calc(100% - 100px); margin-top: 100px">
        <MenuComponent />
      </q-scroll-area>

      <q-img class="absolute-top" src="public/images/wallpaper-002.png" style="height: 150px">
        <div class="absolute-bottom bg-transparent q-mini-drawer-hide" v-if="auth.user != null">
          <q-avatar size="56px" class="q-mb-sm">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
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

    <q-page-container>
      <router-view class="background" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'stores/auth.js'
import MenuComponent from 'components/menu/MenuComponent.vue'

const auth = useAuthStore()
const version = ref('1.0.0')
const today = new Date()
const currentYear = ref(today.getFullYear())
const showDrawer = ref(false)
const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
<style lang="scss" scoped></style>
