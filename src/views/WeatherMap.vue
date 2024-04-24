<script>
  import { ref } from 'vue';  
  import MapWeatherInfo from '../components/MapWeatherInfo.vue'
  import Map from '../components/Map.vue'
  import MapWeatherWeekInfo from '../components/MapWeatherWeekInfo.vue'
  import { beforeEnter, enter } from '../../public/animation.js';

  export default {
    components: {
      Map,
      MapWeatherInfo,
      MapWeatherWeekInfo
    },
    setup() {
      const parentWeatherData = ref(null);

      //處理子組件傳遞資料
      const handleWeatherDataUpdate = (data) => {
        parentWeatherData.value = data;              
      };
      return {
        parentWeatherData,
        handleWeatherDataUpdate,
      };
    },
    methods:{
      beforeEnter,
      enter
    }
  };
</script>

<template>
  <main>
    <div class="container">
      <div class="firstRow">
        <div class="container-map">
          <Map @update="handleWeatherDataUpdate"/>
        </div>
        <Transition  @beforeEnter="beforeEnter" @enter="enter"  appear>
          <div class="container-info">
            <MapWeatherInfo :data="parentWeatherData" />
          </div>
        </Transition>
      </div>
      <div class="secondRow">
        <div class="container-week">
          <MapWeatherWeekInfo :data="parentWeatherData"/>
        </div>
      </div>
    </div>

  </main>
</template>

<style lang="scss" scoped>
  @import '@/assets/views/weatherMap.scss';
</style>

