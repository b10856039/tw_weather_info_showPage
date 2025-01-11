<template>
    <div class="weatherTable_style">
        <div class="div-table">
            <table id="weatherTable" class="week-predict-weather-table" v-if="weather">
                <thead>
                    <tr>
                        <th class="dateTitle">日期</th>
                        <th v-for="element in weather.weather.WeatherElement[1].Time" :key="element.StartTime ? element.StartTime : element.DataTime" class="weekDate">
                            <span>{{ filterTime(element.StartTime ? element.StartTime : element.DataTime,'date') }}</span>
                            <br>
                            <span>{{ `星期${filterTime(element.StartTime ? element.StartTime : element.DataTime,'day')}` }}</span>
                        </th>
                    </tr>
                    <tr>
                        <th class="timeTitle">時間</th>
                        <th v-for="element in weather.weather.WeatherElement[1].Time" :key="element.StartTime ? element.StartTime : element.DataTime" class="weekTime">
                            {{ filterTime(element.StartTime ? element.StartTime : element.DataTime,'time') }}
                        </th>
                    </tr>                    
                </thead>
                <tbody>
                    <tr v-for="data in filteredWeatherElements" :key="data.ElementName">
                        <td class="weather-title">{{ data.ElementName }}</td>
                        <td v-for="(time, index) in data.Time" :key="index" :class="data.ElementName">      
                            <img v-if="data.ElementName==='天氣現象'" :src="image[index]" :title="formatValueWithUnit(time.ElementValue[0],data.ElementName)">       
                            <span v-else>{{ formatValueWithUnit(time.ElementValue[0],data.ElementName) }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>  

        <div class="div-table-small">
            <table id="weatherTable-small" v-for="(element,index) in weather.weather.WeatherElement[1].Time" :key="element.StartTime" class="week-predict-weather-table-small" v-if="weather">
                <thead @click="toggleTableExpand(element.StartTime)">
                    <tr>
                        <th>{{ `${filterTime(element.StartTime,'date')}(${filterTime(element.StartTime,'day')})${filterTime(element.StartTime,'time')}`}}</th>
                        <th><font-awesome-icon :icon="['fas', tableExpandStatus[element.StartTime] ? 'angle-down' : 'angle-left']" /></th>
                    </tr>
                </thead>
                <tbody v-show="tableExpandStatus[element.StartTime]">
                    <tr v-for="data in filteredWeatherElements" :key="data" class="weather-data-element">                    
                        <th v-if="!Object.values(this.NotincludedElementNames[this.chooseType]).includes(data.ElementName)">{{ data.description }}</th>
                        <td v-if="data.ElementName==='天氣現象'">
                            <img :src="image[index]" :title="filterTableStartTimeData(data,element.StartTime)">
                            <span>{{filterTableStartTimeData(data,element.StartTime)}}</span>
                        </td>                        
                        <td v-else>{{filterTableStartTimeData(data,element.StartTime)}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import {ref, toRefs, toRef, onMounted, watch,inject} from 'vue'
    export default {
        props:{
            data:Object,
            perType:String
        },
        setup(props) {

            // weather = 氣象資料
            // propsData = prop的資料
            // NotincludedElementNames = 不顯示於表格資料
            // ElementNamesOrders = 顯示表格順序
            // image = 一週天氣狀況圖示資料
            // chooseType = 選擇圖表的資料類型 ex. Week ; 3Hours
            // tableExpandStatus = 小畫面的每個table是否展開功能

            const weather = ref(null);
            const propsData = toRef(props, 'data').value;
            const NotincludedElementNames = {'Week':["最小舒適度指數","最大舒適度指數","天氣預報綜合描述"],'3Hours':["天氣預報綜合描述"]}
            const ElementNameOrders = {'Week':['天氣現象','平均溫度','最高溫度','最低溫度',"12小時降雨機率",'最高體感溫度','最低體感溫度','平均露點溫度','平均相對濕度','風速','風向','紫外線指數'],'3Hours':['天氣現象','溫度','體感溫度','露點溫度','3小時降雨機率','相對濕度','舒適度指數','風速','風向']}
            const image = ref([])
            const chooseType = ref('Week')
            const tableExpandStatus =ref({})
            const checkUpdateUnit = inject('unpdateUnit')

            //更新天氣狀況圖示資料
            const updateImages = async () => {
                image.value = []; // 清空圖片資料
                const wxData = weather.value.weather.WeatherElement.find(data => data.ElementName === '天氣現象');
                for (const time of wxData.Time) {
                    const imageUrl = await getIconName(time.ElementValue[0].Weather, time.StartTime);
                    image.value.push(imageUrl);
                }
            };
            
            //取得Icon名稱
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

                const response = await import('../../public/jsonFolder/weatherIcon_categories.json');
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
                    return '/image/icons/weather/default.svg'
                }
                
            }        
            
            watch(checkUpdateUnit,(newData,oldData)=>{
                weather.value  = []
                weather.value = propsData
            },{ deep: true})

            //監聽氣象與地區資料
            watch([() => propsData.location,()=>propsData.weather],(newData, oldData) => { 
                if(newData!==oldData){
                    weather.value = propsData
                    updateImages()
                    chooseType.value = props.perType

                }
            }, { deep: true, immediate: true  });


            return{
                weather,
                NotincludedElementNames,
                ElementNameOrders,
                image,
                chooseType,
                tableExpandStatus
            }
        },
        methods: {
            //過濾時間
            filterTime(time, type) {
                if (!time || time.length === 0) return '';
                const dateTime = new Date(time);
                switch (type) {
                    case 'date': {
                        const formatter = new Intl.DateTimeFormat('zh', {  month: '2-digit', day: '2-digit' });
                        return formatter.format(dateTime);
                    }
                    case 'day': {
                        const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
                        const weekDay = dateTime.getDay();
                        return `${dayNames[weekDay]}`;
                    }
                    case 'time': {
                        const formatter = new Intl.DateTimeFormat('zh', {  hour: '2-digit', minute: '2-digit', hour12: false });
                        const parts = formatter.formatToParts(dateTime);
                        const hour = parts.find(part => part.type === 'hour').value;
                        const minute = parts.find(part => part.type === 'minute').value;
                        return `${hour}:${minute}`;
                    }
                    default:
                        return '';
                }
            },
            //數值單位設置
            formatValueWithUnit(element,ElementName){
                
                if (element && element!=" ") {

                    let value = '';
                    
                    if(ElementName == '紫外線指數'){
                        value = Object.values(element)[1];
                        if(value == " "){
                            return '-'
                        }
                    }else{
                        value = Object.values(element)[0];
                    }

                    const storedUnitData = localStorage.getItem('unit');
                    let unitData = JSON.parse(storedUnitData);
                  
                    let measures;
                    switch(ElementName){
                        case "12小時降雨機率":
                        case '平均相對濕度':
                        case '3小時降雨機率':
                        case '相對濕度':
                            console.log()
                            if(Object.values(element)[0]!= '-')
                            {
                                measures = '%';
                            }
                            break
                        case '風速':
                            if(unitData.windSpeed === 'kmh'){
                                measures = 'km/h'
                                value = Math.round((Number(value) * 3.6)* 10)/10
                            }else{
                                measures = 'm/s'
                            }
                            
                            break
                        case '平均溫度':
                        case '最高溫度':
                        case '最低溫度':
                        case '最高體感溫度':
                        case '最低體感溫度':
                        case '平均露點溫度':
                        case '溫度':
                        case '體感溫度':
                        case '露點溫度':
                            if(unitData.temperature === 'fahrenheit'){
                                measures = '\u2109'
                                value = Math.round((Number(value) * 9 / 5 + 32))
                            }else{
                                measures = '\u2103'
                            }
                            break                            
                    }

                    return `${value}${measures ? measures : ''}`;
                }
                return '-';
            },        
            //處理時間對應的資料(手機板表格)
            filterTableStartTimeData(data,filterTime){
                let newData = data.Time.filter((item)=>{                    

                    const st_Time = new Date(item.StartTime ? item.StartTime : item.dataTime)
                    const fil_Time = new Date(filterTime)
                    return st_Time.getTime() === fil_Time.getTime()
                })
                if(newData.length>0){
                    return this.formatValueWithUnit(newData[0].ElementValue[0],data.ElementName)
                }                            
            },            
            toggleTableExpand(startTime) {
                this.tableExpandStatus[startTime] = !this.tableExpandStatus[startTime];
            },
        },
        computed: {
            //處理處理時間對應的資料(大表格)
            filteredWeatherElements() {
                return this.weather.weather.WeatherElement.filter(data =>
                    !Object.values(this.NotincludedElementNames[this.chooseType]).includes(data.ElementName)
                ).sort((a,b)=>{
                    return this.ElementNameOrders[this.chooseType].indexOf(a.ElementName)  - this.ElementNameOrders[this.chooseType].indexOf(b.ElementName) 
                });
            }
        }
    }
</script>


<style lang="scss" scoped>
    @import '@/assets/components/weatherTable.scss';
</style>