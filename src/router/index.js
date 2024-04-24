import { createRouter, createWebHistory } from 'vue-router'
// import WeatherMap from '../views/WeatherMap.vue'
// import CustomChart from '../views/CustomChart.vue'

const WeatherMap = ()=> import('../views/WeatherMap.vue')
const CustomChart = ()=>import('../views/CustomChart.vue')
const NotFound = ()=>import('../views/NotFound.vue')


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'weatherMap',
      component: WeatherMap
    },
    {
      path: '/customChart',
      name: 'Chart',
      component : CustomChart
    },
    {
      path: '/:pathMatch(.*)*',
      component: NotFound
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})


export default router
