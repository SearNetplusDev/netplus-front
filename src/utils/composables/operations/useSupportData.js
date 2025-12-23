import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
// import { useNotifications } from 'src/utils/notification.js'
import { useNotify } from 'src/utils/composables/outsideNotification.js'
import {
  buildFormData,
  handleSubmissionError,
  resetFieldErrors,
} from 'src/utils/composables/useFormHandler.js'

export const useSupportData = () => {
  const { showLoading, hideLoading } = useLoading()
  // const { showNotification } = useNotifications()
  const { showNotification } = useNotify()

  const fetchSupportData = async (id) => {
    showLoading()
    try {
      const { data } = await api.post(`/api/v1/operations/technical/edit`, { id: id })
      return data.support
    } catch (err) {
      showNotification('Error', err.response?.data?.message || 'Error desconocido', 'red-10')
      return null
    } finally {
      setTimeout(() => hideLoading(), 150)
    }
  }

  const saveSupportData = async (id, fields) => {
    showLoading()
    resetFieldErrors(fields)
    const params = buildFormData(fields, { _method: 'PUT' })

    try {
      const { data } = await api.post(`/api/v1/operations/technical/${id}`, params)
      if (data.saved) {
        showNotification('Éxito', 'Soporte procesado correctamente.', 'blue-grey-10')
        return true
      }
      showNotification('Error', 'Algo ha salido mal.', 'red-10')
      return false
    } catch (err) {
      handleSubmissionError(err, fields)
      showNotification('Error', err.response?.data?.message || 'Error al guardar', 'red-10')
      return false
    } finally {
      setTimeout(() => hideLoading(), 150)
    }
  }

  const deleteDevice = async (url, deviceId) => {
    showLoading()
    try {
      const { data } = await api.delete(`${url}/${deviceId}`)
      if (data.deleted) {
        showNotification('Éxito', 'Dispositivo desvinculado.', 'blue-grey-10')
        return true
      }
      return false
    } catch (err) {
      showNotification('Error', err.response?.data?.message || 'Error al eliminar', 'red-10')
      return false
    } finally {
      setTimeout(() => hideLoading(), 150)
    }
  }

  return { fetchSupportData, saveSupportData, deleteDevice }
}
