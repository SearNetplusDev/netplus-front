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
    showNotification('Error', 'Credenciales incorrectas o Usuario inactivo', 'red-10')
    loading.value = false
    console.error('General error: ', error)
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-footer></q-footer>
    <q-page-container>
      <q-page class="flex flex-center login-page">
        <div class="login-container">
          <q-card class="login-card q-px-xl" flat bordered>
            <!--    Header    -->
            <q-card-section class="text-center q-pb-md">
              <div class="login-icon q-mb-md">
                <q-icon name="lock" size="48px" color="primary" />
              </div>
              <div class="text-h4 text-weight-light text-grey-8 q-mb-xs">Iniciar Sesión</div>
              <div class="text-subtitle2 text-grey-6">Ingresa tu credenciales para continuar</div>
            </q-card-section>
            <!--    End Header    -->

            <!--    Form    -->
            <q-card-section>
              <q-form @submit="login" class="q-gutter-md">
                <!--  Email   -->
                <q-input
                  v-model="email"
                  type="email"
                  label="Correo electrónico"
                  outlined
                  :rules="emailRules"
                  lazy-rules
                  class="login-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="grey-6" />
                  </template>
                </q-input>

                <!--    Password    -->
                <q-input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Contraseña"
                  outlined
                  :rules="passwordRules"
                  lazy-rules
                  class="login-input"
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

                <!--    Remember    -->
                <div class="row justify-between items-center q-mt-md">
                  <q-checkbox
                    v-model="rememberMe"
                    label="Recordarme"
                    color="primary"
                    class="text-grey-7"
                  />
                </div>

                <!--    Login Button    -->
                <q-btn
                  type="submit"
                  color="primary"
                  label="Acceder"
                  size="lg"
                  class="full-width q-mt-lg login-button"
                  :loading="loading"
                  unelevated
                />
              </q-form>
            </q-card-section>
            <!--    End Form    -->
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  padding: 10px;
}

.login-card {
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  @media (max-width: 600px) {
    margin: 10px;
    padding: 20px !important;
  }
}

.login-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(25, 118, 210, 0.1);
  margin: 0 auto;
}

.login-input {
  .q-field__control {
    border-radius: 12px;
  }
}

.login-button {
  border-radius: 12px;
  height: 48px;
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.login-card {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .login-container {
    padding: 10px;
  }
}
</style>
