<template>
    <div class="weatherTable_style">
        <div class="div-table">
            <table id="weatherTable" class="week-predict-weather-table" v-if="weather">
                <thead>
                    <tr>
                        <th class="dateTitle">日期</th>
                        <th v-for="element in weather.weather.weatherElement[1].time" :key="element.startTime" class="weekDate">
                            <span>{{ filterTime(element.startTime,'date') }}</span>
                            <br>
                            <span>{{ `星期${filterTime(element.startTime,'day')}` }}</span>
                        </th>
                    </tr>
                    <tr>
                        <th class="timeTitle">時間</th>
                        <th v-for="element in weather.weather.weatherElement[1].time" :key="element.startTime" class="weekTime">
                            {{ filterTime(element.startTime,'time') }}
                        </th>
                    </tr>                    
                </thead>
                <tbody>
                    <tr v-for="data in filteredWeatherElements" :key="data.elementName">
                        <td class="weather-title">{{ data.description }}</td>
                        <td v-for="(time, index) in data.time" :key="index" :class="data.elementName"> 
                            <img v-if="data.elementName==='Wx'" :src="image[index]" :title="formatValueWithUnit(time.elementValue[0])">                            
                            <span v-else>{{ formatValueWithUnit(time.elementValue[0]) }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>  

        <div class="div-table-small">
            <table id="weatherTable-small" v-for="(element,index) in weather.weather.weatherElement[1].time" :key="element.startTime" class="week-predict-weather-table-small" v-if="weather">
                <thead @click="toggleTableExpand(element.startTime)">
                    <tr>
                        <th>{{ `${filterTime(element.startTime,'date')}(${filterTime(element.startTime,'day')})${filterTime(element.startTime,'time')}`}}</th>
                        <th><font-awesome-icon :icon="['fas', tableExpandStatus[element.startTime] ? 'angle-down' : 'angle-left']" /></th>
                    </tr>
                </thead>
                <tbody v-show="tableExpandStatus[element.startTime]">
                    <tr v-for="data in filteredWeatherElements" :key="data" class="weather-data-element">
                        <th v-if="!Object.values(this.NotincludedElementNames[this.chooseType]).includes(data.elementName)">{{ data.description }}</th>
                        <td v-if="data.elementName==='Wx'">
                            <img :src="image[index]" :title="filterTableStartTimeData(data,element.startTime)">
                            <span>{{filterTableStartTimeData(data,element.startTime)}}</span>
                        </td>
                        <td v-else>{{filterTableStartTimeData(data,element.startTime)}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import {ref, toRefs, toRef, onMounted, watch,reactive,watchEffect} from 'vue'
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
            const NotincludedElementNames = {'Week':["MinCI","MaxCI","WeatherDescription"],'3Hours':['PoP12h',"WeatherDescription"]}
            const ElementNameOrders = {'Week':['Wx','T','MaxT','MinT','PoP12h','MaxAT','MinAT','Td','RH','WS','WD','UVI'],'3Hours':['WX','T','AT','Td','PoP6h','RH','CI','WS','WD']}
            const image = ref([])
            const chooseType = ref('Week')
            const tableExpandStatus =ref({})

            //更新天氣狀況圖示資料
            const updateImages = async () => {
                image.value = []; // 清空圖片資料
                
                const wxData = weather.value.weather.weatherElement.find(data => data.elementName === 'Wx');
                
                for (const time of wxData.time) {
                    const imageUrl = await getIconName(time.elementValue[0].value, time.startTime);
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

            //監聽氣象與地區資料
            watch([() => propsData.location,()=>propsData.weather],(newData, oldData) => { 
                if(newData!==oldData){
                    weather.value = propsData
                    updateImages()
                    chooseType.value = props.perType
                    console.log(weather.value)
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
            formatValueWithUnit(element){
                if (element && element.value!=" ") {
                    const value = element.value || '';
                    let measures;
                    switch(element.measures){
                        case '百分比':
                            measures = '%'
                            break
                        case '公尺/秒':
                            measures = 'm/s'
                            break
                        case '攝氏度' :
                            measures = '°C'
                            break                            
                    }
                    return `${value}${measures ? measures : ''}`;
                }
                return '-';
            },        
            //處理時間對應的資料(手機板表格)
            filterTableStartTimeData(data,filterTime){
                let newData = data.time.filter((item)=>{return item.startTime === filterTime})
                if(newData.length>0){
                    return this.formatValueWithUnit(newData[0].elementValue[0])
                }                            
            },            
            toggleTableExpand(startTime) {
                this.tableExpandStatus[startTime] = !this.tableExpandStatus[startTime];
            },
        },
        computed: {
            //處理處理時間對應的資料(大表格)
            filteredWeatherElements() {
                return this.weather.weather.weatherElement.filter(data =>
                    !Object.values(this.NotincludedElementNames[this.chooseType]).includes(data.elementName)
                ).sort((a,b)=>{
                    return this.ElementNameOrders[this.chooseType].indexOf(a.elementName)  - this.ElementNameOrders[this.chooseType].indexOf(b.elementName) 
                });
            }
        }
    }
</script>


<style lang="scss" scoped>
    @import '@/assets/components/weatherTable.scss';
</style>