import { Notify } from 'quasar'

export function useNotify() {
  const showNotification = (title, message, color) => {
    Notify.create({
      caption: message,
      message: title,
      color: color,
      position: 'top-right',
      progress: true,
      timeout: 3000,
      avatar: '/images/logos/iso_wth.png',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
  }

  return { showNotification }
}
