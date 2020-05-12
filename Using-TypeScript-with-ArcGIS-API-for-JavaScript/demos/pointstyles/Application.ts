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

class Application {
  constructor() {
    // Load the webscene with buildings

    const webscene = new WebScene({
      portalItem: {
        // autocasts as new PortalItem()
        id: "711ddecedece4fd88b728bfe4322c22b"
      }
    });

    const view = new SceneView({
      container: "viewDiv",
      map: webscene,
      environment: {
        lighting: {
          directShadowsEnabled: true,
          ambientOcclusionEnabled: true
        }
      }
    });

    // verticalOffset shifts the symbol vertically
    const verticalOffset = {
      screenLength: 40,
      maxWorldLength: 200,
      minWorldLength: 35
    };

    // Function that automatically creates the symbol for the points of interest
    function getUniqueValueSymbol(name: string, color: string): any {
      // The point symbol is visualized with an icon symbol. To clearly see the location of the point
      // we displace the icon vertically and add a callout line. The line connects the offseted symbol with the location
      // of the point feature.
      return {
        type: "point-3d", // autocasts as new PointSymbol3D()
        symbolLayers: [
          {
            type: "icon", // autocasts as new IconSymbol3DLayer()
            resource: {
              href: name
            },
            size: 20,
            outline: {
              color: "white",
              size: 2
            }
          }
        ],

        verticalOffset,

        callout: {
          type: "line", // autocasts as new LineCallout3D()
          color: "white",
          size: 2,
          border: {
            color
          }
        }
      };
    }

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

    const labelingInfo = [
      new LabelClass({
        labelExpressionInfo: {
          expression: "$feature.Name"
        },
        symbol: new LabelSymbol3D({
          symbolLayers: [
            new TextSymbol3DLayer({
              material: {
                color: "white"
              },
              // we set a halo on the font to make the labels more visible with any kind of background
              halo: {
                size: 1,
                color: [50, 50, 50]
              },
              size: 10
            })
          ]
        })
      })
    ];

    // Create the layer with the points of interest
    // Initially points are aligned to the buildings with relative-to-scene,
    // feature reduction is set to "selection" to avoid overlapping icons.
    // A perspective view is enabled on the layers by default.
    const pointsLayer = new FeatureLayer({
      url: "http://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/LyonPointsOfInterest/FeatureServer",
      title: "Touristic attractions",
      elevationInfo: { mode: "relative-to-scene" },
      renderer: pointsRenderer,
      outFields: ["*"],
      // feature reduction is set to selection because our scene contains too many points and they overlap
      featureReduction: {
        type: "selection"
      },
      labelingInfo
    });

    webscene.add(pointsLayer);

    // add functionality on the controls for selection, perspective, callout lines and relative-to-scene elevation mode
    document.getElementById("cityStyle").addEventListener("change", (event) => {
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
        renderer.uniqueValueInfos.forEach((valueInfo) => {
          (valueInfo.symbol as PointSymbol3D).verticalOffset = target.checked ? verticalOffset : null;
        });
        pointsLayer.renderer = renderer;
      } else if (target.id === "relative-to-scene") {
        const mode = target.checked ? "relative-to-scene" : "relative-to-ground";
        pointsLayer.elevationInfo = {
          mode
        };
      }
    });
    view.ui.add(document.getElementById("cityStyle"), "bottom-left");

    const legend = new Legend({ view });

    view.ui.add(legend, "top-right");
  }
}

export = Application;
