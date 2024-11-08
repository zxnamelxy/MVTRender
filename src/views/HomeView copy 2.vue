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
const treeLayers = [];
const t = [
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
    url: `http://192.168.30.86:2231/stservice/tile_vector/1844294626165395457/{z}/{x}/{y}?ak=${ak}`,
    bounds: [113.7787893, 36.50141499, 114.3664393, 37.00680837],
    crsCode: "EPSG:4326",
    renderOptions: {
      // 点渲染参数
      // 注记字段名称，不指定此字段，或者字段无效，将不显示注记
      textField: "名称",
      heightField: "高度",
      // minLabelNum: 500,
      // 是否显示点
      // showPoint: false,
      // 注记参数，详情参考 Cesium.Label.ConstructorOptions
      // pointImage: require('@/assets/iconImg/区片名.png'),
      pointTypeField: "类别",
      iconJson: pointIconJson,
      // color: Cesium.Color.RED,
      // outlineWidth: 3,
      // outlineColor: Cesium.Color.BLACK,
      textOptions: {
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16),
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 5,
        font: "20px sans-serif",
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        height: 100,
        disableDepthTestDistance: 10000000,
      },
    },
  },
  // {
  //   id: 6,
  //   //name: "武安水系-线-矢量",
  //   name: "水系-线状",
  //   sourceType: "vector",
  //   layerType: "polyline",
  //   layerName: "river-vector",
  //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844311434670903297/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     113.76800680428391,36.499764391113786,114.37322605566361,37.00561862589893
  //   ],
  //   "source-layer": "t_1844311434670903297_130481RIVEline",
  //   lineOpacity: 0.2,
  // },
  // {
  //   id: 7,
  //   //name: "武安市水系-面-矢量",
  //   name: "水系-面状",
  //   sourceType: "vector",
  //   layerType: "polygon",
  //   layerName: "river-vector-polygon",
  //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844572938561392641/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     113.76754210800004,36.499638751459486,114.38185410200015,37.005720414325936
  //   ],
  //   "source-layer": "t_1844572938561392641_130481RIVEM",
  //   fillColor: '#00f',
  //   beforeLayer: 'river-vector',
  //   fillOpacity: 0.3,
  // },
  {
    id: 4,
    //name: "2023年主城区倾斜模型-0.02M",
    name: "倾斜模型-0.02M",
    sourceType: "3DTiles",
    layerType: "3DTiles",
    url: `http://192.168.30.86:2231/stservice/tile_3d/1843589927166545921/tileset.json?ak=${ak}`,
    // beforeLayer: 'river-vector-polygon'
  },
  {
    id: 5,
    //name: "2023年武安市主城区外倾斜模型-0.05M",
    name: "倾斜模型-0.05M",
    sourceType: "3DTiles",
    layerType: "3DTiles",
    url: `http://192.168.30.86:2231/stservice/tile_3d/1817101173400801281/tileset.json?ak=${ak}`,
    // beforeLayer: 'river-vector-polygon'
  },
  // {
  //   id: 8,
  //   //name: "武安市国道-矢量",
  //   name: "国道",
  //   sourceType: "vector",
  //   layerType: "polyline",
  //   layerName: "road-gd-vector",
  //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844625669758128130/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     113.86284698909739,36.627665274632875,114.31704212773843,37.00207058009313
  //   ],
  //   "source-layer": "t_1844625669758128130_130481GD",
  //   lineColor: "#f4a828",
  //   lineOpacity: 0.6,
  //   lineWidth: 10,
  //   textSize: 16,
  //   textColor: '#606066',
  //   textHaloColor: '#fff',
  // },
  // {
  //   id: 9,
  //   //name: "武安市高速-矢量",
  //   name: "高速路",
  //   sourceType: "vector",
  //   layerType: "polyline",
  //   layerName: "road-gs-vector",
  //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844640794871336961/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     113.86584113151113,36.56373898866013,114.29075124454205,36.8410595579523
  //   ],
  //   "source-layer": "t_1844640794871336961_130481GS",
  //   lineWidth: 8,
  //   lineColor: "#F4B004",
  //   lineOpacity: 0.6,
  //   textSize: 14,
  //   textColor: '#6D7073',
  //   textHaloColor: '#fff',
  // },
  // {
  //   id: 10,
  //   //name: "武安市省道-矢量",
  //   name: "省道",
  //   sourceType: "vector",
  //   layerType: "polyline",
  //   layerName: "road-sd-vector",
  //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844630139166527489/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     113.77685120529462,36.553185494814905,114.35975477241058,37.00206995956106
  //   ],
  //   "source-layer": "t_1844630139166527489_130481SD",
  //   lineColor: "#ffca8b",
  //   lineOpacity: 0.6,
  //   lineWidth: 8,
  //   textSize: 14,
  //   textColor: '#616167',
  //   textHaloColor: '#fff',
  // },
  // {
  //   id: 11,
  //   //name: "武安市县道-矢量",
  //   name: "县道",
  //   sourceType: "vector",
  //   layerType: "polyline",
  //   layerName: "road-xd-vector",
  //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844642759252643842/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     113.93860985506078,36.49525129990772,114.33090083718697,36.85860076011705
  //   ],
  //   "source-layer": "t_1844642759252643842_130481XD",
  //   lineWidth: 6,
  //   lineColor: "#EEDB6A",
  //   lineOpacity: 0.6,
  //   textSize: 12,
  //   textColor: '#6D7073',
  //   textHaloColor: '#fff',
  //   textMinzoom: 8,
  // },
  // {
  //   id: 12,
  //   //name: "武安市镇道-矢量",
  //   name: "镇道",
  //   sourceType: "vector",
  //   layerType: "polyline",
  //   layerName: "road-zd-vector",
  //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844642941440626689/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     113.90695034927924,36.56678394860369,114.26711145562925,36.799375741297574
  //   ],
  //   "source-layer": "t_1844642941440626689_130481ZD",
  //   lineWidth: 5,
  //   lineColor: "#EEDAA2",
  //   lineOpacity: 0.6,
  //   textSize: 11,
  //   textColor: '#6D7073',
  //   textHaloColor: '#fff',
  //   textMinzoom: 9,
  // },
  // {
  //   id: 13,
  //   //name: "武安市乡道-矢量",
  //   name: "乡道",
  //   sourceType: "vector",
  //   layerType: "polyline",
  //   layerName: "road-xiang-vector",
  //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844643101033893889/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     113.79920395629766,36.5001424292299,114.37362803822806,36.985223057698185
  //   ],
  //   "source-layer": "t_1844643101033893889_130481XIANGD",
  //   lineWidth: 5,
  //   lineColor: "#D5D4CE",
  //   lineOpacity: 0.6,
  //   textSize: 10,
  //   textColor: '#6D7073',
  //   textHaloColor: '#fff',
  //   textMinzoom: 12,
  // },
  // {
  //   id: 14,
  //   //name: "武安城市道路-矢量",
  //   name: "城市道路",
  //   sourceType: "vector",
  //   layerType: "polyline",
  //   layerName: "road-city-vector",
  //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844620848334376962/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     114.0620111857678,36.546271949390935,114.3082551592296,36.849484126591264
  //   ],
  //   "source-layer": "t_1844620848334376962_130481CS",
  //   lineWidth: 5,
  //   lineColor: "#D5D4CE",
  //   lineOpacity: 0.6,
  //   textSize: 10,
  //   textColor: '#6D7073',
  //   textHaloColor: '#fff',
  //   textMinzoom: 12,
  // },
  {
    id: 15,
    //name: "武安市乡级行政区划注记-矢量",
    name: "乡级行政区划注记",
    sourceType: "vector",
    layerType: "point",
    url: `http://192.168.30.86:2231/stservice/tile_vector/1844649260113465345/{z}/{x}/{y}?ak=${ak}`,
    bounds: [
      113.81964943893493, 36.535741638640786, 114.33116285190125,
      36.92139131677028,
    ],
    // poiNameAttr: "XZQMC",
    // noIcon: true,
    // textColor: "#555555",
    // textSize: 16,
    // textHaloColor: "#fff",
    crsCode: "EPSG:4326",
    renderOptions: {
      // 点渲染参数
      // 注记字段名称，不指定此字段，或者字段无效，将不显示注记
      textField: "XZQMC",
      heightField: "高度",
      showPoint: false,
      textOptions: {
        fillColor: Cesium.Color.fromCssColorString("#555555"),
        outlineColor: Cesium.Color.fromCssColorString("#fff"),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16),
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 5,
        font: "16px sans-serif",
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        height: 10,
        disableDepthTestDistance: 10000000,
      },
    },
  },
  {
    id: 16,
    //name: "武安市村级行政区划注记-矢量",
    name: "村级行政区划注记",
    sourceType: "vector",
    layerType: "point",
    layerName: "wa-cjxzq-poi",
    url: `http://192.168.30.86:2231/stservice/tile_vector/1844649631254843394/{z}/{x}/{y}?ak=${ak}`,
    bounds: [
      113.77027333859222, 36.490642506137746, 114.36644242782637,
      37.00909442477336,
    ],
    poiNameAttr: "XZQMC",
    // noIcon: true,
    minZoom: 12,
    // textColor: "#A9A9A9",
    // textSize: 13,
    // textHaloColor: "#fff",
    crsCode: "EPSG:4326",
    renderOptions: {
      // 点渲染参数
      // 注记字段名称，不指定此字段，或者字段无效，将不显示注记
      textField: "XZQMC",
      heightField: "高度",
      showPoint: false,
      textOptions: {
        fillColor: Cesium.Color.fromCssColorString("#A9A9A9"),
        outlineColor: Cesium.Color.fromCssColorString("#fff"),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16),
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 5,
        font: "13px sans-serif",
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        height: 10,
        disableDepthTestDistance: 10000000,
      },
    },
  },
  {
    id: 995,
    //name: "2019武安市遥感影像-M",
    name: "2019遥感影像-M",
    sourceType: "raster",
    layerType: "raster",
    layerName: "wa-ygyx-2019",
    url: `http://192.168.30.86:2231/stservice/tile_xyz/1810142554721660929/{z}/{x}/{y}?ak=${ak}`,
    bounds: [
      // 114.04014588989796, 36.473202456016594, 114.04083253540585,
      // 37.022291112146476,
      12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
    ],
    crsCode: "EPSG:3857",
  },
  {
    id: 996,
    //name: "2020武安市遥感影像-M",
    name: "2020遥感影像-M",
    sourceType: "raster",
    layerType: "raster",
    layerName: "wa-ygyx-2020",
    url: `http://192.168.30.86:2231/stservice/tile_xyz/1810193413513981954/{z}/{x}/{y}?ak=${ak}`,
    bounds: [
      // 114.04014588989796, 36.473202456016594, 114.04083253540585,
      // 37.022291112146476,
      12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
    ],
    crsCode: "EPSG:3857",
  },
  {
    id: 997,
    //name: "2021武安市遥感影像-M",
    name: "2021遥感影像-M",
    sourceType: "raster",
    layerType: "raster",
    layerName: "wa-ygyx-2021",
    url: `http://192.168.30.86:2231/stservice/tile_xyz/1810193226867453953/{z}/{x}/{y}?ak=${ak}`,
    bounds: [
      // 114.04014588989796, 36.473202456016594, 114.04083253540585,
      // 37.022291112146476,
      12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
    ],
    crsCode: "EPSG:3857",
  },
  {
    id: 998,
    //name: "2022武安市遥感影像-M",
    name: "2022遥感影像-M",
    sourceType: "raster",
    layerType: "raster",
    layerName: "wa-ygyx-2022",
    url: `http://192.168.30.86:2231/stservice/tile_xyz/1810193025096265729/{z}/{x}/{y}?ak=${ak}`,
    bounds: [
      // 114.04014588989796, 36.473202456016594, 114.04083253540585,
      // 37.022291112146476,
      12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
    ],
    crsCode: "EPSG:3857",
  },
  {
    id: 999,
    //name: "2023武安市遥感影像-M",
    name: "2023遥感影像-M",
    sourceType: "raster",
    layerType: "raster",
    layerName: "wa-ygyx-2023",
    url: `http://192.168.30.86:2231/stservice/tile_xyz/1811216125204148226/{z}/{x}/{y}?ak=${ak}`,
    bounds: [
      // 114.04014588989796, 36.473202456016594, 114.04083253540585,
      // 37.022291112146476,
      12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
    ],
    crsCode: "EPSG:3857",
  },
  // {
  //   id: 22,
  //   name: "2024武安市遥感影像-M",
  //   sourceType: "raster",
  //   layerType: "raster",
  //   layerName: "wa-ygyx-2024",
  //   url: `http://192.168.30.86:2231/stservice/tile_xyz/1821367875965816834/{z}/{x}/{y}?ak=${ak}`,
  //   extent: [
  //     114.04014588989796,36.473202456016594,114.04083253540585,37.022291112146476
  //     //12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
  //   ]
  // },
];
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
        {
          id: 1,
          //name: "小区",
          name: "POI",
          sourceType: "vector",
          layerType: "point",
          url: `http://106.119.74.112:2231/stservice/tile_vector/1819653822637809666/{z}/{x}/{y}?ak=${ak}`,
          mvtLayer: null,
          bounds: [
            12815702.063046811, 4339337.185487918, 12820523.677588403,
            4342118.149611221,
          ],
          crsCode: "EPSG:3857",
          renderOptions: {
            // 点渲染参数
            // 注记字段名称，不指定此字段，或者字段无效，将不显示注记
            textField: "名称",
            heightField: "高度",
            // minLabelNum: 500,
            // 是否显示点
            // showPoint: false,
            // 注记参数，详情参考 Cesium.Label.ConstructorOptions
            // pointImage: require('@/assets/iconImg/区片名.png'),
            pointTypeField: "类别",
            iconJson: pointIconJson,
            // color: Cesium.Color.RED,
            // outlineWidth: 3,
            // outlineColor: Cesium.Color.BLACK,
            textOptions: {
              fillColor: Cesium.Color.BLACK,
              outlineColor: Cesium.Color.WHITE,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -16),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 5,
              font: "20px sans-serif",
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              height: 100,
              disableDepthTestDistance: 10000000,
            },
          },
        },
        {
          id: 2,
          //name: "大名县城市道路",
          name: "线",
          sourceType: "vector",
          layerType: "polyline",
          url: `http://106.119.74.112:2231/stservice/tile_vector/1827229149723500545/{z}/{x}/{y}?ak=${ak}`,
          mvtLayer: null,
          bounds: [
            115.10990511263094, 36.2503638904812, 115.23108853710637,
            36.31885029680379,
          ],
          crsCode: "EPSG:4490",
          renderOptions: {
            // Polyline: {
            // color: Cesium.Color.RED,
            width: 6,
            // material: new Cesium.Material({
            //   fabric: {
            //     type: "Color",
            //     uniforms: {
            //       color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
            //     },
            //   },
            // }),
            // material: createRoundCapMaterial(Cesium.Color.YELLOW),
            // material: Cesium.Material.fromType(Cesium.Material.PolylineOutlineType),
            // material: Cesium.Material.fromType(Cesium.Material.RimLightingType),
            // material: Cesium.Material.fromType(Cesium.Material.PolylineDashType),
            material: createDashedLineMaterial(
              Cesium.Color.YELLOW,
              10.0 // 虚线长度
              // 20.0 // 间隔长度
            ),
            // },
          },
        },
        {
          id: 3,
          //name: "基本农田",
          name: "面",
          sourceType: "vector",
          layerType: "polygon",
          url: `http://106.119.74.112:2231/stservice/tile_vector/1829086581659672578/{z}/{x}/{y}?ak=${ak}`,
          // url: `http://106.119.74.112:2231/stservice/tile_vector/1829087081666846722/{z}/{x}/{y}?ak=${ak}`,
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
            //     material: new Cesium.Material({
            //       fabric: {
            //         type: "CustomPolygonWithBorder",
            //         uniforms: {
            //           fillColor: new Cesium.Color(1.0, 1.0, 0.0, 0.5), // 多边形填充颜色
            //           borderColor: new Cesium.Color(0.0, 1.0, 1.0, 0.5), // 边框颜色
            //           borderWidth: 2.0, // 边框宽度
            //         },
            //         source: `
            //         uniform vec4 fillColor;
            //         uniform vec4 borderColor;
            //         uniform float borderWidth;
            //   czm_material czm_getMaterial(czm_materialInput materialInput) {
            //     czm_material material = czm_getDefaultMaterial(materialInput);
            //     vec2 st = materialInput.st;
            //     vec3 pos = materialInput.positionToEyeEC;
            //     vec3 normal = normalize(materialInput.normalEC);
            //     vec3 lightDirection = normalize(czm_lightDirectionEC);

            //     // 计算法线方向上的距离
            //     float distanceToEdge = abs(dot(normal, pos));

            //     // 如果距离小于边框宽度，则绘制边框
            //     // if (distanceToEdge < borderWidth) {
            //     //   material.diffuse = borderColor;
            //     // } else {
            //     //   material.diffuse = fillColor;
            //     // }
            //     if (distanceToEdge < borderWidth) {
            //       material.diffuse = borderColor.rgb;
            //       material.alpha = borderColor.a;
            //     } else {
            //       material.diffuse = fillColor.rgb;
            //       material.alpha = fillColor.a;
            //     }

            //     return material;
            //   }
            // `,
            //       },
            //     }),
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
      ],
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
          url: `http://192.168.30.86:2231/stservice/tile_vector/1844294626165395457/{z}/{x}/{y}?ak=${ak}`,
          bounds: [113.7787893, 36.50141499, 114.3664393, 37.00680837],
          crsCode: "EPSG:4326",
          renderOptions: {
            // 点渲染参数
            // 注记字段名称，不指定此字段，或者字段无效，将不显示注记
            textField: "名称",
            heightField: "高度",
            // minLabelNum: 500,
            // 是否显示点
            // showPoint: false,
            // 注记参数，详情参考 Cesium.Label.ConstructorOptions
            // pointImage: require('@/assets/iconImg/区片名.png'),
            pointTypeField: "类别",
            iconJson: pointIconJson,
            // color: Cesium.Color.RED,
            // outlineWidth: 3,
            // outlineColor: Cesium.Color.BLACK,
            textOptions: {
              fillColor: Cesium.Color.BLACK,
              outlineColor: Cesium.Color.WHITE,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -16),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 5,
              font: "20px sans-serif",
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              height: 100,
              disableDepthTestDistance: 10000000,
            },
          },
        },
        // {
        //   id: 6,
        //   //name: "武安水系-线-矢量",
        //   name: "水系-线状",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   layerName: "river-vector",
        //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844311434670903297/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     113.76800680428391,36.499764391113786,114.37322605566361,37.00561862589893
        //   ],
        //   "source-layer": "t_1844311434670903297_130481RIVEline",
        //   lineOpacity: 0.2,
        // },
        // {
        //   id: 7,
        //   //name: "武安市水系-面-矢量",
        //   name: "水系-面状",
        //   sourceType: "vector",
        //   layerType: "polygon",
        //   layerName: "river-vector-polygon",
        //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844572938561392641/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     113.76754210800004,36.499638751459486,114.38185410200015,37.005720414325936
        //   ],
        //   "source-layer": "t_1844572938561392641_130481RIVEM",
        //   fillColor: '#00f',
        //   beforeLayer: 'river-vector',
        //   fillOpacity: 0.3,
        // },
        {
          id: 4,
          //name: "2023年主城区倾斜模型-0.02M",
          name: "倾斜模型-0.02M",
          sourceType: "3DTiles",
          layerType: "3DTiles",
          url: `http://192.168.30.86:2231/stservice/tile_3d/1843589927166545921/tileset.json?ak=${ak}`,
          // beforeLayer: 'river-vector-polygon'
        },
        {
          id: 5,
          //name: "2023年武安市主城区外倾斜模型-0.05M",
          name: "倾斜模型-0.05M",
          sourceType: "3DTiles",
          layerType: "3DTiles",
          url: `http://192.168.30.86:2231/stservice/tile_3d/1817101173400801281/tileset.json?ak=${ak}`,
          // beforeLayer: 'river-vector-polygon'
        },
        // {
        //   id: 8,
        //   //name: "武安市国道-矢量",
        //   name: "国道",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   layerName: "road-gd-vector",
        //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844625669758128130/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     113.86284698909739,36.627665274632875,114.31704212773843,37.00207058009313
        //   ],
        //   "source-layer": "t_1844625669758128130_130481GD",
        //   lineColor: "#f4a828",
        //   lineOpacity: 0.6,
        //   lineWidth: 10,
        //   textSize: 16,
        //   textColor: '#606066',
        //   textHaloColor: '#fff',
        // },
        // {
        //   id: 9,
        //   //name: "武安市高速-矢量",
        //   name: "高速路",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   layerName: "road-gs-vector",
        //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844640794871336961/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     113.86584113151113,36.56373898866013,114.29075124454205,36.8410595579523
        //   ],
        //   "source-layer": "t_1844640794871336961_130481GS",
        //   lineWidth: 8,
        //   lineColor: "#F4B004",
        //   lineOpacity: 0.6,
        //   textSize: 14,
        //   textColor: '#6D7073',
        //   textHaloColor: '#fff',
        // },
        // {
        //   id: 10,
        //   //name: "武安市省道-矢量",
        //   name: "省道",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   layerName: "road-sd-vector",
        //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844630139166527489/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     113.77685120529462,36.553185494814905,114.35975477241058,37.00206995956106
        //   ],
        //   "source-layer": "t_1844630139166527489_130481SD",
        //   lineColor: "#ffca8b",
        //   lineOpacity: 0.6,
        //   lineWidth: 8,
        //   textSize: 14,
        //   textColor: '#616167',
        //   textHaloColor: '#fff',
        // },
        // {
        //   id: 11,
        //   //name: "武安市县道-矢量",
        //   name: "县道",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   layerName: "road-xd-vector",
        //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844642759252643842/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     113.93860985506078,36.49525129990772,114.33090083718697,36.85860076011705
        //   ],
        //   "source-layer": "t_1844642759252643842_130481XD",
        //   lineWidth: 6,
        //   lineColor: "#EEDB6A",
        //   lineOpacity: 0.6,
        //   textSize: 12,
        //   textColor: '#6D7073',
        //   textHaloColor: '#fff',
        //   textMinzoom: 8,
        // },
        // {
        //   id: 12,
        //   //name: "武安市镇道-矢量",
        //   name: "镇道",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   layerName: "road-zd-vector",
        //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844642941440626689/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     113.90695034927924,36.56678394860369,114.26711145562925,36.799375741297574
        //   ],
        //   "source-layer": "t_1844642941440626689_130481ZD",
        //   lineWidth: 5,
        //   lineColor: "#EEDAA2",
        //   lineOpacity: 0.6,
        //   textSize: 11,
        //   textColor: '#6D7073',
        //   textHaloColor: '#fff',
        //   textMinzoom: 9,
        // },
        // {
        //   id: 13,
        //   //name: "武安市乡道-矢量",
        //   name: "乡道",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   layerName: "road-xiang-vector",
        //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844643101033893889/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     113.79920395629766,36.5001424292299,114.37362803822806,36.985223057698185
        //   ],
        //   "source-layer": "t_1844643101033893889_130481XIANGD",
        //   lineWidth: 5,
        //   lineColor: "#D5D4CE",
        //   lineOpacity: 0.6,
        //   textSize: 10,
        //   textColor: '#6D7073',
        //   textHaloColor: '#fff',
        //   textMinzoom: 12,
        // },
        // {
        //   id: 14,
        //   //name: "武安城市道路-矢量",
        //   name: "城市道路",
        //   sourceType: "vector",
        //   layerType: "polyline",
        //   layerName: "road-city-vector",
        //   url: `http://192.168.30.86:2231/stservice/tile_vector/1844620848334376962/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     114.0620111857678,36.546271949390935,114.3082551592296,36.849484126591264
        //   ],
        //   "source-layer": "t_1844620848334376962_130481CS",
        //   lineWidth: 5,
        //   lineColor: "#D5D4CE",
        //   lineOpacity: 0.6,
        //   textSize: 10,
        //   textColor: '#6D7073',
        //   textHaloColor: '#fff',
        //   textMinzoom: 12,
        // },
        {
          id: 15,
          //name: "武安市乡级行政区划注记-矢量",
          name: "乡级行政区划注记",
          sourceType: "vector",
          layerType: "point",
          url: `http://192.168.30.86:2231/stservice/tile_vector/1844649260113465345/{z}/{x}/{y}?ak=${ak}`,
          bounds: [
            113.81964943893493, 36.535741638640786, 114.33116285190125,
            36.92139131677028,
          ],
          // poiNameAttr: "XZQMC",
          // noIcon: true,
          // textColor: "#555555",
          // textSize: 16,
          // textHaloColor: "#fff",
          crsCode: "EPSG:4326",
          renderOptions: {
            // 点渲染参数
            // 注记字段名称，不指定此字段，或者字段无效，将不显示注记
            textField: "XZQMC",
            heightField: "高度",
            showPoint: false,
            textOptions: {
              fillColor: Cesium.Color.fromCssColorString("#555555"),
              outlineColor: Cesium.Color.fromCssColorString("#fff"),
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -16),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 5,
              font: "16px sans-serif",
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              height: 10,
              disableDepthTestDistance: 10000000,
            },
          },
        },
        {
          id: 16,
          //name: "武安市村级行政区划注记-矢量",
          name: "村级行政区划注记",
          sourceType: "vector",
          layerType: "point",
          layerName: "wa-cjxzq-poi",
          url: `http://192.168.30.86:2231/stservice/tile_vector/1844649631254843394/{z}/{x}/{y}?ak=${ak}`,
          bounds: [
            113.77027333859222, 36.490642506137746, 114.36644242782637,
            37.00909442477336,
          ],
          poiNameAttr: "XZQMC",
          // noIcon: true,
          minZoom: 12,
          // textColor: "#A9A9A9",
          // textSize: 13,
          // textHaloColor: "#fff",
          crsCode: "EPSG:4326",
          renderOptions: {
            // 点渲染参数
            // 注记字段名称，不指定此字段，或者字段无效，将不显示注记
            textField: "XZQMC",
            heightField: "高度",
            showPoint: false,
            textOptions: {
              fillColor: Cesium.Color.fromCssColorString("#A9A9A9"),
              outlineColor: Cesium.Color.fromCssColorString("#fff"),
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -16),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 5,
              font: "13px sans-serif",
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              height: 10,
              disableDepthTestDistance: 10000000,
            },
          },
        },
        {
          id: 995,
          //name: "2019武安市遥感影像-M",
          name: "2019遥感影像-M",
          sourceType: "raster",
          layerType: "raster",
          layerName: "wa-ygyx-2019",
          url: `http://192.168.30.86:2231/stservice/tile_xyz/1810142554721660929/{z}/{x}/{y}?ak=${ak}`,
          bounds: [
            // 114.04014588989796, 36.473202456016594, 114.04083253540585,
            // 37.022291112146476,
            12694890.968686927, 4365930.181592697, 12694967.405715212,
            4442214.335821303,
          ],
          crsCode: "EPSG:3857",
        },
        {
          id: 996,
          //name: "2020武安市遥感影像-M",
          name: "2020遥感影像-M",
          sourceType: "raster",
          layerType: "raster",
          layerName: "wa-ygyx-2020",
          url: `http://192.168.30.86:2231/stservice/tile_xyz/1810193413513981954/{z}/{x}/{y}?ak=${ak}`,
          bounds: [
            // 114.04014588989796, 36.473202456016594, 114.04083253540585,
            // 37.022291112146476,
            12694890.968686927, 4365930.181592697, 12694967.405715212,
            4442214.335821303,
          ],
          crsCode: "EPSG:3857",
        },
        {
          id: 997,
          //name: "2021武安市遥感影像-M",
          name: "2021遥感影像-M",
          sourceType: "raster",
          layerType: "raster",
          layerName: "wa-ygyx-2021",
          url: `http://192.168.30.86:2231/stservice/tile_xyz/1810193226867453953/{z}/{x}/{y}?ak=${ak}`,
          bounds: [
            // 114.04014588989796, 36.473202456016594, 114.04083253540585,
            // 37.022291112146476,
            12694890.968686927, 4365930.181592697, 12694967.405715212,
            4442214.335821303,
          ],
          crsCode: "EPSG:3857",
        },
        {
          id: 998,
          //name: "2022武安市遥感影像-M",
          name: "2022遥感影像-M",
          sourceType: "raster",
          layerType: "raster",
          layerName: "wa-ygyx-2022",
          url: `http://192.168.30.86:2231/stservice/tile_xyz/1810193025096265729/{z}/{x}/{y}?ak=${ak}`,
          bounds: [
            // 114.04014588989796, 36.473202456016594, 114.04083253540585,
            // 37.022291112146476,
            12694890.968686927, 4365930.181592697, 12694967.405715212,
            4442214.335821303,
          ],
          crsCode: "EPSG:3857",
        },
        {
          id: 999,
          //name: "2023武安市遥感影像-M",
          name: "2023遥感影像-M",
          sourceType: "raster",
          layerType: "raster",
          layerName: "wa-ygyx-2023",
          url: `http://192.168.30.86:2231/stservice/tile_xyz/1811216125204148226/{z}/{x}/{y}?ak=${ak}`,
          bounds: [
            // 114.04014588989796, 36.473202456016594, 114.04083253540585,
            // 37.022291112146476,
            12694890.968686927, 4365930.181592697, 12694967.405715212,
            4442214.335821303,
          ],
          crsCode: "EPSG:3857",
        },
        // {
        //   id: 22,
        //   name: "2024武安市遥感影像-M",
        //   sourceType: "raster",
        //   layerType: "raster",
        //   layerName: "wa-ygyx-2024",
        //   url: `http://192.168.30.86:2231/stservice/tile_xyz/1821367875965816834/{z}/{x}/{y}?ak=${ak}`,
        //   extent: [
        //     114.04014588989796,36.473202456016594,114.04083253540585,37.022291112146476
        //     //12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
        //   ]
        // },
      ],
    };
  },
  mounted() {
    // treeLayers
    this.treeData.forEach((i) => {
      treeLayers.push({
        layerName: i.name,
        mvtLayer: null,
        renderOptions: i.renderOptions,
      });
      delete i.renderOptions;
    });
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
        case "raster":
          this.addRasterLayer(i);
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
      // data.mvtLayer.show = itemCheck;
      const treeLayerObj = treeLayers.find((i) => i.layerName == data.name);
      treeLayerObj.mvtLayer.show = itemCheck;
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
      const treeLayerObj = treeLayers.find((i) => i.layerName == data.name);
      viewer.flyTo(treeLayerObj.mvtLayer);
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
      // data.mvtLayer = tileset;
      const treeLayerObj = treeLayers.find((i) => i.layerName == data.name);
      treeLayerObj.mvtLayer = tileset;
    },
    addTerrain() {},
    addMVTLayer(data) {
      const treeLayerObj = treeLayers.find((i) => i.layerName == data.name);
      const mvtp = new MVTDynamicPrimitive(viewer.scene, data.url, {
        renderOptions: treeLayerObj.renderOptions,
      });
      viewer.scene.primitives.add(mvtp);
      // data.mvtLayer = mvtp;
      treeLayerObj.mvtLayer = mvtp;
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
    addRasterLayer(data) {
      let tilingScheme = null;
      if (data.crsCode == "EPSG:3857") {
        tilingScheme = new Cesium.WebMercatorTilingScheme();
      } else {
        tilingScheme = new Cesium.GeographicTilingScheme();
      }
      const layer = viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: data.url, //服务地址
          tilingScheme: tilingScheme, // 3857
          // tilingScheme: new Cesium.WebMercatorTilingScheme(), // 3857
          // tilingScheme: new Cesium.GeographicTilingScheme(), // 4326
        })
      );
      const treeLayerObj = treeLayers.find((i) => i.layerName == data.name);
      treeLayerObj.mvtLayer = layer;
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
