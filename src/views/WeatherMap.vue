<script>
  import { ref } from 'vue';  
  import MapWeatherInfo from '../components/MapWeatherInfo.vue'
  import Map from '../components/Map.vue'
  import MapWeatherWeekInfo from '../components/MapWeatherWeekInfo.vue'

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
  };
</script>

<template>
  <main>
    <div class="container">
      <div class="firstRow">
        <div class="container-map">
          <Map @update="handleWeatherDataUpdate"/>
        </div>
        <div class="container-info">
          <MapWeatherInfo :data="parentWeatherData" />
        </div>
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

