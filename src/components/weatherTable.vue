<template>
    <div class="weatherTable_style">
        <div class="div-table">
            <table id="weatherTable" class="week-predict-weather-table" v-if="weather">
                <thead>
                    <tr>
                        <th class="timeTitle">時間</th>
                        <th v-for="element in weather.weather.weatherElement[0].time" :key="element.startTime" class="weekTime">
                            {{ filterYear(element.startTime) }}
                        </th>
                    </tr>                    
                </thead>
                <tbody>
                    <tr v-for="data in filteredWeatherElements" :key="data.elementName">
                        <td class="weather-title">{{ data.description }}</td>
                        <td v-for="(time, index) in data.time" :key="index" :class="data.elementName" :colspan="data.elementName === 'UVI' ? 2 : 1"> 
                            <img v-if="data.elementName==='Wx'" :src="image[index]" :title="formatValueWithUnit(time.elementValue[0])">                            
                            <span v-else>{{ formatValueWithUnit(time.elementValue[0]) }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>  

        <div class="div-table-small">
            <table id="weatherTable-small" v-for="(element,index) in weather.weather.weatherElement[0].time" :key="element.startTime" class="week-predict-weather-table-small" v-if="weather">
                <thead>
                    <tr>
                        <th>{{ filterYear(element.startTime) }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in filteredWeatherElements" :key="data" class="weather-data-element">
                        <th v-if="!NotincludedElementNames.includes(data.elementName)">{{ data.description }}</th>
                        <td v-if="data.elementName==='Wx'">
                            <img :src="image[index]" :title="filterTableStartTimeData(data,element.startTime)">
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
            data:Object
        },
        setup(props) {

            // weather = 氣象資料
            // propsData = prop的資料
            // NotincludedElementNames = 不顯示於表格資料
            // ElementNamesOrders = 顯示表格順序
            // image = 一週天氣狀況圖示資料

            const weather = ref(null);
            const propsData = toRef(props, 'data').value;
            const NotincludedElementNames = ['T',"MinCI","MaxCI",'Td',"WeatherDescription"]
            const ElementNameOrders = ['Wx','MaxT','MinT','PoP12h','MaxAT','MinAT','RH','WS','WD','UVI']
            const image = ref([])

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
                }
            }, { deep: true, immediate: true  });


            return{
                weather,
                NotincludedElementNames,
                ElementNameOrders,
                image
            }
        },
        methods: {
            //過濾時間年份
            filterYear(time){               
                if (time && time.length > 0) {

                    const date_time = new Date(time);

                    // 取得月份和日期
                    const month = (date_time.getMonth() + 1).toString().padStart(2, '0'); // 月份從0开始，所以加1
                    const day = date_time.getDate().toString().padStart(2, '0');

                    // 取得時間
                    let split_time = time.split(' ')[1].split(":").slice(0, 2).join(":"); 


                    return month + '-' + day + '\n' + split_time;
                }
                return '';
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
            }
        },
        computed: {
            //處理處理時間對應的資料(大表格)
            filteredWeatherElements() {
                return this.weather.weather.weatherElement.filter(data =>
                    !this.NotincludedElementNames.includes(data.elementName)
                ).sort((a,b)=>{
                    return this.ElementNameOrders.indexOf(a.elementName)  - this.ElementNameOrders.indexOf(b.elementName) 
                });
            }
        }
    }
</script>


<style lang="scss" scoped>
    @import '@/assets/components/weatherTable.scss';
</style>