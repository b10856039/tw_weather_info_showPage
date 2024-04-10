<script setup>
  import { RouterLink, RouterView, useRoute } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav class = 'nav-title'>
        <RouterLink to="/">臺灣氣象查詢</RouterLink>
      </nav>
      <nav class = 'nav-router'>        
        <RouterLink  to="/">天氣<br class="visible-br"/>地圖</RouterLink>
        <RouterLink to="/customChart">個人<br class="visible-br"/>氣象</RouterLink>             
      </nav>
    </div>
  </header>
  <div class="viewer">
    <RouterView />
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

<style lang="scss" scoped>
  @import '@/assets/app.scss';
</style>



