
<template>
  <div class="WeekInfo_template" v-if="weather.location  && weather.weather && weather.weather.weatherElement">
    
    <div class="WeekInfo_body">
        <div class="WeekInfo_header">
            <div class="header-title"><span>{{ titleText }}</span><br class="visible-br"/>{{ `${weather.location.city}${weather.location.town ? weather.location.town : ''}` }}</div>
       
        </div>
        <div class="WeekInfo_container">
            <weatherChart class="weatherChart_style" :data="weather" @update-weatherData="selectAPIprocessed"/>            
            <weatherTable class="weatherTable_style" :data="weather" :perType ="selectAPIType"/>
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
            // titleText = 標題

            const propsData = toRef(props, 'data');
            const selectAPIType = toRef('Week')
            const weather = reactive({
                location : null,
                weather : null,                
            })
            const titleText = ref('一週天氣預報 -')

            const fetchData = async ()=>{
                const api = ['weatherWeek']     
                const resWeatherWeek = await WeatherAPI.fetchWeatherData(weather.location,api[0],selectAPIType.value)
                weather.weather = resWeatherWeek.data

            }
          
            const selectAPIprocessed =async (type)=>{
                if(type === '3Hours_Temp'){
                    selectAPIType.value = '3Hours'
                    titleText.value = '逐三小時預報(三天) -'
                }else{
                    selectAPIType.value = 'Week'
                    titleText.value = '一週天氣預報 -'
                }
                await fetchData()
            }

            //監聽氣象資料更新
            watch(propsData,async (newData,oldData)=>{
                if(newData!==oldData  && newData!==null && newData!=undefined ){
                    weather.location = new Location(newData.cityName,newData.townName,newData.showCityType)                                
                    await fetchData()
                }
            },{immediate:true})
            

            return{
                weather,
                selectAPIprocessed,
                selectAPIType,
                titleText
            }
        },
        
    };
</script>


<style lang="scss" scoped>
    @import '@/assets/components/mapWeatherWeekInfo.scss';
</style>


