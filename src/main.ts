import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Dialog, Quasar, Notify } from 'quasar'
import quasarLang from 'quasar/lang/zh-CN'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'
import router from './router'
import './css/app.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Dialog, Notify },
  lang: quasarLang,
})

app.mount('#app')
