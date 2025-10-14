import { reactive } from 'vue'

export const useFormState = () => {
  const state = reactive({
    title: 'Resolución de soportes',
    loading: false,
    showDeleteItem: false,
    showSearchInternetDevicesDialog: false,
    showSearchIptvDevicesDialog: false,
    showSearchSaleDevicesDialog: false,
  })

  const resetDialogs = () => {
    state.showDeleteItem = false
    state.showSearchInternetDevicesDialog = false
    state.showSearchIptvDevicesDialog = false
    state.showSearchSaleDevicesDialog = false
  }

  const setTitle = (ticket, type) => {
    state.title = `Resolución ${ticket} (${type})`
  }

  return { state, resetDialogs, setTitle }
}
