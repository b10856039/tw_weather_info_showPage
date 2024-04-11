<template>
    <div class="toolTip-container" @mouseover="toggleToolTip" @mouseout="toggleToolTip" @click.stop="toggleToolTip" @touchstart="toggleToolTip"  @touchend="toggleToolTip">
        <slot></slot>
        <div v-if="isToolTipVisible" :style="tooltipStyle.style" class="toolTip">
            <div :style="tooltipStyle.arrowStyle" class="arrow"></div>
            <span class="tooltip-text">{{ toolTipText }}</span>
        </div>
    </div>
</template>
  
<script>
  import { ref, computed } from 'vue';
  
  export default {
    props: {
      toolTipText: {
        type: String,
        default: 'Default tooltip'
      },
      position: {
        type: String,
        default: 'bottom'
      }
    },
    setup(props) {

      // isToolTipVisible = 是否顯示toolTip
      const isToolTipVisible = ref(false);  

      //toggle處理toolTip
      const toggleToolTip = () => {
        isToolTipVisible.value = !isToolTipVisible.value;
      };  

      //設置toolTip的style
      const tooltipStyle = computed(() => {
        let style = {};
        let arrowStyle = {};

        switch (props.position) {
          case 'top':
            style = { bottom: 'calc(100% + 5px)', left: '50%', transform: 'translateX(-50%)' };
            arrowStyle = { top: '100%', left: '50%', 'margin-left': '-5px', 'border-color': 'black transparent transparent transparent' };
            break;
          case 'right':
            style = { top: '50%', left: 'calc(100% + 5px)', transform: 'translateY(-50%)' };
            arrowStyle = { top: '50%', right: '100%', 'margin-top': '-5px', 'border-color': 'transparent black transparent transparent' };
            break;
          case 'bottom':
            style = { top: 'calc(100% + 5px)', left: '50%', transform: 'translateX(-50%)' };
            arrowStyle = { bottom: '100%', left: '50%', 'margin-left': '-5px', 'border-color': 'transparent transparent black transparent' };
            break;
          case 'left':
            style = { top: '50%', right: 'calc(100% + 5px)', transform: 'translateY(-50%)' };
            arrowStyle = { top: '50%', left: '100%', 'margin-top': '-5px', 'border-color': 'transparent transparent transparent black' };
            break;
        }

        return { style, arrowStyle, maxWidth: style.maxWidth };
      });
  
      return {
        isToolTipVisible,
        toggleToolTip,
        tooltipStyle
      };
    }
  };
  </script>
  
<style lang="scss" scoped>
  @import '@/assets/components/tooltip.scss';
</style>