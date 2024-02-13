/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import ru from 'vuetify/lib/locale/ru.mjs'
import '@/styles/main.scss'
import '@/styles/custom.scss'

// Composables
import {createVuetify} from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    locale: 'ru',
    fallback: 'ru',
    messages: { ru },
  },
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2196F3',
          secondary: '#32B830',
          accent: '#3F51B5',
          error: '#E12F2F'
        },
      }
    },
  },
})
