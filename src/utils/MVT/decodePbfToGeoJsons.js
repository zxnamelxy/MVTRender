
import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';

/**
 * 根据pbf的url，获取数据，并转换为GeoJson数据
 * @param {*} pbfurl 
 * @param {*} level 
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
export default async function decodePbfToGeoJsons(pbfurl, level, x, y) {
    // var pbfurl = "https://demotiles.maplibre.org/tiles/3/7/2.pbf";
    // var pbfurl = "http://localhost:8084/api/v1/vector-tiles/f9daf1be8c864da1c9b4eb78fa5502fc/tiles/12/3346/1683"
    const td = await fetch(pbfurl);
    const data = await td.arrayBuffer();

    const tile = new VectorTile(new Protobuf(data));
    window.tile = tile;
    if (tile.layers) {

        var layerNames = Object.keys(tile.layers);
        if (layerNames.length > 0) {

            const resGS = [];

            for (let i = 0, il = layerNames.length; i < il; i++) {
                const layer = tile.layers[layerNames[i]];

                for (let j = 0, jl = layer.length; j < jl; j++) {
                    const geojson = layer.feature(j).toGeoJSON(x, y, level);
                    if (geojson) {
                        resGS.push(geojson);
                    }
                }

            }

            return resGS;
        }

        // const layers = tile.layers.fflayer
        // for (let i = 0, il = layers.length; i < il; i++) {
        //     const geojson = tile.layers.fflayer.feature(i).toGeoJSON(x, y, level);
        //     if (geojson) {
        //         resGS.push(geojson);
        //     }
        // }

        // return resGS;
    }

    return void 0
}
