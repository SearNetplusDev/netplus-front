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
<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-10 text-grey-1">
    <q-header reveal class="app-header">
      <q-toolbar class="app-toolbar">
        <q-btn flat round dense icon="menu" class="menu-toggle" @click="toggleLeftDrawer" />

        <div class="page-heading">
          <div class="page-title">
            {{ route.meta.title }}
          </div>

          <div class="page-subtitle">NetPlus ISP Manager</div>
        </div>

        <q-space />

        <template v-if="useDataViewer.dataViewer.show">
          <q-btn
            round
            flat
            dense
            :icon="useDataViewer.dataViewer.filter ? 'search_off' : 'search'"
            :class="{ 'action-active': useDataViewer.dataViewer.filter }"
            @click="toggle"
          >
            <q-tooltip>
              {{ useDataViewer.dataViewer.filter ? 'Ocultar filtros' : 'Mostrar filtros' }}
            </q-tooltip>
          </q-btn>

          <q-btn
            v-if="useDataViewer.dataViewer.allowCreate"
            round
            flat
            dense
            icon="add"
            class="header-action"
            @click="create"
          >
            <q-tooltip>Crear registro</q-tooltip>
          </q-btn>
        </template>

        <q-separator vertical inset class="q-mx-sm" />

        <q-btn flat no-caps class="user-menu" @click="logout">
          <q-avatar square size="34px">
            <q-img src="/images/logos/iso_wth.png" alt="avatar" />
          </q-avatar>

          <div class="q-ml-sm text-left gt-xs">
            <div class="user-name">{{ auth.user?.name }}</div>
            <div class="user-role">{{ auth.user?.roles?.[0] }}</div>
          </div>

          <q-icon name="expand_more" size="18px" class="q-ml-sm" />
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-footer reveal class="app-footer">
      <div class="footer-content">
        <span>Sistema administrativo de Netplus</span>
        <span class="footer-separator">•</span>
        <span>v {{ version }}</span>
        <span class="footer-separator">•</span>
        <span> &copy; 2021 - {{ currentYear }}</span>
      </div>
    </q-footer>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :mini="showDrawer"
      :width="260"
      :mini-width="72"
      :breakpoint="700"
      class="app-drawer"
      @mouseover="showDrawer = false"
      @mouseout="showDrawer = true"
    >
      <div class="drawer-inner">
        <div class="drawer-brand">
          <div class="brand-logo">
            <q-img src="/images/logos/logo_wth.png" alt="logo" fit="contain" />
          </div>
        </div>

        <div v-if="auth.user" class="drawer-user q-mini-drawer-hide">
          <q-avatar size="32px" square>
            <q-img src="/images/user.jpg" alt="avatar" />
          </q-avatar>

          <div class="q-ml-sm ellipsis">
            <div class="drawer-user-name">
              {{ auth.user?.name }}
            </div>

            <div class="drawer-user-role ellipsis">
              {{ auth.user?.roles?.[0] }}
            </div>
          </div>
        </div>

        <q-scroll-area class="drawer-scroll">
          <MenuComponent />
        </q-scroll-area>

        <div class="drawer-footer">
          <div class="drawer-version q-mini-drawer-hide">v {{ version }}</div>
          <q-btn flat round dense icon="power_settings_new" class="drawer-logout" @click="logout">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-drawer>

    <template v-if="showLogout">
      <LogoutDialog :visible="showLogout" @hide-dialog="showLogout = false" />
    </template>

    <q-page-container class="app-page-container">
      <router-view class="background" />
    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
$textColor: #F8FAFC
$dashboard-background: #0b1120
$dashboard-surface:#1e293b
$dashboard-header: #0f172a
$dashboard-border: rgba(148, 163, 184, 0.12)

.app-layout
  background: $textColor
  color: #1e293b

.app-header
  background: #0f172a
  color: $textColor
  border-bottom: 1px solid rgba(148, 163, 184, 0.12)

.app-toolbar
  min-height: 68px
  padding: 0 20px

.menu-toggle
  color: #94A3B8
  &:hover
    color: $textColor
    background: rgba(255,255,255,0.06)

.page-heading
  margin-left: 16px

.page-title
  font-size: 17px
  font-weight: 600
  line-height: 1.2
  color: $textColor

.page-subtitle
  margin-top: 3px
  font-size: 11px
  color: #64748B

.header-action
  color: #cbd5e1
  &:hover
    color: #FFFFFF
    background: rgba(255,255,255,0.06)

.action-active
  color: #3b82f6 !important
  background: rgba(59, 130, 246, 0.12)

.header-separator
  color: rgba(148,163,184, 0.20)

.user-menu
  min-height: 44px
  padding: 4px 8px
  border-radius: 10px
  color: #cbd5e1
  transition: background 0.15s ease
  &:hover
    background: rgba(255,255,255,0.06)

.user-info
  min-width: 90px
  margin-left: 10px
  text-align: left

.user-name
  font-size: 13px
  font-weight: 600
  line-height: 1.3
  color: $textColor

.user-role
  margin-top: 2px
  font-size: 11px
  line-height: 1.2
  color: #64748B

.user-arrow
  margin-left: 6px
  color: #64748B

.app-drawer
  background: #0f172a
  color: #cbd5e1

.drawer-brand
  height: 76px
  flex-shrink: 0
  display: flex
  align-items: center
  justify-content: center
  padding: 0 17px
  border-bottom: 1px solid rgba(148, 163, 184, 0.08)

.brand-logo
  width: 100%
  height: 42px
  display: flex
  align-items: center
  justify-content: center
  flex-shrink: 0

  :deep(.q-img)
    width: 100%
    height: 100%
    max-width: 140px

.drawer-inner
  display: flex
  flex-direction: column
  height: 100%
  overflow: hidden

.drawer-user
  flex-shrink: 0
  display: flex
  align-items: center
  margin: 14px 10px 10px
  padding: 9px 10px
  border-radius: 10px
  background: rgba(255,255,255,0.035)

.drawer-user-name
  font-size: 12px
  font-weight: 600
  color: $textColor

.drawer-user-role
  margin-top: 2px
  font-size: 10px
  color: #64748B

.drawer-scroll
  flex: 1 1 auto
  min-height: 0
  padding-top: 4px

.drawer-footer
  flex-shrink: 0
  height: 52px
  display: flex
  align-items: center
  justify-content: flex-end
  padding: 0 14px
  border-top: 1px solid rgba(148, 163, 184, 0.08)

.drawer-version
  margin-right: auto
  padding-left: 4px
  color: #475569
  font-size: 10px

.drawer-logout
  color: #64748B
  background: rgba(239, 68, 68, 0.08)

.app-page-container
  background: $textColor

.app-footer
  background: #FFFFFF
  color: #94A3B8
  border-top: 1px solid #E2E8F0

.footer-content
  min-height: 38px
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  padding: 0 16px
  font-size: 11px
  font-weight: 600
  text-transform: uppercase

.footer-separator
  color: #cbd5e1

.body--dark
  .app-layout
    background: #0f172a
    color: #E2E8F0

  .app-page-container
    background: #0f172a

  .app-footer
    background: #0f172a
    border-top-color: rgba(148, 163, 184, 0.10)

@media (max-width: 700px)
  .app-toolbar
    padding: 0 12px

  .page-heading
    margin-left: 10px

  .page-title
    font-size: 15px

  .page-subtitle
    display: none

  .header-separator
    margin-left: 4px
    margin-right: 4px

  .footer-content
    font-size: 9px
</style>
