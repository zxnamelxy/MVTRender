<template>
  <div class="map_box">
    <div class="header">
      <span class="text">多源数据融合中心</span>
    </div>
    <div
      class="content"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div class="title"><i class="iconfont icon-odbc"></i> 多源数据中心</div>
      <el-tree
        check-strictly
        default-expand-all
        ref="tree"
        :data="treeData"
        show-checkbox
        node-key="id"
        @check-change="checkChange"
        @node-click="nodeClick"
        :default-checked-keys="Array.from({ length: 100 }, (_, index) => index + 1)"
      >
        <!-- :default-checked-keys="Array.from({ length: 100 }, (_, index) => index + 1)" -->
        <span class="custom-tree-node" slot-scope="{ data }">
          <span
            :title="data.name"
            :class="{
              'node-text': true,
              fontBold: data.type == 0,
            }"
          >
            <!-- :class="{
                'iconfont icon-wenjianjia': data.type === 'folder',
                'iconfont icon-layer': data.type !== 'folder',
              }" -->
            <i class="iconfont icon-layer" style="margin-right: 5px"></i>

            {{ data.name | ellipsis }}
          </span>
          <!-- <i
                  @click="centerTolayer(data)"
                  class="zoomTo"
                  title="缩放"
                  v-if="
                    data.type !== 'folder' &&
                    data.layerType !== 'TILE_TERRAIN' &&
                    isLoaded(data.id)
                  "
                ></i> -->
        </span>
      </el-tree>
    </div>
    <div class="home" id="map"></div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import "mapbox-gl/dist/mapbox-gl.css";
// mapboxgl.accessToken =
//   "pk.eyJ1IjoiemtnNjQyIiwiYSI6ImNpdHdianY5ZTAwNnIyb240ZWxiaThqbmQifQ.uC2N1F0FvBMTE7CeTfvbIw";
import { MapboxLayer } from "@deck.gl/mapbox";
import { Tile3DLayer, MVTLayer } from "@deck.gl/geo-layers";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";
import { DayAndNight } from "@/utils/mapboxUtil";
const local = window.location.origin;
const pathname = window.location.pathname;
const ak = "158c71dc21fd904203259f71df203da0";

export default {
  name: "HomeView",
  filters: {
    ellipsis: function (value) {
      if (!value) return "";
      if (value.length > 15) {
        return value.slice(0, 15) + "...";
      }
      return value;
    },
  },
  data() {
    return {
      viewState: {
        latitude: 30.5,
        longitude: 121,
        zoom: 4,
        bearing: 0,
        pitch: 0,
      },
      layer: [],
      treeData: [
        // {
        //   id: 1,
        //   name: "行政区划",
        //   sourceType: "vector",
        //   layerType: "polygon",
        //   layerName: "provinces-vector",
        //   url: `http://106.119.74.112:2231/stservice/tile_vector/1799340413598027778/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     114.97053716500625, 36.085511126679364, 115.48131798576651,
        //     36.50483379810703,
        //   ],
        //   "source-layer": "t_1799340413598027778_县级行政区",
        // },
        {
          id: 2,
          //name: "武安兴趣点POI",
          name: "兴趣点POI",
          sourceType: "vector",
          layerType: "point",
          layerName: "wa-poi",
          url: `http://106.119.74.112:2231/stservice/tile_vector/1816410478684020737/{z}/{x}/{y}?ak=${ak}`,
          extent: [
            113.7787893,36.50141499,114.3664393,37.00680837
          ],
          "source-layer": "t_1816410478684020737_DMXQ",
          poiNameAttr: "名称",
          poiTypeAttr: "类别",
        },
      ],
    };
  },
  mounted() {
    this.initMap();
    // setTimeout(() => {
    //   this.deleteDeckLayers("dyt");
    //   console.log("删除");
    // }, 15000);
  },
  methods: {
    initMap() {
      const mapStyle = {
        version: 8,
        name: "Dark",
        sprite: `${local}${pathname}/sprite/myIcon`,
        glyphs: `${local}${pathname}/font/{fontstack}/{range}.pbf`,
        sources: {
          Tianditu: {
            type: "raster",
            tiles: [
              "http://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311",
            ],
            tileSize: 256,
            maxzoom: 8,
          },
        },
        layers: [
          {
            id: "Tianditu",
            type: "raster",
            source: "Tianditu",
          },
          // {
          //   id: "Tianditu-label",
          //   type: "raster",
          //   source: "Tianditu-label",
          //   minzoom: 0,
          //   maxzoom: 18,
          // },
        ],
      };
      const map = new mapboxgl.Map({
        container: "map", // container ID
        // style: "mapbox://styles/mapbox/streets-v12", // style URL
        projection: "globe",
        style: mapStyle,
        //center: [104.218439, 37.636502], // starting position [lng, lat]
        center: [114.04083253540585, 36.760091112146476], // starting position [lng, lat]
        // 114.04083253540585, 36.600091112146476
        zoom: 10, // starting zoom
        // maxZoom: 16,
      });
      this.map = map;
      map.on("load", () => {
        const dayNight = new DayAndNight({
          map: map,
        });
        dayNight.setConfigProperty("day");
        
        //this.addTerrain();
        this.addTreeDataLayers();
      });
    },
    checkLayerTypeLoad(i) {
      if(i.sourceType !== 'raster'){
        switch (i.layerType) {
          case "polygon":
            this.addPolygon(i);
            break;
          case "polyline":
            this.addPolyLine(i);
            break;
          case "point":
            this.$nextTick(() => {
              this.addPoint(i);
            });
            break;
          case "3DTiles":
            this.add3DTiles(i);
            break;
        }
      } else {
        this.addRasterLayer(i)
      }
    },
    addTreeDataLayers() {
      this.treeData.forEach((i) => {
        if (i.children) {
          i.children.forEach((child) => {
            this.checkLayerTypeLoad(child);
          });
        } else {
          this.checkLayerTypeLoad(i);
        }
      });
    },
    load3DTilesByMapboxLayer(name, id, url, data) {
      const tile3dLayer = new MapboxLayer({
        id: data.layerName,
        type: Tile3DLayer,
        pointSize: 1,
        data: url,
        // opacity: 0.9,
        pickable: true,
        loader: Tiles3DLoader,
        onTilesetLoad: (tileset) => {
          // tileset.content.cartographicOrigin.z -= 16; //  z轴偏移
          const { cartographicCenter, zoom } = tileset;
          const treeTilesData = this.treeData.find((i) => i.layerName == name);
          treeTilesData.extent = {
            cartographicCenter,
            zoom,
          };
        },
        // onHover: (Tile3DLayer, event) =>
        //   console.log("Hovered:", Tile3DLayer, event),
      });
      this.map.addLayer(tile3dLayer, data.beforeLayer || null);
    },
    checkChange(data, itemCheck) {
      console.log("checkChange", ...arguments);
      // const stateDataLayer = map.getLayer('state-data');
      const visible = itemCheck ? "visible" : "none";
      this.map.setLayoutProperty(data.layerName, "visibility", visible);
      if (data.layerType == "polyline") {
        // this.map.setLayoutProperty(
        //   data.layerName + "-label",
        //   "visibility",
        //   visible
        // );
        this.map.setLayoutProperty(
          data.layerName + "-label",
          "visibility",
          visible
        );
      } else if (data.layerType == "polygon" && data.outLine) {
        this.map.setLayoutProperty(
          data.layerName + "-line",
          "visibility",
          visible
        );
      }
    },
    nodeClick(data, node, event) {
      if (event.node.checked) {
        console.log(event.node.data.layerName);
        const extent = event.node.data.extent;
        if (event.node.data.sourceType == "3DTiles") {
          this.map.flyTo({
            center: [
              extent.cartographicCenter[0],
              extent.cartographicCenter[1],
            ],
            zoom: extent.zoom,
            speed: 2,
          });
          // console.log(extent);
          // debugger;
        } else if (event.node.data.sourceType == "vector" || event.node.data.sourceType == "raster") {
          // 创建 LngLatBounds 对象
          const bounds = new mapboxgl.LngLatBounds(
            [extent[0], extent[1]], // 左下角坐标
            [extent[2], extent[3]] // 右上角坐标
          );

          // 使用 fitBounds 方法将地图视图调整到指定的边界框
          this.map.fitBounds(bounds, {
            padding: 20, // 添加一些边缘空间
          });
        }
      }
    },
    add3DTiles(data) {
      if (!this.map.getLayer(data.layerName)) {
        // 2024年大名县主城区3Dtiles
        this.load3DTilesByMapboxLayer(data.layerName, data.layerName, data.url, data);
      } else {
        this.map.removeLayer(data.layerName);
        this.map.removeSource(data.layerName); // 如果使用的是矢量图层，也需要移除source
      }
    },
    addTerrain() {
      // this.map.addSource("mapbox-dem", {
      //   type: "raster-dem",
      //   url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      //   tileSize: 512,
      //   maxzoom: 14,
      // });
      // // // add the DEM source as a terrain layer with exaggerated height
      // this.map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      this.map.addSource("local-terrain", {
        type: "raster-dem",
        tiles: [`${local}${pathname}/gisterrain/{z}/{x}/{y}.png`],
        // encoding: 'utf',
        // tileSize: 256,
        // url: `http://106.119.74.112:2229/worldterrain10/{z}/{x}/{y}.png`,
        // tiles: [`${local}${pathname}/terrain/{z}/{x}/{y}.png`],
        tileSize: 256,
        maxzoom: 14,
      });
      this.map.setTerrain({
        source: "local-terrain",
        exaggeration: 0.5,
      });
    },
    addPolygon(data) {
      const polygonSource = {
        type: "vector",
        tiles: [data.url],
      };
      // 面
      // 大名县县级行政区划mvt
      this.map.addLayer({
        id: data.layerName,
        source: polygonSource,
        type: "fill",
        "source-layer": data["source-layer"],
        paint: {
          "fill-color": data.fillColor || "#ff0",
          "fill-opacity": data.fillOpacity || 1,
        },
      }, data.beforeLayer || null);
      if(data.outLine){
        this.map.addLayer({
          id: `${data.layerName}-line`,
          source: polygonSource,
          type: "line",
          "source-layer": data["source-layer"],
          paint: {
            "line-width": 2,
            "line-color": data.fillColor || "#ff0",
            // "line-opacity": 0.5,
            "line-blur": 1,
            "line-dasharray": [5, 3],
          },
        }, data.beforeLayer || null);
      }
    },
    addPolyLine(data) {
      const polygonSource = {
        type: "vector",
        tiles: [data.url],
      };
      // 线
      // 大名县其他道路
      this.map.addLayer({
        id: data.layerName,
        source: polygonSource,
        type: "line",
        "source-layer": data["source-layer"],
        paint: {
          "line-width": data.lineWidth || 5,
          "line-color": data.lineColor || "#36AAF8",
          "line-opacity": data.lineOpacity || 1,
          "line-blur": 1,
        },
      }, data.beforeLayer || null);
      const lineLabelObject = {
        id: `${data.layerName}-label`,
        type: "symbol",
        source: polygonSource,
        "source-layer": data["source-layer"],
        'layout': {
          'text-field':['get', 'DLMC'],
          "symbol-placement": "line-center", 
          "text-rotation-alignment": 'map',
          'text-offset': [0, 0.25],
          'text-anchor': 'top',
          "text-padding": 20,
          'text-size': data.textSize || 12
        },
        'paint': {
          //'text-color': '#8F5A33',
          'text-color': data.textColor || '#fff',
          //"text-halo-width": 1.5,
          "text-halo-width": 15,
          "text-halo-color": data.textHaloColor || "#D5BB97",
          "text-halo-blur": 0.5, // 描边模糊程度
          "text-halo-opacity": 1, // 描边透明度
        }
      }
      if(data.textMinzoom){
        lineLabelObject.minzoom = data.textMinzoom
      }
      if(data.textMaxzoom){
        lineLabelObject.maxzoom = data.textMaxzoom
      }
      this.map.addLayer(lineLabelObject, data.beforeLayer || null);
    },
    addPoint(data) {
      // poi点
      // 大名县POI-学校mvt
      const pointVector = {
        type: "vector",
        tiles: [data.url],
      };
      const imgFilter = [
        "match",
        ["get", data.poiTypeAttr || ''],
        "小学",
        "小学",
        "初中",
        "初中",
        "高中",
        "高中",
        "加油站",
        "加油站",
        "厂矿企业",
        "厂矿企业",
        "乡镇级党政机关",
        "乡镇级党政机关",
        "公司",
        "公司",
        "区片名",
        "区片名",
        "综合医院",
        "综合医院",
        "区县级事业单位",
        "区县级事业单位",
        "交警队",
        "交警队",
        "精神病医院",
        "精神病医院",
        "产业园区",
        "产业园区",
        "职业技术学校",
        "职业技术学校",
        "城市广场",
        "城市广场",
        "商业大厦、写字楼",
        "商业大厦、写字楼",
        "康复医院",
        "康复医院",
        "批发市场",
        "批发市场",
        "商住两用楼",
        "商住两用楼",
        "眼科医院",
        "眼科医院",
        "学校",
        "学校",
        "区片名", // 默认图标
      ]
      let img = '';
      img = imgFilter
      if(data.noIcon) img = ''
      const layerObject = {
        id: data.layerName,
        source: pointVector,
        type: "symbol", // 类型
        "source-layer": data["source-layer"],
        // 图层的布局属性
        layout: {
          //"icon-image": "University", // 图层图标
          "icon-image": img,
          "icon-size": 0.8,
          // "icon-allow-overlap": true, // 图标覆盖不隐藏
          "text-field": ["get", data.poiNameAttr], // 使用 feature 的属性作为文本
          "text-font": ["yh"],
          "text-size": data.textSize || 14, // 文本大小
          "text-offset": data.noIcon ? [0, 0] : [0, -3.4],
          "icon-offset": data.noIcon ? [0, 0] : [0, -30.4],
        },
        paint: {
          "icon-color": "#000", // 图标颜色, 当 sprite.json 的图标属性 sdf 都为 false时, 生效
          "text-color": data.textColor || "#ffffff",
          "text-halo-width": 1.5,
          "text-halo-color": data.textHaloColor || "#000",
          "text-halo-blur": 0.5, // 描边模糊程度
          "text-halo-opacity": 1, // 描边透明度
        },
      }
      if(data.minzoom){
        layerObject.minzoom = data.minzoom
      }
      if(data.maxzoom){
        layerObject.maxzoom = data.maxzoom
      }
      this.map.addLayer(layerObject, data.beforeLayer || null);
      // this.map.moveLayer(data.layerName, "3dTiles");
      // setTimeout(() => {
      //   console.log(this.map.getStyle().layers);
      //   debugger;
      // }, 8000);
    },
    addRasterLayer(data){
      this.map.addLayer({
        id: data.layerName, // 图层 ID，唯一标识符
        type: "raster", // 图层类型，例如 fill, line, symbol
        source: {
          type: "raster",
          tiles: [
              data.url,
          ],
          tileSize: 256,
        },
        layout: {
          visibility: 'none'
        }
      });
    }
  },
};
</script>

<style scoped lang="less">
#map {
  width: 100vw;
  height: 100vh;
}
.map_box {
  .header {
    position: absolute;
    width: 100%;
    height: 90px;
    // background-image: linear-gradient(to bottom, #294983, #00000000);
    background-image: linear-gradient(to bottom, #131836, #00000000);
    z-index: 999;
    padding-top: 15px;
    font-size: 40px;
    text-align: center;
    .text {
      // color: #36aaf8;
      // background-color: #36aaf8;
      // width: 200px;
      background-image: linear-gradient(to right, #47a5e4, #8bd8d5);
      -webkit-background-clip: text;
      color: transparent;
    }
    &::before {
      content: "";
      display: block;
      position: absolute;
      top: 5px;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("../assets/head-bg2.png");
      background-size: 100% 100%;
      // z-index: -1;
    }
  }
  .content {
    position: absolute;
    top: 120px;
    left: 20px;
    width: 320px;
    min-height: 200px;
    // max-height: 400px;
    // overflow: scroll;
    // background-color: transparent;
    // background-color: #19423e8d;
    background-color: #131836a5;
    z-index: 9;
    border-radius: 5px;
    border: 1px solid #6d6d6d;
    .title {
      color: #fff;
      font-weight: bold;
      padding: 6px 10px;
      width: 100%;
      border-bottom: 1px solid #eee;
      // background-color: #065040;
      // background-color: #153936ee;
      background-image: linear-gradient(to right, #131836, #496eaa);
      border-radius: 5px 5px 0 0;
    }
    .el-tree {
      background-color: transparent;
      overflow-y: scroll;
      max-height: 800px;
      // color: @cesiumSystemColor;
      color: #fff;
      ::v-deep {
        .el-checkbox.is-disabled {
          display: none;
        }
      }
    }
    ::v-deep {
      .is-disabled .el-checkbox__inner {
        background-color: rgba(147, 142, 136, 0.5);
      }
      .el-checkbox__inner {
        z-index: 0;
        background-color: transparent;
      }
      .el-tree-node:focus > .el-tree-node__content,
      .el-tree-node:hover > .el-tree-node__content {
        background-color: #45679f;
        position: relative;
      }
      .el-tree-node:not(:last-child) {
        .el-tree-node__content {
          position: relative;
          padding-bottom: 2px;
          height: 30px;
          &::before {
            content: "";
            display: block;
            position: absolute;
            left: 5%;
            bottom: 0;
            width: 90%;
            height: 1px;
            border-bottom: 1px dashed #eee;
          }
        }
      }
      .el-tree-node:nth-last-child(2) {
        .el-tree-node__content {
          &::before {
            border: none;
          }
        }
      }
      // .el-tree-node__content:{}

      label {
        width: 15px;
      }
      .el-checkbox__input.is-checked {
        .el-checkbox__inner {
          background-color: #36aaf8;
          border-color: #fff;
        }
        .el-checkbox__inner::after {
          border-color: #fff;
        }
      }
    }
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 8px;
      width: 100%;
      overflow: hidden;
      .node-text {
        display: inline-block;
        width: 100%;
        // 溢出省略号
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
