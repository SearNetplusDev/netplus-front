import { api } from 'src/utils/api.js'
// import { useLoading } from 'src/utils/loader.js'
import { useNotify } from 'src/utils/composables/outsideNotification.js'

export const useLogData = () => {
  // const { showLoading, hideLoading } = useLoading()
  const { showNotification } = useNotify()

  const fetchLogs = async (id) => {
    // showLoading()
    const uri = 'api/v1/supports/logs'
    try {
      const { data } = await api.post(uri, { id: id })
      return {
        ticket: data.logs.ticket,
        logs: data.logs.collection,
      }
    } catch (err) {
      showNotification('Error', `${err.response?.data?.message}`, 'red-10')
      return { ticket: '', logs: [] }
    } finally {
      // setTimeout(() => hideLoading(), 150)
    }
  }
  return { fetchLogs }
}
