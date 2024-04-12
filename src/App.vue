<template>
  <header>
    <div class="wrapper">
      <nav class = 'nav-title'>
        <div>
          <RouterLink to="/">臺灣氣象查詢</RouterLink>
        </div>
        <div>
          <a href="javascript:void(0)" @click="toggleNavigation" class="Nav-bar"><font-awesome-icon :icon="['fas',showNavigationBar ? 'x' : 'bars']" /></a>
        </div>
      </nav>
      <nav class ='nav-router' :class="{'nav-router-active':showNavigationBar}">   
        <ul>
          <li>
            <RouterLink  to="/" class="hover-el">天氣地圖</RouterLink>
          </li>
          <li>
            <RouterLink  to="/customChart" class="hover-el">個人氣象</RouterLink>
          </li>
          <li>
            <div class="website-setting hover-el" @click="toggleUnitWrap()"><font-awesome-icon :icon="['fas', 'gear']" />網站設定</div>
            <ul class="UnitWrap-small" v-if="windowWidth < 768" :class="{'wrap-enter-small-active':showUnitWrap}">
              <li v-for="setting in settings" :key="setting.key">
                <span>{{ setting.label }}</span>
                <a href="javascript:void(0)" @click="toggleSetting(setting)">
                  <div class="switch-unit-ui">
                    <input type="checkbox" :class="'Unitcheckbox-' + setting.key" :checked="unitData[setting.key] === Object.keys(setting.options)[1]"/>
                    <label>
                      <span class="btn-box">
                        <span class="btn"></span>      
                      </span>
                    </label>
                    <span class="unit-type-text" :class="{'unit-type-text-active': unitData[setting.key] === Object.keys(setting.options)[1]}">
                      {{ setting.options[unitData[setting.key]] }}
                    </span>
                  </div>              
                </a>
              </li>
            </ul>
          </li>
        </ul>            
      </nav>
    </div>
  </header>
  <div class="viewer">
    <div class="UnitWrap" :class="{ 'wrap-enter-active': showUnitWrap }" v-if="windowWidth >= 768">
      <div class="checkUnit_block" v-for="setting in settings" :key="setting.key">
        <span>{{ setting.label }}</span>
        <a href="javascript:void(0)" @click="toggleSetting(setting)">
          <div class="switch-unit-ui">
            <input type="checkbox" :class="'Unitcheckbox-' + setting.key" :checked="unitData[setting.key] === Object.keys(setting.options)[1]"/>
            <label>
              <span class="btn-box">
                <span class="btn"></span>      
              </span>
            </label>
            <span class="unit-type-text" :class="{'unit-type-text-active': unitData[setting.key] === Object.keys(setting.options)[1]}">
              {{ setting.options[unitData[setting.key]] }}
            </span>
          </div>              
        </a>
      </div>
    </div>
    <div class="Router-view-container">
      <RouterView />
    </div>    
  </div>
  <footer>
    <div class="footer">
      <div>
        臺灣氣象查詢
      </div>
      <div>
        Side Project
      </div>
      <div>
        Made by 林昌聖 <a href="https://github.com/b10856039"  target="_blank" class="href_github"><font-awesome-icon :icon="['fab', 'github']" /></a>
      </div>
    </div>
  </footer>
</template>


<script>
  import { RouterLink, RouterView, useRoute } from 'vue-router'
  import { ref,onMounted,provide } from 'vue';  
  export default {

    setup() {
      const unitData = ref({'windSpeed':'ms','temperature':'celsius'});
      const showUnitWrap = ref(false)
      const showNavigationBar = ref(false)
      const windowWidth = ref(window.innerWidth);
      provide('unpdateUnit',unitData)

      const settings = ref([
        {
          key: 'temperature',
          label: '溫度顯示',
          options: {
            celsius: '\u2103',
            fahrenheit: '\u2109'
          }
        },
        {
          key: 'windSpeed',
          label: '風力顯示',
          options: {
            ms: 'm/s',
            kmh: 'km/h'
          }
        }
      ]);



      const handleUnitData =(event)=>{
        if(event === undefined){
          return
        }

        if(event.target.classList.contains('Unitcheckbox-1')) {          
          unitData.value.temperature = unitData.value.temperature === 'celsius' ? 'fahrenheit' : 'celsius';
        }

        if(event.target.classList.contains('Unitcheckbox-2')) {
         
          unitData.value.windSpeed = unitData.value.windSpeed === 'ms' ? 'kmh' : 'ms';
        }

        localStorage.setItem('unit', JSON.stringify(unitData.value));      

      }

      const toggleSetting = (setting) => {
        const current = unitData.value[setting.key];
        const options = Object.keys(setting.options);
        const nextIndex = (options.indexOf(current) + 1) % options.length;
        unitData.value[setting.key] = options[nextIndex];
        localStorage.setItem('unit', JSON.stringify(unitData.value));
      };

      const getUnitData = ()=>{
        const res_unit =localStorage.getItem('unit');
        if(res_unit) {
          unitData.value = JSON.parse(res_unit);
        } else {
          // 如果 localStorage 中没有单位设置，则使用默认值，并保存
          localStorage.setItem('unit', JSON.stringify(unitData.value));
        }
      }

      onMounted(() => {
        getUnitData()

        window.addEventListener("resize", function () {
            windowWidth.value = window.innerWidth;
        });
      })

      return{
        unitData,
        showUnitWrap,
        handleUnitData,
        settings,
        toggleSetting,
        windowWidth,
        showNavigationBar
      }
    },
    methods:{
      toggleUnitWrap(){
        this.showUnitWrap = !this.showUnitWrap;
      },
      toggleNavigation(){
        this.showNavigationBar =!this.showNavigationBar;
      }
    }
  }

</script>


<style lang="scss" scoped>
  @import '@/assets/app.scss';
</style>

