<template>
    <div class="container">
        <div class="weather-info">
            <div class="weather-info-title">
                <div class="title-header">
                    <div class="title-city">
                        {{ weather.location.city ? weather.location.city : weather.location.town }}
                    </div>   
                    <div class="title-fav">
                        <Tooltip :toolTipText="!fav_btn ? '加入到個人圖表' :'移除出個人圖表' " :position="'bottom'">
                            <button  @click="toggleFav(weather.location)" class="fav_btn_class"><font-awesome-icon :icon="['fas', 'star']" v-if="fav_btn"/><font-awesome-icon :icon="['far', 'star']" v-else/></button>
                        </Tooltip>
                    </div>  
                    <div class="title-info">
                        <div class="title-town">
                            <label>{{ weather.location.town ? weather.location.town : '' }}</label>
                            <small class="replace-town">{{ weather.location.replaceTown ? `(無測站，以${weather.location.replaceTown}為參考指標)` : "" }}</small>                    
                        </div>         
                    </div>           
                </div>
            </div>
            <div class="weather-info-container">
                <div class="info-title">
                    <div class="title">目前天氣</div>
                </div>    
                <div class="info-body">
                    <div class="current-1">
                        <div>
                            <div>{{ findCurrentTimeElementByName(weather.weather.ObsTime,'none','time')}}</div>                    
                        </div>
                        <div class="current-Wx">
                            <img :src="currentWxIcon" :alt="findCurrentTimeElementByName(weather.weather.WeatherElement,'Weather')" :title="findCurrentTimeElementByName(weather.weather.WeatherElement,'Weather')">
                        </div>
                        <div class="current-temp">
                            <div>{{findCurrentTimeElementByName(weather.weather.WeatherElement,'AirTemperature')}}</div>
                        </div>
                    </div>
                    <div class="current-2">
                        <div class="current-D_TX">
                            <div>最高溫</div>
                            <div><img :src="currentDataIcon[1]" :alt="'最高溫'" :title="'最高溫'"></div>
                            <div>{{ findCurrentTimeElementByName(weather.weather.WeatherElement,'DailyExtreme,DailyHigh,TemperatureInfo,AirTemperature')  }}</div>
                        </div>
                        <div class="current-D_TN">
                            <div>最低溫</div>
                            <div><img :src="currentDataIcon[0]" :alt="'最低溫'" :title="'最低溫'"></div>
                            <div>{{ findCurrentTimeElementByName(weather.weather.WeatherElement,'DailyExtreme,DailyLow,TemperatureInfo,AirTemperature')  }}</div>                    
                        </div>
                    </div>
                    <div class="current-3">
                        <div class="current-HUMD">
                            <div>濕度</div>
                            <div><img :src="currentDataIcon[2]" :alt="'濕度'" :title="'濕度'"></div>
                            <div>{{ findCurrentTimeElementByName(weather.weather.WeatherElement,'RelativeHumidity')  }}</div>                            
                        </div>
                        <div class="current-Precipitation">
                            <div>降雨量</div>
                            <div><img :src="currentDataIcon[3]" :alt="'降雨量'" :title="'降雨量'"></div>
                            <div>{{ findCurrentTimeElementByName(weather.weather.WeatherElement,'Now,Precipitation')  }}</div>                            
                        </div>
                    </div>

                    <div class="current-4">
                        <div class="current-WDIR">
                            <div>風向</div>
                            <div><img :src="currentDataIcon[4]" :alt="'風向'" :title="'風向'"></div>
                            <div>{{ checkWDIR(findCurrentTimeElementByName(weather.weather.WeatherElement,'WindDirection'))}}</div>                            
                        </div>
                        <div class="current-WDSD">
                            <div>風速</div>
                            <div><img :src="currentDataIcon[5]" :alt="'風速'" :title="'風速'"></div>
                            <div>{{ findCurrentTimeElementByName(weather.weather.WeatherElement,'WindSpeed')  }}</div>                            
                        </div>
                        <div class="current-AirPressure">
                            <div>氣壓</div>
                            <div><img :src="currentDataIcon[6]" :alt="'氣壓'" :title="'氣壓'" style="width:80px; height:auto;"></div>
                            <div>{{ findCurrentTimeElementByName(weather.weather.WeatherElement,'AirPressure')  }}</div>                            
                        </div>
                    </div>
                </div>
            </div>
        </div>


    </div>
</template>


<script>
    import {ref, toRefs, toRef, onMounted, watch,reactive } from 'vue'
    import Tooltip from '../components/toolTip.vue';
import { faV } from '@fortawesome/free-solid-svg-icons';
    export default{
        components: {
            Tooltip
        },
        emits:['favToggle'],
        props:{
            data:Object
        },
        setup(props, { emit }){

            // weather = 氣象資料
            // propsData = prop的資料
            // currentWxIcon = 即時氣象的天氣狀態圖示位址
            // fav_btn = 加入個人圖表
            // region = 地區資料

            const weather = ref(null);
            const propsData = toRef(props, 'data').value;
            const currentWxIcon = ref('')
            const currentDataIcon = ref([])
            const fav_btn = ref(false)
            
            //取得天氣狀態Icon名稱
            const getIconName = async(weatherName,time)=>{ 
                let timeState = time.split('\n')
                if(timeState.length>1){
                    const datePart = timeState[0].split('~')[0];
                    const timePart = timeState[1].split('-')[0];                    
                    timeState = `${datePart} ${timePart}`;
                }else{
                    timeState = timeState[0]
                }
                timeState = new Date(timeState)
                
                let hours = timeState.getHours();

                const response = await import('../../public/jsonFolder/weatherIcon_categories.json')
                const categories = await response.default;
                
                const lowercaseType = weatherName.toLowerCase();  
                //尋找天氣圖示分類
                const weatherInfo = categories.data.find(item => item.type.includes(lowercaseType));

                //找到對應圖示，接上位址連結
                try {
                    let url = ''
                    if (weatherInfo) {
                        if (hours >= 6 && hours < 18) {
                            url = `/image/icons/weather/${weatherInfo.icon_day_url}`
                        } else {
                            url = `/image/icons/weather/${weatherInfo.icon_night_url}`
                        }
                    }
                    return url
                } catch (error) {
                    console.error('Error loading icon:', error);
                    return '/image/icons/default.svg';
                }
                
            }

            //取得各資料圖示Icon
            const getcurrentDataIcon = ()=>{
                currentDataIcon.value = []
                const imgName = ['lowtemperature.png','hightemperature.png','humidity.png','precipitation.png','winddirection_icon.png'
                ,'windspeed_icon.png','airpressure_icon.png']
                for(const img of imgName){
                    try {
                        let url = `/image/icons/${img}`

                        
                        currentDataIcon.value.push(url) 
                    } catch (error) {
                        console.error('Error loading icon:', error);
                        return '/image/icons/default.svg'
                    }
                }
            }

            //取得與處理即時天氣資料
            const findCurrentTimeElementByName = (elements, name, useTime=undefined)=>{   
                if(useTime){
                    const foundElement = new Date(elements.DateTime)
                    // 轉換為目標格式的字串
                    const formattedDateString = `${padZero(foundElement.getMonth()+1)}-${padZero(foundElement.getDate())} ${padZero(foundElement.getHours())}:${padZero(foundElement.getMinutes())}`;
                    
                    function padZero(value) {
                        return value < 10 ? `0${value}` : value;
                    }
                    return formattedDateString ? formattedDateString : 'N/A-暫無資料'
                }else{
                    const elementUnit = [{name:'AirTemperature',unit:'\u2103'},
                                            {name:'RelativeHumidity',unit:'%'},
                                            {name:'Precipitation',unit:'mm'},
                                            {name:'WindSpeed',unit:'m/s'},
                                            {name:'AirPressure',unit:'hpa'}]

                    const foundUnit = elementUnit.filter(unit => name.includes(unit.name))[0]!=undefined ? elementUnit.filter(unit => name.includes(unit.name))[0] : '';
                    if(name.split(',').length>1){
                        let foundElement = elements
                        let name_arr = name.split(',')

                        for(const key of name_arr){
                            foundElement = foundElement[key]
                            if(!foundElement){
                                break
                            }
                        }
                        foundElement = foundElement!='-99' ? foundElement.toString() : 'N/A-暫無資料'
                        return foundElement!='N/A-暫無資料' ? (foundElement + (foundUnit!='' ? ` ${foundUnit.unit}` : '')) : 'N/A-暫無資料';
                    }else{
                        let foundElement = elements[name]!='-99' ? elements[name].toString() : 'N/A-暫無資料'
                        return foundElement!='N/A-暫無資料' ? (foundElement + (foundUnit ? ` ${foundUnit.unit}` : '')) : 'N/A-暫無資料';
                    }

                }

            }

            const toggleFav = async (location) => {

                const regionJSON = localStorage.getItem('region')
                let region =await JSON.parse(regionJSON)

                if(region===null){
                    localStorage.setItem('region',JSON.stringify([]));
                    region = []
                }
                console.log(region)
                if (fav_btn.value) {
                    region =await region.filter((item) => {
                        if (location.reqestType) {
                            return !(item.cityName === location.city);
                        } else {
                            return !(item.cityName === location.city && item.townName === location.town);
                        }
                    });
                } else {
                    await region.push({
                        'cityName': location.city,
                        'townName': location.town,
                        'showCityType': location.reqestType
                    });
                }
                fav_btn.value = !fav_btn.value;
                // 更新 localStorage
                localStorage.setItem('region', JSON.stringify(region));


                emit('favToggle',location);
            }

            watch([() => propsData.location,()=>propsData.weather], async (newData,oldData)=>{
                
                if(newData!==oldData){
                    weather.value = propsData
                    currentWxIcon.value = await getIconName(findCurrentTimeElementByName(weather.value.weather.WeatherElement, 'Weather'), findCurrentTimeElementByName(weather.value.weather.ObsTime, 'none', 'time'));

                    const regionJSON = localStorage.getItem('region')

                    if(regionJSON===null || regionJSON===undefined){
                        return
                    }
                    const region = JSON.parse(regionJSON)
                    if(region.length<=0 || region===undefined){
                        return
                    }

                    for(const item of region){
                        if(weather.value.location.reqestType){
                            if(weather.value.location.city === item.cityName){
                                fav_btn.value = true
                                return
                            }
                        }else{
                            if(weather.value.location.city === item.cityName && weather.value.location.town === item.townName){
                                fav_btn.value = true
                                return
                            }
                        }
                        
                    }
                    fav_btn.value = false
                    
                    return
                }   
            },{ deep: true, immediate: true  })       
            

            onMounted(()=>{
                getcurrentDataIcon()
            })

            return{
                propsData,
                weather,
                currentWxIcon,
                findCurrentTimeElementByName,
                fav_btn,
                toggleFav,
                currentDataIcon
            }
        },
        methods:{
            checkWDIR(wind){
                const wind_degrees = parseInt(wind)
                const directions = ['偏北','北','偏東北','東北','偏東','東','偏東南','東南','偏南','南','偏西南','西南','偏西','西','偏西北','西北'];
                // 將風向歸一化到0到360度之間
                const normalized_degrees = (wind_degrees + 360) % 360;
                // 計算方向的索引
                const index = Math.round(normalized_degrees / 22.5) % 16;
                // 返回對應的方向描述
                return directions[index] ? directions[index] + '風': 'N/A-暫無資料';
            }
        }
    }

</script>


<style lang="scss" scoped>
    @import '@/assets/components/weatherInfo.scss'
</style>