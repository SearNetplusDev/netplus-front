<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useLogFormatting } from 'src/utils/composables/logs/useLogFormatting.js'
import { useLogDifference } from 'src/utils/composables/logs/useLogDifference.js'
import { useLogData } from 'src/utils/composables/logs/useLogData.js'

const props = defineProps({
  id: { type: Number, required: true },
  visible: { type: Boolean, required: true },
})
const emit = defineEmits(['update:visible'])
const { formatDate, formatFieldName, formatValue } = useLogFormatting()
const { getDiff, getCategoryIcon, getActionColor } = useLogDifference()
const { fetchLogs } = useLogData()
const uiStates = reactive({
  isVisible: props.visible,
  loading: false,
  title: '',
  searchFilter: '',
})
const logs = ref([])
const filteredLogs = computed(() => {
  if (!uiStates.searchFilter.trim()) return logs.value

  const search = uiStates.searchFilter.toLowerCase()
  return logs.value.filter(
    (log) =>
      log.action.toLowerCase().includes(search) ||
      log.user?.name.toLowerCase().includes(search) ||
      log.support?.ticket_number.toLowerCase().includes(search),
  )
})
const getLogs = async () => {
  uiStates.loading = true
  const { ticket, logs: fetchedLogs } = await fetchLogs(props.id)
  logs.value = fetchedLogs
  uiStates.title = `Historial del soporte ${ticket}`
  uiStates.loading = false
}
const getChangesSummary = (log) => {
  const changes = getDiff(log.before, log.after)
  return changes.length > 0
    ? `${changes.length} cambio${changes.length > 1 ? 's' : ''}`
    : 'Sin Cambios'
}
watch(
  () => props.visible,
  (newVal) => {
    uiStates.isVisible = newVal
  },
)
watch(
  () => uiStates.isVisible,
  (newVal) => {
    emit('update:visible', newVal)
  },
)
onMounted(async () => {
  await getLogs()
})
</script>
<template>
  <q-dialog
    :model-value="uiStates.isVisible"
    persistent
    transition-show="slide-up"
    transition-hide="jump-down"
    backdrop-filter="blur(4px) saturate(150%)"
    @update:model-value="uiStates.isVisible = $event"
  >
    <q-card dark flat class="custom-cards" style="width: 800px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-md">
        <div>
          <div class="text-h6 text-white">{{ uiStates.title }}</div>
          <div class="text-caption text-grey-7">
            {{ filteredLogs.length }} evento{{ filteredLogs.length !== 1 ? 's' : '' }}
          </div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!--  Search Bar    -->
      <!--      <q-card-section class="q-pa-md border-bottom">-->
      <!--        <q-input-->
      <!--          v-model="uiStates.searchFilter"-->
      <!--          dense-->
      <!--          dark-->
      <!--          outlined-->
      <!--          clearable-->
      <!--          placeholder="Buscar por acción, usuario o ticket..."-->
      <!--          class="full-width"-->
      <!--        >-->
      <!--          <template #prepend>-->
      <!--            <q-icon name="mdi-magnify" />-->
      <!--          </template>-->
      <!--        </q-input>-->
      <!--      </q-card-section>-->
      <!--  End Search Bar    -->

      <!--    Timeline Content    -->
      <q-card-section class="q-pa-md">
        <q-skeleton v-if="uiStates.loading" type="QLinear" dark />

        <div class="text-center q-pa-lg" v-if="filteredLogs.length === 0">
          <q-icon name="mdi-history" size="lg" color="grey-7" />
          <div class="text-grey-7 q-mt-md">No hay registros que mostrar</div>
        </div>

        <q-timeline color="primary" layout="dense" class="q-pl-md">
          <q-timeline-entry
            v-for="(log, index) in filteredLogs"
            :key="index"
            :title="`${log.action.toUpperCase()}`"
            :subtitle="`${log.user?.name || 'Sistema'} • ${formatDate(log.created_at)}`"
            :icon="getCategoryIcon(log.action)"
            :color="getActionColor(log.action)"
            class="log-entry"
          >
            <q-card flat class="bg-grey-9 q-mb-md">
              <q-card-section class="row items-center q-py-sm">
                <div class="row items-center">
                  <q-icon
                    :name="getCategoryIcon(log.action)"
                    :color="getActionColor(log.action)"
                    size="sm"
                    class="q-mr-md"
                  />
                  <div>
                    <div class="text-weight-bold text-white">
                      {{ getChangesSummary(log) }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ formatDate(log.created_at) }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!--    Changes Detail    -->
            <div v-if="getDiff(log.before, log.after).length">
              <div class="text-caption text-uppercase text-weight-bold text-grey-6 q-mb-sm">
                Cambios realizados:
              </div>
              <q-list dense separator class="bg-grey-9 rounded-borders">
                <q-item
                  v-for="change in getDiff(log.before, log.after)"
                  :key="change.field"
                  class="change-item"
                >
                  <q-item-section avatar>
                    <q-icon name="mdi-arrow-right-circle" color="primary" size="xs" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-white">
                      {{ formatFieldName(change.field) }}
                    </q-item-label>

                    <q-item-label caption class="text-grey-7 q-mt-xs">
                      <div class="row items-center q-gutter-md">
                        <div>
                          <span class="text-caption text-grey-8">De:</span>
                          <span class="text-white q-ml-sm">
                            {{ formatValue(change.before) }}
                          </span>
                        </div>
                        <q-icon name="mdi-arrow-right" size="xs" color="primary" />
                        <div>
                          <span class="text-caption text-grey-8">a:</span>
                          <span class="text-white q-ml-sm">
                            {{ formatValue(change.after) }}
                          </span>
                        </div>
                      </div>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <!--    End Changes Detail    -->

            <!--  No Changes    -->
            <div v-else class="text-center q-py-md">
              <q-icon name="mdi-check-circle" color="positive" size="sm" />
              <div class="text-caption text-grey-7 q-mt-sm">Sin cambios detectados</div>
            </div>
            <!--  End No Changes    -->
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
      <!--    End Timeline Content    -->
      <q-card-actions align="right" class="q-pa-md border-top">
        <q-btn flat label="Cerrar" v-close-popup color="white" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style lang="sass" scoped></style>
