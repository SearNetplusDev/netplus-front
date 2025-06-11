<script setup>
import { onMounted, ref } from 'vue'
import { useMenuStore } from 'stores/menu-store.js'
import MenuItemsComponent from 'components/menu/MenuItemsComponent.vue'

const menuStore = useMenuStore()
const menuData = ref([])

onMounted(() => {
  // menuStore.fetchMenu()
  menuData.value = menuStore.items.data

  console.info(menuData)
})
</script>

<template>
  <q-list dark padding class="rounded-borders text-white" style="max-width: 328px">
    <template v-for="item in menuData" :key="item.id">
      <MenuItemsComponent :item="item" />
    </template>
  </q-list>
</template>

<style scoped></style>
