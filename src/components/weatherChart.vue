<template>
    <div class="weatherChart_style">     
        <div class="div-chart">
            <div class="chart-body">
                <canvas  ref="dataChart"></canvas>
            </div>            
        </div>
        
        <div class="div-selector">
            <button v-for="(chart, index) in chartTypes" :key="index" :class="{ 'chart-type-class': selectChart === chart.type }" @click="selectTypeHandler(chart.type)">
                <span>{{ chart.label }}</span>
                <font-awesome-icon class="squarePlus_icon" :icon="['fas', 'square-plus']" />
            </button>
        </div>
    </div>

</template>

<script>
import { ref, onMounted,watch,inject } from 'vue';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';


export default {
    props: {
        data: Object,
    },
    setup(props,{emit}) {  

        // dataChart = Canvas元素
        // chartData = 圖表資料
        // selectChart = 選取的圖表類型
        // windowWidth = 網頁寬度

        const dataChart = ref(null);
        const chartData = ref(null);
        const selectChart = ref('Week_temp')
        const windowWidth = ref(window.innerWidth);
        const checkUpdateUnit = inject('unpdateUnit')

        const chartTypes = [
            // { type: '3Hours_Temp', label: '逐三小時\n預報'},
            { type: 'Week_temp', label: '一週溫度\n曲線' },
            { type: 'Week_feelTemp', label: '一週體感溫度\n曲線' },            
        ];

        // chartInstance = 圖表物件
        let chartInstance = null;

        const initChart = (chartData) => {
            
            Chart.register(ChartDataLabels);
            if (dataChart.value) {
                chartInstance= new Chart(dataChart.value.getContext('2d'), chartData);
            }
        };


        //過濾早晚時間(用於溫度與體感溫度)
        const filterTimeData = (data,type)=>{
            let processData = []
            data.forEach(item => {
                // 提取 startTime                        
                const startTime = new Date(item.StartTime);
                const startHour = startTime.getHours();
                if(type === 'High'){
                    if (startHour >= 6 && startHour<18) {
                        processData.push(Object.values(item.ElementValue[0])[0]);
                    } else {
                        processData.push(null);
                    }
                }else{
                    if (startHour >= 18 || startHour<6) {
                        processData.push(Object.values(item.ElementValue[0])[0]);
                    } else {
                        processData.push(null);
                    }
                }                        
            });            
            return processData
        }

        //處理時間Label
        let processedDates = {};
        const formatTimeString = (timeString, index) => {
            const dateTime = new Date(timeString);
            
            if (selectChart.value === '3Hours_Temp') {
                const date = `${(dateTime.getMonth() + 1).toString().padStart(2, '0')}/${dateTime.getDate().toString().padStart(2, '0')}`;
                const time = `${dateTime.getHours().toString()}`;

                // 如果該日期已經處理過，則返回time
                if (processedDates[date]) {
                    return [time];
                } else {
                    processedDates[date] = true;
                    return ['',date];
                }
            } else {
                const date = (dateTime.getHours() >= 6 && dateTime.getHours() < 18) ? `${(dateTime.getMonth() + 1).toString().padStart(2, '0')}/${dateTime.getDate().toString().padStart(2, '0')}` : '';
                const period = (dateTime.getHours() >= 6 && dateTime.getHours() < 18) ? '早上' : '晚上';
                return [period, date];
            }
        };


        //處理圖表
        const handleChartData = (data, type) => {
            let timeLabels, HighValues, LowValues, dataSets, countyName;
            let newYmax = 0, newYmin = 0;

            //處理Data Value
            const processData = (HighData, LowData,filter) => {    

                if(selectChart.value === '3Hours_Temp'){
                    processedDates = {}
                    timeLabels = HighData.map(item => item.DataTime).map(formatTimeString); 
                }else{
                    timeLabels = HighData.map(item => item.StartTime).map(formatTimeString); 
                }
                                   

                if(filter){
                    HighValues = filterTimeData(HighData,'High');
                    LowValues = filterTimeData(LowData,'Low');
                }else{
                    HighValues = HighData.map(item => Object.values(item.ElementValue[0])[0]),'High';
                    LowValues = LowData.map(item => Object.values(item.ElementValue[0])[0]),'Low';
                }

                HighValues = HighValues.map((item)=>{
                    if(yAxisTitle === '\u2109' && item!=null){
                        item = (Math.round(Number(item) * 9 / 5 + 32)).toString()
                    }
                    return item
                })

                LowValues = LowValues.map((item)=>{
                    if(yAxisTitle === '\u2109' && item!=null){
                        item = (Math.round(Number(item) * 9 / 5 + 32)).toString()
                    }
                    return item
                })
            };

            //設置DataSet(用於溫度與體感溫度)
            const setDatasets = (label1, label2, borderColor1, borderColor2) => {
                return [{
                    label: label1,
                    borderColor: borderColor1,
                    data: HighValues,
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 5,
                    spanGaps:true
                },
                {
                    label: label2,
                    borderColor: borderColor2,
                    data: LowValues,
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 5,
                    spanGaps:true
                }];
            };

            let yAxisTitle = '\u2103';


            const storedUnitData = localStorage.getItem('unit');
            let unitData = JSON.parse(storedUnitData);

            if(unitData.temperature === 'fahrenheit'){
                yAxisTitle = '\u2109'
            }

            if (type === 'Week_temp') {
                const HighData = data.weather.WeatherElement.find(item => item.ElementName === "最高溫度").Time;
                const LowData = data.weather.WeatherElement.find(item => item.ElementName === "最低溫度").Time;
                processData(HighData, LowData,true);
                dataSets = setDatasets('高溫', '低溫', 'rgb(246, 180, 4)', 'rgb(18, 180, 220)');

                let fitlerNullHighValues = HighValues.filter(value => value !== null)
                let fitlerNullLowValues = LowValues.filter(value => value !== null)
                newYmax = Math.max(...fitlerNullHighValues)+(5-(Math.max(...fitlerNullHighValues)%5))
                newYmin = Math.min(...fitlerNullLowValues)-(Math.min(...fitlerNullLowValues)%5)-5 >=0 ? Math.min(...fitlerNullLowValues)-(Math.min(...fitlerNullLowValues)%5)-5 : 0

                yAxisTitle = `溫度(${yAxisTitle})`

            } else if (type === 'Week_feelTemp') {
                const HighData = data.weather.WeatherElement.find(item => item.ElementName === "最高體感溫度").Time;
                const LowData = data.weather.WeatherElement.find(item => item.ElementName === "最低體感溫度").Time;
                processData(HighData, LowData,true);
                dataSets = setDatasets('體感高溫', '體感低溫', 'rgb(246, 180, 4)', 'rgb(18, 180, 220)');

                let fitlerNullHighValues = HighValues.filter(value => value !== null)
                let fitlerNullLowValues = LowValues.filter(value => value !== null)

                newYmax = Math.max(...fitlerNullHighValues)+(5-(Math.max(...fitlerNullHighValues)%5))
                newYmin = Math.min(...fitlerNullLowValues)-(Math.min(...fitlerNullLowValues)%5)-5 >=0 ? Math.min(...fitlerNullLowValues)-(Math.min(...fitlerNullLowValues)%5)-5 : 0
                yAxisTitle = `體感溫度(${yAxisTitle})`
            } else if (type === '3Hours_Temp') {
                console.log(data.weather.WeatherElement)
                const HighData = data.weather.WeatherElement.find(item => item.ElementName === '溫度').Time;
                const LowData = data.weather.WeatherElement.find(item => item.ElementName === '體感溫度').Time;
                processData(HighData,LowData,false); // LowData not used for humidity
                dataSets = setDatasets('溫度', '體感溫度', 'rgb(205, 205, 205)', 'rgb(246, 180, 4)');
                newYmax = Math.max(...HighValues)+(10-(Math.max(...HighValues)%5))
                newYmin = Math.min(...LowValues)-(Math.min(...LowValues)%5)-5 >=0 ? Math.min(...LowValues)-(Math.min(...LowValues)%5)-5 : 0
                yAxisTitle = `溫度(${yAxisTitle})`
            }

            countyName = `${data.location.city}${data.location.town ? data.location.town : ''}`;
            
            //圖表config檔
            const chartConfig = {
                type: 'line',
                data: {
                    labels: timeLabels,
                    datasets: dataSets,
                },
                options: {
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        datalabels: {
                            anchor: 'end',
                            align: 'end',
                            color: 'black',
                            font: {
                                weight: 'bold',
                            },
                            formatter: (value, context) => {
                                return value;
                            },
                        },
                        title: {
                            display: true,
                            text: countyName,
                            font: {
                                size: 16,
                                weight: 'bold',
                            },
                        },
                        legend:{
                            labels:{
                                usePointStyle:true,
                                pointStyle:'rectRounded',
                                font:{
                                    size:14,
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            position: 'left',
                            max: newYmax,
                            min: newYmin,
                            display:true,
                            title: {
                                display: true,
                                text:yAxisTitle ,                                    
                            }
                        }
                    },
                },
            };

            return chartConfig;
        };

        const selectTypeHandler = (type)=>{
            selectChart.value = type
            emit('update-weatherData',selectChart.value)
        }

        //更新圖表
        const updateChart = () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
            if (dataChart.value) {
                initChart(chartData.value);
            }
        };

        //監聽圖表資料
        watch([()=>props.data.weather,()=>checkUpdateUnit], (newData, oldData) => {
            if (newData !== oldData) {
                chartData.value = handleChartData(props.data,selectChart.value)
                updateChart();
            }

        },{ deep: true});

        const responsiveChartSize = ()=>{
            const chartBody = document.querySelector('.chart-body')             
            if(chartBody==null){
                return
            }
            chartBody.style.width = windowWidth.value<768 ? '800px' : 'auto'
        }

        //初始化圖表
        onMounted(() => {
            if (dataChart.value) {
                chartData.value = handleChartData(props.data,selectChart.value)
                initChart(chartData.value);
                responsiveChartSize()
                window.addEventListener("resize", function () {
                    windowWidth.value = window.innerWidth;
                    responsiveChartSize()
                });
            }
        });

        return {
            dataChart,
            chartInstance,
            chartTypes,
            selectTypeHandler,
            selectChart,
            chartInstance
        };
    }
};

</script>


<style lang="scss" scoped>
    @import '@/assets/components/weatherChart.scss';
</style>