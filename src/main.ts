import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { permissionDirective } from './modules/permissions/directives/permission.directive'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('permission', permissionDirective)

app.mount('#app')
