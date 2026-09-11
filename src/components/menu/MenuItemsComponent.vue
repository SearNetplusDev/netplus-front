<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: Object,
})
const hasChildren = computed(() => props.item.children && props.item.children.length > 0)
</script>

<template>
  <q-item
    v-if="!hasChildren"
    clickable
    v-ripple
    :to="item.url || '#'"
    active-class="menu-item-active"
    class="menu-item"
  >
    <q-item-section avatar>
      <q-icon :name="item.icon" size="19px" />
    </q-item-section>
    <q-item-section>
      <span class="menu-item-text">{{ item.name }}</span>
    </q-item-section>
  </q-item>

  <q-expansion-item
    v-else
    :label="item.name"
    :icon="item.icon || 'menu'"
    class="menu-group"
    expand-icon="keyboard_arrow_down"
  >
    <q-list class="menu-children">
      <MenuItemsComponent v-for="child in item.children" :key="child.id" :item="child" />
    </q-list>
  </q-expansion-item>
</template>

<style scoped lang="sass">
.menu-item
  position: relative
  min-height: 44px
  margin: 3px 10px
  padding: 0 12px
  border-radius: 8px
  color: #94A3B8
  transition: background 0.15s ease, color 0.15s ease

  &:hover
    color: #F8FAFC
    background: rgba(255, 255, 255, 0.05)

  &:focus-visible
    outline: 2px solid #3b82f6
    outline-offset: -2px

  :deep(.q-item__section--avatar)
    min-width: 34px

  :deep(.q-item__section):not(.q-item__section--avatar)
    min-width: 0

  .menu-item-text
    display: block
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  :deep(.q-item__label)
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  :deep(.q-icon)
    color: #64748B
    transition: color 0.15s ease

  &:hover :deep(.q-icon)
    color: #CBD5E1

.menu-item-active
  color: #F8FAFC !important
  background: rgba(59, 130, 246, 0.12)

  &::before
    content: ''
    position: absolute
    left: 0
    top: 8px
    bottom: 8px
    width: 3px
    border-radius: 0 3px 3px 0
    background: #3B82F6

  :deep(.q-icon)
    color: #3B82F6 !important

  :deep(.q-item__label)
    font-weight: 600

.menu-group
  margin: 3px 10px
  border-radius: 8px

  :deep(.q-item)
    min-height: 44px
    padding: 0 12px
    border-radius: 8px
    color: #94A3B8
    transition: background 0.15s ease, color 0.15s ease

    &:hover
      color: #F8FAFC
      background: rgba(255, 255, 255, 0.05)

    &:focus-visible
      outline: 2px solid #3b82f6
      outline-offset: -2px

  :deep(.q-item__section--avatar)
    min-width: 34px

  :deep(.q-item__section):not(.q-item__section--avatar)
    min-width: 0

  :deep(.q-item__label)
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  :deep(.q-icon)
    color: #64748B
    transition: color 0.15s ease

  :deep(.q-item:hover .q-icon)
    color: #CBD5E1

  :deep(.q-expansion-item__toggle-icon)
    transition: transform 0.2s ease

.menu-children
  padding-left: 0
  margin-left: 0
</style>
