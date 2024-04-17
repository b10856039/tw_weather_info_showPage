<template>
  <div class="map-option">
    <div class="map-toggleCounty">
      <button @click="toggleMap(true)" :class="{ 'showCity-class': showCity }">縣市地圖</button>
      <button  @click="toggleMap(false)" :class="{ 'showCity-class': !showCity }">鄉鎮地圖</button>
    </div>
    <div class="map-selection">
      <div class="city-input"> 
        <select id="searchCityInput" v-model="cityName" @change="generatorTownSelecter"></select>
      </div>
      <div class="town-input" v-if="!showCity">
        <select id="searchTownInput" v-model="townName"></select>
      </div>
    </div> 
    <div class="submit-selection">
      <div class="select-btn">
        <button id="search_target" @click="searchingMap()"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></button>
      </div>
      <div class="locate-btn">
        <button @click="getUserCoordinates()"><font-awesome-icon class="location_dot" :icon="['fas', 'location-dot']" /></button>
      </div>
    </div>
    <div>

    </div>   
  </div>
  <div class="map-canvas">
    <svg id="svgcanvas" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <g class="country-container" @mousewheel="zooming()">
        <g class="counties"></g>
      </g>
    </svg>
    <div id="fixedDiv">
      <button id="zoom_in">+</button>
      <button id="zoom_out">-</button>
      <button id="zoom_reset">Reset</button>
    </div>
  </div>

</template>

<style lang="scss" scoped>
  @import '@/assets/components/map.scss';
</style>


<script>
import { ref, onMounted, onBeforeUnmount ,watch , defineProps} from "vue";
import Map from '../../public/mapUtil.js';
import * as d3 from "d3";
import { eventBus } from '../main';

export default {
    emits:['update'],
    setup(_,{emit}) {

      // taiwanCounties = 地圖標線資料; 
      // showCity = 判斷顯示鄉鎮or縣市地圖 ;
      // weatherData = 地區天氣資料
      // cityName = 縣市名稱 ; townName = 鄉鎮名稱;
      // map = Map物件

      const taiwanCounties = ref([]);
      const showCity = ref(true);
      const weatherData = ref(null);
      const cityName = ref('')
      const townName = ref('')
      const map = ref(null);

      // 初始化地圖
      const initializeMap = async () => {
        try {
          const cityTypeJson = showCity.value ? "COUNTY_MOI_1090820" : "TOWN_MOI_1120825";
          const response = await import(`../../public/mapBoundsData/${cityTypeJson}.json`);
          const data = await response.default;
          taiwanCounties.value = data;

          await map.value.initMapSize();
          const [countiesGroup,geometry,path] = await map.value.draw(data, showCity.value);
          await map.value.drawMapPaths(countiesGroup, geometry, path, showCity.value);
          await map.value.mapLabelUtil(countiesGroup,geometry,path,showCity.value);
          await map.value.setupZoom(showCity.value)

        } catch (error) {
          console.error("Error loading JSON data:", error);
        }
      };

      //讀取台灣縣市鄉鎮資料
      const loadCityTown = async (type = false) =>{
        try{
          const countryJson = await import('../../public/jsonFolder/TwCities.json')
          const response = await countryJson.default;

          if(!type){
            const cityData = response.find(item => item.name === cityName.value);
            return cityData ? cityData.districts : [];
          }else {
            const allCities = response.map(item => {
              return item.name
            });
            return allCities;
          }

        }catch(error){
          console.error("Error loading TwCities Data:", error)
        }
      }


      // 生成搜尋Selector功能
      const generateSearchSelector = async (selectorId, dataArray, defaultText, valueExtractor) => {
        const selector = document.querySelector(`#${selectorId}`);
        selector.innerHTML = ''; // 清空所有Option

        // 添加默認選項(僅展示)
        const firstOptionElement = document.createElement('option');
        firstOptionElement.text = defaultText;
        firstOptionElement.value = '';
        firstOptionElement.disabled = true;
        selector.appendChild(firstOptionElement);

        // 添加地區Option選項
        dataArray.forEach(item => {
          const optionElement = document.createElement('option');
          optionElement.value = valueExtractor(item);
          optionElement.text = valueExtractor(item);
          selector.appendChild(optionElement);
        });

        // 設置第一個選項為默認選取狀態
        if (dataArray.length > 0) {
          selector.selectedIndex = 1;
        }
      };

      // 生成臺灣縣市搜尋Selector功能
      const generatorCitySelecter = async (cityInput = undefined) => {
        const cityArr = await loadCityTown(true);
        await generateSearchSelector('searchCityInput', cityArr, '請選擇縣市', item => item);

        // 設置縣市為默認選取狀態
        const citySelect = document.querySelector('#searchCityInput');
        if (!cityInput) {
          cityName.value = cityArr[0];
          citySelect.selectedIndex = 1;
        } else {
          cityName.value = cityInput;
          citySelect.value = cityInput;
        }
      };

      // 生成臺灣鄉鎮搜尋Selector功能
      const generatorTownSelecter = async () => {
        townName.value = '';

        if (!showCity.value) {
          const townArr = await loadCityTown(false);
          await generateSearchSelector('searchTownInput', townArr, '請選擇鄉鎮', item => item.name);

          // 設置鄉鎮為默認選取狀態
          const TownSelect = document.querySelector('#searchTownInput');
          if (townArr.length > 0) {
            townName.value = townArr[0].name;
            TownSelect.selectedIndex = 1;
          }
        }
      };


      //監聽天氣資料是否變化
      watch(weatherData, (newData, oldData) => {
        try {
          if (newData !== oldData && newData!==null) {
            
            newData.showCityType = showCity.value

            //上傳給weatherInfo與weatherWeekInfo
            emit('update',newData)
          }
        } catch (error) {
          console.error("Error in watch callback:", error);
        }
      });

      //網頁重置時進行地圖初始化
      onMounted(() => {

        map.value = new Map()
        eventBus.weatherData = weatherData;
        initializeMap(); 
        generatorCitySelecter()  

        //處理d3.js的mapClickHandler事件的數值變更
        document.addEventListener('mapClickFinished',async (event) => {
            cityName.value = event.detail.cityName;         
            if(townName.value!==null){
              await generatorCitySelecter(cityName.value);         
              await generatorTownSelecter();
              townName.value = event.detail.townName;
            }

        });
      });

      return {
        taiwanCounties,
        showCity,
        weatherData,
        initializeMap,
        cityName,
        townName,
        generatorCitySelecter,
        generatorTownSelecter,
        map
      };
    },
    methods: {
      zooming() {
        //d3.js的放大縮小功能
        this.map.setupZoom(this.showCity);
      },
      async toggleMap(event) {
        //顯示縣市地圖or鄉鎮地圖
        if (event === this.showCity) {
          return;
        }
        this.showCity = event;
        await this.initializeMap(this.taiwanCounties);
        await this.generatorCitySelecter(this.cityName)
        await this.generatorTownSelecter()
        this.weatherData = null;
      },
      searchingMap() {
        //搜尋位置功能
        if (!this.showCity) {
          if (this.townName === '' || this.cityName === '' || this.cityName === '請選擇縣市' || this.townName === '請選擇鄉鎮') {
            return;
          }
        } else {
          if (this.cityName === '' || this.cityName === '請選擇縣市') {
            return;
          }
        }
        this.map.search(this.showCity, this.cityName, this.showCity ? undefined : this.townName);
      },
      getUserCoordinates() {
          if (navigator.geolocation) {
              //獲取使用者定位座標
              navigator.geolocation.getCurrentPosition((position) => {
                  const longitude = position.coords.longitude;
                  const latitude = position.coords.latitude;
                  this.getUserPosition(latitude, longitude);
              });
          } else {
              alert('此網站不支援定位功能');
          }
      },
      async getUserPosition(latitude, longitude) {
        //獲取使用者所在縣市鄉鎮名稱
        const reverseGeocodingAPI = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
        try {
            const response = await fetch(reverseGeocodingAPI);
            const data = await response.json();
            this.cityName = data.address.city ? data.address.city : data.address.county; 
            await this.toggleMap(false);
            this.showCity = false;                    
            await this.generatorTownSelecter();
            this.townName = data.address.suburb ? data.address.suburb : data.address.town;          
            await this.map.search(this.showCity,this.cityName,this.townName)
        } catch (error) {
            console.error('Error fetching reverse geocoding data:', error);
        }
      }
    }
  };
</script>

