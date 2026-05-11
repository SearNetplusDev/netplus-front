<script setup>
import { reactive, ref } from 'vue'
import { useFields } from 'src/utils/composables/useFields.js'
import { useFieldFilters } from 'src/utils/composables/operations/useFieldFilters.js'
import { api } from 'src/utils/api.js'
import { useDataviewerStore } from 'stores/dataviewer/index.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'

const dataViewer = useDataviewerStore()
const { showNotification } = useNotifications()
const { showLoading, hideLoading } = useLoading()
const { createField, validationRules } = useFields()
const props = defineProps({
  data: Object,
  visible: Boolean,
})
const invalidationTypeOptions = [
  { id: 1, name: 'Error en la información del DTE' },
  { id: 2, name: 'Rescindir de la operación realizada' },
  { id: 3, name: 'Otro' },
]
const isVisible = ref(props.visible)
const event = defineEmits('hide-dialog')
const ui_states = reactive({
  loading: false,
})
const fields = reactive({
  invalidation_type: createField(
    'Tipo de invalidación',
    'select',
    [validationRules.text_required],
    false,
    '',
    {
      options: invalidationTypeOptions,
      optionValue: (option) => option.id,
      optionLabel: (option) => option.name,
    },
  ),
  invalidation_reason: createField('Motivo de la anulación', 'textarea', []),
  responsible_dui: createField(
    'DUI del empleado',
    'text',
    [validationRules.text_required, validationRules.dui],
    false,
    '########-#',
  ),
})
const { normalFields, textAreaFields } = useFieldFilters(fields)
const send_invalidation = async () => {
  ui_states.loading = true
  showLoading()
  resetFieldErrors(fields)
  let uri = `/api/v1/accounting/dte/invalidate`
  let params = buildFormData(fields, { _method: 'POST', dte_id: props.data.id })
  try {
    const { data } = await api.post(uri, params)
    if (data) {
      showNotification('Éxito', 'DTE anulado correctamente', 'blue-grey-10')
      dataViewer.fetch({ force: true })
    } else {
      showNotification('Error', 'Algo ha salido mal.', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      ui_states.loading = false
      hideLoading()
    }, 150)
  }
}
const cancel = () => {
  isVisible.value = false
  event('hide-dialog')
}
</script>

<template>
  <q-dialog
    v-model="isVisible"
    dark
    persistent
    @hide="cancel"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card class="custom-cards q-pa-xs" dark>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ data.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <q-card-section class="text-subtitle1">
        <div class="row wrap full-width">
          <q-form greedy @submit="send_invalidation" class="full-width">
            <div class="row content-start items-start q-pa-sm">
              <div
                class="col-xs-12 col-sm-12 col-md-4 col-lg-6 q-pa-sm"
                v-for="(field, index) in normalFields"
                :key="index"
              >
                <template v-if="field.type === 'select'">
                  <q-select
                    v-model="field.data"
                    dark
                    dense
                    outlined
                    clearable
                    color="white"
                    emit-value
                    map-options
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    lazy-rules
                    v-if="!ui_states.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                    :options="field.options ?? []"
                    :option-value="(opt) => opt.id"
                    :option-label="(opt) => opt.name"
                  />
                </template>

                <template v-if="field.type === 'text'">
                  <q-input
                    v-model="field.data"
                    dark
                    dense
                    outlined
                    clearable
                    lazy-rules
                    v-if="!ui_states.loading"
                    :label="field.label"
                    :rules="field.rules"
                    :error="field.error"
                    :error-message="field['error-message']"
                    :disable="field.disabled"
                    :mask="field.mask"
                  />
                </template>

                <q-skeleton
                  v-if="ui_states.loading"
                  class="q-my-xs"
                  dark
                  animation="fade"
                  type="QInput"
                />
              </div>

              <div
                class="col-xs-12 col-sm-12 col-md-12 col-lg-12 q-pa-sm"
                v-for="(field, index) in textAreaFields"
                :key="index"
              >
                <template v-if="field.type === 'textarea'">
                  <q-input
                    v-model="field.data"
                    outlined
                    dark
                    dense
                    clearable
                    type="textarea"
                    counter
                    maxlength="250"
                    :label="field.label"
                    :error="field.error"
                    :error-message="field['error-message']"
                    v-if="!ui_states.loading"
                  />
                </template>

                <q-skeleton
                  v-if="ui_states.loading"
                  class="q-my-xs"
                  dark
                  animation="fade"
                  type="QInput"
                />
              </div>
            </div>
          </q-form>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          icon="mdi-check"
          label="Anular"
          color="primary"
          type="submit"
          @click="send_invalidation"
        />
        <q-btn icon="mdi-cancel" label="Cancelar" color="negative" @click="cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.custom-cards
  width: 50vw
  max-width: 50vw
  border-radius: 1em
</style>
