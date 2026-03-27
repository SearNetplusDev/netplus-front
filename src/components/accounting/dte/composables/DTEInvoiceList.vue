<script setup>
defineProps({
  invoiceOptions: { type: Array, required: true },
  selectedInvoices: { type: Array, required: true },
  loadingInvoices: { type: Boolean, default: false },
  isInvoiceSelected: { type: Function, required: true },
  toggleInvoice: { type: Function, required: true },
})
</script>

<template>
  <q-card-section>
    <p class="text-white text-weight-medium q-mb-sm">Listado de facturas</p>

    <!--    Cargando    -->
    <div v-if="loadingInvoices" class="row q-gutter-sm">
      <q-skeleton dark type="QInput" class="col-12" animation="fade" />
      <q-skeleton dark type="QInput" class="col-12" animation="fade" />
      <q-skeleton dark type="QInput" class="col-12" animation="fade" />
    </div>
    <!--    Fin Cargando    -->

    <!--  Sin Facturas    -->
    <div v-else-if="invoiceOptions.length === 0" class="text-grey-5 text-caption q-pa-sm">
      Sin créditos fiscales disponibles
    </div>
    <!--  Fin Sin Facturas    -->

    <!--    Listado de Facturas   -->
    <div v-else class="row">
      <div
        v-for="invoice in invoiceOptions"
        :key="invoice.id"
        class="col-xs-12 col-sm-12 col-md-3 col-lg-4 q-pa-xs"
      >
        <q-card
          flat
          dark
          bordered
          class="q-pa-sm cursor-pointer"
          :class="isInvoiceSelected(invoice) ? 'bg-grey-10' : 'custom-cards'"
          @click="toggleInvoice(invoice)"
        >
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-white text-caption text-weight-bold">
              {{ invoice.period?.name }}
            </div>
            <q-icon
              :name="
                isInvoiceSelected(invoice)
                  ? 'mdi-checkbox-marked-circle'
                  : 'mdi-checkbox-blank-circle-outline'
              "
              :color="isInvoiceSelected(invoice) ? 'white' : 'grey-5'"
            />
          </div>

          <div class="text-grey-4 text-caption">
            <div class="row">
              <div v-for="item in invoice.items" :key="item.id">
                {{ item.description }}
              </div>
            </div>
            <div class="row justify-between q-mt-sm">
              <span>Subtotal</span>
              <span>$ {{ parseFloat(invoice.subtotal).toFixed(2) }}</span>
            </div>

            <div class="row justify-between">
              <span>I.V.A.</span>
              <span>$ {{ parseFloat(invoice.iva).toFixed(2) }}</span>
            </div>

            <q-separator dark class="q-my-xs" />

            <div class="row justify-between text-white text-weight-bold">
              <span>Total</span>
              <span>$ {{ parseFloat(invoice.total_amount).toFixed(2) }}</span>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <div v-if="selectedInvoices.length > 0" class="text-grey-4 text-caption q-mt-sm q-pa-xs">
      {{ selectedInvoices.length }} factura(s) seleccionada(s)
    </div>
    <!--    Fin Listado de Facturas   -->
  </q-card-section>
</template>

<style scoped></style>
