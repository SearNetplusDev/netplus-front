import { Loading, QSpinnerFacebook } from 'quasar'

export function useLoading() {
  function showLoading(message = 'Procesando, espera un momento...') {
    Loading.show({
      spinner: QSpinnerFacebook,
      spinnerColor: 'amber',
      backgroundColor: 'dark',
      messageColor: 'amber',
      message,
      spinnerSize: '5.5em',
    })
  }

  function hideLoading() {
    Loading.hide()
  }

  return { showLoading, hideLoading }
}
