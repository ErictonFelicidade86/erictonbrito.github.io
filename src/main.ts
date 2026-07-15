import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          background: '#0b0d12',
          surface: '#12151c',
          primary: '#7c5cff',
          secondary: '#00e5c7',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(vuetify)
app.use(router)
app.use(i18n)

app.mount('#app')
