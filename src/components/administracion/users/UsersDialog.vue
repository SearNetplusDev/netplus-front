<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import { resetFieldErrors, handleSubmissionError } from 'src/utils/composables/useFormHandler.js'
import { getSupportData } from 'src/utils/composables/getData.js'

const { showLoading, hideLoading } = useLoading()
const title = ref('')
const loading = ref(false)
const { showNotification } = useNotifications()
const props = defineProps({
  id: Number,
})
const url = 'api/v1/management/users/'
const isPwd = ref(true)
const passwordRules = computed(() => [
  (val) => {
    if (props.id === 0) {
      return !!val || 'La contraseña es requerida'
    }
    if (val && val.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    return true
  },
])
const confirmPasswordRules = computed(() => [
  (val) => {
    const pass = fields.password_1.data
    if (props.id === 0) {
      if (!val) return 'Confirma contraseña'
      if (val !== pass) return 'Las contraseñas no coinciden'
    } else {
      if (val && val !== pass) return 'Las contraseñas no coinciden'
    }
    return true
  },
])
const fields = reactive({
  name: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Nombre',
    type: 'text',
    rules: [(val) => (val && val.length > 0) || 'Campo requerido'],
  },
  email: {
    data: null,
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
    data: null,
    error: false,
    'error-message': '',
    label: 'Contraseña',
    type: 'password',
    rules: passwordRules,
  },
  password_2: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Confirma contraseña',
    type: 'password',
    rules: confirmPasswordRules,
  },
  role: {
    data: null,
    error: false,
    'error-message': '',
    label: 'Rol',
    type: 'select',
    rules: [(val) => (val !== null && val !== '') || 'Campo requerido'],
  },
  status: {
    data: false,
    error: false,
    'error-message': '',
    type: 'toggle',
    label: 'Estado',
  },
  permissions: {
    data: [],
  },
})
const external = reactive({
  roles: [],
  permissions: [],
})
const getData = () => {
  showLoading()
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
      fields.role.data = item.roles[0]?.id
      fields.permissions.data = res.data?.permissions
    })
    .catch((err) => {
      showNotification('Error', err, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 1000)
    })
}
const sendData = () => {
  title.value = 'Procesando datos, espera un momento...'
  loading.value = true
  showLoading()
  resetFieldErrors(fields)
  let status
  fields.status.data === true ? (status = 1) : (status = 0)
  let params = new FormData()
  params.append('name', fields.name.data)
  params.append('email', fields.email.data)
  params.append('status', status)
  params.append('role', fields.role.data)
  fields.permissions.data.forEach((perm) => {
    params.append('permissions[]', perm)
  })
  if (fields.password_1.data !== null) params.append('password', fields.password_1.data)
  let request = props.id > 0 ? `${url}${props.id}` : url
  props.id > 0 ? params.append('_method', 'PUT') : params.append('_method', 'POST')

  api
    .post(request, params, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => {
      if (res.data.saved) {
        showNotification('Exito', 'Registro almacenado', 'blue-grey-10')
        title.value = `Modificar datos de ${res.data.user?.name}`
      } else {
        showNotification('Error', 'Verifica la información ingresada', 'red-10')
      }
    })
    .catch((err) => {
      handleSubmissionError(err, fields)
      showNotification('Error', `${err}`, 'red-10')
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
        hideLoading()
      }, 1000)
    })
}
const getPermissions = async (index) => {
  const role = fields[index].data
  try {
    showLoading()
    loading.value = true
    fields.permissions.data = await getSupportData(
      `/api/v1/general/management/roles/${role}/permissions`,
    )
  } catch (err) {
    showNotification('Error', err, 'red-10')
  } finally {
    hideLoading()
    loading.value = false
  }
}
const selectOrRemove = () => {
  if (fields.permissions.data.length > 0) {
    fields.permissions.data = []
  } else {
    fields.permissions.data = external.permissions.map((p) => p.value)
  }
}
onMounted(async () => {
  if (props.id > 0) getData()
  title.value = 'Registrar nuevo usuario'
  external.roles = await getSupportData('/api/v1/general/management/roles')
  external.permissions = await getSupportData('/api/v1/general/management/permissions')
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
                      :options="external.roles"
                      :option-value="(opt) => opt.id"
                      :option-label="(opt) => opt.name"
                      @update:model-value="getPermissions(index)"
                    />
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

            <!--    Permissions   -->
            <q-card-section>
              <q-card flat class="custom-cards">
                <q-card-section class="q-header row no-wrap items-center">
                  <div>
                    <span class="text-white text-subtitle2">Permisos asignados al usuario</span>
                  </div>

                  <q-space />

                  <div>
                    <q-btn
                      :label="
                        fields.permissions.data.length > 0
                          ? 'deseleccionar todos'
                          : 'seleccionar todos'
                      "
                      flat
                      @click="selectOrRemove"
                    />
                  </div>
                </q-card-section>
                <q-card-section class="q-pa-md">
                  <q-option-group
                    v-if="!loading"
                    :options="external.permissions"
                    type="checkbox"
                    v-model="fields.permissions.data"
                    inline
                  />
                  <q-skeleton class="q-my-xs" dark type="QInput" animation="fade" v-if="loading" />
                </q-card-section>
              </q-card>
            </q-card-section>
            <!--    End input content   -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-form>
  </q-layout>
</template>

<style scoped></style>
