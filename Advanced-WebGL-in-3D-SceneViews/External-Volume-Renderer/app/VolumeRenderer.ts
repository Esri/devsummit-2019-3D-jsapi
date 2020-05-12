// esri
import EsriColor = require("esri/Color");
import { SimpleRenderer } from "esri/renderers";
import esriRequest = require("esri/request");

// esri.geometry
import SpatialReference = require("esri/geometry/SpatialReference");

// esri.layers
import FeatureLayer = require("esri/layers/FeatureLayer");

// esri.renderers.visualVariables
import ColorVariable = require("esri/renderers/visualVariables/ColorVariable");

// esri.views
import SceneView = require("esri/views/SceneView");

// esri.views.3d
import {
  toRenderCoordinates,
  fromRenderCoordinates,
  requestRender
} from "esri/views/3d/externalRenderers";

// esri.widgets
import Legend = require("esri/widgets/Legend");

// gl-matrix
import { mat4, vec3, glMatrix } from "gl-matrix";

// Supported data sets: base name, data range, data unit
// Used to populate the UI (dropdown and legend)
export const dataSets = {
  Pressure: ["Pf", -5.47185791, 3.22542578, "ΔkPa"],
  Precipitation: ["PRECIPf", 0, 16.72, "g"],
  Water: ["CLOUDf", 0, 3.32, "g/m³"],
  Temperature: ["TCf", -83.00402, 31.51576, "°C"],
  Wind: ["Wf", 0, 28.61434, "m/s vertical"]
};

// webgl-volume-raycaster API definitions:
declare var setupGL: (gl: WebGLRenderingContext) => void;
declare var selectVolume: (
  file: string,
  size: vec3,
  done: () => void,
  error: () => void
) => void;
declare var selectColormap: (file: string, done: () => void) => void;
declare var draw: (projView: mat4, eye: vec3) => void;

// Use local data on a local checkout, fall back to hosted data:
const localURL = "../isabeldata/";
const remoteURL = "https://2019-devsummit-demo-data.s3.amazonaws.com/External-Volume-Renderer-Data/Isabel/";
let dataSetURL = localURL;

// Use double math for precision at global scale
glMatrix.ARRAY_TYPE = Float64Array;

// Fix typings missing in the 4.10 API:
type RenderContext = __esri.RenderContext;
type ExternalRenderer = __esri.ExternalRenderer;

export class VolumeRenderer implements ExternalRenderer {
  constructor(private _view: SceneView, private _legendLayer: FeatureLayer) {}

  setup(context: RenderContext): void {
    // Set up our state
    const renderer = new SimpleRenderer();
    renderer.visualVariables = [new ColorVariable({ field: "attr" })];
    this._legendLayer.renderer = renderer;
    this.data = "Pressure";

    // Set up volume renderer
    setupGL(context.gl);

    // Compute origin of data
    //   x (Longitude) coordinate runs from 83 W to 62 W (approx)
    //   y (Latitude) coordinate runs from 23.7 N to 41.7 N (approx)
    //   z (Vertical) coordinate runs from .035 KM to 19.835 KM (100 equally spaced levels with delta=.2 KM)
    const min = [83.2, -23.7, 0.035 * 1000];
    const max = [62.2, -41.7, 19.835 * 1000 * 30]; // exagerate height by 30x

    //   translate into renderer coordinate system
    toRenderCoordinates(this._view, min, 0, SpatialReference.WGS84, min, 0, 1);
    toRenderCoordinates(this._view, max, 0, SpatialReference.WGS84, max, 0, 1);

    vec3.subtract(this._size, max, min); // compute size of volume for _loadVolume()

    const position = vec3.create();
    vec3.add(position, min, max);
    vec3.scale(position, position, 0.5);

    toRenderCoordinates(
      this._view,
      [0, 0, 0],
      0,
      this._view.spatialReference,
      this._localOriginRender,
      0,
      1
    );
    vec3.subtract(this._localOriginRender, this._localOriginRender, position);
    this._localOriginRender[2] += max[2];
  }

  render(context: RenderContext): void {
    const eye = vec3.fromValues(
      context.camera.eye[0],
      context.camera.eye[1],
      context.camera.eye[2]
    );

    // move to data origin
    vec3.subtract(position, eye, this._localOriginRender);

    mat4.identity(viewProj);
    mat4.translate(viewProj, viewProj, this._localOriginRender);
    mat4.multiply(viewProj, context.camera.viewMatrix as mat4, viewProj);
    mat4.multiply(viewProj, context.camera.projectionMatrix as mat4, viewProj);

    // raycast volume and reset state
    draw(viewProj, position);
    context.resetWebGLState();
  }

  /** @return true if animating after the change */
  playPause(): boolean {
    this._animating = !this._animating;
    if (this._animating) {
      this._loadNextVolume();
    }
    return this._animating;
  }

  set data(name: string) {
    this._data = dataSets[name];
    this._updateColorMap = true;
    this._loadVolume();
  }

  private _loadNextVolume(): void {
    const nTimeSteps = 48;
    if (this._timeStep >= nTimeSteps) {
      this._timeStep = 0;
    }
    ++this._timeStep;
    this._loadVolume();
  }

  private _loadVolume(): void {
    const sequence =
      this._timeStep < 10 ? "0" + this._timeStep : this._timeStep.toFixed(0);
    const filename =
      dataSetURL + this._data[0] + sequence + "_500x500x100_uint8.raw";

    selectVolume(
      filename,
      this._size,
      () => {
        if (this._updateColorMap) {
          this._updateColorMap = false;
          selectColormap(dataSetURL + this._data[0] + ".png", () => {
            this._updateLegend();
            requestRender(this._view);
          });
        } else {
          requestRender(this._view);
        }

        if (this._animating) {
          setTimeout(() => this._loadNextVolume(), 0);
        }
      },
      () => {
        if (dataSetURL === localURL) {
          dataSetURL = remoteURL; // fall back to remote URL if local data is missing
          this._loadVolume();
        }
      }
    );
  }

  // Update the legend for the transfer function.
  // We do use a dummy FeatureLayer here, for which we create a renderer with a color ramp
  // from the transfer function image. This renderer and color ramp will then be rendered
  // automatically by the Legend implementation.
  private _updateLegend(): void {
    const image = new Image();
    esriRequest(dataSetURL + this._data[0] + ".png", {
      authMode: "anonymous",
      method: "get",
      responseType: "image"
    }).then((response: any) => {
      const image: HTMLImageElement = response.data;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, 180, 1).data;
      const stops = new Array<any>(pixels.length / 4);
      const min = this._data[1];
      const max = this._data[2];
      const valueStep = (max - min) / pixels.length;
      for (let i = 0; i < pixels.length; i += 4) {
        stops[i / 4] = {
          value: (min + i * valueStep).toFixed(1),
          label: "",
          color: new EsriColor([pixels[i + 0], pixels[i + 1], pixels[i + 2], 1])
        };
      }

      stops[0].label = `${min.toFixed(1)} ${this._data[3]}`;
      stops[stops.length - 1].label = `${max.toFixed(1)} ${this._data[3]}`;

      const renderer = (this._legendLayer.renderer as SimpleRenderer).clone();
      (renderer.visualVariables[0] as ColorVariable).stops = stops;
      this._legendLayer.renderer = renderer;
    });
  }

  private _localOriginRender = vec3.create();
  private _size = vec3.create();
  private _data: [string, number, number, string];
  private _timeStep = 1;
  private _animating = false;
  private _updateColorMap = true;
}

const viewProj = mat4.create();
const position = vec3.create();
