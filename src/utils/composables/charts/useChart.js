import { ref } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'

/**
 * Encapsula el patrón repetido de los widgets del dashboard
 * @param endpoint
 */
export function useChart(endpoint) {
  const loading = ref(true)
  const { showLoading, hideLoading } = useLoading()
  const { showNotification } = useNotifications()

  const fetchDashboardData = async (onSuccess) => {
    showLoading()
    loading.value = true

    try {
      const { data } = await api.get(endpoint)

      if (data) {
        onSuccess(data)
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
        loading.value = false
      }, 150)
    }
  }

  return { loading, fetchDashboardData }
}
