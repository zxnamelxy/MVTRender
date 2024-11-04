<template>
    <div>
      <div class="home" id="map"></div>
    </div>
  </template>
  
  <script>
  import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
  import "mapbox-gl/dist/mapbox-gl.css";
  mapboxgl.accessToken =
    "pk.eyJ1IjoiemtnNjQyIiwiYSI6ImNpdHdianY5ZTAwNnIyb240ZWxiaThqbmQifQ.uC2N1F0FvBMTE7CeTfvbIw";
  import { MapboxOverlay, MapboxLayer } from "@deck.gl/mapbox";
  import { Tile3DLayer } from "@deck.gl/geo-layers";
  import { CesiumIonLoader } from "@loaders.gl/3d-tiles";
  const ION_ACCESS_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZjJiMTE2OS1lYzAwLTRlODEtYjAyYy01MTE2YTBmMTNjNGMiLCJpZCI6MTk1OTkxLCJpYXQiOjE3MDgxMzQ5NjR9.O4FIGMW_v4OxAm2GTsiwllrQ7DehNBLbodUk_eSZo-E";
  
  export default {
    name: "HomeView",
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
      };
    },
    mounted() {
      this.initMap();
    },
    methods: {
      initMap() {
        const map = new mapboxgl.Map({
          container: "map", // container ID
          style: "mapbox://styles/mapbox/streets-v12", // style URL
          center: [104.218439, 37.636502], // starting position [lng, lat]
          zoom: 3.5, // starting zoom
        });
        this.map = map;
        map.on("load", () => {
          const position = [
            108.959389691493, 34.219584095229145, 430.59174492256886,
          ];
          const tile3dLayer = new MapboxLayer({
            type: Tile3DLayer,
            id: "dyt",
            data: "http://localhost:8080/大雁塔/tileset.json",
            loader: CesiumIonLoader,
            loadOptions: {
              tileset: {
                throttleRequests: false,
              },
              "cesium-ion": { accessToken: ION_ACCESS_TOKEN },
            },
          });
          map.addLayer(tile3dLayer);
          this.map.jumpTo({
            center: [position[0], position[1]],
            zoom: position[2],
          });
        });
      },
    },
  };
  </script>
  
  <style>
  #map {
    width: 100vw;
    height: 100vh;
  }
  </style>
  