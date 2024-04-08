<template>

    <div class="container">
      <div class="search_container">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        <input v-model="search" placeholder="搜尋">
        <Tooltip :toolTipText="'搜尋方式:\n縣市鄉鎮,縣市 鄉鎮,縣市,鄉鎮'" :position="'bottom'">
            <button class="circleQuestionIcon">?</button>
        </Tooltip>
      </div>
      <div class="region_container" ref="region_container" v-if="displayedData.length>0">
        <div  v-for="(item, index) in displayedData" :key="item.currentData.location.city + item.currentData.location.town" class="weather_block"  >
            <div class="select_block">
                <button @click="toggleBlockContent(index,'current')">目前天氣</button>
                <button @click="toggleBlockContent(index,'week')">一周天氣</button>
            </div>
            <div class="current_block"  :id="'current_block_'+index">
                <template v-if="item.currentData.location && item.currentData.weather">                    
                    <weatherInfo  :data="{ location: item.currentData.location, weather: item.currentData.weather }" @favToggle="handleFavToggle"/>
                </template>
                <template v-else>
                <p>Loading...</p>
                </template>
            </div>
            <div class="week_block" :id="'week_block_'+index" style="display: none;">
                <template v-if="item.weekData.location && item.weekData.weather">
                    <div class="week_title_block"><span>一週天氣預報 -</span><br class="visible-br"/>{{`${item.weekData.location.city}${item.weekData.location.town ? item.weekData.location.town : ''}`}}</div>
                    <div class="chart_block">
                        <weatherChart  :data="{location:item.weekData.location,weather:item.weekData.weather}"/>
                    </div>         
                    <div class="table_block">
                        <weatherTable  :data="{location:item.weekData.location,weather:item.weekData.weather}"/>
                    </div>   
                </template>
                <template v-else>
                <p>Loading...</p>
                </template>
            </div>
        </div>        
      </div>
      <div class="no-data" v-else>無資料</div>
    </div>
    <pagination v-if="combinedData.length > 0" :data="combinedData" @update-displayedData="updateDisplayedData" />
</template>

<script>

    import {ref, toRefs, toRef, onMounted, watch,reactive,computed } from 'vue'
    import {Location,WeatherAPI} from '../../public/weatherUtil.js' 
    import weatherInfo from '../components/weatherInfo.vue';
    import weatherChart from '../components/weatherChart.vue';
    import weatherTable from '../components/weatherTable.vue';
    import pagination from '../components/pagination.vue';
    import Tooltip from '../components/toolTip.vue'

    export default{
        components:{
            weatherInfo,
            weatherChart,
            weatherTable,
            pagination,
            Tooltip
        },
        setup(){
            const weatherWeek_sorted = ref([])
            const weatherCurrent_sorted = ref([])
            const combinedData = ref([])
            const region = ref([])
            const search = ref(null)
            const displayedData = ref([])


            const get_WeatherData = async () => {
                try {

                    const regionJSON = localStorage.getItem('region')
                    region.value =JSON.parse(regionJSON)
                    if(region.value===null){
                        localStorage.setItem('region',JSON.stringify([]));
                        return
                    }

                    if(region.value.length<=0){
                        return
                    }
                    //同時處理氣象資料
                    const weatherPromises = region.value.map(async (area) => {
                        const weather_week = reactive({
                            location: new Location(area.cityName, area.townName, area.showCityType),
                            weather: null
                        });
                        const weather_current = reactive({
                            location: new Location(area.cityName, area.townName, area.showCityType),
                            weather: null
                        });

                        const currentPromise = fetch_WeatherData(weather_current, 'weatherCurrent');
                        const weekPromise = fetch_WeatherData(weather_week, 'weatherWeek');

                        return Promise.all([currentPromise, weekPromise]);
                    });


                    const allWeatherData = await Promise.all(weatherPromises);

                    
                    allWeatherData.forEach(([currentWeather, weekWeather]) => {

                        weatherCurrent_sorted.value.push(currentWeather);
                        weatherWeek_sorted.value.push(weekWeather);
                    });

                    // 更新 combinedData
                    combinedData.value = combined_Data();

                } catch (error) {
                    console.error('Error fetching weather data:', error);
                }
            };

            const fetch_WeatherData = async (data,api)=>{
                await data.location.checkhaveStation();
                const resWeather = await WeatherAPI.fetchWeatherData(data.location, api);
                data.weather = resWeather.data;
                return data; 
            }

            const combined_Data = ()=> {
                const combined = [];
                for (let i = 0; i < weatherWeek_sorted.value.length; i++) {
                    
                    combined.push({
                        weekData: weatherWeek_sorted.value[i],
                        currentData: weatherCurrent_sorted.value[i],
                    });
                }

                return combined;
                
            }

            //toggle地區至個人圖表
            const handleFavToggle = (payload) => {
                const location = payload;
                                
                const indexToRemove = combinedData.value.findIndex(item => {
                    if (location.requestType) {
                    return item.currentData.location.city === location.city;
                    } else {
                    return item.currentData.location.city === location.city && item.currentData.location.town === location.town;
                    }
                });

                if (indexToRemove !== -1) {                    
                    combinedData.value.splice(indexToRemove, 1);
                }

                region.value = region.value.filter((item) => {
                    if (location.reqestType) {
                        return !(item.cityName === location.city);
                    } else {
                        return !(item.cityName === location.city && item.townName === location.town);
                    }
                });
            };

            const updateDisplayedData = (data)=>{
                displayedData.value = data
            }

            watch(search, (newSearch, oldSearch) => {

                newSearch = newSearch.trim().replace(/\s+/g, '');
                // 檢查字串的第一个字元是否為"台"，如果是替換為"臺"
                if (newSearch && newSearch.charAt(0) === '台') {
                    newSearch = '臺' + newSearch.slice(1);
                }

                // 正則表達式，考虑 "臺" 和 "台" 的相同性
                const searchRegex = new RegExp(newSearch ? newSearch.replace(/臺/g, '[臺台]') : '', 'i');

                // 根据條件過濾 combinedData
                combinedData.value = combined_Data().filter(item => {
                    const locationString = item.currentData.location.city + item.currentData.location.town;

                    return searchRegex.test(locationString);
                });
                
                if(combinedData.value.length <=0){
                    displayedData.value = []
                }
            });


            onMounted(() => {
                get_WeatherData();  
            });

            return{
                combinedData,
                handleFavToggle,
                search,
                displayedData,
                updateDisplayedData
            }
        },
        methods:{
            toggleBlockContent(index,type){
                const currentBlock = document.getElementById('current_block_' + index);
                const weekBlock = document.getElementById('week_block_' + index);

                if(type === 'current'){
                    currentBlock.style.display = 'block'
                    weekBlock.style.display = 'none'
                }else if(type === 'week'){
                    weekBlock.style.display = 'block'
                    currentBlock.style.display = 'none'
                }
            }
        }
    }

</script>


<style lang="scss" scoped>    
    @import '@/assets/views/customChart.scss';

</style>