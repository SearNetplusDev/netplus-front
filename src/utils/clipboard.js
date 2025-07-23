import { copyToClipboard, Notify } from 'quasar'

export const useClipboard = () => {
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

  const copy = (txt) => {
    copyToClipboard(txt)
      .then(() => {
        showNotification(
          'Elemento Copiado.',
          `${txt} ha sido agregado al portapapeles`,
          'blue-grey-10',
        )
      })
      .catch((err) => {
        showNotification('Error', err, 'red-10')
      })
  }

  return { copy }
}
