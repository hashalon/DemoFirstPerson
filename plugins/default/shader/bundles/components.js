(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Shader = require("./Shader");
SupEngine.registerComponentClass("Shader", Shader);

},{"./Shader":2}],2:[function(require,module,exports){
var THREE = SupEngine.THREE;
function createShaderMaterial(asset, textures, geometry, options) {
    if (options === void 0) { options = { useDraft: false }; }
    if (asset == null)
        return null;
    function replaceShaderChunk(shader) {
        var keyword = "THREE_ShaderChunk(";
        var index = shader.indexOf(keyword);
        while (index !== -1) {
            var end = shader.indexOf(")", index + 1);
            var shaderChunk = shader.slice(index + keyword.length, end);
            shaderChunk.trim();
            shader = shader.slice(0, index) + THREE.ShaderChunk[shaderChunk] + shader.slice(end + 1);
            index = shader.indexOf(keyword, index + 1);
        }
        return shader;
    }
    var uniforms = {};
    if (asset.useLightUniforms) {
        uniforms = THREE.UniformsUtils.merge([uniforms, THREE.UniformsUtils.clone(THREE.UniformsLib["lights"])]);
        uniforms = THREE.UniformsUtils.merge([uniforms, THREE.UniformsUtils.clone(THREE.UniformsLib["shadowmap"])]);
    }
    uniforms["time"] = { type: "f", value: 0.0 };
    for (var _i = 0, _a = asset.uniforms; _i < _a.length; _i++) {
        var uniform = _a[_i];
        var value = void 0;
        switch (uniform.type) {
            case "f":
                value = uniform.value;
                break;
            case "c":
                value = new THREE.Color(uniform.value[0], uniform.value[1], uniform.value[2]);
                break;
            case "v2":
                value = new THREE.Vector2(uniform.value[0], uniform.value[1]);
                break;
            case "v3":
                value = new THREE.Vector3(uniform.value[0], uniform.value[1], uniform.value[2]);
                break;
            case "v4":
                value = new THREE.Vector4(uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
                break;
            case "t":
                value = textures[uniform.value];
                if (value == null) {
                    console.warn("Texture \"" + uniform.name + "\" is null");
                    continue;
                }
                break;
        }
        uniforms[uniform.name] = { type: uniform.type, value: value };
    }
    for (var _b = 0, _c = asset.attributes; _b < _c.length; _b++) {
        var attribute = _c[_b];
        var values = [];
        var itemSize = void 0;
        switch (attribute.type) {
            case "f":
                itemSize = 1;
                break;
            case "c":
                itemSize = 3;
                break;
            case "v2":
                itemSize = 2;
                break;
            case "v3":
                itemSize = 3;
                break;
            case "v4":
                itemSize = 4;
                break;
        }
        var triangleCount = geometry.getAttribute("position").length / 3;
        for (var v = 0; v < triangleCount; v++) {
            for (var i = 0; i < itemSize; i++)
                values.push(Math.random());
        }
        geometry.addAttribute(attribute.name, new THREE.BufferAttribute(new Float32Array(values), itemSize));
    }
    var vertexShader = replaceShaderChunk(options.useDraft ? asset.vertexShader.draft : asset.vertexShader.text);
    var fragmentShader = replaceShaderChunk(options.useDraft ? asset.fragmentShader.draft : asset.fragmentShader.text);
    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader, fragmentShader: fragmentShader,
        transparent: true,
        lights: asset.useLightUniforms
    });
}
exports.createShaderMaterial = createShaderMaterial;

},{}]},{},[1]);
