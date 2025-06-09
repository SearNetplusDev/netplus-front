import { useQuasar } from 'quasar'

export function useNotifications() {
  const $q = useQuasar()
  const showNotification = (title, message, color) => {
    $q.notify({
      title: title,
      message: message,
      color: color,
      position: 'top-right',
      progress: true,
      avatar: '/icons/favicon-128x128.png',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
  }
  return { showNotification }
}
