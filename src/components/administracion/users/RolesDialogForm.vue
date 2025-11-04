<script setup>
import { onMounted, ref, reactive } from 'vue'
import { api } from 'boot/axios.js'
import { useNotifications } from 'src/utils/notification.js'
import { useLoading } from 'src/utils/loader.js'
import { useFields } from 'src/utils/composables/useFields.js'
import {
  resetFieldErrors,
  handleSubmissionError,
  buildFormData,
} from 'src/utils/composables/useFormHandler.js'
import { getSupportData } from 'src/utils/composables/getData.js'
import FooterComponent from 'components/base/widgets/FooterComponent.vue'
import { useAuthStore } from 'stores/auth.js'

const auth = useAuthStore()
const { showLoading, hideLoading } = useLoading()
const { createField, validationRules } = useFields()
const title = ref('')
const loading = ref(false)
const { showNotification } = useNotifications()
const props = defineProps({
  id: Number,
})
const url = 'api/v1/management/roles/'
const fields = reactive({
  name: createField('Nombre', 'text', [validationRules.text_required()]),
  homepage: createField('Redirige a:', 'text', [validationRules.text_required()]),
  role_permissions: {
    data: [],
    disabled: false,
  },
})
const permissions = ref([])
const getData = () => {
  showLoading()
  loading.value = true
  title.value = 'Obteniedo datos, espera un momento...'
  let data = new FormData()
  data.append('id', props.id)
  api
    .post(`${url}edit`, data)
    .then((res) => {
      let itm = res.data.role
      fields.name.data = itm.role?.name
      fields.homepage.data = itm.role?.homepage
      fields.role_permissions.data = itm.permissions
      title.value = `Editar datos del rol: ${itm.role?.name}`
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
const sendData = async () => {
  title.value = 'Procesando datos, espera un momento...'
  loading.value = true
  showLoading()
  resetFieldErrors(fields)

  let request = props.id > 0 ? `${url}${props.id}` : url
  let method = props.id > 0 ? 'PUT' : 'POST'
  let params = buildFormData(fields, { _method: method })
  fields.role_permissions.data.forEach((perm) => {
    params.append('permissions[]', perm)
  })

  try {
    const { data } = await api.post(request, params)
    if (data.saved) {
      showNotification('Exito', 'Registro almacenado correctamente', 'blue-grey-10')
      title.value = `Editar datos del rol: ${data.role?.name}`
    } else {
      showNotification('Error', 'Verifica la información ingresada', 'red-10')
    }
  } catch (err) {
    handleSubmissionError(err, fields)
    showNotification('Error', err.response?.data?.message || 'Error al guardar', 'red-10')
  } finally {
    setTimeout(() => {
      loading.value = false
      hideLoading()
    }, 150)
  }
}

const selectOrRemove = () => {
  if (fields.role_permissions.data.length > 0) {
    fields.role_permissions.data = []
  } else {
    fields.role_permissions.data = permissions.value.flatMap((cat) =>
      cat.permissions.map((p) => p.value),
    )
  }
}
onMounted(async () => {
  if (props.id > 0) getData()
  title.value = 'Registrar nuevo rol'
  permissions.value = await getSupportData('/api/v1/general/management/permissions')
  auth.user.roles[0] === 'Root'
    ? (fields.role_permissions.disabled = false)
    : (fields.role_permissions.disabled = true)
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
          <q-btn v-close-popup round dense icon="close" />
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
                    <q-breadcrumbs-el label="Roles" icon="mdi-account-tie-hat" />
                  </q-breadcrumbs>
                </div>
              </div>
            </q-card-section>
            <!--    End breadcrumbs   -->

            <q-separator dark class="q-my-sm" />

            <!--    Input content   -->
            <q-card-section>
              <div class="row wrap full-width justify-start items-start content-start">
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
                      lazy-rules
                      v-model="field.data"
                      v-if="!loading"
                      :label="field.label"
                      :rules="field.rules"
                      :error="field.error"
                      :error-message="field['error-message']"
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
                    <span class="text-white text-subtitle2">Permisos asignados al rol</span>
                  </div>

                  <q-space />

                  <div>
                    <q-btn
                      :icon="
                        fields.role_permissions.data.length > 0
                          ? 'mdi-close-circle'
                          : 'mdi-check-all'
                      "
                      :color="fields.role_permissions.data.length > 0 ? 'white' : 'primary'"
                      flat
                      @click="selectOrRemove"
                      :disable="fields.role_permissions.disabled"
                    />
                  </div>
                </q-card-section>
                <q-card-section class="q-pa-md">
                  <q-card
                    class="custom-cards full-width q-my-sm"
                    dark
                    flat
                    v-for="(item, index) in permissions"
                    :key="index"
                  >
                    <q-card-section class="q-header row no-wrap items-center">
                      {{ item.category }}
                    </q-card-section>
                    <q-card-section>
                      <q-option-group
                        v-if="!loading"
                        :options="item.permissions"
                        type="checkbox"
                        v-model="fields.role_permissions.data"
                        inline
                        :disable="fields.role_permissions.disabled"
                      />
                    </q-card-section>
                  </q-card>
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
