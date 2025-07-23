<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'stores/auth.js'
import { useRouter } from 'vue-router'
import { useNotifications } from 'src/utils/notification.js'

const { showNotification } = useNotifications()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const emailRules = [
  (val) => (val && val.length > 0) || 'Correo requerido',
  (val) => /.+@.+\..+/.test(val) || 'Ingresa un correo válido',
]
const passwordRules = [
  (val) => (val && val.length > 0) || 'La contraseña es requerida',
  (val) => val.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
]
const login = async () => {
  loading.value = true

  try {
    const success = await auth.login({
      email: email.value,
      password: password.value,
    })

    if (success) {
      await router.push('/dashboard')
    } else {
      console.error('Credenciales incorrectas o Usuario inactivo')
    }
  } catch (error) {
    // showNotification('Error', 'Credenciales incorrectas o Usuario inactivo', 'red-10')
    showNotification('Error', `${error}`, 'red-10')
    loading.value = false
    console.error('General error: ', error)
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center login-page">
        <div class="login-container">
          <div class="loading-overlay" id="loadingOverlay">
            <q-circular-progress indeterminate size="50px" color="primary" />
          </div>

          <div class="logo-section">
            <div class="logo">
              <q-img src="images/logos/logo_wth.png" spinner-color="white" />
            </div>
            <h1 class="app-title">ISP Manager</h1>
            <!--            <p class="app-subtitle">Sistema de administración</p>-->
          </div>

          <q-form greedy @submit="login">
            <div class="form-section">
              <q-input
                v-model="email"
                outlined
                label="Correo electrónico"
                type="email"
                :rules="emailRules"
                lazy-rules
                class="custom-input"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="grey-6" />
                </template>
              </q-input>

              <q-input
                v-model="password"
                outlined
                label="Contraseña"
                class="custom-input"
                lazy-rules
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-key-variant" color="grey-6" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    color="grey-6"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 24px;
                "
              >
                <q-checkbox
                  v-model="rememberMe"
                  label="Recordarme"
                  color="primary"
                  style="color: #cbd5e1"
                />
              </div>

              <q-btn class="login-btn" label="Acceder" no-caps :loading="loading" @click="login" />
            </div>
          </q-form>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.login-page {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  background: #1e293b;
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.4),
    0 10px 10px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid #334155;
  padding: 48px;
  width: 100%;
  max-width: 550px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  //background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  background: linear-gradient(90deg, #bc1718 0%, #26326c 65%);
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  //width: 64px;
  //height: 64px;
  width: 60%;
  //background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  //border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  //margin-bottom: 16px;
  //box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.logo i {
  color: white;
  font-size: 28px;
}

.app-title {
  color: #f8fafc;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.app-subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}

.form-section {
  margin-bottom: 32px;
}

.custom-input {
  margin-bottom: 24px;
}

.custom-input .q-field__control {
  border-color: #475569 !important;
  background-color: #0f172a !important;
  border-radius: 8px !important;
  height: 56px !important;
}

.custom-input .q-field__native {
  color: #f8fafc !important;
  padding: 0 16px !important;
}

.custom-input .q-field__label {
  color: #94a3b8 !important;
  left: 16px !important;
}

.custom-input.q-field--focused .q-field__control {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.custom-input .q-field__control:hover {
  border-color: #64748b !important;
}

.custom-input .q-field__append {
  color: #94a3b8 !important;
}

.login-btn {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3) !important;
  margin-bottom: 24px;
}

.login-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px);
}

.forgot-password {
  text-align: center;
  margin-bottom: 24px;
}

.forgot-password a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-password a:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  margin: 32px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #334155;
}

.divider span {
  color: #64748b;
  padding: 0 16px;
  font-size: 14px;
}

.social-login {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.social-btn {
  flex: 1;
  height: 48px;
  background: #334155 !important;
  border: 1px solid #475569 !important;
  border-radius: 8px !important;
  color: #cbd5e1 !important;
}

.social-btn:hover {
  background: #475569 !important;
  border-color: #64748b !important;
}

.footer-text {
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.footer-text a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.footer-text a:hover {
  color: #60a5fa;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 41, 59, 0.9);
  display: none;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

@media (max-width: 480px) {
  .login-container {
    margin: 16px;
    padding: 32px 24px;
  }
}
</style>
