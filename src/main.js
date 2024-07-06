/* eslint-disable import/order */
import '@/@iconify/icons-bundle'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import router from '@/router'
import '@core/scss/template/index.scss'
import '@layouts/styles/index.scss'
import '@styles/styles.scss'
import { createApp } from 'vue'

import { createPinia } from 'pinia'

const app = createApp(App)


// Use plugins
app.use(createPinia()); // Create and use Pinia instance
app.use(vuetify)
app.use(router)

// Mount vue app
app.mount('#app')
