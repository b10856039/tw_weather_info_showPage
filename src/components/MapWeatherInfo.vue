<template>
    <div class="weather-info-body" v-if="weather.location && weather.weather  && weather.weather.WeatherElement">
        <weatherInfo :data="weather" @favToggle="handleFavToggleEvent"/>
    </div>
    <div class="no-data" v-if="!weather.location">
        <div>無資料</div>
        <div>請選取地圖</div>
    </div>

</template>

<script>
    import {ref, toRefs, toRef, onMounted, watch,reactive } from 'vue'    
    import {Location,WeatherAPI} from '../../public/weatherUtil.js'    
    import weatherInfo from './weatherInfo.vue';

    

    export default{
        components:{
            weatherInfo
        },
        props:{
            data:Object
        },
        emits:['fav-toggle-parent'],
        setup(props,{emit}){
            const propsData = toRef(props, 'data');
            const weather = reactive({
                location : null,
                weather : null
            })

            //上拋給CustomChart
            const handleFavToggleEvent = (location)=>{                
                emit('fav-toggle-parent',location)
            }

            //監聽天氣資料是否更新
            watch(propsData,(newData,oldData)=>{   
                if(newData!==oldData && newData!==null && newData!=undefined){                    
                    weather.location = new Location(newData.cityName,newData.townName,newData.showCityType)   
                    
                    weather.location.checkhaveStation().then(() => {

                        const api = ['weatherCurrent'];
                        // 確保 replaceTown 的值已經被設置後再執行後續操作
                        WeatherAPI.fetchWeatherData(weather.location, api[0]).then(async (resWeatherCurrent) => {
                            weather.weather = resWeatherCurrent.data;                            
                        });
                    });
                }
            },{immediate:true})       
            
            return{
                propsData,
                weather,
                handleFavToggleEvent
            }
        }
    }
</script>

<style lang="scss" scoped>
   @import '@/assets/components/mapWeatherInfo.scss'; 
</style>
