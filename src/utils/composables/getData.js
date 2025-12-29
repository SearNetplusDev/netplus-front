import { api } from 'src/utils/api.js'
import { useNotify } from 'src/utils/composables/outsideNotification.js'

const { showNotification } = useNotify()

export async function getSupportData(url) {
  try {
    const res = await api.get(url)
    return res.data.response
  } catch (err) {
    // console.error(`Error getting data: ${err}`)
    showNotification(
      'Error',
      err.response?.data?.message ??
        err.message ??
        'Error inesperado al obtener los datos solicitados',
      'red-10',
    )
    // return null
    return []
  }
}
