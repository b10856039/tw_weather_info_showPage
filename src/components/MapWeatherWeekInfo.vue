
<template>
  <div class="WeekInfo_template" v-if="weather.location  && weather.weather && weather.weather.weatherElement">
    
    <div class="WeekInfo_body">
        <div class="WeekInfo_header">
            <div class="header-title"><span>一週天氣預報 -</span><br class="visible-br"/>{{ `${weather.location.city}${weather.location.town ? weather.location.town : ''}` }}</div>
       
        </div>
        <div class="WeekInfo_container">
            <weatherChart class="weatherChart_style" :data="weather"/>            
            <weatherTable class="weatherTable_style" :data="weather"/>
        </div>   
    </div>
  </div>
</template>
  

<script>

    import {ref, toRefs, toRef, onMounted, watch,reactive,nextTick,onUnmounted } from 'vue'
    import {Location,WeatherAPI} from '../../public/weatherUtil.js' 
    import weatherChart from './weatherChart.vue';
    import weatherTable from './weatherTable.vue';

    export default {
        props:{
            data:Object
        },
        components:{
            weatherChart,
            weatherTable
        },
        setup(props){

            // propsData = prop的資料
            // selectChartType = 選擇顯示的圖表資料
            // weather = 氣象資料
            // chartData = 圖表資料

            const propsData = toRef(props, 'data');
            const selectChartType = ref('temp');
            const weather = reactive({
                location : null,
                weather : null
            })

            
            //監聽氣象資料更新
            watch(propsData,async (newData,oldData)=>{
                if(newData!==oldData){
                    weather.location = new Location(newData.cityName,newData.townName,newData.showCityType)                                 
                    const api = ['weatherWeek']                    
                    const resWeatherWeek = await WeatherAPI.fetchWeatherData(weather.location,api[0])
                    weather.weather = resWeatherWeek.data
                    console.log(weather.weather)
                }
            })

            

            return{
                weather
            }
        },
        
    };
</script>


<style lang="scss" scoped>
    @import '@/assets/components/mapWeatherWeekInfo.scss';
</style>


