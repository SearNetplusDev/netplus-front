<script setup>
defineProps({
  supportData: { type: Object, required: true },
  devices: { type: Object, required: true },
})
defineEmits([
  'show-delete-dialog',
  'show-internet-devices-dialog',
  'show-iptv-devices-dialog',
  'show-sale-devices-dialog',
  'copy',
])
const hasIptv = (suportData) => {
  return suportData.service?.internet?.profile?.iptv || suportData.details?.profile?.iptv
}
const isSaleType = (supportData) => {
  return supportData.type_id === 9
}
const getAllowedStb = (supportData) => {
  return supportData.service?.internet?.profile?.allowed_stb || 0
}
</script>

<template>
  <div
    v-if="supportData?.service"
    class="row wrap full-width justify-start items-start content-start"
  >
    <!--    Internet Profile Data   -->
    <div class="col-xs-12 col-sm-12 col-md-2 q-ma-sm">
      <q-card flat class="custom-cards" style="width: 100%">
        <q-card-section class="q-header text-subtitle2 text-center">
          Datos de internet
        </q-card-section>
        <q-card-section class="text-subtitle2">
          Nuevo Perfil: {{ supportData.details?.profile?.name ?? 'N/A' }}
        </q-card-section>
        <q-card-section class="text-subtitle2">
          Perfil Actual: {{ supportData.service?.internet?.profile?.name ?? 'N/A' }}
        </q-card-section>
        <q-card-section class="text-subtitle2">
          <q-btn
            flat
            bordered
            text-color="white"
            :label="supportData.service?.internet?.user ?? 'Sin Servicio'"
            class="full-width q-mb-xs"
            icon="mdi-account"
            @click="$emit('copy', supportData.service?.internet?.user ?? 'Sin Servicio')"
          />
          <q-btn
            flat
            bordered
            text-color="white"
            :label="supportData.service?.internet?.secret ?? 'Sin Servicio'"
            class="full-width q-mb-xs"
            icon="mdi-key-variant"
            @click="$emit('copy', supportData.service?.internet?.secret ?? 'Sin Servicio')"
          />
        </q-card-section>
      </q-card>
    </div>
    <!--    End Internet Profile Data   -->

    <!--  Installed Internet Devices    -->
    <div class="col-xs-12 col-sm-12 col-md-2 q-ma-sm">
      <q-card flat class="custom-cards" style="width: 100%">
        <q-card-section class="q-header text-subtitle2 text-center">
          Equipos Instalados
        </q-card-section>
        <q-card-section>
          <template v-for="device in devices.internet" :key="device.id">
            <div class="row q-my-sm">
              <div class="col-1 text-bold">
                {{ device.equipment?.type?.name }}
              </div>
              <div class="col-9 text-center">
                <span class="copy-text" @click="$emit('copy', device.equipment?.mac_address)">
                  {{ device.equipment?.mac_address }}
                </span>
              </div>
              <div class="col-2">
                <q-btn
                  flat
                  round
                  icon="mdi-delete"
                  color="red"
                  size="sm"
                  @click="$emit('show-delete-dialog', 1, device.id, device.equipment?.mac_address)"
                >
                  <q-tooltip transition-hide="flip-left" transition-show="fade" class="bg-grey-10">
                    Remover dispositivo con MAC {{ device.equipment?.mac_address }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>
        </q-card-section>

        <q-card-actions align="around">
          <q-btn
            flat
            label="buscar"
            @click="$emit('show-internet-devices-dialog')"
            :disable="devices.internet.length >= 2"
          />
        </q-card-actions>
      </q-card>
    </div>
    <!--  End Installed Internet Devices    -->

    <!--  Installed IPTV Devices    -->
    <div class="col-xs-12 col-sm-12 col-md-2 q-ma-sm" v-if="hasIptv(supportData)">
      <q-card flat class="custom-cards" style="width: 100%">
        <q-card-section class="q-header text-subtitle2 text-center">
          TV Box instaladas
          <span class="text-caption">
            {{ devices.iptv.length }}/{{ getAllowedStb(supportData) }} dispositivos
          </span>
        </q-card-section>
        <q-card-section>
          <template v-for="device in devices.iptv" :key="device.id">
            <div class="row q-my-xs">
              <div class="col-10">
                <span class="copy-text" @click="$emit('copy', device.equipment?.mac_address)">
                  {{ device.equipment?.mac_address }}
                </span>
              </div>
              <div class="col-2">
                <q-btn
                  flat
                  round
                  icon="mdi-delete"
                  color="red"
                  size="sm"
                  @click="$emit('show-delete-dialog', 2, device.id, device.equipment?.mac_address)"
                >
                  <q-tooltip transition-show="fade" transition-hide="flip-left" class="bg-grey-10">
                    Remover dispositivo con MAC {{ device.equipment?.mac_address }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>
        </q-card-section>
        <q-card-actions align="around">
          <q-btn
            flat
            label="buscar"
            @click="$emit('show-iptv-devices-dialog')"
            :disable="devices.iptv.length >= getAllowedStb(supportData)"
          />
        </q-card-actions>
      </q-card>
    </div>
    <!--  End IPTV Devices    -->

    <!--  Sold Devices    -->
    <div class="col-xs-12 col-sm-12 col-md-2 q-ma-sm" v-if="isSaleType(supportData)">
      <q-card flat class="custom-cards" style="width: 100%">
        <q-card-section class="q-header text-subtitle2 text-center">
          Equipos vendidos
        </q-card-section>
        <q-card-section>
          <template v-for="device in devices.sold" :key="device.id">
            <div class="row q-my-xs">
              <div class="col-2 text-bold">
                {{ device.equipment?.type?.name }}
              </div>
              <div class="col-10 text-center">
                <span class="copy-text" @click="$emit('copy', device.equipment?.mac_address)">
                  {{ device.equipment?.mac_address }}
                </span>
              </div>
            </div>
          </template>
        </q-card-section>
        <q-card-actions align="around">
          <q-btn flat label="buscar" @click="$emit('show-sale-devices-dialog')" />
        </q-card-actions>
      </q-card>
    </div>
    <!--  End Sold Devices    -->
  </div>
</template>

<style scoped></style>
