//  3857 转 4326
function mercatorTolonlat (mercator) {
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
}

const arr = [{ x: 12694890.968686927, y: 4365930.181592697 }, { x: 12694967.405715212, y: 4442214.335821303 }]
// 12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
const n = arr.map(i => {
    return mercatorTolonlat(i)
})
// console.log(n);

// 
const arr2 = [114.04014588989796,36.473202456016594,114.04083253540585,37.022291112146476]
const a1 = arr2[2] - arr2[0]
const a2 = arr2[3] - arr2[1]

// console.log(a1, a2);
console.log(arr2[0] + a1);
console.log(arr2[1] + a2);

// const json = [
//     // {
//     //   id: 1,
//     //   name: "行政区划",
//     //   sourceType: "vector",
//     //   layerType: "polygon",
//     //   layerName: "provinces-vector",
//     //   url: `http://106.119.74.112:2231/stservice/tile_vector/1799340413598027778/{z}/{x}/{y}?ak=${ak}`,
//     //   extent: [
//     //     114.97053716500625, 36.085511126679364, 115.48131798576651,
//     //     36.50483379810703,
//     //   ],
//     //   "source-layer": "t_1799340413598027778_县级行政区",
//     // },
//     {
//         id: 2,
//         //name: "武安兴趣点POI",
//         name: "兴趣点POI",
//         sourceType: "vector",
//         layerType: "point",
//         layerName: "wa-poi",
//         url: `http://192.168.30.86:2231/stservice/tile_vector/1844294626165395457/{z}/{x}/{y}?ak=${ak}`,
//         extent: [
//             113.7787893, 36.50141499, 114.3664393, 37.00680837
//         ],
//         "source-layer": "t_1844294626165395457_130481POI",
//         poiNameAttr: "名称",
//         poiTypeAttr: "类别",
//     },
//     {
//         name: '水系',
//         children: [
//             {
//                 id: 6,
//                 //name: "武安水系-线-矢量",
//                 name: "水系-线状",
//                 sourceType: "vector",
//                 layerType: "polyline",
//                 layerName: "river-vector",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844311434670903297/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.76800680428391, 36.499764391113786, 114.37322605566361, 37.00561862589893
//                 ],
//                 "source-layer": "t_1844311434670903297_130481RIVEline",
//             },
//             {
//                 id: 7,
//                 //name: "武安市水系-面-矢量",
//                 name: "水系-面状",
//                 sourceType: "vector",
//                 layerType: "polygon",
//                 layerName: "river-vector-polygon",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844572938561392641/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.76754210800004, 36.499638751459486, 114.38185410200015, 37.005720414325936
//                 ],
//                 "source-layer": "t_1844572938561392641_130481RIVEM",
//                 fillColor: '#81c5f8',
//                 fillOpacity: 1,
//                 beforeLayer: 'river-vector'
//             },
//         ]
//     },
//     {
//         name: '倾斜模型',
//         children: [
//             {
//                 id: 4,
//                 //name: "2023年主城区倾斜模型-0.02M",
//                 name: "2023年武安市主城区倾斜模型-0.02M",
//                 sourceType: "3DTiles",
//                 layerType: "3DTiles",
//                 layerName: "wanModel",
//                 url: `http://192.168.30.86:2231/stservice/tile_3d/1843589927166545921/tileset.json?ak=${ak}`,
//                 beforeLayer: 'river-vector-polygon'
//             },
//             {
//                 id: 5,
//                 //name: "2023年武安市主城区外倾斜模型-0.05M",
//                 name: "2023年主城区外倾斜模型-0.05M",
//                 sourceType: "3DTiles",
//                 layerType: "3DTiles",
//                 layerName: "wawModel",
//                 url: `http://192.168.30.86:2231/stservice/tile_3d/1817101173400801281/tileset.json?ak=${ak}`,
//                 beforeLayer: 'river-vector-polygon'
//             },
//         ]
//     },
//     {
//         name: '道路',
//         children: [
//             {
//                 id: 8,
//                 //name: "武安市国道-矢量",
//                 name: "国道",
//                 sourceType: "vector",
//                 layerType: "polyline",
//                 layerName: "road-gd-vector",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844625669758128130/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.86284698909739, 36.627665274632875, 114.31704212773843, 37.00207058009313
//                 ],
//                 "source-layer": "t_1844625669758128130_130481GD",
//                 lineColor: "#f4a828",
//                 lineWidth: 10,
//                 textSize: 16,
//                 textColor: '#606066',
//                 textHaloColor: '#fff',
//             },
//             {
//                 id: 9,
//                 //name: "武安市高速-矢量",
//                 name: "高速路",
//                 sourceType: "vector",
//                 layerType: "polyline",
//                 layerName: "road-gs-vector",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844640794871336961/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.86584113151113, 36.56373898866013, 114.29075124454205, 36.8410595579523
//                 ],
//                 "source-layer": "t_1844640794871336961_130481GS",
//                 lineWidth: 8,
//                 lineColor: "#F4B004",
//                 textSize: 14,
//                 textColor: '#6D7073',
//                 textHaloColor: '#fff',
//             },
//             {
//                 id: 10,
//                 //name: "武安市省道-矢量",
//                 name: "省道",
//                 sourceType: "vector",
//                 layerType: "polyline",
//                 layerName: "road-sd-vector",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844630139166527489/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.77685120529462, 36.553185494814905, 114.35975477241058, 37.00206995956106
//                 ],
//                 "source-layer": "t_1844630139166527489_130481SD",
//                 lineColor: "#ffca8b",
//                 lineWidth: 8,
//                 textSize: 14,
//                 textColor: '#616167',
//                 textHaloColor: '#fff',
//             },
//             {
//                 id: 11,
//                 //name: "武安市县道-矢量",
//                 name: "县道",
//                 sourceType: "vector",
//                 layerType: "polyline",
//                 layerName: "road-xd-vector",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844642759252643842/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.93860985506078, 36.49525129990772, 114.33090083718697, 36.85860076011705
//                 ],
//                 "source-layer": "t_1844642759252643842_130481XD",
//                 lineWidth: 6,
//                 lineColor: "#EEDB6A",
//                 textSize: 12,
//                 textColor: '#6D7073',
//                 textHaloColor: '#fff',
//                 textMinzoom: 8,
//             },
//             {
//                 id: 12,
//                 //name: "武安市镇道-矢量",
//                 name: "镇道",
//                 sourceType: "vector",
//                 layerType: "polyline",
//                 layerName: "road-zd-vector",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844642941440626689/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.90695034927924, 36.56678394860369, 114.26711145562925, 36.799375741297574
//                 ],
//                 "source-layer": "t_1844642941440626689_130481ZD",
//                 lineWidth: 4,
//                 lineColor: "#EEDAA2",
//                 textSize: 11,
//                 textColor: '#6D7073',
//                 textHaloColor: '#fff',
//                 textMinzoom: 9,
//             },
//             {
//                 id: 13,
//                 //name: "武安市乡道-矢量",
//                 name: "乡道",
//                 sourceType: "vector",
//                 layerType: "polyline",
//                 layerName: "road-xiang-vector",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844643101033893889/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.79920395629766, 36.5001424292299, 114.37362803822806, 36.985223057698185
//                 ],
//                 "source-layer": "t_1844643101033893889_130481XIANGD",
//                 lineWidth: 2,
//                 lineColor: "#D5D4CE",
//                 textSize: 10,
//                 textColor: '#6D7073',
//                 textHaloColor: '#fff',
//                 textMinzoom: 12,
//             },
//             {
//                 id: 14,
//                 //name: "武安城市道路-矢量",
//                 name: "城市道路",
//                 sourceType: "vector",
//                 layerType: "polyline",
//                 layerName: "road-city-vector",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844620848334376962/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     114.0620111857678, 36.546271949390935, 114.3082551592296, 36.849484126591264
//                 ],
//                 "source-layer": "t_1844620848334376962_130481CS",
//                 lineWidth: 2,
//                 lineColor: "#D5D4CE",
//                 textSize: 10,
//                 textColor: '#6D7073',
//                 textHaloColor: '#fff',
//                 textMinzoom: 12,
//             },
//         ]
//     },
//     {
//         name: '注记',
//         children: [
//             {
//                 id: 15,
//                 //name: "武安市乡级行政区划注记-矢量",
//                 name: "乡级行政区划注记",
//                 sourceType: "vector",
//                 layerType: "point",
//                 layerName: "wa-xjxzq-poi",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844649260113465345/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.81964943893493, 36.535741638640786, 114.33116285190125, 36.92139131677028
//                 ],
//                 "source-layer": "t_1844649260113465345_130481XZJXDZJ",
//                 poiNameAttr: "XZQMC",
//                 noIcon: true,
//                 textColor: '#555555',
//                 textSize: 16,
//                 textHaloColor: '#fff'
//             },
//             {
//                 id: 16,
//                 //name: "武安市村级行政区划注记-矢量",
//                 name: "村级行政区划注记",
//                 sourceType: "vector",
//                 layerType: "point",
//                 layerName: "wa-cjxzq-poi",
//                 url: `http://192.168.30.86:2231/stservice/tile_vector/1844649631254843394/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     113.77027333859222, 36.490642506137746, 114.36644242782637, 37.00909442477336
//                 ],
//                 "source-layer": "t_1844649631254843394_130481CUND",
//                 poiNameAttr: "XZQMC",
//                 noIcon: true,
//                 minzoom: 12,
//                 textColor: '#A9A9A9',
//                 textSize: 13,
//                 textHaloColor: '#fff'
//             },
//         ]
//     },
//     {
//         name: '遥感影像',
//         children: [
//             {
//                 id: 995,
//                 //name: "2019武安市遥感影像-M",
//                 name: "2019遥感影像-M",
//                 sourceType: "raster",
//                 layerType: "raster",
//                 layerName: "wa-ygyx-2019",
//                 url: `http://192.168.30.86:2231/stservice/tile_xyz/1810142554721660929/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     114.04014588989796, 36.473202456016594, 114.04083253540585, 37.022291112146476
//                     //12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
//                 ]
//             },
//             {
//                 id: 996,
//                 //name: "2020武安市遥感影像-M",
//                 name: "2020遥感影像-M",
//                 sourceType: "raster",
//                 layerType: "raster",
//                 layerName: "wa-ygyx-2020",
//                 url: `http://192.168.30.86:2231/stservice/tile_xyz/1810193413513981954/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     114.04014588989796, 36.473202456016594, 114.04083253540585, 37.022291112146476
//                     //12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
//                 ]
//             },
//             {
//                 id: 997,
//                 //name: "2021武安市遥感影像-M",
//                 name: "2021遥感影像-M",
//                 sourceType: "raster",
//                 layerType: "raster",
//                 layerName: "wa-ygyx-2021",
//                 url: `http://192.168.30.86:2231/stservice/tile_xyz/1810193226867453953/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     114.04014588989796, 36.473202456016594, 114.04083253540585, 37.022291112146476
//                     //12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
//                 ]
//             },
//             {
//                 id: 998,
//                 //name: "2022武安市遥感影像-M",
//                 name: "2022遥感影像-M",
//                 sourceType: "raster",
//                 layerType: "raster",
//                 layerName: "wa-ygyx-2022",
//                 url: `http://192.168.30.86:2231/stservice/tile_xyz/1810193025096265729/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     114.04014588989796, 36.473202456016594, 114.04083253540585, 37.022291112146476
//                     //12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
//                 ]
//             },
//             {
//                 id: 999,
//                 //name: "2023武安市遥感影像-M",
//                 name: "2023遥感影像-M",
//                 sourceType: "raster",
//                 layerType: "raster",
//                 layerName: "wa-ygyx-2023",
//                 url: `http://192.168.30.86:2231/stservice/tile_xyz/1811216125204148226/{z}/{x}/{y}?ak=${ak}`,
//                 extent: [
//                     114.04014588989796, 36.473202456016594, 114.04083253540585, 37.022291112146476
//                     //12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
//                 ]
//             },
//             // {
//             //   id: 22,
//             //   name: "2024武安市遥感影像-M",
//             //   sourceType: "raster",
//             //   layerType: "raster",
//             //   layerName: "wa-ygyx-2024",
//             //   url: `http://192.168.30.86:2231/stservice/tile_xyz/1821367875965816834/{z}/{x}/{y}?ak=${ak}`,
//             //   extent: [
//             //     114.04014588989796,36.473202456016594,114.04083253540585,37.022291112146476
//             //     //12694890.968686927,4365930.181592697,12694967.405715212,4442214.335821303
//             //   ]
//             // },
//         ]
//     }
// ]