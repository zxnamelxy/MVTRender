<template>
  <VueDeckgl :layers="layers"
             class="vc"
             :viewState="viewState"
             @view-state-change="updateViewState">
    <div id="map"
         ref="map"></div>
  </VueDeckgl>
</template>

<script>
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { CesiumIonLoader } from '@loaders.gl/3d-tiles';


import mapboxgl from "mapbox-gl";
import VueDeckgl from 'vue-deck.gl'

export default {
  components: {
    VueDeckgl
  },
  data () {

    return {
      accessToken: 'pk.eyJ1IjoiaWxZWt4bDFncGI3ZjYifQ.Pu9l94qL1MEDdDim2-s6RA',//replace with your token
      mapStyle: "mapbox://styles/haxzie/ck0aryyna2lwq1crp7fwpm5vz",
      viewState: {
        latitude: 30.5,
        longitude: 121,
        zoom: 4,
        bearing: 0,
        pitch: 0,
      },
    };
  },
  computed: {
    layers () {
      const layer = new Tile3DLayer({
        id: 'tile-3d-layer',
        data: 'tileset.json',//replace with your tileset
        loader: CesiumIonLoader,
        loadOptions: {
          // 'cesium-ion': { accessToken: 'eyJhbGciOiJIUzI1'  }//replace with your token
   
        },
        onTileError: (err) => {
          console.log(err)
        },
        onTilesetLoad: (tileset) => {
          tileset
          const { cartographicCenter, zoom } = tileset;
          this.viewState = {
            ...this.viewState,
            longitude: cartographicCenter[0],
            latitude: cartographicCenter[1],
            zoom
          }
        },
        _subLayerProps: {
          'scenegraph': { _lighting: "flat" }
        }

      })
      return [layer];
    },
  },
  created () {
    // We need to set mapbox-gl library here in order to use it in template
    this.map = null;
  },
  methods: {
    updateViewState (viewState) {
      console.log("updating view state...");
      this.viewState = {
        ...viewState
      }
      this.map.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        bearing: viewState.bearing,
        pitch: viewState.pitch,
      });
    },
    hnadleClick () {
      console.log('a')
    }
  },
  mounted () {
    // creating the map
    this.map = new mapboxgl.Map({
      accessToken: this.accessToken,
      container: this.$refs.map,
      interactive: false,
      style:
        this.mapStyle || "mapbox://styles/haxzie/ck7h838qb0bik1iofe0k2i3f2",
      center: [this.viewState.longitude, this.viewState.latitude],
      zoom: this.viewState.zoom,
      pitch: this.viewState.pitch,
      bearing: this.viewState.bearing,
    });

    // setTimeout(() => {
    //   const { latitude, longitude, pitch, bearing } = this.viewState;
    //   this.viewState = {
    //     latitude,
    //     longitude,
    //     pitch,
    //     bearing,
    //     zoom: 12,
    //     transitionDuration: 3000,
    //   };
    // }, 5000);
  },
};
</script>

<style lang="css">
#map,
.vc {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #e5e9ec;
  overflow: hidden;
}
</style>
