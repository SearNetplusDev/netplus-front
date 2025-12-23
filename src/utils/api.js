import axios from 'axios'
import qs from 'qs'

const api = axios.create({
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  },
  baseURL: process.env.API_URL,
  withCredentials: true,
  withXSRFToken: true,
})

class CancelToken {
  constructor(initVal) {
    console.log(initVal)
    this.source = axios.CancelToken.source()
  }

  getSource() {
    return this.source
  }

  setSource() {
    this.source = axios.CancelToken.source()
  }

  cancel() {
    this.source.cancel()
  }
}

const cancelSource = new CancelToken()
export { api, cancelSource, axios }
