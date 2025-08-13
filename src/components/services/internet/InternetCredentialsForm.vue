<script setup>
const props = defineProps({
  service: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div>
    {{ props }}
  </div>
</template>

<style scoped></style>
