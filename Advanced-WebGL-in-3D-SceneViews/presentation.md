<!-- .slide: data-background="../images/bg-1.png" -->

### Advanced WebGL in 3D Scene Views with the ArcGIS API for JavaScript

<p style="font-size: 75%"><br/>
  Stefan Eilemann, ESRI R&amp;D Center Z&uuml;rich
</p>
<p><br/><small>
Live version of this presentation:<br>https://esri.github.io/devsummit-2019-3D-jsapi/Advanced-WebGL-in-3D-SceneViews
</small></p>

---

<!-- .slide: data-background="../images/bg-2.png" -->

## External renderer

- You have data that you cannot visualize with available layers and renderers
- You want visualizations/animations that are not (yet) available
- You are familiar with WebGL and can afford the development effort
- *Experimental*

---

<!-- .slide: data-background="../images/bg-2.png" -->

## Basics

- Implement ExternalRenderer API
- Add Instance to SceneView
    
```ts
export class VolumeRenderer implements ExternalRenderer {
  setup(context: RenderContext): void {
    this.renderer = new THREE.WebGLRenderer({ context: context.gl });
  }

  render(context: RenderContext): void {
    this.renderer.resetGLState();
    this.renderer.render(this.scene, this.camera);
    context.resetWebGLState();
  }
}

addExternalRenderer(view, new VolumeRenderer());
```

---

<!-- .slide: data-background="../images/bg-2.png" -->

## Requesting Redraws

- Whenever external data changes

```ts
selectVolume(filename, () => {
  requestRender(this._view);
  if (this._animating) {
    setTimeout(() => this._loadNextVolume(), 0);
  }
});
```

---

<!-- .slide: data-background="../images/bg-2.png" -->

## Coordinate Systems

- Use Internal Rendering Coordinate System of SceneView
  - ```local```: view.spatialReference
  - ```global```: ECEF:  X-axis points to 0°N 0°E, Y-axis points to 0°N 90°E, Z-axis points to the North Pole, perfect sphere with a radius of 6378137
- ```toRenderCoordinates``` and ```fromRenderCoordinates``` convenience functions

---

<!-- .slide: data-background="../images/bg-2.png" -->

## Precision Issues

- 32 bit float WebGL arithmetic
- Pick a local origin position, approximately at the center of your data.
- Subtract the local origin position from all positional data (vertex data, uniforms, etc.) before passing it into WebGL.
- Translate the view transformation matrix by the origin (pre-multiply the view transformation matrix by the origin translation matrix)

---

<!-- .slide: data-background="../images/bg-survey.jpg" -->

---

<!-- .slide: data-background="../images/bg-esri.png" -->
