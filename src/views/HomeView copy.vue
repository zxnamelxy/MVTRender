<template>
  <div class="map_box">
    <div
      class="content"
      v-loading="treeLoading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div class="title"><i class="iconfont icon-odbc"></i> 图层控制</div>
      <el-tree
        check-strictly
        default-expand-all
        ref="tree"
        :data="treeData"
        show-checkbox
        node-key="id"
        @check-change="checkChange"
        @node-click="nodeClick"
        :default-checked-keys="
          Array.from({ length: 100 }, (_, index) => index + 1)
        "
      >
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
import { MapboxOverlay, MapboxLayer, DeckGL } from "@deck.gl/mapbox";
import { Tile3DLayer, MVTLayer } from "@deck.gl/geo-layers";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";
import { CesiumIonLoader } from "@loaders.gl/tiles";
const core_1 = require("@math.gl/core");
import { DayAndNight } from "@/utils/mapboxUtil";
const local = window.location.origin;
const ak = "158c71dc21fd904203259f71df203da0";

import { ScatterplotLayer } from "@deck.gl/layers";
const ION_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZjJiMTE2OS1lYzAwLTRlODEtYjAyYy01MTE2YTBmMTNjNGMiLCJpZCI6MTk1OTkxLCJpYXQiOjE3MDgxMzQ5NjR9.O4FIGMW_v4OxAm2GTsiwllrQ7DehNBLbodUk_eSZo-E";

export default {
  name: "HomeView",
  filters: {
    ellipsis: function (value) {
      if (!value) return "";
      if (value.length > 12) {
        return value.slice(0, 12) + "...";
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
      treeLoading: false,
      treeData: [
        {
          id: 1,
          name: "行政区划",
          sourceType: "vector",
          layerType: "polygon",
          layerName: "provinces-vector",
          url: `http://106.119.74.112:2231/stservice/tile_vector/1799340413598027778/{z}/{x}/{y}?ak=${ak}`,
          extent: [
            114.97053716500625, 36.085511126679364, 115.48131798576651,
            36.50483379810703,
          ],
          "source-layer": "t_1799340413598027778_县级行政区",
          fillColor: "#81c5f8",
          fillOpacity: 1,
          beforeLayer: "river-vector",
        },
        {
          id: 2,
          name: "POI",
          sourceType: "vector",
          layerType: "point",
          layerName: "poi-vector",
          url: `http://106.119.74.112:2231/stservice/tile_vector/1799329059621294082/{z}/{x}/{y}?ak=${ak}`,
          extent: [
            114.99963830036734, 36.09920440026292, 115.45954099981736,
            36.474394400181495,
          ],
          "source-layer": "t_1799329059621294082_学校",
          poiNameAttr: "名称",
          poiTypeAttr: "类别",
        },
        {
          id: 4,
          name: "道路",
          sourceType: "vector",
          layerType: "polyline",
          layerName: "road-vector",
          url: `http://106.119.74.112:2231/stservice/tile_vector/1827229270968246274/{z}/{x}/{y}?ak=${ak}`,
          extent: [
            114.97183913356923, 36.08509794311561, 115.48125954269378,
            36.50326010447031,
          ],
          "source-layer": "t_1827229270968246274_QT",
          lineColor: "#7f786c",
        },
        {
          id: 3,
          name: "3DTiles模型",
          sourceType: "3DTiles",
          layerType: "3DTiles",
          layerName: "3dTiles",
          url: `http://106.119.74.112:2231/stservice/tile_3d/1806495748796325890/tileset.json?ak=${ak}`,
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
        sprite: `${local}/sprite/sprite.json`,
        glyphs: `${local}/font/{fontstack}/{range}.pbf`,
        sources: {
          Tianditu: {
            type: "raster",
            tiles: [
              "http://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311",
            ],
            tileSize: 256,
            maxzoom: 8,
          },
          "Tianditu-label": {
            type: "raster",
            tiles: [
              "http://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=1d109683f4d84198e37a38c442d68311",
            ],
            tileSize: 256,
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
        style: mapStyle,
        center: [104.218439, 37.636502], // starting position [lng, lat]
        zoom: 3.5, // starting zoom
        // maxZoom: 16,
      });
      this.map = map;
      map.on("load", () => {
        const dayNight = new DayAndNight({
          map: map,
        });
        dayNight.setConfigProperty("day");
        // this.addTerrain();
        this.addTreeDataLayers();
        // this.add3DTiles();
        // this.addPolygon();
        // this.addPoint();
        // this.addPolyLine();
        // this.loadPointLayer(
        //   "road-vector",
        //   "http://106.119.74.112:2231/stservice/tile_vector/1827229270968246274/{z}/{x}/{y}?ak=158c71dc21fd904203259f71df203da0"
        // );
        // this.loadPointLayer('poi-vector', 'http://106.119.74.112:2231/stservice/tile_vector/1799329059621294082/{z}/{x}/{y}?ak=158c71dc21fd904203259f71df203da0')
        // map.addLayer({
        //   id: 'background',
        //   type: "background",
        //   paint: {
        //     "background-color": "#fff",
        //     "background-opacity": 0,
        //   },
        // });
      });
      map.on("click", this.handleMapClick);
    },
    checkLayerTypeLoad(i) {
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
    // load3DTiles(name, id, url) {
    //   const layers = deckOverlay._props.layers;
    //   const layer = new Tile3DLayer({
    //     id: id,
    //     name: name,
    //     data: url,
    //     loader: Tiles3DLoader,
    //     extruded: true, // 设置3D功能
    //     opacity: 1, // 设置透明度
    //     loadOptions: {
    //       "3d-tiles": {
    //         loadGLTF: true,
    //         decodeQuantizedPositions: false,
    //         isTileset: "auto",
    //         assetGltfUpAxis: null,
    //       },
    //     },
    //     pickable: true, // 设置可选取
    //     onTilesetError: (err) => {
    //       console.log(22, err);
    //     },
    //     onTilesetLoad: (tileset) => {
    //       const { cartographicCenter, zoom } = tileset;
    //       // const initialViewState = {
    //       //   longitude: cartographicCenter[0],
    //       //   latitude: cartographicCenter[1],
    //       //   zoom: 7,
    //       //   // zoom: zoom,
    //       //   pitch: 45,
    //       //   bearing: 0, // 初始方向
    //       //   maxZoom: 20, // 最大缩放级别
    //       //   minZoom: 1, // 最小缩放级别
    //       //   maxPitch: 85, // 最大倾斜角度
    //       //   minPitch: 0, // 最小倾斜角度
    //       // };
    //       deckOverlay.setProps({
    //         initialViewState: {
    //           longitude: cartographicCenter[0],
    //           latitude: cartographicCenter[1],
    //           zoom,
    //         },
    //         // initialViewState,
    //         controller: true,
    //       });
    //       let mMtx = new core_1.Matrix4().makeTranslation(1, 1, 500);

    //       tileset.modelMatrix = mMtx;
    //       const treeTilesData = this.treeData.find((i) => i.layerName == name);
    //       treeTilesData.extent = {
    //         cartographicCenter,
    //         zoom,
    //       };
    //     },
    //     pointSize: 2,
    //     parameters: {
    //       depthTest: false, // 禁用深度测试
    //     },
    //   });
    //   deckOverlay.setProps({
    //     layers: [...layers, layer],
    //   });
    // },
    load3DTilesByMapboxLayer(name, id, url) {
      const tile3dLayer = new MapboxLayer({
        id: "tile3dlayer",
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
      this.map.addLayer(tile3dLayer);
    },
    checkChange(data, itemCheck) {
      console.log("checkChange", ...arguments);
      // const stateDataLayer = map.getLayer('state-data');
      const visible = itemCheck ? "visible" : "none";
      this.map.setLayoutProperty(data.layerName, "visibility", visible);
      if (data.layerType == "point") {
        // this.map.setLayoutProperty(
        //   data.layerName + "-label",
        //   "visibility",
        //   visible
        // );
      } else if (data.layerType == "polygon") {
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
        } else if (event.node.data.sourceType == "vector") {
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
        this.load3DTilesByMapboxLayer(data.layerName, data.layerName, data.url);
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
        tiles: [`${local}/gisterrain/{z}/{x}/{y}.png`],
        // encoding: 'utf',
        // tileSize: 256,
        // url: `http://106.119.74.112:2229/worldterrain10/{z}/{x}/{y}.png`,
        // tiles: [`${local}/terrain/{z}/{x}/{y}.png`],
        tileSize: 256,
        maxzoom: 14,
      });
      this.map.setTerrain({
        source: "local-terrain",
        exaggeration: 1,
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
        paint: {
          "fill-color": "#ff0",
          "fill-opacity": 0.1,
        },
      });
      this.map.addLayer({
        id: `${data.layerName}-line`,
        source: polygonSource,
        type: "line",
        "source-layer": data["source-layer"],
        paint: {
          "line-width": 2,
          "line-color": "#ff0",
          // "line-opacity": 0.5,
          "line-blur": 1,
          "line-dasharray": [5, 3],
        },
      });
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
          "line-width": 5,
          "line-color": "#36AAF8",
          // "line-opacity": 0.5,
          "line-blur": 1,
        },
      });
    },
    addPoint(data) {
      // poi点
      // 大名县POI-学校mvt
      const pointVector = {
        type: "vector",
        tiles: [data.url],
      };
      this.map.addLayer({
        id: data.layerName,
        source: pointVector,
        type: "symbol", // 类型
        "source-layer": data["source-layer"],
        // 图层的布局属性
        layout: {
          "icon-image": "University", // 图层图标
          "icon-size": 0.8,
          // "icon-allow-overlap": true, // 图标覆盖不隐藏
          "text-field": ["get", data.poiNameAttr], // 使用 feature 的属性作为文本
          "text-font": ["yh"],
          "text-size": 14, // 文本大小
          "text-offset": [0, -3.4],
          "icon-offset": [0, -30.4],
        },
        paint: {
          "icon-color": "#000", // 图标颜色, 当 sprite.json 的图标属性 sdf 都为 false时, 生效
          "text-color": "#ffffff",
          "text-halo-width": 1.5,
          "text-halo-color": "#000",
          "text-halo-blur": 0.5, // 描边模糊程度
          "text-halo-opacity": 1, // 描边透明度
        },
      });
      // this.map.moveLayer(data.layerName, "3dTiles");
      // setTimeout(() => {
      //   console.log(this.map.getStyle().layers);
      //   debugger;
      // }, 8000);
    },
    // loadPointLayer(id, url) {
    //   const layers = deckOverlay._props.layers;
    //   const elevationCache = {};
    //   deckOverlay.setProps({
    //     layers: [
    //       ...layers,
    //       new MVTLayer({
    //         id: id,
    //         data: [url],
    //         minZoom: 0,
    //         maxZoom: 14,
    //         // getFillColor: (f) => {
    //         //   return [255, 255, 0];
    //         // },
    //         // getLineColor: [192, 192, 192],
    //         // getPointRadius: 6,
    //         // pointRadiusUnits: "pixels",
    //         // stroked: false,
    //         // picking: true,
    //         getFillColor: (f) => {
    //           return [0, 240, 240];
    //         },
    //         getLineWidth: (f) => {
    //           return 12;
    //         },
    //         getLineColor: [0, 192, 192],
    //         getPointRadius: 2,
    //         pointRadiusUnits: "pixels",
    //         stroked: false,
    //         picking: true,
    //         getElevation: (f) => {
    //           const key = `${f.geometry.coordinates[0]},${f.geometry.coordinates[1]}`;
    //           return elevationCache[key] || 0; // 如果没有找到高度信息，使用默认值 0
    //         },
    //       }),
    //     ],
    //   });
    // },
    // judgeIsModel(e) {
    //   const [x, y] = [e.point.x, e.point.y];
    //   const pickInfo = deckOverlay.pickObject({
    //     x,
    //     y,
    //     unproject3D: true,
    //   });

    //   if (pickInfo && pickInfo.coordinate) {
    //     return pickInfo;
    //   } else {
    //     return null;
    //   }
    // },
    // handleMapClick(e) {
    //   const pickResult = this.judgeIsModel(e);

    //   if (pickResult) {
    //     console.log("点击了模型:", pickResult);
    //     // 可以在这里处理点击后的逻辑，例如弹出模型信息等
    //   } else {
    //     console.log("点击未命中任何模型");
    //     // 处理点击未命中的情况
    //   }
    // },
    // deleteDeckLayers(id) {
    //   const decklayers = deckOverlay._props.layers;
    //   console.log("Before:", decklayers);

    //   // 创建一个新的数组来保存需要保留的图层
    //   const newLayers = decklayers.filter(
    //     (layer) => layer.id.indexOf(id) === -1
    //   );

    //   // 更新 deckOverlay 的 layers 属性
    //   deckOverlay.setProps({
    //     layers: newLayers,
    //   });

    //   console.log("After:", decklayers);
    // },
  },
};
</script>

<style scoped lang="less">
#map {
  width: 100vw;
  height: 100vh;
}
.map_box {
  .content {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 320px;
    min-height: 200px;
    // max-height: 400px;
    // overflow: scroll;
    // background-color: transparent;
    background-color: #19423e8d;
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
      background-color: #153936ee;
      border-radius: 5px 5px 0 0;
    }
    .el-tree {
      background-color: transparent;
      overflow-y: scroll;
      max-height: 300px;
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
        background-color: #4b8189;
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
