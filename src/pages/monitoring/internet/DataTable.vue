<script setup>
import { reactive } from 'vue'
import { useClipboard } from 'src/utils/clipboard.js'
import BaseDataTable from 'pages/baseComponents/BaseDataTable.vue'

const { copy } = useClipboard()
// const currentItem = ref(0)
const columns = reactive([
  {
    name: 'financial_status',
    label: 'Estado financiero',
    filterable: true,
    model: [],
    filterURL: '/api/v1/general/billing/statuses',
    options: [],
    align: 'left',
  },
  { name: 'client', label: 'Cliente', align: 'left' },
  { name: 'branch', label: 'Sucursal', align: 'left' },
  { name: 'mobile', label: 'Teléfono', align: 'left' },
  { name: 'pppoe', label: 'Usuario PPPoe', align: 'left' },
  { name: 'ip', label: 'IP', align: 'left' },
  { name: 'mac', label: 'Caller', align: 'left' },
  { name: 'uptime', label: 'Tiempo de conexión', align: 'left' },
])
</script>
<template>
  <div>
    <base-data-table :columns="columns">
      <template v-slot:body="{ props }">
        <q-tr :props="props">
          <!--    Financial Status    -->
          <q-td key="financial_status" :props="props">
            <q-badge
              class="text-center text-weight-bold q-py-xs"
              :style="{
                backgroundColor:
                  props.row.internet_service?.service?.client?.financial_status?.status
                    ?.badge_color,
              }"
              :label="props.row.internet_service?.service?.client?.financial_status?.status?.name"
            />
          </q-td>

          <!--    Client    -->
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

          <!--    IP    -->
          <q-td
            key="ip"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row.ip_address)"
          >
            {{ props.row.ip_address }}
          </q-td>

          <!--    Caller    -->
          <q-td
            key="mac"
            class="text-left copy-text"
            :props="props"
            @click="copy(props.row.caller_id)"
          >
            {{ props.row.caller_id }}
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
