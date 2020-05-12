define(["require", "exports", "esri/Color", "esri/renderers", "esri/request", "esri/geometry/SpatialReference", "esri/renderers/visualVariables/ColorVariable", "esri/views/3d/externalRenderers", "gl-matrix"], function (require, exports, EsriColor, renderers_1, esriRequest, SpatialReference, ColorVariable, externalRenderers_1, gl_matrix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Supported data sets: base name, data range, data unit
    // Used to populate the UI (dropdown and legend)
    exports.dataSets = {
        Pressure: ["Pf", -5.47185791, 3.22542578, "ΔkPa"],
        Precipitation: ["PRECIPf", 0, 16.72, "g"],
        Water: ["CLOUDf", 0, 3.32, "g/m³"],
        Temperature: ["TCf", -83.00402, 31.51576, "°C"],
        Wind: ["Wf", 0, 28.61434, "m/s vertical"]
    };
    // Use local data on a local checkout, fall back to hosted data:
    var localURL = "../isabeldata/";
    var remoteURL = "https://2019-devsummit-demo-data.s3.amazonaws.com/External-Volume-Renderer-Data/Isabel/";
    var dataSetURL = localURL;
    // Use double math for precision at global scale
    gl_matrix_1.glMatrix.ARRAY_TYPE = Float64Array;
    var VolumeRenderer = /** @class */ (function () {
        function VolumeRenderer(_view, _legendLayer) {
            this._view = _view;
            this._legendLayer = _legendLayer;
            this._localOriginRender = gl_matrix_1.vec3.create();
            this._size = gl_matrix_1.vec3.create();
            this._timeStep = 1;
            this._animating = false;
            this._updateColorMap = true;
        }
        VolumeRenderer.prototype.setup = function (context) {
            // Set up our state
            var renderer = new renderers_1.SimpleRenderer();
            renderer.visualVariables = [new ColorVariable({ field: "attr" })];
            this._legendLayer.renderer = renderer;
            this.data = "Pressure";
            // Set up volume renderer
            setupGL(context.gl);
            // Compute origin of data
            //   x (Longitude) coordinate runs from 83 W to 62 W (approx)
            //   y (Latitude) coordinate runs from 23.7 N to 41.7 N (approx)
            //   z (Vertical) coordinate runs from .035 KM to 19.835 KM (100 equally spaced levels with delta=.2 KM)
            var min = [83.2, -23.7, 0.035 * 1000];
            var max = [62.2, -41.7, 19.835 * 1000 * 30]; // exagerate height by 30x
            //   translate into renderer coordinate system
            externalRenderers_1.toRenderCoordinates(this._view, min, 0, SpatialReference.WGS84, min, 0, 1);
            externalRenderers_1.toRenderCoordinates(this._view, max, 0, SpatialReference.WGS84, max, 0, 1);
            gl_matrix_1.vec3.subtract(this._size, max, min); // compute size of volume for _loadVolume()
            var position = gl_matrix_1.vec3.create();
            gl_matrix_1.vec3.add(position, min, max);
            gl_matrix_1.vec3.scale(position, position, 0.5);
            externalRenderers_1.toRenderCoordinates(this._view, [0, 0, 0], 0, this._view.spatialReference, this._localOriginRender, 0, 1);
            gl_matrix_1.vec3.subtract(this._localOriginRender, this._localOriginRender, position);
            this._localOriginRender[2] += max[2];
        };
        VolumeRenderer.prototype.render = function (context) {
            var eye = gl_matrix_1.vec3.fromValues(context.camera.eye[0], context.camera.eye[1], context.camera.eye[2]);
            // move to data origin
            gl_matrix_1.vec3.subtract(position, eye, this._localOriginRender);
            gl_matrix_1.mat4.identity(viewProj);
            gl_matrix_1.mat4.translate(viewProj, viewProj, this._localOriginRender);
            gl_matrix_1.mat4.multiply(viewProj, context.camera.viewMatrix, viewProj);
            gl_matrix_1.mat4.multiply(viewProj, context.camera.projectionMatrix, viewProj);
            // raycast volume and reset state
            draw(viewProj, position);
            context.resetWebGLState();
        };
        /** @return true if animating after the change */
        VolumeRenderer.prototype.playPause = function () {
            this._animating = !this._animating;
            if (this._animating) {
                this._loadNextVolume();
            }
            return this._animating;
        };
        Object.defineProperty(VolumeRenderer.prototype, "data", {
            set: function (name) {
                this._data = exports.dataSets[name];
                this._updateColorMap = true;
                this._loadVolume();
            },
            enumerable: true,
            configurable: true
        });
        VolumeRenderer.prototype._loadNextVolume = function () {
            var nTimeSteps = 48;
            if (this._timeStep >= nTimeSteps) {
                this._timeStep = 0;
            }
            ++this._timeStep;
            this._loadVolume();
        };
        VolumeRenderer.prototype._loadVolume = function () {
            var _this = this;
            var sequence = this._timeStep < 10 ? "0" + this._timeStep : this._timeStep.toFixed(0);
            var filename = dataSetURL + this._data[0] + sequence + "_500x500x100_uint8.raw";
            selectVolume(filename, this._size, function () {
                if (_this._updateColorMap) {
                    _this._updateColorMap = false;
                    selectColormap(dataSetURL + _this._data[0] + ".png", function () {
                        _this._updateLegend();
                        externalRenderers_1.requestRender(_this._view);
                    });
                }
                else {
                    externalRenderers_1.requestRender(_this._view);
                }
                if (_this._animating) {
                    setTimeout(function () { return _this._loadNextVolume(); }, 0);
                }
            }, function () {
                if (dataSetURL === localURL) {
                    dataSetURL = remoteURL; // fall back to remote URL if local data is missing
                    _this._loadVolume();
                }
            });
        };
        // Update the legend for the transfer function.
        // We do use a dummy FeatureLayer here, for which we create a renderer with a color ramp
        // from the transfer function image. This renderer and color ramp will then be rendered
        // automatically by the Legend implementation.
        VolumeRenderer.prototype._updateLegend = function () {
            var _this = this;
            var image = new Image();
            esriRequest(dataSetURL + this._data[0] + ".png", {
                authMode: "anonymous",
                method: "get",
                responseType: "image"
            }).then(function (response) {
                var image = response.data;
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                context.drawImage(image, 0, 0);
                var pixels = context.getImageData(0, 0, 180, 1).data;
                var stops = new Array(pixels.length / 4);
                var min = _this._data[1];
                var max = _this._data[2];
                var valueStep = (max - min) / pixels.length;
                for (var i = 0; i < pixels.length; i += 4) {
                    stops[i / 4] = {
                        value: (min + i * valueStep).toFixed(1),
                        label: "",
                        color: new EsriColor([pixels[i + 0], pixels[i + 1], pixels[i + 2], 1])
                    };
                }
                stops[0].label = min.toFixed(1) + " " + _this._data[3];
                stops[stops.length - 1].label = max.toFixed(1) + " " + _this._data[3];
                var renderer = _this._legendLayer.renderer.clone();
                renderer.visualVariables[0].stops = stops;
                _this._legendLayer.renderer = renderer;
            });
        };
        return VolumeRenderer;
    }());
    exports.VolumeRenderer = VolumeRenderer;
    var viewProj = gl_matrix_1.mat4.create();
    var position = gl_matrix_1.vec3.create();
});
//# sourceMappingURL=VolumeRenderer.js.map