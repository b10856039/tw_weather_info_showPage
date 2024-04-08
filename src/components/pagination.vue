<template>
    <div v-if="totalPage > 1" class="page-container">
        <button @click="setCurrentPage(currentPage - 1)" :disabled="currentPage === 1">前一頁</button>
        <button @click="setCurrentPage(1)" :class="{'ishover':currentPage === 1 }">1</button>
        <small v-if="(currentPage-1)>=4">...</small>
        <button v-for="page in visablePages" :key="page" @click="setCurrentPage(page)" :class="{'ishover':page === currentPage}">{{ page }}</button>
        <small v-if="(totalPage-currentPage)>=4">...</small>
        <button @click="setCurrentPage(totalPage)" :class="{'ishover':totalPage === currentPage}">{{ totalPage }}</button>
        <button @click="setCurrentPage(currentPage + 1)" :disabled="currentPage === totalPage">後一頁</button>
    </div>
</template>

<script>
    import { ref, watch, onMounted,computed } from 'vue';

    export default {
        props: {
            data: Array
        },
        emits: ['update-displayedData'],
        setup(props, { emit }) {

            // displayedData = 每頁能夠顯示的資料
            // currentPage = 目前頁數
            // pageSize = 一頁最多資料數量
            // totalPage = 總頁數

            const displayedData = ref([]);
            const currentPage = ref(1);
            const pageSize = ref(4);
            const totalPage = ref(0);

            //上拋至父組件
            const updateDisplayedData = () => {
                const startIdx = (currentPage.value - 1) * pageSize.value;
                const endIdx = startIdx + pageSize.value;
                displayedData.value = props.data.slice(startIdx, endIdx);
                emit('update-displayedData', displayedData.value);
            };

            //設置目前頁數
            const setCurrentPage = (page) => {
                currentPage.value = page;
                updateDisplayedData();
            };

            //設置總頁數
            const setTotalPage = () => {
                totalPage.value = Math.ceil(props.data.length / pageSize.value);
                // 如果当前页超出总页数，则将当前页设置为最后一页
                if (currentPage.value > totalPage.value) {
                    currentPage.value = totalPage.value;
                }
            };

            //設置頁碼顯示
            const visablePages = computed(()=>{
                const innerPageCount = 5;
                const startPage = Math.max(2, Math.min(currentPage.value - Math.floor(innerPageCount / 2), totalPage.value - innerPageCount + 2));
                const endPage = Math.min(totalPage.value - 1, startPage + innerPageCount - 1);
                
                let pages = [];
                for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                }
                return pages;
            })

            

            //監聽weather資料
            watch(() => props.data.length, () => {                
                setTotalPage();
                updateDisplayedData();
            });

            //初始化頁數
            onMounted(() => {
                setTotalPage();
                updateDisplayedData();
            });

            return {
                displayedData,
                totalPage,
                currentPage,
                setCurrentPage,
                visablePages
            };
        }
    };
</script>


<style lang="scss" scoped>
    @import '@/assets/components/pagination.scss';
</style>