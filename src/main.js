import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faStar as faSolidStar,faMagnifyingGlass,faLocationDot,faSquarePlus,faCircleQuestion,faAngleLeft,faAngleDown,faGear,faBars,faX } from '@fortawesome/free-solid-svg-icons'
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'


import './assets/base.scss'
import 'd3'

import { createApp,ref } from 'vue'
import App from './App.vue'
import router from './router'


library.add(faMagnifyingGlass,faLocationDot,faSolidStar,faRegularStar,faSquarePlus,faCircleQuestion,faGithub,faAngleLeft,faAngleDown,faGear,faBars,faX)

const app = createApp(App)
const eventBus = createApp({});
eventBus.config.globalProperties.weatherData = ref(null);

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)

app.mount('#app')

export { app, eventBus };