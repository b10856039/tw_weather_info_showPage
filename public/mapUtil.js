import * as d3 from "d3";
import { eventBus } from '../src/main';


//縣市地區顏色
const townColor = {
  '10017':'rgb(18, 218, 89)',  
  '63000':'rgb(109, 204, 0)',  
  '65000':'rgb(34, 169, 0)',
  '68000':'rgb(132, 189, 0)',  
  '10004':'rgb(136, 219, 98)',  
  '10005':'rgb(52, 219, 98)',
  '66000':'rgb(52, 219, 1)',
  '10007':'rgb(52, 177, 1)',
  '10008':'rgb(99, 209, 60)',
  '10009':'rgb(122, 209, 91)',
  '10010':'rgb(127, 235, 108)',
  '10020':'rgb(94, 187, 75)',
  '67000':'rgb(44, 202, 108)',
  '64000':'rgb(44, 202, 72)',  
  '10013':'rgb(44, 235, 72)',
  '10014':'rgb(92, 208, 50)',
  '10015':'rgb(92, 170, 50)',
  '10002':'rgb(92, 192, 75)',
  '10016':'rgb(53, 166, 75)',
  '10018':'rgb(53, 140, 75)',
  '09020':'rgb(107, 210, 75)',
  '09007':'rgb(107, 222, 75)'
}

//取得使用者網頁寬度
const MAP_WIDTH = window.innerWidth


// mapData = 地圖框線資料
// mapConfig = Canvas的資料
// zoomSize = 預設縮放比例
// selection = 選取區域
// townZoomthreshold = 區域縮放倍率閥值，處理縣市城鎮名稱切換
// defaultScale = 預設地圖比例
// citiesLabelsCoordinate = 所有縣市座標與資料
// zoom_setting = 縮放設定

class Map {
  constructor(mapData) {
    this.mapData = mapData;
    this.mapConfig = {
      center: [120, 24], // 預設中心座標
      width: 0,
      height: 0,
      scale: 0,
      translate: [0, 0]
    };
    this.zoomSize = 1.0;
    this.selection = undefined;
    this.townZoomthreshold = 4.0;
    this.defaultScale = 0;
    this.citiesLabelsCoordinate = undefined;
    this.zoom_setting = undefined;
  }

  //初始化地圖大小
  initMapSize() {
    const svg = document.getElementById('svgcanvas');
    if (svg) {
      svg.addEventListener('wheel', (event) => {
        event.preventDefault();
      });
    }

    const el = document.querySelector('.map-canvas')

    if(MAP_WIDTH>1800){
      this.defaultScale = 20000
    }else if(MAP_WIDTH>1200){
      this.defaultScale = 12000
    }else if(MAP_WIDTH>900){
      this.defaultScale = 8000
    }else{
      this.defaultScale = 4000
    }
    
    const rect = el.getBoundingClientRect();

    //計算地圖寬高比例
    const new_width = Math.round(rect.width)
    const new_height = Math.round(rect.height) 
    this.mapConfig.width = new_width
    this.mapConfig.height = new_height
    this.mapConfig.scale = (new_width / MAP_WIDTH)*this.defaultScale;
    this.mapConfig.translate = [new_width / 2, new_height / 2]
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  }

  //設置縮放功能
  setupZoom(show = undefined) {
    const svg = d3.select('#svgcanvas');
    this.zoom_setting = d3.zoom()
      .scaleExtent([1, 25])
      .translateExtent([[0, 0], [this.mapConfig.width, this.mapConfig.height]])
      .on('zoom', (event) => zoomed(event)); 
    
    svg.call(this.zoom_setting);
    
    //放大
    d3.select("#zoom_in").on("click", () => { 
      this.zoom_setting.scaleBy(svg.transition().duration(500), 1.5);
    });

    //縮小
    d3.select("#zoom_out").on("click", () => {
      this.zoom_setting.scaleBy(svg.transition().duration(500), 0.7);
    });  

    //重置
    d3.select('#zoom_reset').on("click", () => { 
      svg.transition().duration(500).call(this.zoom_setting.transform, d3.zoomIdentity);
    });
  
    const zoomed = (event) => { 
      this.zoomSize = event.transform.k;
      if (!show) {
        if (this.zoomSize > this.townZoomthreshold) {
          d3.selectAll('text.town-label').style('display', 'block');
          d3.selectAll('text.city-label').style('display', 'none');
        } else {
          d3.selectAll('text.town-label').style('display', 'none');
          d3.selectAll('text.city-label').style('display', 'block');
        }
      }
  
      d3.select('.country-container').attr('transform', event.transform);
    };
  }

  //繪製地圖
  draw(data,show) { 
    const svg = d3.select('#svgcanvas');
    const countiesGroup = d3.select('g.counties')
    svg.attr('width', this.mapConfig['width']).attr('height', this.mapConfig['height']);
    
    const path = this.createMapPath(this.mapConfig)
    this.removeMapPath() // 清空地圖內容

    const _type_json = show ? "COUNTY_MOI_1090820" : "TOWN_MOI_1120825";
    const geometry = topojson.feature(data, data.objects[_type_json]);

    return [countiesGroup,geometry,path]
  }

  //創建地圖區域邊界
  createMapPath() {
    const projection = d3.geoMercator()
      .center(this.mapConfig.center)
      .scale(this.mapConfig.scale)
      .translate(this.mapConfig.translate);

    return d3.geoPath(projection);
  }

  //移除地區邊界
  removeMapPath() {
    this.selection = undefined
    d3.select('g.counties').selectAll('path').remove();
    d3.select('g.counties').selectAll('text').remove();
  }

  //繪製地圖區域邊界
  drawMapPaths(group, geometry, path, show) {
    group.selectAll('path')
    .data(geometry.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', (d) => d.properties.TOWNCODE!=undefined ? `town${d.properties.TOWNCODE}` : `notown${d.properties.COUNTYCODE}`)
    .attr('class', (d) => {
      const classEl = '' + d.properties.COUNTYCODE;
      return show ? classEl + ' disabled' : classEl;
    })
    .attr('_id', (d) => d.properties.COUNTYCODE)
    .attr('_name', (d) => d.properties.COUNTYNAME)
    .attr('town_name', (d) => d.properties.TOWNNAME)
    .style('fill', (d) => {
      const townId =d.properties.TOWNCODE!=undefined ? `town${d.properties.TOWNCODE}` : `notown${d.properties.COUNTYCODE}`
      const selectionId = this.selection!=undefined ? this.selection.id : undefined

      if (selectionId === townId) {
        return 'rgb(238, 221, 23)';
      } else {
        return townColor[d.properties.COUNTYCODE];
      }
    })
    .style('stroke-width', show ? '0.3px' : '0.1px')
    .style('stroke', '#ffffff')
    .on('click',this.mapClickHandler)
    .on('mouseover',(e,d)=>{ 
      const target = e.target;
      const selectionId = this.selection!=undefined ? this.selection.id : undefined      
      if (target.id !== selectionId) {
        d3.select(target).style('fill', 'rgb(238, 221, 23)').style('cursor','pointer'); 
      }  
    })
    .on('mouseout',(e,d)=>{
      const target = e.target;
      const selectionId = this.selection!=undefined ? this.selection.id : undefined
      if (target.id !== selectionId ) {
        d3.select(target).style('fill', townColor[target.__data__.properties.COUNTYCODE]);
      }  
    })
  }

  //繪製縣市鄉鎮地區名稱
  mapLabelUtil(group, geometry, path, show) {
    // 添加鄉鎮名稱
    const townsLabelElement ='text'
    const townsFeatures = geometry.features
    const townsLabelText = 'TOWNNAME'
    const townsFontSize = '0.5px'
    const townClass = "town-label"
    const townShow = 'none'
    appendTextLabel(group,townsLabelElement,townsFeatures,townsLabelText,townsFontSize,townClass,townShow)
    if(show){
      this.citiesLabelsCoordinate = geometry.features.filter((d, i, arr) =>
        i === arr.findIndex(x => x.properties.COUNTYNAME === d.properties.COUNTYNAME
      ))
    }
    // 添加縣市名稱
    const citiesLabelElement ='text.country-label'
    const citiesFeatures = this.citiesLabelsCoordinate

    const citiesLabelText = 'COUNTYNAME'
    const citiesFontSize = '3px'
    const citiesClass = "city-label"
    const citiesShow = 'block'
    const citiesWeight = 'bold'
    appendTextLabel(group,citiesLabelElement,citiesFeatures,citiesLabelText,citiesFontSize,citiesClass,citiesShow,citiesWeight)

    //顯示於地圖
    function appendTextLabel(group,element,features,propertiesName,fontSize,elementClass,showText,showWeight){
      group.selectAll(element)
      .data(features)
      .enter()
      .append("text")
      .attr("x", (d) => path.centroid(d)[0]) 
      .attr("y", (d) => path.centroid(d)[1])
      .attr("text-anchor", "middle")
      .text((d) => d.properties[propertiesName])
      .attr("class",elementClass)
      .style('font-size',fontSize)
      .style('font-weight',showWeight)
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('display',showText)
    }
  }

  //上拋資料給weatherInfo與weatherWeekInfo
  uploadLocation(data) {
    eventBus.weatherData.value = data;
  }

  //處理點擊事件
  mapClickHandler = (e, d, outCall = false) => {
    const target = outCall ? e : e.target;
    const selectionId = this.selection != undefined ? this.selection.id : undefined;
    if (target.id !== selectionId) {
      if (this.selection) {
        d3.select(`#${selectionId}`).style('fill', townColor[this.selection.__data__.properties.COUNTYCODE]);
      }
      d3.select(target).style('fill', 'rgb(238, 221, 23)');
      this.selection = target;
    }
    let data;
    if (!outCall) {
      let el = e.srcElement;
      data = {'cityName': el.getAttribute('_name'), 'townName': el.getAttribute('town_name')};
    } else {
      data = {'cityName': target.getAttribute('_name'), 'townName': target.getAttribute('town_name')};
    } 

    //變更Map.vue的city跟town
    const clickEvent = new CustomEvent('mapClickFinished', { detail: data });
    document.dispatchEvent(clickEvent);
  
    this.uploadLocation(data);
  }

  //取得地區節點
  getLocationNode(_name, town_name) {
    const mapContainer = d3.select('g.counties');

    const path = town_name ? `path[_name="${_name}"][town_name="${town_name}"]` : `path[_name="${_name}"]`
  
    const selectedPath = mapContainer.select(path);
  
    const selectedPathNode = selectedPath.node();
    if(selectedPathNode){
      return selectedPathNode
    }else{
      return
    }
  }

  //搜尋地區
  async search(show, city, town) {
    const svg = d3.select('#svgcanvas');
    // 選擇符合搜尋文字的地區
    var selectedRegion =await svg.selectAll("path").filter(function(d) {    
      if(town!==''){
        return d && d.properties && d.properties.COUNTYNAME === city && d.properties.TOWNNAME === town;
      }else{   
        return d && d.properties && d.properties.COUNTYNAME === city
      }
    });
    // 取得符合條件的地區範圍
    const bounds =await this.getPathBounds(selectedRegion);
  
    // 將地圖縮放和平移至指定範圍
    this.zoomToRegion(bounds,show);
  
    const target =await this.getLocationNode(city,town)
    if(target){
      this.mapClickHandler(target,undefined,true)
    }
  }

  //取得地區邊界
  getPathBounds(selection) {
    const path = this.createMapPath(this.mapConfig);
    let bounds = path.bounds(selection.datum());
    return bounds;
  }

  //放大至指定地區
  zoomToRegion(bounds, show) {
    const svg = d3.select('#svgcanvas');
    let scale_size = 8
    if(!show){
      scale_size = 15
    }
  
    // 計算縮放比例和平移值
    const scale = Math.min(scale_size, 0.9 / Math.max((bounds[1][0] - bounds[0][0]) / this.mapConfig.width, (bounds[1][1] - bounds[0][1]) / this.mapConfig.height));
    const centroid = [(bounds[1][0] + bounds[0][0]) / 2, (bounds[1][1] + bounds[0][1]) / 2];
    const translate = [this.mapConfig.width / 2 - scale * centroid[0], this.mapConfig.height / 2 - scale * centroid[1]];
  
    // 使用 d3.zoomIdentity 和 d3.zoomTo 將地圖縮放和平移至指定範圍
    svg.transition().duration(500).call(this.zoom_setting.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  }
}

export default Map;

