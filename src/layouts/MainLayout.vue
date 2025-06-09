<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Netplus</q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-footer reveal elevated class="q-py-sm">
      <q-toolbar-title class="text-center text-subtitle2">
        ISP v{{ version }} || All right reserved to Netplus 2021 - {{ currentYear }} &trade;
      </q-toolbar-title>
    </q-footer>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links</q-item-label>

        <!--EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" /-->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const version = ref('1.0.0')
const today = new Date()
const currentYear = ref(today.getFullYear())
// import EssentialLink from 'components/EssentialLink.vue'

// const linksList = [
//   {
//     title: 'Docs',
//     caption: 'quasar.dev',
//     icon: 'school',
//     link: 'https://quasar.dev',
//   },
//   {
//     title: 'Github',
//     caption: 'github.com/quasarframework',
//     icon: 'code',
//     link: 'https://github.com/quasarframework',
//   },
//   {
//     title: 'Discord Chat Channel',
//     caption: 'chat.quasar.dev',
//     icon: 'chat',
//     link: 'https://chat.quasar.dev',
//   },
//   {
//     title: 'Forum',
//     caption: 'forum.quasar.dev',
//     icon: 'record_voice_over',
//     link: 'https://forum.quasar.dev',
//   },
//   {
//     title: 'Twitter',
//     caption: '@quasarframework',
//     icon: 'rss_feed',
//     link: 'https://twitter.quasar.dev',
//   },
//   {
//     title: 'Facebook',
//     caption: '@QuasarFramework',
//     icon: 'public',
//     link: 'https://facebook.quasar.dev',
//   },
//   {
//     title: 'Quasar Awesome',
//     caption: 'Community Quasar projects',
//     icon: 'favorite',
//     link: 'https://awesome.quasar.dev',
//   },
// ]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
<style lang="scss" scoped></style>
