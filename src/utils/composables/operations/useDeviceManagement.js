import { computed, reactive } from 'vue'

export const useDeviceManagement = () => {
  const devices = reactive({
    internet: [],
    iptv: [],
    sold: [],
  })

  const iptvButtonDisabled = computed(() => {
    return false
  })

  const internetButtonDisabled = computed(() => {
    return false
  })

  const setDevices = (internet, iptv, sold) => {
    devices.internet = internet || []
    devices.iptv = iptv || []
    devices.sold = sold || []
  }

  const removeDevice = (type, index) => {
    if (type === 'internet') {
      devices.internet.splice(index, 1)
    } else if (type === 'iptv') {
      devices.iptv.splice(index, 1)
    } else if (type === 'sold') {
      devices.sold.splice(index, 1)
    }
  }

  const getDeviceCount = (type) => {
    return devices[type]?.length || 0
  }

  return {
    devices,
    iptvButtonDisabled,
    internetButtonDisabled,
    setDevices,
    removeDevice,
    getDeviceCount,
  }
}
