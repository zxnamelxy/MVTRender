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
const local = window.location.origin;
const pathname = window.location.pathname;
const ak = '';
import "cesium/Build/Cesium/Widgets/widgets.css"
import * as Cesium from 'cesium';

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
          id: 2,
          //name: "武安兴趣点POI",
          name: "兴趣点POI",
          sourceType: "vector",
          layerType: "point",
          layerName: "wa-poi",
          url: `http://192.168.30.86:2231/stservice/tile_vector/1844294626165395457/{z}/{x}/{y}?ak=${ak}`,
          extent: [
            113.7787893,36.50141499,114.3664393,37.00680837
          ],
          "source-layer": "t_1844294626165395457_130481POI",
          poiNameAttr: "名称",
          poiTypeAttr: "类别",
        },
      ],
      view: null,
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      this.view = new Cesium.Viewer('map');
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
    },
    checkChange(data, itemCheck) {
    },
    nodeClick(data, node, event) {
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
    },
    addPolygon(data) {
    },
    addPolyLine(data) {
    },
    addPoint(data) {
      // const imgFilter = [
      //   "match",
      //   ["get", data.poiTypeAttr || ''],
      //   "小学",
      //   "小学",
      //   "初中",
      //   "初中",
      //   "高中",
      //   "高中",
      //   "加油站",
      //   "加油站",
      //   "厂矿企业",
      //   "厂矿企业",
      //   "乡镇级党政机关",
      //   "乡镇级党政机关",
      //   "公司",
      //   "公司",
      //   "区片名",
      //   "区片名",
      //   "综合医院",
      //   "综合医院",
      //   "区县级事业单位",
      //   "区县级事业单位",
      //   "交警队",
      //   "交警队",
      //   "精神病医院",
      //   "精神病医院",
      //   "产业园区",
      //   "产业园区",
      //   "职业技术学校",
      //   "职业技术学校",
      //   "城市广场",
      //   "城市广场",
      //   "商业大厦、写字楼",
      //   "商业大厦、写字楼",
      //   "康复医院",
      //   "康复医院",
      //   "批发市场",
      //   "批发市场",
      //   "商住两用楼",
      //   "商住两用楼",
      //   "眼科医院",
      //   "眼科医院",
      //   "学校",
      //   "学校",
      //   "区片名", // 默认图标
      // ]
    },
    addRasterLayer(data){
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
