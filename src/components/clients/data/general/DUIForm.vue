<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios.js'
import { useLoading } from 'src/utils/loader.js'

const $q = useQuasar()
const { showLoading, hideLoading } = useLoading()
const props = defineProps({
  visible: Boolean,
})
const visible = ref(props.visible)
const dui = ref(null)
const uri = '/api/v1/clients/documents/verify/'
const emit = defineEmits(['hideDuiDialog'])
const checkDocument = () => {
  showLoading()
  let data = new FormData()
  data.append('dui', dui.value)
  api
    .post(uri, data)
    .then((res) => {
      if (res.data.response === null) {
        visible.value = false
      } else {
        let item = res.data.response.client
        let message = `El documento ingresado pertenece a <span class="text-primary text-bold text-subtitle1">${item.name} ${item.surname}</span>.<p>Falta validar el total si tiene facturas pendientes</p>`
        $q.dialog({
          title: '<span class="text-h6">Documento Encontrado</span>',
          message: message,
          html: true,
          persistent: true,
          ok: {
            textColor: 'white',
            flat: true,
          },
        }).onOk(() => {
          dui.value = null
          visible.value = false
          emit('hideDuiDialog', item.id)
        })
      }
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      setTimeout(() => {
        hideLoading()
      }, 100)
    })
}
</script>
<template>
  <q-dialog
    v-model="visible"
    persistent
    transition-show="flip-up"
    transition-hide="jump-down"
    backdrop-filter="blur(4px) saturate(150%)"
  >
    <q-card dark flat class="custom-cards" style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Ingresa Número de DUI</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form greedy @submit="checkDocument">
          <q-input
            dense
            v-model="dui"
            autofocus
            mask="########-#"
            lazy-rules
            :rules="[(val) => !!val || 'Campo requerido']"
          />

          <div class="row fit content-end justify-end">
            <q-btn flat label="verificar documento" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<style scoped></style>
