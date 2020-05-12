define(["require", "exports", "./VolumeRenderer", "esri/Camera", "esri/geometry", "esri/Map", "esri/geometry/SpatialReference", "esri/layers/FeatureLayer", "esri/views/SceneView", "esri/views/3d/externalRenderers", "esri/widgets/Legend"], function (require, exports, VolumeRenderer_1, Camera, geometry_1, Map, SpatialReference, FeatureLayer, SceneView, externalRenderers_1, Legend) {
    "use strict";
    var Application = /** @class */ (function () {
        function Application() {
            var _this = this;
            var legendLayer = new FeatureLayer({
                source: [
                    {
                        geometry: new geometry_1.Point({ x: -7702261, y: 3522600, spatialReference: spatialReference }),
                        attributes: { id: 1 }
                    }
                ],
                objectIdField: "id"
            });
            this.view = new SceneView({
                camera: {
                    position: { spatialReference: spatialReference, x: -8519711, y: 269771, z: 3016702 },
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
            var legend = new Legend({ view: this.view });
            legend.layerInfos = [
                {
                    layer: legendLayer,
                    title: "Hurricane Isabel data produced by the Weather Research and Forecast (WRF) model, courtesy of NCAR, and the U.S. National Science Foundation (NSF)"
                }
            ];
            this.view.ui.add(legend, "top-right"); // Add legend to the bottom right corner of the view
            this.view.ui.add("filterbyAttributes", "top-right"); // Data set list to top right
            this.view.ui.add("playButton", "top-left"); // Play/pause to top left
            this.view["renderContext"] = "webgl2"; // Needed for 3D textures: this is an internal, unsupported API as of now.
            // Instantiate and add external volume renderer
            var renderer = new VolumeRenderer_1.VolumeRenderer(this.view, legendLayer);
            externalRenderers_1.add(this.view, renderer);
            // camera animation targets on 'n'
            var targets = [
                Camera.fromJSON({
                    position: { spatialReference: spatialReference, x: -8165709, y: 1392677, z: 102038 },
                    heading: 0,
                    tilt: 87
                }),
                Camera.fromJSON({
                    position: { spatialReference: spatialReference, x: -10810212, y: 5227877, z: 2480553 },
                    heading: 114,
                    tilt: 53
                }),
                Camera.fromJSON({
                    heading: 0,
                    position: { spatialReference: spatialReference, x: -8171928, y: 3729895, z: 3889699 },
                    tilt: 0
                }),
                this.view.camera.clone()
            ];
            var target = 0;
            this.view.on("key-down", function (event) {
                switch (event.key) {
                    case "b":
                    case " ":
                        event.stopPropagation();
                        renderer.playPause();
                        break;
                    case "n":
                        event.stopPropagation();
                        _this.view.goTo(targets[target]);
                        target = (target + 1) % targets.length;
                }
            });
            // Populate drop-down with available data sets
            var dataList = document.getElementById("dataList");
            for (var _i = 0, _a = Object.keys(VolumeRenderer_1.dataSets); _i < _a.length; _i++) {
                var dataSet = _a[_i];
                var field = document.createElement("option");
                field.textContent = dataSet;
                field.value = dataSet;
                dataList.appendChild(field);
            }
            dataList.onchange = function () {
                var aa = dataList;
                renderer.data = aa.value;
            };
            var playButton = document.getElementById("playButton");
            var icon = document.getElementById("playButtonIcon");
            playButton.addEventListener("click", function () {
                var playing = renderer.playPause();
                icon.className = playing ? "esri-icon-pause" : "esri-icon-play";
            });
            window["app"] = this;
            window["view"] = this.view;
        }
        return Application;
    }());
    var spatialReference = SpatialReference.WebMercator;
    return Application;
});
//# sourceMappingURL=Application.js.map