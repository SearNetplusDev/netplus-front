import axios from 'axios'
import qs from 'qs'

const api = axios.create({
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  },
  baseURL: process.env.API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

class CancelToken {
  constructor() {
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
