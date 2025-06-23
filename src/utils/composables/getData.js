import { api } from 'boot/axios.js'

export async function getSupportData(url) {
  try {
    const res = await api.get(url)
    return res.data.response
  } catch (err) {
    console.error(`Error getting data: ${err}`)
    return null
  }
}
