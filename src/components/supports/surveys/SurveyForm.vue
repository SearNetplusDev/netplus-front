<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const uri = '/api/v1/supports/survey'
const props = defineProps({
  survey: { type: Number, required: true },
  support: { type: Number, required: true },
  visible: { type: Boolean, required: true },
})
const emit = defineEmits(['update:visible', 'hide'])
const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})
const questions = reactive([
  {
    key: 'overall_rate',
    text: '¿Cómo calificaría su experiencia general con el servicio de soporte recibido?',
    data: 0,
  },
  {
    key: 'attention_rate',
    text: '¿Que tan satisfecho(a) quedó con la atención y el trato recibido por parte de nuestro técnico?',
    data: 0,
  },
  {
    key: 'solution_rate',
    text: '¿Que tan conforme está con la solución brindada para resolver su inconveniente?',
    data: 0,
  },
  {
    key: 'punctuality_rate',
    text: '¿Como calificaría la puntualidad del servicio técnico en la atención de su solicitud?',
    data: 0,
  },
  {
    key: 'recommendation_rate',
    text: 'En una escala de 0 a 5 estrellas, ¿que tan probable es que recomiende nuestra empresa a un familiar o amigo?',
    data: 0,
  },
])
const comments = ref(null)
const resolved = ref(false)
const ratings = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
const submitting = ref(false)
const getData = async () => {
  showLoading()
  try {
    const { data } = await api.post(`${uri}/show`, {
      support_id: props.support,
      _method: 'POST',
    })
    if (data?.survey) {
      const survey = data.survey

      questions.forEach((question) => {
        question.data = survey[question.key] ?? 0
      })
      resolved.value = survey.resolved
      comments.value = survey.comment
    } else {
      showNotification('Error', 'Algo ha salido mal', 'red-10')
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
const sendData = async () => {
  showLoading()
  submitting.value = true
  try {
    const payload = {
      support_id: props.support,
      resolved: resolved.value,
      comment: comments.value,
      _method: props.survey > 0 ? 'PUT' : 'POST',
    }

    questions.forEach((question) => {
      payload[question.key] = question.data
    })

    const url = props.survey > 0 ? `${uri}/${props.survey}` : uri
    const { data } = await api.post(url, payload)
    if (data?.saved) {
      showNotification('Éxito', 'Datos almacenados correctamente.', 'blue-green-10')
    }
  } catch (err) {
    if (err.response?.status === 422) {
      const errors = err.response.data.errors
      const firstError = Object.values(errors)[0][0]
      showNotification('Error de validación', firstError, 'red-10')
    } else {
      showNotification(
        'Error',
        err.response?.data?.message ?? err.message ?? 'Error inesperado',
        'red-10',
      )
    }
  } finally {
    setTimeout(() => {
      hideLoading()
      submitting.value = false
    }, 150)
  }
}
onMounted(async () => {
  if (props.survey > 0) {
    await getData()
  }
})
</script>

<template>
  <q-dialog v-model="isVisible" dark persistent backdrop-filter="blur(5px) saturate(150%)">
    <q-card class="survey-dialog">
      <q-card-section class="row items-center survey-header">
        <div class="text-h6">Realizar encuesta de control de calidad</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="grey-4" />
      </q-card-section>

      <q-form greedy class="q-pa-sm q-gutter-md" @submit="sendData">
        <q-card-section class="survey-content">
          <div v-for="question in questions" :key="question.key" class="question-card">
            <div class="question-title">{{ question.text }}</div>
            <div class="row items-center justify-between q-mt-md">
              <q-rating
                v-model="question.data"
                size="2em"
                :max="5"
                color="orange"
                color-selected="amber"
                icon="star_border"
                icon-selected="star"
                icon-half="star_half"
                no-dimming
              />

              <div class="rating-text">
                {{ ratings[question.data] }}
              </div>
            </div>
          </div>

          <div class="question-card">
            <div class="question-title">¿El técnico logró resolver completamente su problema?</div>
            <q-btn-toggle
              v-model="resolved"
              spread
              unelevated
              class="q-mt-md"
              color="grey-9"
              toggle-color="primary"
              text-color="white"
              :options="[
                {
                  label: 'Sí',
                  value: true,
                  icon: 'check_circle',
                },
                {
                  label: 'No',
                  value: false,
                  icon: 'cancel',
                },
              ]"
            />
          </div>

          <q-input
            v-model="comments"
            outlined
            dense
            dark
            counter
            maxlength="2000"
            class="q-mt-lg"
            type="textarea"
            rows="5"
            label="Comentarios (Opcional)"
          />
        </q-card-section>

        <q-card-actions align="right" class="survey-footer">
          <q-btn
            icon="save"
            :label="props.survey > 0 ? 'Actualizar' : 'Almacenar'"
            color="primary"
            type="submit"
            :loading="submitting"
            :disable="submitting"
          />
          <q-btn icon="close" label="cerrar" color="red-10" v-close-popup />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="sass">
.custom-cards
  width: 50vw
  max-width: 50vw
  border-radius: 1em

.survey-dialog
  width: 720px
  max-width: 95vw
  border-radius: 18px
  background: #17213d
  height: 80vh
  display: flex
  flex-direction: column

.survey-header
  position: sticky
  top: 0
  z-index: 10
  background: #17213d

.survey-content
  flex: 1
  overflow-y: auto
  padding: 20px

.survey-footer
  position: sticky
  bottom: 0
  z-index: 10
  background: #17213d
  padding: 16px

.question-card
  background: #111827
  border: 1px solid rgba(255, 255, 255, .08)
  border-radius: 14px
  padding: 18px
  margin-bottom: 18px
  transition: .25s

.question-card:hover
  border-color: $primary
  transform: translateY(-2px)
  box-shadow: 0 10px 24px rgba(0, 0, 0, .25)

.question-title
  color: white
  font-size: .95rem
  font-weight: 500
  line-height: 1.5

.rating-text
  min-width: 90px
  text-align: right
  color: #94A3B8
  font-size: .85rem
  font-weight: 600
</style>
