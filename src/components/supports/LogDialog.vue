<script setup>
import { onMounted, reactive, ref } from 'vue'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'

const props = defineProps({
  id: { type: Number, required: true },
  visible: { type: Boolean, required: true },
})
const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const uiStates = reactive({
  isVisible: ref(props.visible),
  loading: false,
  title: '',
})
// const columns = [
//   { name: 'date', label: 'Fecha', align: 'left', field: (row) => formatDate(row.created_at) },
//   { name: 'user', label: 'Responsable', align: 'left', field: (row) => row.user?.name },
//   { name: 'action', label: 'Acción', align: 'left', field: (row) => row.action },
//   { name: 'diff', label: 'Cambios', align: 'left' },
// ]
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  // if (isNaN(date.getTime())) return 'Fecha Inválida'

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/El_Salvador',
  }
  //
  // const parser = new Intl.DateTimeFormat('es-ES', options)
  // return parser.format(date)

  // const year = date.getUTCFullYear()
  // const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  // const day = String(date.getUTCDate()).padStart(2, '0')
  // const hours = String(date.getUTCHours()).padStart(2, '0')
  // const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  // const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  //
  // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

  return new Intl.DateTimeFormat('es-Es', options).format(date)
}
const logs = ref([])
const getDiff = (before, after) => {
  const changes = []
  for (const key in after) {
    if (before?.[key] !== after[key]) {
      changes.push({
        field: key,
        before: before?.key ?? '---',
        after: after[key] ?? '---',
      })
    }
  }
  return changes
}
// const initialPagination = {
//   sort: 'desc',
//   descending: false,
//   rowsPerPage: 10,
// }
const getLogs = async () => {
  uiStates.loading = true
  showLoading()
  const uri = 'api/v1/supports/logs'
  try {
    const { data } = await api.post(uri, { id: props.id })
    logs.value = data.logs.collection
    uiStates.title = `Historial del soporte ${data.logs.ticket}`
  } catch (err) {
    showNotification('Error', err.response?.data?.message || 'Error al cargar datos.', 'red-10')
  } finally {
    setTimeout(() => {
      hideLoading()
      uiStates.loading = false
    }, 250)
  }
}

onMounted(async () => {
  await getLogs()
})
</script>

<template>
  <q-dialog
    v-model="uiStates.isVisible"
    persistent
    transition-show="slide-up"
    transition-hide="jump-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark flat style="width: 700px; max-width: 80vh" class="custom-cards">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ uiStates.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-sm">
        <!--        <div class="q-pa-xs">-->
        <!--          <q-table-->
        <!--            flat-->
        <!--            dark-->
        <!--            row-key="name"-->
        <!--            class="secondary-table"-->
        <!--            binary-state-sort-->
        <!--            no-data-label="Sin resultados"-->
        <!--            :columns="columns"-->
        <!--            :rows="logs"-->
        <!--            :pagination="initialPagination"-->
        <!--          >-->
        <!--            <template v-slot:body-cell-diff="props">-->
        <!--              <div>-->
        <!--                <ul>-->
        <!--                  <li v-for="c in getDiff(props.row.before, props.row.after)" :key="c.field">-->
        <!--                    <b>{{ c.field }}: </b> {{ c.after }}-->
        <!--                  </li>-->
        <!--                </ul>-->
        <!--              </div>-->
        <!--            </template>-->
        <!--          </q-table>-->
        <!--        </div>-->

        <q-timeline color="primary" layout="dense" class="q-pl-md">
          <q-timeline-entry
            v-for="log in logs"
            :key="log.id"
            :title="log.action.toUpperCase()"
            :subtitle="`${log.user?.name || 'Brainiac'} • ${formatDate(log.created_at)}`"
            :icon="log.action === 'create' ? 'mdi-plus-circle' : 'mdi-autorenew'"
          >
            <div v-if="getDiff(log.before, log.after).length">
              <q-list dense>
                <q-item v-for="change in getDiff(log.before, log.after)" :key="change.field">
                  <q-item-section>
                    <div>
                      <strong>{{ change.field }}: </strong>
                      cambió de: {{ change.before }} a
                      <span class="text-white">{{ change.after }}</span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-else>Sin cambios detectados</div>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="cerrar" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
