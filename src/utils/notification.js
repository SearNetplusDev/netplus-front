import { useQuasar } from 'quasar'

export function useNotifications() {
  const $q = useQuasar()
  const showNotification = (title, message, color) => {
    $q.notify({
      caption: message,
      message: title,
      color: color,
      position: 'top-right',
      progress: true,
      timeout: 3000,
      avatar: '/icons/favicon-128x128.png',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
  }
  return { showNotification }
}
