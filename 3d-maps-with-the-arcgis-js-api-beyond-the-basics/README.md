# 3D Maps with the ARCGIS JS API: Beyond the Basics

Learn how you can leverage the WebGL capabilities of your browser with the JavaScript API to build stunning 3D web applications. This session will focus on more advanced aspects like: camera operations, atmosphere and lighting and performance. Also learn how to extend the API with custom WebGL code and integrate it with frameworks like Three.js.

Live: https://esri.github.io/devsummit-2019-3D-jsapi/3d-maps-with-the-arcgis-js-api-beyond-the-basics



    Advanced architectural
        Promises x
    Advanced camera & navigation
        goTo x
        constraints x
        elevationInfo

    Interactive tools
        toMap -> view.graphics|GraphicLayer, x
        hitTest -> draw/sketch area based on feature points x
        draw tools svm x

        Filtering using sketched area
            Model/View -> layer/layerView x
            client (view) vs server (layer) side (FL) x
            Interactive client filters x

            Symbology in filtered area?
                Declutter outside x
                Improved perspective outside x
                Callout outside 
                Mention other session 
                WebStyleSymbol inside x
    Widgets
        measurement
        slice


    Data Query ?
        Feature layer
        scene layer
        elevation layer
        client (view) vs server (layer) side
    

    Performance & quality
        Publishing -> I3S OBB, flags, reprojection SR, ... x
        Map tile layers
        textures 3d object
        Edges
        Many features -> maximumNumberOfFeatures
        Will reduce quality under pressure

    3D models
        Mesh geometry
        glTF import

    Syncing up multiple views ?
        2D/3D, 3D/3D
        Side-by-side views
        Widget

    External renderer - mention other session

