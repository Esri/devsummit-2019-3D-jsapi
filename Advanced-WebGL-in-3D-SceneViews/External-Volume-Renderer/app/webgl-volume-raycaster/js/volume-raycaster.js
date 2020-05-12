var cubeStrip = [
	1,
	1,
	0,
	0,
	1,
	0,
	1,
	1,
	1,
	0,
	1,
	1,
	0,
	0,
	1,
	0,
	1,
	0,
	0,
	0,
	0,
	1,
	1,
	0,
	1,
	0,
	0,
	1,
	1,
	1,
	1,
	0,
	1,
	0,
	0,
	1,
	1,
	0,
	0,
	0,
	0,
	0
];

var gl = null;
var shader = null;
var volumeTexture = null;
var colormapTexture = null;
var fileRegex = /.*\/(\w+)_(\d+)x(\d+)x(\d+)_(\w+)\.*/;
var proj = null;
var camera = null;
var projView = null;
var tabFocused = true;
var newVolumeUpload = true;
var volDims = [1, 1, 1];
var volScale = 1;
var targetFrameTime = 32;
var samplingRate = 1.0;
var WIDTH = 640;
var HEIGHT = 480;
const center = vec3.set(vec3.create(), 0.5, 0.5, 0.5);

var volumes = {
	Fuel: "7d87jcsh0qodk78/fuel_64x64x64_uint8.raw",
	Neghip: "zgocya7h33nltu9/neghip_64x64x64_uint8.raw",
	"Hydrogen Atom": "jwbav8s3wmmxd5x/hydrogen_atom_128x128x128_uint8.raw",
	"Boston Teapot": "w4y88hlf2nbduiv/boston_teapot_256x256x178_uint8.raw",
	Engine: "ld2sqwwd3vaq4zf/engine_256x256x128_uint8.raw",
	Bonsai: "rdnhdxmxtfxe0sa/bonsai_256x256x256_uint8.raw",
	Foot: "ic0mik3qv4vqacm/foot_256x256x256_uint8.raw",
	Skull: "5rfjobn0lvb7tmo/skull_256x256x256_uint8.raw",
	Aneurysm: "3ykigaiym8uiwbp/aneurism_256x256x256_uint8.raw"
};

var colormaps = {
	"Cool Warm": "colormaps/cool-warm-paraview.png",
	"Matplotlib Plasma": "colormaps/matplotlib-plasma.png",
	"Matplotlib Virdis": "colormaps/matplotlib-virdis.png",
	Rainbow: "colormaps/rainbow.png",
	"Samsel Linear Green": "colormaps/samsel-linear-green.png",
	"Samsel Linear YGB 1211G": "colormaps/samsel-linear-ygb-1211g.png"
};

var loadVolume = function(url, nBytes, onload, onerror) {
	var m = url.match(fileRegex);
	volDims = [parseInt(m[2]), parseInt(m[3]), parseInt(m[4])];

	var req = new XMLHttpRequest();
	req.open("GET", url, true);
	req.responseType = "arraybuffer";

	if (loadingProgressText) {
		var loadingProgressText = document.getElementById("loadingText");
		var loadingProgressBar = document.getElementById("loadingProgressBar");

		loadingProgressText.innerHTML = "Loading Volume";
		loadingProgressBar.setAttribute("style", "width: 0%");

		req.onprogress = function(evt) {
			var vol_size = volDims[0] * volDims[1] * volDims[2];
			var percent = (evt.loaded / vol_size) * 100;
			loadingProgressBar.setAttribute("style", "width: " + percent.toFixed(2) + "%");
		};
		req.onerror = function(evt) {
			loadingProgressText.innerHTML = "Error Loading Volume";
			loadingProgressBar.setAttribute("style", "width: 0%");
		};
	}

	req.onload = function(evt) {
		if (loadingProgressText) {
			loadingProgressText.innerHTML = "Loaded Volume";
			loadingProgressBar.setAttribute("style", "width: 100%");
		}

		var dataBuffer = req.response;
		if (dataBuffer && req.status < 400 && dataBuffer.byteLength === nBytes) {
			dataBuffer = new Uint8Array(dataBuffer);
			onload(url, dataBuffer);
		} else {
			if (onerror) {
				onerror();
			} else {
				alert("Unable to load buffer properly from volume?");
				console.log("no buffer?");
			}
		}
	};
	req.onerror = onerror;
	req.send();
};

var selectVolume = function(selection, size, doneCB, errCB) {
	if (!selection) {
		selection = document.getElementById("volumeList").value;
		history.replaceState(history.state, "#" + selection, "#" + selection);
		selection = "https://www.dl.dropboxusercontent.com/s/" + volumes[selection] + "?dl=1";
	}

	var m = selection.match(fileRegex);
	volDims = [parseInt(m[2]), parseInt(m[3]), parseInt(m[4])];
	var nBytes = volDims[0] * volDims[1] * volDims[2];

	loadVolume(
		selection,
		nBytes,
		function(_, data) {
			if (!volumeTexture) {
				volumeTexture = gl.createTexture();

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_3D, volumeTexture);
				gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R8, volDims[0], volDims[1], volDims[2]);

				if (proj) {
					// loaded, create main loop:
					setInterval(function() {
						// Save them some battery if they're not viewing the tab
						if (document.hidden) {
							return;
						}

						var startTime = new Date();
						projView = mat4.mul(projView, proj, camera.camera);
						var eye = [
							camera.invCamera[12],
							camera.invCamera[13],
							camera.invCamera[14]
						];

						clear();
						draw(projView, eye);

						var endTime = new Date();
						var renderTime = endTime - startTime;
						var targetSamplingRate = renderTime / targetFrameTime;

						// If we're dropping frames, decrease the sampling rate
						if (!newVolumeUpload && targetSamplingRate > samplingRate) {
							samplingRate = 0.5 * samplingRate + 0.5 * targetSamplingRate;
						}
						startTime = endTime;
					}, targetFrameTime);
				}
			}

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_3D, volumeTexture);
			gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
			gl.texSubImage3D(
				gl.TEXTURE_3D,
				0,
				0,
				0,
				0,
				volDims[0],
				volDims[1],
				volDims[2],
				gl.RED,
				gl.UNSIGNED_BYTE,
				data
			);

			if (size) {
				volScale = [Math.abs(size[0]), Math.abs(size[1]), Math.abs(size[2])];
			} else {
				var longestAxis = Math.max(volDims[0], Math.max(volDims[1], volDims[2]));
				volScale = [
					volDims[0] / longestAxis,
					volDims[1] / longestAxis,
					volDims[2] / longestAxis
				];
			}

			doneCB && doneCB();
		},
		errCB
	);
};

var colormapImage = new Image();

var selectColormap = function(selection, doneCB) {
	selection = selection || colormaps[document.getElementById("colormapList").value];

	colormapImage = new Image();
	colormapImage.onload = function() {
		if (!colormapTexture) {
			colormapTexture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, colormapTexture);
			gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 180, 1);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		}

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, colormapTexture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 180, 1, gl.RGBA, gl.UNSIGNED_BYTE, colormapImage);

		doneCB && doneCB();
	};
	colormapImage.crossOrigin = "Anonymous";
	colormapImage.src = selection;
};

var clear = function() {
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
};

var draw = function(projView, eye) {
	if (!volumeTexture || !colormapTexture) {
		return;
	}

	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.enableVertexAttribArray(0);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_3D, volumeTexture);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, colormapTexture);

	// Reset the sampling rate and camera for new volumes
	if (newVolumeUpload) {
		camera = new ArcballCamera(center, 2, [WIDTH, HEIGHT]);
		samplingRate = 1.0;
		newVolumeUpload = false;
	}

	shader.use();
	gl.uniform1i(shader.uniforms["volume"], 0);
	gl.uniform1i(shader.uniforms["colormap"], 1);
	gl.uniform1f(shader.uniforms["dt_scale"], samplingRate);
	gl.uniform3iv(shader.uniforms["volume_dims"], volDims);
	gl.uniform3fv(shader.uniforms["volume_scale"], volScale);
	gl.uniformMatrix4fv(shader.uniforms["proj_view"], false, projView);
	gl.uniform3fv(shader.uniforms["eye_pos"], eye);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeStrip.length / 3);
	// Wait for rendering to actually finish
	gl.finish();
};

var vao = null;
var vbo = null;

var setupGL = function(glRenderingContext) {
	gl = glRenderingContext;

	// Setup VAO and VBO to render the cube to run the raymarching shader
	vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeStrip), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

	shader = new Shader(vertShader, fragShader);
	shader.use();

	// Setup required OpenGL state for drawing the back faces and
	// compositing with the background color
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
};

load = function() {
	fillVolumeSelector();
	fillcolormapSelector();

	var canvas = document.getElementById("glcanvas");
	var gl = canvas.getContext("webgl2");
	if (!gl) {
		alert("Unable to initialize WebGL2. Your browser may not support it");
		return;
	}
	WIDTH = canvas.getAttribute("width");
	HEIGHT = canvas.getAttribute("height");

	proj = mat4.perspective(mat4.create(), (60 * Math.PI) / 180.0, WIDTH / HEIGHT, 0.1, 100);

	camera = new ArcballCamera(center, 2, [WIDTH, HEIGHT]);
	projView = mat4.create();

	// Register mouse and touch listeners
	var controller = new Controller();
	controller.mousemove = function(prev, cur, evt) {
		if (evt.buttons == 1) {
			camera.rotate(prev, cur);
		} else if (evt.buttons == 2) {
			camera.pan([cur[0] - prev[0], prev[1] - cur[1]]);
		}
	};
	controller.wheel = function(amt) {
		camera.zoom(amt);
	};
	controller.pinch = controller.wheel;
	controller.twoFingerDrag = function(drag) {
		camera.pan(drag);
	};

	controller.registerForCanvas(canvas);

	// See if we were linked to a datset
	if (window.location.hash) {
		var linkedDataset = decodeURI(window.location.hash.substr(1));
		if (linkedDataset in volumes) {
			document.getElementById("volumeList").value = linkedDataset;
		}
	}

	setupGL(gl);

	// Load the default colormap and upload it, after which we load the default volume.
	selectColormap("colormaps/cool-warm-paraview.png");
	selectVolume();
};

var fillVolumeSelector = function() {
	var selector = document.getElementById("volumeList");
	for (v in volumes) {
		var opt = document.createElement("option");
		opt.value = v;
		opt.innerHTML = v;
		selector.appendChild(opt);
	}
};

var fillcolormapSelector = function() {
	var selector = document.getElementById("colormapList");
	for (p in colormaps) {
		var opt = document.createElement("option");
		opt.value = p;
		opt.innerHTML = p;
		selector.appendChild(opt);
	}
};
