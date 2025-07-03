<script setup>
import { reactive, ref } from 'vue'
import LocaleEs from 'src/utils/composables/localeEs.js'

const props = defineProps({
  client: Number,
  visible: Boolean,
})
const isVisible = ref(props.visible)
const loading = ref(false)
const fields = reactive({
  type: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Tipo de documento',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  number: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Número del documento',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  expiration: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Fecha de vencimiento',
    type: 'date',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  status: {
    data: false,
    error: false,
    'error-message': '',
    label: 'Estado',
    type: 'toggle',
  },
})
const documents = ref([])
const locale = LocaleEs
</script>

<template>
  <q-dialog v-model="isVisible" persistent transition-show="scale" transition-hide="fade-out">
    <q-card dark flat style="width: 700px; max-width: 80vh">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">Almacenar / Actualizar</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row content-start items-start q-pa-sm fit">
          <div
            class="col-xs-12 col-sm-12 col-md-6 col-lg-6 q-pa-md"
            v-for="(field, index) in fields"
            :key="index"
          >
            <div v-if="field.type === 'text'">
              <q-input
                dense
                dark
                outlined
                clearable
                lazy-rules
                v-model="field.data"
                v-if="!loading"
                :rules="field.rules"
                :label="field.label"
                :error="field.error"
                :error-message="field['error-message']"
              />
            </div>
            <div v-if="field.type === 'select'">
              <q-select
                v-model="field.data"
                dense
                dark
                outlined
                clearable
                color="white"
                emit-value
                map-options
                transition-show="flip-up"
                transition-hide="flip-down"
                lazy-rules
                v-if="!loading"
                :label="field.label"
                :rules="field.rules"
                :error="field.error"
                :error-message="field['error-message']"
                :options="documents"
                :option-value="(opt) => opt.id"
                :option-label="(opt) => opt.name"
              />
            </div>

            <div v-if="field.type === 'date'">
              <q-input
                dark
                dense
                outlined
                v-model="field.data"
                v-if="!loading"
                :rules="field.rules"
                :label="field.label"
                :error="field.error"
                :error-message="field['error-message']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transiton-show="scale" transition-hide="scale">
                      <q-date
                        v-model="field.data"
                        mask="YYYY-MM-DD"
                        :locale="locale"
                        color="blue-10"
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="white" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div v-if="field.type === 'toggle'">
              <q-toggle
                v-model="field.data"
                :label="field.label"
                checked-icon="check"
                unchecked-icon="clear"
                size="lg"
                color="primary"
                v-if="!loading"
                :error="fields.status.error"
                :error-message="fields.status['error-message']"
              />
            </div>

            <q-skeleton v-if="loading" class="q-my-xs" dark animation="fade" type="QInput" />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="cancelar" v-close-popup />
        <q-btn flat label="ejecutar" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
