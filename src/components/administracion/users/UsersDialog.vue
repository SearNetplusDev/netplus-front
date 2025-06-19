<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'

const title = ref('')
const loading = ref(false)
const { showNotification } = useNotifications()
const props = defineProps({
  id: Number,
})
const url = 'api/v1/administracion/usuarios/'
const isPwd = ref(true)
// const errors = ref([])
const passwordRules = [
  (val) => !!val || 'La contraseña es requerida',
  (val) => val.length >= 8 || 'Mínimo de 8 caracteres',
]
const confirmPasswordRules = computed(() => [
  ...passwordRules,
  (val) => val === fields.password_1.data || 'Las contraseñas no coinciden',
])
const fields = reactive({
  // id: props.id,
  name: {
    data: '',
    error: false,
    'error-message': '',
    label: 'Nombre',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  email: {
    data: '',
    error: false,
    'error-message': '',
    label: 'Correo electrónico',
    type: 'text',
    rules: [
      (val) => (val && val.length > 0) || 'Campo requerido',
      (val) =>
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(val) ||
        'Formato Incorrecto',
    ],
  },
  password_1: {
    data: '',
    error: false,
    'error-message': '',
    label: 'Contraseña',
    type: 'password',
    rules: passwordRules,
  },
  password_2: {
    data: '',
    error: false,
    'error-message': '',
    label: 'Confirma contraseña',
    type: 'password',
    rules: confirmPasswordRules,
  },
  status: { data: false, error: false, 'error-message': '', type: 'toggle' },
})
const getData = () => {
  loading.value = true
  title.value = 'Obteniendo datos, espera un momento ...'
  let data = new FormData()
  data.append('id', props.id)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let item = res.data.user
      title.value = `Modificar datos de ${item.name}`
      fields.name.data = item.name
      fields.email.data = item.email
      fields.status.data = item.status_id
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 1000)
    })
}
const sendData = () => {
  // let request = ''
  // let params = new FormData()
  title.value = 'Procesando datos, espera un momento...'
  loading.value = true
}

onMounted(() => {
  if (props.id > 0) {
    getData()
  } else {
    title.value = 'Registrar nuevo usuario'
  }
})
</script>

<template>
  <q-layout view="hHh LpR fFF" container>
    <q-form greedy @submit="sendData">
      <q-header class="q-header">
        <q-toolbar>
          <q-toolbar-title>{{ title }}</q-toolbar-title>
          <q-btn
            flat
            icon="mdi-content-save"
            :loading="loading"
            :label="props.id === 0 ? 'Almacenar' : 'Actualizar'"
            type="submit"
            color="white"
          >
            <template v-slot:loading>
              <q-spinner-gears class="on-left" />
            </template>
          </q-btn>
          <q-btn flat v-close-popup round dense icon="close" />
        </q-toolbar>
      </q-header>

      <FooterComponent />

      <q-page-container>
        <q-page class="q-pa-md bg-dark">
          <q-card flat class="custom-cards q-pa-sm">
            <!--    Breadcrumbs   -->
            <q-card-section>
              <div class="fit row">
                <div class="col-12">
                  <q-breadcrumbs class="text-white" active-color="white" gutter="md">
                    <template v-slot:separator>
                      <q-icon size="1.5em" name="chevron_right" color="white" />
                    </template>
                    <q-breadcrumbs-el label="Administración" icon="mdi-account-tie" />
                    <q-breadcrumbs-el label="Usuarios" icon="mdi-account-group" />
                  </q-breadcrumbs>
                </div>
              </div>
            </q-card-section>
            <q-separator dark class="q-my-sm" />
            <!--    End breadcrumbs   -->

            <!--    Input content   -->
            <q-card-section>
              <div class="full-width row wrap justify-start items-start content-start">
                <div
                  class="col-xs-12 col-sm-12 col-md-4 col-lg-3 q-pa-md"
                  v-for="(field, index) in fields"
                  :key="index"
                >
                  <div v-if="field.type === 'text'">
                    <q-input
                      dense
                      dark
                      outlined
                      clearable
                      v-if="!loading"
                      v-model="field.data"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                    />
                  </div>

                  <div v-if="field.type === 'password'">
                    <q-input
                      v-model="field.data"
                      dark
                      dense
                      clearable
                      outlined
                      :label="field.label"
                      maxlength="12"
                      counter
                      lazy-rules
                      :type="isPwd ? 'password' : 'text'"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
                      v-if="!loading"
                    >
                      <template v-slot:append>
                        <q-icon
                          :name="isPwd ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isPwd = !isPwd"
                        />
                      </template>
                    </q-input>
                  </div>

                  <div v-if="field.type === 'toggle'">
                    <q-toggle
                      v-model="fields.status.data"
                      label="Estado"
                      checked-icon="check"
                      unchecked-icon="clear"
                      size="lg"
                      color="primary"
                      v-if="!loading"
                      :error="fields.status.error"
                      :error-message="fields.status['error-message']"
                    />
                  </div>
                  <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
                </div>
              </div>
            </q-card-section>
            <!--    End input content   -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
