// import { defineBoot } from '#q-app/wrappers'
// import axios from 'axios'
// import qs from 'qs'
//
// // Be careful when using SSR for cross-request state pollution
// // due to creating a Singleton instance here;
// // If any data changes this (global) instance, it might be a
// // good idea to move this instance creation inside of the
// // "export default () => {}" function below (which runs individually
// // for each data)
// // const api = axios.create({ baseURL: 'https://api.example.com' })
// const api = axios.create({
//   paramsSerializer: (params) => {
//     return qs.stringify(params, { arrayFormat: 'repeat' })
//   },
//   baseURL: process.env.API_URL,
//   withCredentials: true,
//   withXSRFToken: true,
// })
//
// class CancelToken {
//   constructor(initVal) {
//     console.log(initVal)
//     this.source = axios.CancelToken.source()
//   }
//
//   getSource() {
//     return this.source
//   }
//
//   setSource() {
//     this.source = axios.CancelToken.source()
//   }
//
//   cancel() {
//     this.source.cancel()
//   }
// }
//
// const cancelSource = new CancelToken()
//
// /*
//  *
//  * */
// api.defaults.withCredentials = true
// export default defineBoot(({ app }) => {
//   // for use inside Vue files (Options API) through this.$axios and this.$api
//
//   app.config.globalProperties.$axios = axios
//   // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
//   //       so you won't necessarily have to import axios in each vue file
//
//   app.config.globalProperties.$api = api
//   // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
//   //       so you can easily perform requests against your app's API
// })
//
// export { api, cancelSource }

import { boot } from 'quasar/wrappers'
import { api, axios } from 'src/utils/api.js'

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})
