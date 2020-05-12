- Move application into separate Typescript file:

```ts
  <script>
    var locationPath = location.pathname.replace(/\/[^\/]+$/, "");
    window.dojoConfig = {
      packages: [
        {
          name: "app",
          location: locationPath
        }
      ]
    };
  </script>

  <script src="https://js.arcgis.com/4.11/"></script>

  <script>
      var app;
      require([
        "app/Application",
        "dojo/domReady!"
      ], function(Application) {
        var app = new Application();
      });
  </script>
```

- Fix imports

```ts
// esri
import { UniqueValueRenderer } from "esri/renderers";
import { PointSymbol3D, LabelSymbol3D, TextSymbol3DLayer } from "esri/symbols";
import WebScene = require("esri/WebScene");

// esri.layers
import FeatureLayer = require("esri/layers/FeatureLayer");

// esri.layers.support
import LabelClass = require("esri/layers/support/LabelClass");

// esri.views
import SceneView = require("esri/views/SceneView");

// esri.widgets
import Legend = require("esri/widgets/Legend");
```

- Create class and Constructor

- npm run tsfix
- Fix function signatures

- npm run watch
- Fix FeatureLayer ctor piece-by-piece

```ts
const pointsRenderer = new UniqueValueRenderer({
  field: "Type",
  uniqueValueInfos: [
    {
      value: "Museum",
      symbol: getUniqueValueSymbol(
        "https://developers.arcgis.com/javascript/latest/sample-code/visualization-point-styles/live/Museum.png",
        "#D13470"
      )
    },
    {
      value: "Restaurant",
      symbol: getUniqueValueSymbol(
        "https://developers.arcgis.com/javascript/latest/sample-code/visualization-point-styles/live/Restaurant.png",
        "#F97C5A"
      )
    },
    {
      value: "Church",
      symbol: getUniqueValueSymbol(
        "https://developers.arcgis.com/javascript/latest/sample-code/visualization-point-styles/live/Church.png",
        "#884614"
      )
    },
    {
      value: "Hotel",
      symbol: getUniqueValueSymbol(
        "https://developers.arcgis.com/javascript/latest/sample-code/visualization-point-styles/live/Hotel.png",
        "#56B2D6"
      )
    },
    {
      value: "Park",
      symbol: getUniqueValueSymbol(
        "https://developers.arcgis.com/javascript/latest/sample-code/visualization-point-styles/live/Park.png",
        "#40C2B4"
      )
    }
  ]
});

expression: "$feature.Name"
```

- Fix event handler typing

```ts
     document
      .getElementById("cityStyle")
      .addEventListener("change", (event)=> {
        const target = event.target as HTMLInputElement;
        if (target.id === "declutter") {
          const type = {
            type: "selection"
          };
          pointsLayer.featureReduction = target.checked ? type : null;
        } else if (target.id === "perspective") {
          pointsLayer.screenSizePerspectiveEnabled = target.checked;
        } else if (target.id === "callout") {
          const renderer = (pointsLayer.renderer as UniqueValueRenderer).clone();
          renderer.uniqueValueInfos.forEach((valueInfo) =>{
            (valueInfo.symbol as PointSymbol3D).verticalOffset = target.checked
              ? verticalOffset
              : null;
          });
          pointsLayer.renderer = renderer;
        } else if (target.id === "relative-to-scene") {
          const mode = target.checked
            ? "relative-to-scene"
            : "relative-to-ground";
          pointsLayer.elevationInfo = {
            mode
          };
        }
      });
```