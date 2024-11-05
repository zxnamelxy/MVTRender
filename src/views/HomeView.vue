<template>
  <div class="map_box">
    <div class="header">
      <span class="text">多源数据融合中心</span>
    </div>
    <div class="content" element-loading-background="rgba(0, 0, 0, 0.8)">
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
        :default-checked-keys="
          Array.from({ length: 100 }, (_, index) => index + 1)
        "
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
const local = window.location.origin;
const pathname = window.location.pathname;
const ak = "158c71dc21fd904203259f71df203da0";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";
window.CESIUM_BASE_URL = "./Cesium/";
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZjJiMTE2OS1lYzAwLTRlODEtYjAyYy01MTE2YTBmMTNjNGMiLCJpZCI6MTk1OTkxLCJpYXQiOjE3MDgxMzQ5NjR9.O4FIGMW_v4OxAm2GTsiwllrQ7DehNBLbodUk_eSZo-E";
import MVTDynamicPrimitive from "@/utils/MVT/MVTDynamicPrimitive.js";
import pointIconJson from "@/assets/iconjson";

// 创建自定义材质
function createRoundCapMaterial(color) {
  return new Cesium.Material({
    fabric: {
      type: "RoundCap",
      uniforms: {
        color: color,
      },
      source: `
                  uniform vec4 color;
      czm_material czm_getMaterial(czm_materialInput materialInput)
      {
        czm_material material = czm_getDefaultMaterial(materialInput);
        vec2 st = materialInput.st;
        float distance = length(st - vec2(0.5));
        if (distance > 0.5) {
          discard;
        }
        material.diffuse = color.rgb; // 使用uniforms中的color
        material.alpha = color.a; // 使用uniforms中的color
        return material;
      }
            `,
    },
    translucent: function () {
      return true; // 确保材质被认为是半透明的
    },
  });
}
function createDashedLineMaterial(
  color,
  dashLength, // 虚线长度
  dashPattern, // 虚线模式
  gapColor // 间隔颜色
) {
  var dashedLineMaterial = Cesium.Material.fromType("PolylineDash");
  dashedLineMaterial.uniforms.color = color; // 设置虚线颜色
  if (dashLength) dashedLineMaterial.uniforms.dashLength = dashLength; // 设置虚线长度
  if (dashPattern) dashedLineMaterial.uniforms.dashPattern = dashPattern; // 设置虚线模式
  if (gapColor) dashedLineMaterial.uniforms.gapColor = gapColor;
  return dashedLineMaterial;
}
let viewer;
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
      layer: [],
      treeData: [
        // {
        //   id: 1,
        //   //name: "小区",
        //   name: "POI",
        //   sourceType: "vector",
        //   layerType: "point",
        //   url: `http://106.119.74.112:2231/stservice/tile_vector/1819653822637809666/{z}/{x}/{y}?ak=${ak}`,
        //   mvtLayer: null,
        //   bounds: [
        //     12815702.063046811, 4339337.185487918, 12820523.677588403,
        //     4342118.149611221,
        //   ],
        //   crsCode: "EPSG:3857",
        //   renderOptions: {
        //     // 点渲染参数
        //     // 注记字段名称，不指定此字段，或者字段无效，将不显示注记
        //     textField: "名称",
        //     heightField: "高度",
        //     // minLabelNum: 500,
        //     // 是否显示点
        //     // showPoint: false,
        //     // 注记参数，详情参考 Cesium.Label.ConstructorOptions
        //     // pointImage: require('@/assets/iconImg/区片名.png'),
        //     pointTypeField: "类别",
        //     iconJson: pointIconJson,
        //     // color: Cesium.Color.RED,
        //     // outlineWidth: 3,
        //     // outlineColor: Cesium.Color.BLACK,
        //     textOptions: {
        //       fillColor: Cesium.Color.BLACK,
        //       outlineColor: Cesium.Color.WHITE,
        //       horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        //       verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        //       pixelOffset: new Cesium.Cartesian2(0, -16),
        //       style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        //       outlineWidth: 5,
        //       font: "20px sans-serif",
        //       heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        //       height: 100,
        //       disableDepthTestDistance: 10000000,
        //     },
        //   },
        // },
        // {
        //   id: 2,
        //   //name: "大名县城市道路",
        //   name: "线",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   url: `http://106.119.74.112:2231/stservice/tile_vector/1827229149723500545/{z}/{x}/{y}?ak=${ak}`,
        //   mvtLayer: null,
        //   bounds: [
        //     115.10990511263094, 36.2503638904812, 115.23108853710637,
        //     36.31885029680379,
        //   ],
        //   crsCode: "EPSG:4490",
        //   renderOptions: {
        //     // Polyline: {
        //     // color: Cesium.Color.RED,
        //     width: 6,
        //     // material: new Cesium.Material({
        //     //   fabric: {
        //     //     type: "Color",
        //     //     uniforms: {
        //     //       color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
        //     //     },
        //     //   },
        //     // }),
        //     // material: createRoundCapMaterial(Cesium.Color.YELLOW),
        //     // material: Cesium.Material.fromType(Cesium.Material.PolylineOutlineType),
        //     // material: Cesium.Material.fromType(Cesium.Material.RimLightingType),
        //     // material: Cesium.Material.fromType(Cesium.Material.PolylineDashType),
        //     material: createDashedLineMaterial(
        //       Cesium.Color.YELLOW,
        //       10.0 // 虚线长度
        //       // 20.0 // 间隔长度
        //     ),
        //     // },
        //   },
        // },
        {
          id: 3,
          //name: "基本农田",
          name: "面",
          sourceType: "vector",
          layerType: "polygon",
          // url: `http://106.119.74.112:2231/stservice/tile_vector/1829086581659672578/{z}/{x}/{y}?ak=${ak}`,
          url: `http://106.119.74.112:2231/stservice/tile_vector/1829087081666846722/{z}/{x}/{y}?ak=${ak}`,
          mvtLayer: null,
          bounds: [
            114.97053716500612, 36.08551112667936, 115.48131798576647,
            36.50479401734554,
          ],
          crsCode: "EPSG:4490",
          renderOptions: {
            material: new Cesium.Material({
              fabric: {
                type: "Color",
                uniforms: {
                  color: new Cesium.Color(1.0, 1, 0.0, 0.5),
                },
              },
            }),
          },
        },
        {
          id: 4,
          //name: "2024年大名县主城区倾斜模型-0.02米",
          name: "模型",
          sourceType: "vector",
          layerType: "3DTiles",
          url: `http://106.119.74.112:2231/stservice/tile_3d/1806495748796325890/tileset.json?ak=${ak}`,
          mvtLayer: null,
        },
        // {
        //   id: 5,
        //   //name: "大名县线状水系",
        //   name: "水系",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   url: `http://106.119.74.112:2231/stservice/tile_vector/1799339397532078081/{z}/{x}/{y}?ak=${ak}`,
        //   mvtLayer: null,
        //   bounds: [
        //     114.97038976457611, 36.10066794077295, 115.4712961462003,
        //     36.502961775965275,
        //   ],
        //   crsCode: "EPSG:4490",
        //   renderOptions: {
        //     // Polyline: {
        //     // color: Cesium.Color.RED,
        //     width: 6,
        //     material: new Cesium.Material({
        //       fabric: {
        //         type: "Color",
        //         uniforms: {
        //           color: new Cesium.Color(0, 0, 1.0, 0.3),
        //         },
        //       },
        //     }),
        //     // material: createRoundCapMaterial(Cesium.Color.YELLOW),
        //     // material: Cesium.Material.fromType(Cesium.Material.PolylineOutlineType),
        //     // material: Cesium.Material.fromType(Cesium.Material.RimLightingType),
        //     // material: Cesium.Material.fromType(Cesium.Material.PolylineDashType),
        //     // material: createDashedLineMaterial(
        //     //   Cesium.Color.YELLOW,
        //     //   10.0 // 虚线长度
        //     //   // 20.0 // 间隔长度
        //     // ),
        //     // },
        //   },
        // },
      ],
    };
  },
  mounted() {
    this.initMap();
    this.addTreeDataLayers();
  },
  methods: {
    initMap() {
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
        // 西边经度
        89.5,
        // 南边纬度
        20.4,
        // 东边经度
        110.4,
        // 北边纬度
        61.2
      );
      viewer = new Cesium.Viewer("map", {
        animation: false,
        baseLayerPicker: false,
        vrButton: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        creditContainer: document.createElement("div"),
        terrainExaggeration: 1,
        terrainProvider: new Cesium.CesiumTerrainProvider({
          // url: "http://106.119.74.112:2229/worldterrain10",
          url: "http://data.mars3d.cn/terrain",
          requestWaterMask: true,
          requestVertexNormals: true,
        }),
      });
      // viewer.scene.debugShowFramesPerSecond = true;
      // viewer.scene.globe.depthTestAgainstTerrain = false;
      // viewer.imageryLayers.addImageryProvider(
      //   new Cesium.UrlTemplateImageryProvider({
      //     url: new Cesium.Resource({
      //       url: "http://106.119.74.112:2229/worldtiles/{z}/{x}/{y}.png",
      //     }),
      //     tilingScheme: new Cesium.WebMercatorTilingScheme(),
      //   })
      // );
      // 隐藏版权显示
      viewer._cesiumWidget._creditContainer.style.display = "none";
    },
    checkLayerTypeLoad(i) {
      switch (i.layerType) {
        // case "polygon":
        //   this.addPolygon(i);
        //   break;
        // case "polyline":
        //   this.addPolyLine(i);
        //   break;
        // case "point":
        //   this.$nextTick(() => {
        //     this.addPoint(i);
        //   });
        //   break;
        case "3DTiles":
          this.add3DTiles(i);
          break;
        default:
          this.addMVTLayer(i);
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
    checkChange(data, itemCheck) {
      data.mvtLayer.show = itemCheck;
    },
    nodeClick(data, node, event) {
      switch (data.layerType) {
        case "3DTiles":
          this.flyTo3DTiles(data);
          break;
        default:
          this.flyToLayer(data);
          break;
      }
    },
    flyTo3DTiles(data) {
      viewer.flyTo(data.mvtLayer);
    },
    flyToLayer(data) {
      let west, south, east, north;
      if (data.crsCode === "EPSG:3857") {
        const c1 = this.mercatorTolonlat({
          x: data.bounds[0],
          y: data.bounds[1],
        });
        const c2 = this.mercatorTolonlat({
          x: data.bounds[2],
          y: data.bounds[3],
        });
        west = Cesium.Math.toRadians(c1.x);
        south = Cesium.Math.toRadians(c1.y);
        east = Cesium.Math.toRadians(c2.x);
        north = Cesium.Math.toRadians(c2.y);
      } else {
        west = Cesium.Math.toRadians(data.bounds[0]);
        south = Cesium.Math.toRadians(data.bounds[1]);
        east = Cesium.Math.toRadians(data.bounds[2]);
        north = Cesium.Math.toRadians(data.bounds[3]);
      }
      const rectangle = new Cesium.Rectangle(west, south, east, north);
      const zoomToHome = () => {
        viewer.camera.flyTo({
          destination: rectangle,
          orientation: {
            heading: 0.0,
            pitch: -Cesium.Math.PI_OVER_TWO,
            roll: 0.0,
          },
          offset: new Cesium.HeadingPitchRange(
            0.0,
            -Cesium.Math.PI_OVER_TWO,
            0.0
          ), // 保持初始方向和俯仰
          duration: 2.0, // 可选，设置飞行动画持续时间（秒）
        });
      };
      zoomToHome();
    },
    add3DTiles(data) {
      var tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: data.url,
        })
      );
      data.mvtLayer = tileset;
    },
    addTerrain() {},
    addMVTLayer(data) {
      const mvtp = new MVTDynamicPrimitive(viewer.scene, data.url, {
        renderOptions: data.renderOptions,
      });
      viewer.scene.primitives.add(mvtp);
      data.mvtLayer = mvtp;
    },
    // addPoint(data) {
    //   // const imgFilter = [
    //   //   "match",
    //   //   ["get", data.poiTypeAttr || ''],
    //   //   "小学",
    //   //   "小学",
    //   //   "初中",
    //   //   "初中",
    //   //   "高中",
    //   //   "高中",
    //   //   "加油站",
    //   //   "加油站",
    //   //   "厂矿企业",
    //   //   "厂矿企业",
    //   //   "乡镇级党政机关",
    //   //   "乡镇级党政机关",
    //   //   "公司",
    //   //   "公司",
    //   //   "区片名",
    //   //   "区片名",
    //   //   "综合医院",
    //   //   "综合医院",
    //   //   "区县级事业单位",
    //   //   "区县级事业单位",
    //   //   "交警队",
    //   //   "交警队",
    //   //   "精神病医院",
    //   //   "精神病医院",
    //   //   "产业园区",
    //   //   "产业园区",
    //   //   "职业技术学校",
    //   //   "职业技术学校",
    //   //   "城市广场",
    //   //   "城市广场",
    //   //   "商业大厦、写字楼",
    //   //   "商业大厦、写字楼",
    //   //   "康复医院",
    //   //   "康复医院",
    //   //   "批发市场",
    //   //   "批发市场",
    //   //   "商住两用楼",
    //   //   "商住两用楼",
    //   //   "眼科医院",
    //   //   "眼科医院",
    //   //   "学校",
    //   //   "学校",
    //   //   "区片名", // 默认图标
    //   // ]
    // },
    addRasterLayer(data) {},
    // javascript 转换
    // 4326转3857
    WGS84ToMercator(lonlat) {
      const coord = {
        lat: 0,
        lng: 0,
      };
      const earthRad = 6378137.0; //地球半径
      coord.lat = ((lonlat.lng * Math.PI) / 180) * earthRad;
      const param = (lonlat.lat * Math.PI) / 180;
      coord.lng =
        (earthRad / 2) *
        Math.log((1.0 + Math.sin(param)) / (1.0 - Math.sin(param)));
      return coord;
    },
    // 3857转4326
    mercatorTolonlat(mercator) {
      var lonlat = {
        x: 0,
        y: 0,
      };
      var x = (mercator.x / 20037508.34) * 180;
      var y = (mercator.y / 20037508.34) * 180;
      y =
        (180 / Math.PI) *
        (2 * Math.atan(Math.exp((y * Math.PI) / 180)) - Math.PI / 2);
      lonlat.x = x;
      lonlat.y = y;
      return lonlat;
    },
  },
};
</script>

<style scoped lang="less">
#map {
  width: 100vw;
  height: 100vh;
}
::v-deep {
  .cesium-viewer-fullscreenContainer {
    display: none !important;
  }
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
