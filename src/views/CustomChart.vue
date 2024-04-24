<template>

    <div class="container">
      <div class="search_container">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        <input v-model="search" placeholder="搜尋">
        <Tooltip :toolTipText="'搜尋方式:\n縣市鄉鎮,縣市 鄉鎮,縣市,鄉鎮'" :position="'bottom'">
            <button class="circleQuestionIcon">?</button>
        </Tooltip>
      </div>
      <TransitionGroup 
        tag="div" 
        class="region_container" 
        ref="region_container" 
        v-if="displayedData.length>0" 
        @before-enter="beforeEnter" 
        @enter="enter" 
        appear
      > 
        <div  v-for="(item, index) in displayedData" :key="item.cityName + item.townName" :data-index="index" class="weather_block"  >
            <div class="select_block">
                <button @click="toggleBlockContent(index,'current')">目前天氣</button>
                <button @click="toggleBlockContent(index,'week')">一周天氣</button>
            </div>
            <div class="current_block"  :id="'current_block_'+index">
                <MapWeatherInfo  :data="item" @fav-toggle-parent="ToogleFavEvent"/>
            </div>
            <div class="week_block" :id="'week_block_'+index" style="display: none;">
                <MapWeatherWeekInfo :data="item"/>

            </div>
        </div>        
      </TransitionGroup>
      <div class="no-data" v-else>無資料</div>
    </div>
    <pagination v-if="region.length > 0" :data="region" @update-displayedData="updateDisplayedData" />
</template>

<script>

    import {ref, toRefs, toRef, onMounted, watch,reactive,computed } from 'vue'
    import pagination from '../components/pagination.vue';
    import Tooltip from '../components/toolTip.vue'
    
    import MapWeatherInfo from '../components/MapWeatherInfo.vue';
    import MapWeatherWeekInfo from '../components/MapWeatherWeekInfo.vue';
    import { beforeEnter, enter } from '../../public/animation.js';

    export default{
        components:{
            pagination,
            Tooltip,
            MapWeatherInfo,
            MapWeatherWeekInfo
        },
        setup(){

            // region = 使用者儲存地區
            // search = 搜索欄
            // displayedData = 一頁顯示的資料

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

                    return region.value
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                }
            };

            //toggle地區至個人圖表
            const ToogleFavEvent = (location) => {
                                
                region.value = region.value.filter((item) => {
                    if (location.reqestType) {
                        return !(item.cityName === location.city);
                    } else {
                        return !(item.cityName === location.city && item.townName === location.town);
                    }
                });
                
                if(region.value.length<=0){
                    region.value = []
                    displayedData.value = [];
                }
            };


            const updateDisplayedData = (data)=>{
                displayedData.value = data
            }

            watch(search,async (newSearch, oldSearch) => {

                newSearch = newSearch.trim().replace(/\s+/g, '');
                // 檢查字串的第一个字元是否為"台"，如果是替換為"臺"
                if (newSearch && newSearch.charAt(0) === '台') {
                    newSearch = '臺' + newSearch.slice(1);
                }

                // 正則表達式，考虑 "臺" 和 "台" 的相同性
                const searchRegex = new RegExp(newSearch ? newSearch.replace(/臺/g, '[臺台]') : '', 'i');

                let getRegionData = await get_WeatherData()
                region.value = getRegionData.filter(item => {
                    const locationString = item.cityName + item.townName;
                    return searchRegex.test(locationString);
                });

                if(region.value.length <=0){
                    displayedData.value = []
                }
            });


            onMounted(() => {
                get_WeatherData();  
            });

            return{
                region,
                search,
                displayedData,
                updateDisplayedData,
                ToogleFavEvent
            }
        },
        methods:{
            beforeEnter,
            enter,
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