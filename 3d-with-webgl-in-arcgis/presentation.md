
<!-- .slide: data-background="../images/bg-1.png" -->

## 3D with WebGL in ArcGIS

### Samples

<br/>

<p>Philip Mielke, Esri Redlands</p>
<p>Arno Fiva, Esri R&amp;D Center Z&uuml;rich</p>

<p><br/><small>
Live version of this presentation:<br>https://esri.github.io/devsummit-2019-3D-jsapi/3d-with-webgl-in-arcgis
</small></p>

---

<!-- .slide: data-background="../images/bg-3.png" data-title="goto" -->

## Creating a 3D Map

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="steetViewButton"></button>
<pre><code class="lang-ts">// SceneView vs MapView
const view = new SceneView({
  map: map,
});
view.goTo({ position: {
  x: -117.19, y: 34.05, z: 418}, // Redlands
  heading: 80, tilt: 84,
}});</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="addElevationButton"></button>
<pre><code class="lang-ts">// Show terrain
map.ground = "world-elevation";</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="addBuildingsButton"></button>
<pre><code class="lang-ts">// Add building scene layer, lights, trees
var buildingsLayer = new SceneLayer({
  portalItem: {
    id: "2e0761b9a4274b8db52c4bf34356911e"
  }
});
map.layers.add(buildingsLayer);</code></pre>
</div>

  </div>
  <div class="right-column">
    <iframe id="go-to-demo" data-src="./samples/redlands.html" ></iframe>
  </div>
</div>

---

<!-- .slide: data-background="../images/bg-3.png" data-title="feature-filter" -->

## Geometries

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet" style="font-size: 160%;">
<pre><code class="lang-ts">var polygon = new Polygon({
  rings: [
    [-117.186524, 34.059662], // lon, lat
    [-117.186575, 34.060404],
    ...
  ],
});</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="gotoBuildingButton"></button>
<pre><code class="lang-ts">// Zoom to polygon
view.goTo(polygon).then(function() {
  // Draw polygon
  view.graphics.add(new Graphic({
    symbol: { type: "fill", color: "orange" },
    geometry: polygon,
  }));
});</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="buildings_filter_button"></button>
<pre><code class="lang-ts">// Hide buildings inside polygon
layerView.filter = new FeatureFilter({
  geometry: geometry,
  spatialRelationship: "disjoint",
});</code></pre>
</div>

  </div>
  <div class="right-column">
    <iframe id="go-to-demo" data-src="./samples/redlands.html" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="../images/bg-3.png" data-title="building-scene-layer-api" -->

## Building Scene Layer

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="addBSLButton"></button>
<pre><code class="lang-ts">// Add new Building Scene Layer
var building = new BuildingSceneLayer({
  portalItem: {
    id: "34238fa639f441a794bd97ca526b3d26"
  }
});
view.map.add(building);</code></pre>
</div>


<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="hideWallsButton"></button>
<pre><code class="lang-ts">// Retrieve building sublayer
function getSublayer(title) {
  adminBuildingLayer.allSublayers.find(
    function(sublayer) {
      return sublayer.title === title;
});}

// Hide sublayer named "Walls"
getSublayer("Walls").visible = false;</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="hideRoofButton"></button>
<pre><code class="lang-ts">// Hide roof and windows
getSublayer("Roof").visible = false;
getSublayer("Windows").visible = false;</code></pre>
</div>


  </div>
  <div class="right-column">
    <iframe id="go-to-demo" data-src="./samples/redlands.html" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="../images/bg-3.png" data-title="building-scene-layer-widgets" -->

## Building Scene Layer

<div class="two-columns">
  <div class="left-column">


<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="startLineMeasureButton"></button>
<pre>
<code class="lang-ts">new DirectLineMeasurement3D({
  view: view
}).viewModel.newMeasurement();</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="startAreaMeasureButton"></button>
<pre><code class="lang-ts">var widget = new AreaMeasurement3D({
  view: view
});
widget.viewModel.newMeasurement();</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="startSliceButton"></button>
<pre><code class="lang-ts">var widget = new Slice({
  view: view
});
widget.viewModel.newSlice();

// exclude layers from slice
widget.viewModel.excludedLayers.addMany(
    getSublayer("Floors"),
    getSublayer("Structural"),
    getSublayer("Furniture"), ...);</code></pre>
</div>


  </div>
  <div class="right-column">
    <iframe id="go-to-demo" data-src="./samples/redlands.html" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="../images/bg-3.png" data-title="underground" -->

## Underground

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="showUndergroundButton"></button>
<pre>
<code class="lang-ts">// Add underground features
new FeatureLayer({ portalItem: {
  id: "e9950bd0d35d49438dda4cc59548046e"
}};
// Make ground transparent
adminBuildingLayer.opacity = 0.4;
webscene.ground.opacity = 0.4;
</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="goUndergroundButton"></button>
<pre>
<code class="lang-ts">// Remove navigation constraints
webscene.ground.navigationConstraint = {
  type: "none"
};

// Place camera underground
view.goTo(undergroundCamera);</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="goWaterNetworkButton"></button>
<pre>
<code class="lang-ts">// Show closeup of sewer system
view.goTo(sewerCamera);</code></pre>
</div>

  </div>
  <div class="right-column">
    <iframe id="go-to-demo" data-src="./samples/redlands.html" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="../images/bg-3.png" data-title="rendering-environment" -->

## Rendering: Quality & Lighting

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="highQualityButton"></button>
<pre>
<code class="lang-ts">// Atmosphere settings
view.environment.starsEnabled = true;
view.environment.atmosphereEnabled = true;
view.environment.atmosphere = {
  quality: "high"
};
// Lighting settings
view.environment.lighting = {
  date: "Thu Mar 15 2018 16:30:00 PST",
  directShadowsEnabled: true,
};
</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="sunsetButton"></button>
<pre>
<code class="lang-ts">// Animated sunset
Slide.createFrom(view).then(function(slide) {
  slide.view.environment.lighting.date =
    "Thu Mar 15 2018 19:30:00 PST";
  slide.applyTo(view, { duration: 15000 });
});
</code></pre>
</div>


  </div>
  <div class="right-column">
    <iframe id="go-to-demo" data-src="./samples/redlands.html" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="../images/bg-3.png" data-title="rendering-nightmode" -->

## Rendering: Colors & Basemaps

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="darkBuildingsButton"></button>
<pre>
<code class="lang-ts">// Buildings with white edges
buildingLayer.opacity = 0.5;
buildingLayer.renderer = {...
  material: {
    color: [0, 132, 168]
  },
  edges: {
    type: "solid", color: [255, 255, 255],
  }
...};
</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="darkBasemapButton"></button>
<pre>
<code class="lang-ts">// Apply color scheme to vector tile layer
var vectorBasemap = new VectorTileLayer();
vectorBasemap.loadStyle({
  layers: [..., {
    id: "Urban area",
    paint: {fill-color: "#00FABC"}
  }, ...]
});
map.layers.add(vectorBasemap);

</code></pre>
</div>


  </div>
  <div class="right-column">
    <iframe id="go-to-demo" data-src="./samples/redlands.html" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="../images/bg-3.png" data-title="rendering-dispatch" -->

## Tactical Operations

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="showTacticalTeamsButton"></button>
<pre>
<code class="lang-ts">tacticalOpsGroupLayer.visible = true;
</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="showLocationButton"></button>
<pre>
<code class="lang-ts">// Add location tracking widget
var track = new Track({
  view: view,
});
track.start();
</code></pre>
</div>

<div class="code-snippet" style="font-size: 160%;">
<button class="play" id="trackLocationButton"></button>
<pre>
<code class="lang-ts">// Called when location updates
track.on("track", function() {
  // Point camera to new location
  var location = track.graphic.geometry;
  view.goTo({
    center: location,
    tilt: 60,
    scale: 1200,
  });
});
</code></pre>
</div>


  </div>
  <div class="right-column">
    <iframe id="go-to-demo" data-src="./samples/redlands.html" ></iframe>
  </div>
</div>

---

<!-- .slide: data-background="../images/bg-survey.jpg" -->

---

<!-- .slide: data-background="../images/bg-esri.png" -->
