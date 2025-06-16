<script setup>
const props = defineProps({
  el: String,
  value: String,
})
</script>

<template>
  <q-td :key="props.key" class="text-left custom-link">
    {{ props.value }}
  </q-td>
</template>

<style lang="sass" scoped>
.custom-link
  cursor: pointer

  &:hover
    color: $custom-table-hover-color
</style>
