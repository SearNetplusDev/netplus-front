<script setup>
import { reactive } from 'vue'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'

const { copy } = useClipboard()
// const currentItem = ref(0)
const columns = reactive([
  { name: 'client', label: 'Cliente', align: 'left' },
  { name: 'branch', label: 'Sucursal', align: 'left' },
  { name: 'mobile', label: 'Teléfono', align: 'left' },
  { name: 'pppoe', label: 'Usuario PPPoe', align: 'left' },
  { name: 'uptime', label: 'Tiempo de conexión', align: 'left' },
])
</script>
<template>
  <div>
    <base-data-table :columns="columns">
      <template v-slot:body="{ props }">
        <!--    Client    -->
        <q-tr :props="props">
          <q-td key="client" class="text-left" :props="props">
            {{ props.row.internet_service?.service?.client?.name }}
            {{ props.row.internet_service?.service?.client?.surname }}
          </q-td>

          <!--    Branch    -->
          <q-td key="branch" class="text-left" :props="props">
            {{ props.row.internet_service?.service?.client?.branch?.name }}
          </q-td>

          <!--    Phone   -->
          <q-td
            key="mobile"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row.internet_service?.service?.client?.mobile?.number)"
          >
            {{ props.row.internet_service?.service?.client?.mobile?.number }}
          </q-td>

          <!--    PPPoe User    -->
          <q-td
            key="pppoe"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row.pppoe_user)"
          >
            {{ props.row.pppoe_user }}
          </q-td>

          <!--    Uptime    -->
          <q-td key="uptime" class="text-left copy-text" :props="props">
            {{ props.row.uptime_human }}
          </q-td>
        </q-tr>
      </template>
    </base-data-table>
  </div>
</template>
<style scoped lang="sass"></style>
