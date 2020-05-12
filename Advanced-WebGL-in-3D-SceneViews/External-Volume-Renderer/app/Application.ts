import { VolumeRenderer, dataSets } from "./VolumeRenderer";

// esri
import Camera = require("esri/Camera");
import { Point } from "esri/geometry";
import Map = require("esri/Map");

// esri.geometry
import SpatialReference = require("esri/geometry/SpatialReference");

// esri.layers
import FeatureLayer = require("esri/layers/FeatureLayer");

// esri.views
import SceneView = require("esri/views/SceneView");

// esri.views.3d
import { add as addExternalRenderer } from "esri/views/3d/externalRenderers";

// esri.widgets
import Legend = require("esri/widgets/Legend");

class Application {
  view: SceneView;

  constructor() {
    const legendLayer = new FeatureLayer({
      source: [
        {
          geometry: new Point({ x: -7702261, y: 3522600, spatialReference }),
          attributes: { id: 1 }
        }
      ],
      objectIdField: "id"
    });

    this.view = new SceneView({
      camera: {
        position: { spatialReference, x: -8519711, y: 269771, z: 3016702 },
        heading: 0,
        tilt: 53
      },
      container: "view",
      viewingMode: "local",
      map: new Map({ basemap: "satellite", layers: [legendLayer] }),
      environment: {
        background: { type: "color", color: [255, 244, 252, 1] },
        starsEnabled: false,
        atmosphereEnabled: false // Atmosphere would overwrite volume rendering
      }
    });

    const legend = new Legend({ view: this.view });
    legend.layerInfos = [
      {
        layer: legendLayer,
        title:
          "Hurricane Isabel data produced by the Weather Research and Forecast (WRF) model, courtesy of NCAR, and the U.S. National Science Foundation (NSF)"
      }
    ];

    this.view.ui.add(legend, "top-right"); // Add legend to the bottom right corner of the view
    this.view.ui.add("filterbyAttributes", "top-right"); // Data set list to top right
    this.view.ui.add("playButton", "top-left"); // Play/pause to top left
    this.view["renderContext"] = "webgl2"; // Needed for 3D textures: this is an internal, unsupported API as of now.

    // Instantiate and add external volume renderer
    const renderer = new VolumeRenderer(this.view, legendLayer);
    addExternalRenderer(this.view, renderer);

    // camera animation targets on 'n'
    const targets = [
      Camera.fromJSON({
        position: { spatialReference, x: -8165709, y: 1392677, z: 102038 },
        heading: 0,
        tilt: 87
      }),
      Camera.fromJSON({
        position: { spatialReference, x: -10810212, y: 5227877, z: 2480553 },
        heading: 114,
        tilt: 53
      }),
      Camera.fromJSON({
        heading: 0,
        position: { spatialReference, x: -8171928, y: 3729895, z: 3889699 },
        tilt: 0
      }),
      this.view.camera.clone()
    ];
    let target = 0;

    this.view.on("key-down", event => {
      switch (event.key) {
        case "b":
        case " ":
          event.stopPropagation();
          renderer.playPause();
          break;

        case "n":
          event.stopPropagation();
          this.view.goTo(targets[target]);
          target = (target + 1) % targets.length;
      }
    });

    // Populate drop-down with available data sets
    const dataList = document.getElementById("dataList");

    for (const dataSet of Object.keys(dataSets)) {
      const field = document.createElement("option");
      field.textContent = dataSet;
      field.value = dataSet;
      dataList.appendChild(field);
    }

    dataList.onchange = () => {
      const aa = dataList as HTMLOptionElement;
      renderer.data = aa.value;
    };

    const playButton = document.getElementById("playButton");
    const icon = document.getElementById("playButtonIcon");
    playButton.addEventListener("click", () => {
      const playing = renderer.playPause();
      icon.className = playing ? "esri-icon-pause" :"esri-icon-play";
    });

    window["app"] = this;
    window["view"] = this.view;
  }
}

const spatialReference = SpatialReference.WebMercator;

export = Application;
