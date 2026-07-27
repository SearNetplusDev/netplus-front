<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import { useDateFormatter } from 'src/utils/composables/useDateFormatter.js'
import SurveyForm from 'components/supports/surveys/SurveyForm.vue'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const { formatLongDateTime } = useDateFormatter()
const props = defineProps({
  visible: { type: Boolean, required: true },
  support: { type: Number, required: true },
})
const ui_states = reactive({
  title: 'Control de calidad',
  current: 0,
})
const emit = defineEmits(['update:visible', 'hide'])
const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})
const survey_data = ref(null)
// const showForm = ref(false)
const ratingFields = [
  { key: 'overall_rate', label: 'Calificación general' },
  { key: 'attention_rate', label: 'Atención' },
  { key: 'solution_rate', label: 'Solución' },
  { key: 'punctuality_rate', label: 'Puntualidad' },
  { key: 'recommendation_rate', label: 'Recomendación' },
]
const supportInfo = computed(() => survey_data.value?.support ?? null)
const technicianInfo = computed(() => supportInfo.value?.technician ?? null)
const getData = async () => {
  showLoading()
  ui_states.title = 'Obteniendo datos, espera un momento ...'
  try {
    const { data } = await api.post('/api/v1/supports/survey/show', {
      support_id: props.support,
      _method: 'POST',
    })
    if (data) {
      survey_data.value = data.survey
      if (data.survey !== null) {
        ui_states.title = `Control de calidad del soporte ${data.survey?.support?.ticket_number}`
      } else {
        ui_states.title = 'Control de calidad'
      }
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      hideLoading()
    }, 150)
  }
}
onMounted(async () => {
  await getData()
})
</script>

<template>
  <q-dialog v-model="isVisible" dark persistent backdrop-filter="blur(4px) saturate(150%)">
    <q-card class="custom-cards q-pa-xs" dark>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">{{ ui_states.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <q-card-section class="row fit content-end justify-end">
        <q-btn
          color="white"
          icon="mdi-file-star-outline"
          flat
          :ripple="{ center: true, color: 'primary' }"
          :label="survey_data === null ? 'Realizar evaluación' : 'Editar evaluación'"
          align="around"
        />
      </q-card-section>

      <q-card-section v-if="survey_data === null" class="text-center text-grey-5">
        <q-icon name="mdi-star-remove" size="48px" class="q-mb-sm" />
        <div>Ningún control de calidad ha sido aplicado a este soporte.</div>
      </q-card-section>

      <q-card-section v-else class="survey-summary">
        <!--    Info del soporte    -->
        <div v-if="supportInfo" class="support-info q-mb-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle2 text-white">
              <q-icon name="mdi-ticket-outline" size="18px" class="q-mr-xs" />
              {{ supportInfo.ticket_number }}
            </div>

            <q-chip
              text-color="white"
              dense
              square
              :color="supportInfo.breached_sla ? 'red-10' : 'green-10'"
              :label="
                supportInfo.breached_sla
                  ? 'Solucionado después de 72 horas'
                  : 'Solucionado en 72 horas o menos'
              "
            />
          </div>

          <div class="info-grid">
            <div class="info-item">
              <q-icon name="mdi-map-marker-outline" size="16px" />
              <span>{{ supportInfo.address }}</span>
            </div>

            <div class="info-item">
              <q-icon name="mdi-account-hard-hat-outline" size="16px" />
              <span>{{ technicianInfo?.user?.name ?? '' }}</span>
            </div>

            <div class="info-item">
              <q-icon name="mdi-calendar-check-outline" size="16px" />
              <span>Fecha creación: {{ formatLongDateTime(supportInfo.creation_date) }}</span>
            </div>

            <div class="info-item">
              <q-icon name="mdi-calendar-lock-outline" size="16px" />
              <span>Cerrado: {{ formatLongDateTime(supportInfo.closed_at) }}</span>
            </div>
          </div>

          <q-expansion-item
            dense
            dark
            icon="mdi-text-box-outline"
            label="Descripción y solución"
            header-class="text-grey-4 q-px-none"
            class="q-mt-sm"
          >
            <div class="expansion-content">
              <div class="text-caption text-grey-5">Descripción:</div>
              <div class="text-body2 text-white q-mb-sm">{{ supportInfo.description }}</div>
              <div class="text-caption text-grey-5">Solución:</div>
              <div class="text-body2 text-white q-mb-sm">
                {{ supportInfo.solution ?? 'No se insertó una solución' }}
              </div>
            </div>
          </q-expansion-item>
        </div>

        <q-separator class="q-my-md" />
        <!--    End info del soporte    -->

        <div class="rows items-center justify-between q-mb-md">
          <q-chip
            square
            text-color="white"
            :color="survey_data.resolved ? 'green-10' : 'negative'"
            :icon="survey_data.resolved ? 'mdi-check-circle' : 'mdi-close-circle'"
            :label="survey_data.resolved ? 'Resuelto' : 'No resuelto'"
          />

          <div class="text-caption text-grey-5">
            <q-icon name="mdi-phone-in-talk" size="16px" class="q-mr-xs" />
            {{ formatLongDateTime(survey_data.survey_datetime) }}
          </div>
        </div>

        <div class="ratings-grid">
          <div v-for="field in ratingFields" :key="field.key" class="rating-row">
            <span class="rating-label">{{ field.label }}</span>

            <q-rating
              :model-value="survey_data[field.key]"
              readonly
              size="1.1em"
              color="amber"
              icon="mdi-star"
              icon-half="mdi-star-half-full"
            />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="comment-box">
          <div class="text-caption text-grey-5 q-mb-xs">
            <q-icon name="mdi-comment-quote-outline" size="16px" class="q-mr-xs" />
            Comentario
          </div>

          <div class="text-body2 text-white">{{ survey_data.comment }}</div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn icon="close" label="cerrar" color="negative" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <template>
    <SurveyForm :survey="ui_states.current" />
  </template>
</template>

<style scoped lang="sass">
.custom-cards
  width: 50vw
  max-width: 50vw
  border-radius: 1em

.survey-summary
  background: rgba(255, 255, 255, 0.03)
  border-radius: 0.75em
  padding: 0.5em

.support-info
  background: rgba(255, 255, 255, 0.02)
  border-radius: 0.5em
  padding: 0.75em

.info-grid
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 0.4em 1em

.info-item
  display: flex
  align-items: center
  gap: 0.4em
  color: #cfcfcf
  font-size: 0.82rem

  .q-icon
    color: var(--q-primary)
    flex-shrink: 0

.expansion-content
  padding: 0.5em 0.25em

.ratings-grid
  display: flex
  flex-direction: column
  gap: 0.5em

.rating-row
  display: flex
  align-items: center
  justify-content: space-between
  padding: 0.25em 0.5em
  border-radius: 0.5em
  background: rgba(255, 255, 255, 0.02)

.rating-label
  color: #cfcfcf
  font-size: 0.85rem

.comment-box
  background: rgba(255, 255, 255, 0.03)
  border-left: 3px solid var(--q-primary)
  padding: 0.75em 1em
  border-radius: 0.5em
  font-style: italic
</style>
