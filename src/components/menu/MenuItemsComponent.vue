<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  item: Object,
})
const hasChildren = computed(() => props.item.children && props.item.children.length > 0)

onMounted(() => {
  console.error(props.item)
})
</script>

<template>
  <q-item v-if="!hasChildren" clickable :to="item.url || '#'">
    <q-item-section>{{ item.name }}</q-item-section>
  </q-item>

  <q-expansion-item v-else :label="item.name" expand-separator dense :icon="item.icon || 'menu'">
    <q-list dense>
      <MenuItemsComponent v-for="child in item.children" :key="child.id" :item="child" />
    </q-list>
  </q-expansion-item>
</template>

<style scoped></style>
