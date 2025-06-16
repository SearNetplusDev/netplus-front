import { copyToClipboard } from 'quasar'
import { useNotifications } from 'src/utils/notification.js'

export const clipboard = async (text) => {
  const { showNotification } = useNotifications()
  try {
    await copyToClipboard(text)
    showNotification('Éxito', `${text} agreado al portapapeles`, 'blue-grey-10')
  } catch (err) {
    showNotification('Error', `${err}`, 'red-10')
  }
}
