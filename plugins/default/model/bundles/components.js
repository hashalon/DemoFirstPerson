(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ModelRenderer_1 = require("./ModelRenderer");
SupEngine.registerComponentClass("ModelRenderer", ModelRenderer_1.default);

},{"./ModelRenderer":2}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var tmpBoneMatrix = new THREE.Matrix4;
var tmpVec = new THREE.Vector3;
var tmpQuat = new THREE.Quaternion;
var ModelRendererUpdater_1 = require("./ModelRendererUpdater");
function getInterpolationData(keyFrames, time) {
    var prevKeyFrame = keyFrames[keyFrames.length - 1];
    // TODO: Use a cache to maintain most recently used key frames for each bone
    // and profit from temporal contiguity
    var nextKeyFrame;
    for (var _i = 0; _i < keyFrames.length; _i++) {
        var keyFrame = keyFrames[_i];
        nextKeyFrame = keyFrame;
        if (keyFrame.time > time)
            break;
        prevKeyFrame = keyFrame;
    }
    if (prevKeyFrame === nextKeyFrame)
        nextKeyFrame = keyFrames[0];
    var timeSpan = nextKeyFrame.time - prevKeyFrame.time;
    var timeProgress = time - prevKeyFrame.time;
    var t = (timeSpan > 0) ? timeProgress / timeSpan : 0;
    return { prevKeyFrame: prevKeyFrame, nextKeyFrame: nextKeyFrame, t: t };
}
var ModelRenderer = (function (_super) {
    __extends(ModelRenderer, _super);
    function ModelRenderer(actor) {
        _super.call(this, actor, "ModelRenderer");
        this.color = { r: 1, g: 1, b: 1 };
        this.hasPoseBeenUpdated = false;
        this.materialType = "basic";
        this.castShadow = false;
        this.receiveShadow = false;
    }
    ModelRenderer.prototype._clearMesh = function () {
        if (this.skeletonHelper != null) {
            this.actor.threeObject.remove(this.skeletonHelper);
            this.skeletonHelper = null;
        }
        this.actor.threeObject.remove(this.threeMesh);
        this.threeMesh.traverse(function (obj) { if (obj.dispose != null)
            obj.dispose(); });
        this.threeMesh = null;
        this.material.dispose();
        this.material = null;
    };
    ModelRenderer.prototype._destroy = function () {
        if (this.threeMesh != null)
            this._clearMesh();
        this.asset = null;
        _super.prototype._destroy.call(this);
    };
    ModelRenderer.prototype.setModel = function (asset, materialType, customShader) {
        if (this.threeMesh != null)
            this._clearMesh();
        this.asset = asset;
        if (materialType != null)
            this.materialType = materialType;
        if (customShader != null)
            this.shaderAsset = customShader;
        this.animation = null;
        this.animationsByName = {};
        if (asset == null || asset.attributes["position"] == null)
            return;
        this.updateAnimationsByName();
        var geometry = new THREE.BufferGeometry;
        if (this.asset.attributes["position"] != null) {
            var buffer = new Float32Array(this.asset.attributes["position"]);
            geometry.addAttribute("position", new THREE.BufferAttribute(buffer, 3));
        }
        if (this.asset.attributes["index"] != null) {
            var buffer = new Uint16Array(this.asset.attributes["index"]);
            geometry.setIndex(new THREE.BufferAttribute(buffer, 1));
        }
        if (this.asset.attributes["uv"] != null) {
            var buffer = new Float32Array(this.asset.attributes["uv"]);
            geometry.addAttribute("uv", new THREE.BufferAttribute(buffer, 2));
        }
        if (this.asset.attributes["normal"] != null) {
            var buffer = new Float32Array(this.asset.attributes["normal"]);
            geometry.addAttribute("normal", new THREE.BufferAttribute(buffer, 3));
        }
        if (this.asset.attributes["color"] != null) {
            var buffer = new Float32Array(this.asset.attributes["color"]);
            geometry.addAttribute("color", new THREE.BufferAttribute(buffer, 3));
        }
        if (this.asset.attributes["skinIndex"] != null) {
            var buffer = new Float32Array(this.asset.attributes["skinIndex"]);
            geometry.addAttribute("skinIndex", new THREE.BufferAttribute(buffer, 4));
        }
        if (this.asset.attributes["skinWeight"] != null) {
            var buffer = new Float32Array(this.asset.attributes["skinWeight"]);
            geometry.addAttribute("skinWeight", new THREE.BufferAttribute(buffer, 4));
        }
        if (this.materialType === "shader") {
            this.material = SupEngine.componentClasses["Shader"].createShaderMaterial(this.shaderAsset, this.asset.textures, geometry);
        }
        else {
            var material;
            if (this.materialType === "basic")
                material = new THREE.MeshBasicMaterial();
            else if (this.materialType === "phong") {
                material = new THREE.MeshPhongMaterial();
                material.lightMap = this.asset.textures[this.asset.mapSlots["light"]];
            }
            material.map = this.asset.textures[this.asset.mapSlots["map"]];
            material.specularMap = this.asset.textures[this.asset.mapSlots["specular"]];
            material.alphaMap = this.asset.textures[this.asset.mapSlots["alpha"]];
            if (this.materialType === "phong")
                material.normalMap = this.asset.textures[this.asset.mapSlots["normal"]];
            material.alphaTest = 0.1;
            this.material = material;
        }
        this.setColor(this.color.r, this.color.g, this.color.b);
        this.setOpacity(this.opacity);
        if (this.asset.bones != null) {
            this.threeMesh = new THREE.SkinnedMesh(geometry, this.material);
            if (this.asset.upAxisMatrix != null) {
                var upAxisMatrix = new THREE.Matrix4().fromArray(this.asset.upAxisMatrix);
                this.threeMesh.applyMatrix(upAxisMatrix);
            }
            var bones = [];
            this.bonesByName = {};
            for (var _i = 0, _a = this.asset.bones; _i < _a.length; _i++) {
                var boneInfo = _a[_i];
                var bone = new THREE.Bone(this.threeMesh);
                bone.name = boneInfo.name;
                this.bonesByName[bone.name] = bone;
                bone.applyMatrix(tmpBoneMatrix.fromArray(boneInfo.matrix));
                bones.push(bone);
            }
            for (var i = 0; i < this.asset.bones.length; i++) {
                var boneInfo = this.asset.bones[i];
                if (boneInfo.parentIndex != null)
                    bones[boneInfo.parentIndex].add(bones[i]);
                else
                    this.threeMesh.add(bones[i]);
            }
            this.threeMesh.updateMatrixWorld(true);
            var useVertexTexture = false;
            this.threeMesh.bind(new THREE.Skeleton(bones, undefined, useVertexTexture));
            this.material.skinning = true;
        }
        else
            this.threeMesh = new THREE.Mesh(geometry, this.material);
        this.setUnitRatio(asset.unitRatio);
        this.setCastShadow(this.castShadow);
        this.threeMesh.receiveShadow = this.receiveShadow;
        this.actor.threeObject.add(this.threeMesh);
        if (geometry.getAttribute("normal") == null) {
            this.threeMesh.geometry.computeVertexNormals();
            this.threeMesh.geometry.computeFaceNormals();
        }
        this.threeMesh.updateMatrixWorld(false);
    };
    ModelRenderer.prototype.setCastShadow = function (castShadow) {
        this.castShadow = castShadow;
        this.threeMesh.castShadow = castShadow;
    };
    ModelRenderer.prototype.setOpacity = function (opacity) {
        this.opacity = opacity;
        if (this.material == null)
            return;
        if (this.opacity != null) {
            this.material.transparent = true;
            this.material.opacity = this.opacity;
        }
        else {
            this.material.transparent = false;
            this.material.opacity = 1;
        }
        this.material.needsUpdate = true;
    };
    ModelRenderer.prototype.setColor = function (r, g, b) {
        this.color.r = r;
        this.color.g = g;
        this.color.b = b;
        if (this.material instanceof THREE.ShaderMaterial) {
            var uniforms = this.material.uniforms;
            if (uniforms.color != null)
                uniforms.color.value.setRGB(r, g, b);
        }
        else
            this.material.color.setRGB(r, g, b);
    };
    ModelRenderer.prototype.setUnitRatio = function (unitRatio) {
        if (this.threeMesh == null)
            return;
        var ratio = 1 / unitRatio;
        this.threeMesh.scale.set(ratio, ratio, ratio);
        this.threeMesh.updateMatrixWorld(false);
    };
    ModelRenderer.prototype.setShowSkeleton = function (show) {
        if (show == (this.skeletonHelper != null))
            return;
        if (show) {
            this.skeletonHelper = new THREE.SkeletonHelper(this.threeMesh);
            if (this.asset.upAxisMatrix != null) {
                var upAxisMatrix = new THREE.Matrix4().fromArray(this.asset.upAxisMatrix);
                this.skeletonHelper.root = this.skeletonHelper;
                this.skeletonHelper.applyMatrix(upAxisMatrix);
                this.skeletonHelper.update();
            }
            this.skeletonHelper.material.linewidth = 3;
            this.actor.threeObject.add(this.skeletonHelper);
        }
        else {
            this.actor.threeObject.remove(this.skeletonHelper);
            this.skeletonHelper = null;
        }
        if (this.threeMesh != null)
            this.threeMesh.updateMatrixWorld(true);
    };
    ModelRenderer.prototype.updateAnimationsByName = function () {
        for (var _i = 0, _a = this.asset.animations; _i < _a.length; _i++) {
            var animation = _a[_i];
            this.animationsByName[animation.name] = animation;
        }
    };
    ModelRenderer.prototype.setAnimation = function (newAnimationName, newAnimationLooping) {
        if (newAnimationLooping === void 0) { newAnimationLooping = true; }
        if (newAnimationName != null) {
            var newAnimation = this.animationsByName[newAnimationName];
            if (newAnimation == null)
                throw new Error("Animation " + newAnimationName + " doesn't exist");
            if (newAnimation === this.animation && this.isAnimationPlaying)
                return;
            this.animation = newAnimation;
            this.animationLooping = newAnimationLooping;
            this.animationTimer = 0;
            this.isAnimationPlaying = true;
        }
        else {
            this.animation = null;
            this.clearPose();
        }
        return;
    };
    ModelRenderer.prototype.getAnimation = function () { return (this.animation != null) ? this.animation.name : null; };
    ModelRenderer.prototype.setAnimationTime = function (time) {
        if (typeof time !== "number" || time < 0 || time > this.getAnimationDuration())
            throw new Error("Invalid time");
        this.animationTimer = time * this.actor.gameInstance.framesPerSecond;
        this.updatePose();
    };
    ModelRenderer.prototype.getAnimationTime = function () { return (this.animation != null) ? this.animationTimer / this.actor.gameInstance.framesPerSecond : 0; };
    ModelRenderer.prototype.getAnimationDuration = function () {
        if (this.animation == null || this.animation.duration == null)
            return 0;
        return this.animation.duration;
    };
    ModelRenderer.prototype.playAnimation = function (animationLooping) {
        if (animationLooping === void 0) { animationLooping = true; }
        this.animationLooping = animationLooping;
        this.isAnimationPlaying = true;
    };
    ModelRenderer.prototype.pauseAnimation = function () { this.isAnimationPlaying = false; };
    ModelRenderer.prototype.stopAnimation = function () {
        if (this.animation == null)
            return;
        this.isAnimationPlaying = false;
        this.animationTimer = 0;
        this.updatePose();
    };
    ModelRenderer.prototype.clearPose = function () {
        if (this.threeMesh == null)
            return;
        for (var i = 0; i < this.threeMesh.skeleton.bones.length; i++) {
            var bone = this.threeMesh.skeleton.bones[i];
            bone.matrix.fromArray(this.asset.bones[i].matrix);
            bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);
        }
        this.threeMesh.updateMatrixWorld(false);
        if (this.skeletonHelper != null)
            this.skeletonHelper.update();
    };
    ModelRenderer.prototype.getBoneTransform = function (name) {
        if (!this.hasPoseBeenUpdated)
            this._tickAnimation();
        var position = new THREE.Vector3;
        var orientation = new THREE.Quaternion;
        var scale = new THREE.Vector3;
        if (this.bonesByName == null || this.bonesByName[name] == null)
            return null;
        this.bonesByName[name].matrixWorld.decompose(position, orientation, scale);
        return { position: position, orientation: orientation, scale: scale };
    };
    ModelRenderer.prototype.updatePose = function () {
        this.hasPoseBeenUpdated = true;
        // TODO: this.asset.speedMultiplier
        var speedMultiplier = 1;
        var time = this.animationTimer * speedMultiplier / this.actor.gameInstance.framesPerSecond;
        if (time > this.animation.duration) {
            if (this.animationLooping) {
                this.animationTimer -= this.animation.duration * this.actor.gameInstance.framesPerSecond / speedMultiplier;
                time -= this.animation.duration;
            }
            else {
                time = this.animation.duration;
                this.isAnimationPlaying = false;
            }
        }
        for (var i = 0; i < this.threeMesh.skeleton.bones.length; i++) {
            var bone = this.threeMesh.skeleton.bones[i];
            var boneKeyFrames = this.animation.keyFrames[bone.name];
            if (boneKeyFrames == null)
                continue;
            if (boneKeyFrames.translation != null) {
                var _a = getInterpolationData(boneKeyFrames.translation, time), prevKeyFrame = _a.prevKeyFrame, nextKeyFrame = _a.nextKeyFrame, t = _a.t;
                bone.position.fromArray(prevKeyFrame.value);
                bone.position.lerp(tmpVec.fromArray(nextKeyFrame.value), t);
            }
            if (boneKeyFrames.rotation != null) {
                var _b = getInterpolationData(boneKeyFrames.rotation, time), prevKeyFrame = _b.prevKeyFrame, nextKeyFrame = _b.nextKeyFrame, t = _b.t;
                bone.quaternion.fromArray(prevKeyFrame.value);
                bone.quaternion.slerp(tmpQuat.fromArray(nextKeyFrame.value), t);
            }
            if (boneKeyFrames.scale != null) {
                var _c = getInterpolationData(boneKeyFrames.scale, time), prevKeyFrame = _c.prevKeyFrame, nextKeyFrame = _c.nextKeyFrame, t = _c.t;
                bone.scale.fromArray(prevKeyFrame.value);
                bone.scale.lerp(tmpVec.fromArray(nextKeyFrame.value), t);
            }
        }
        this.threeMesh.updateMatrixWorld(false);
        if (this.skeletonHelper != null)
            this.skeletonHelper.update();
    };
    ModelRenderer.prototype.update = function () {
        if (this.material != null) {
            var uniforms = this.material.uniforms;
            if (uniforms != null)
                uniforms.time.value += 1 / this.actor.gameInstance.framesPerSecond;
        }
        if (this.hasPoseBeenUpdated) {
            this.hasPoseBeenUpdated = false;
            return;
        }
        this._tickAnimation();
        this.hasPoseBeenUpdated = false;
    };
    ModelRenderer.prototype._tickAnimation = function () {
        if (this.threeMesh == null || this.threeMesh.skeleton == null)
            return;
        if (this.animation == null || this.animation.duration === 0 || !this.isAnimationPlaying)
            return;
        this.animationTimer += 1;
        this.updatePose();
    };
    ModelRenderer.prototype.setIsLayerActive = function (active) { if (this.threeMesh != null)
        this.threeMesh.visible = active; };
    ModelRenderer.Updater = ModelRendererUpdater_1.default;
    return ModelRenderer;
})(SupEngine.ActorComponent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModelRenderer;

},{"./ModelRendererUpdater":3}],3:[function(require,module,exports){
var THREE = SupEngine.THREE;
var ModelRendererUpdater = (function () {
    function ModelRendererUpdater(client, modelRenderer, config, receiveAssetCallbacks, editAssetCallbacks) {
        this.overrideOpacity = false;
        this.modelAsset = null;
        this.modelSubscriber = {
            onAssetReceived: this._onModelAssetReceived.bind(this),
            onAssetEdited: this._onModelAssetEdited.bind(this),
            onAssetTrashed: this._onModelAssetTrashed.bind(this)
        };
        this.shaderSubscriber = {
            onAssetReceived: this._onShaderAssetReceived.bind(this),
            onAssetEdited: this._onShaderAssetEdited.bind(this),
            onAssetTrashed: this._onShaderAssetTrashed.bind(this)
        };
        this.client = client;
        this.modelRenderer = modelRenderer;
        this.receiveAssetCallbacks = receiveAssetCallbacks;
        this.editAssetCallbacks = editAssetCallbacks;
        this.modelAssetId = config.modelAssetId;
        this.animationId = config.animationId;
        this.materialType = config.materialType;
        this.shaderAssetId = config.shaderAssetId;
        if (config.overrideOpacity != null)
            this.overrideOpacity = config.overrideOpacity;
        this.modelRenderer.castShadow = config.castShadow;
        this.modelRenderer.receiveShadow = config.receiveShadow;
        if (config.overrideOpacity)
            this.modelRenderer.opacity = config.opacity;
        if (config.color != null) {
            var hex = parseInt(config.color, 16);
            this.modelRenderer.color.r = (hex >> 16 & 255) / 255;
            this.modelRenderer.color.g = (hex >> 8 & 255) / 255;
            this.modelRenderer.color.b = (hex & 255) / 255;
        }
        if (this.modelAssetId != null)
            this.client.subAsset(this.modelAssetId, "model", this.modelSubscriber);
        if (this.shaderAssetId != null)
            this.client.subAsset(this.shaderAssetId, "shader", this.shaderSubscriber);
    }
    ModelRendererUpdater.prototype.destroy = function () {
        if (this.modelAssetId != null)
            this.client.unsubAsset(this.modelAssetId, this.modelSubscriber);
        if (this.shaderAssetId != null)
            this.client.unsubAsset(this.shaderAssetId, this.shaderSubscriber);
    };
    ModelRendererUpdater.prototype._onModelAssetReceived = function (assetId, asset) {
        var _this = this;
        if (this.modelRenderer.opacity == null)
            this.modelRenderer.opacity = asset.pub.opacity;
        this._prepareMaps(asset.pub.textures, function () {
            _this.modelAsset = asset;
            _this._setModel();
            if (_this.receiveAssetCallbacks != null)
                _this.receiveAssetCallbacks.model();
        });
    };
    ModelRendererUpdater.prototype._prepareMaps = function (textures, callback) {
        var textureNames = Object.keys(textures);
        var texturesToLoad = textureNames.length;
        if (texturesToLoad === 0) {
            callback();
            return;
        }
        function onTextureLoaded() {
            texturesToLoad--;
            if (texturesToLoad === 0)
                callback();
        }
        textureNames.forEach(function (key) {
            var image = textures[key].image;
            if (!image.complete)
                image.addEventListener("load", onTextureLoaded);
            else
                onTextureLoaded();
        });
    };
    ModelRendererUpdater.prototype._setModel = function () {
        if (this.modelAsset == null || (this.materialType === "shader" && this.shaderPub == null)) {
            this.modelRenderer.setModel(null);
            return;
        }
        this.modelRenderer.setModel(this.modelAsset.pub, this.materialType, this.shaderPub);
        if (this.animationId != null)
            this._playAnimation();
    };
    ModelRendererUpdater.prototype._playAnimation = function () {
        var animation = this.modelAsset.animations.byId[this.animationId];
        this.modelRenderer.setAnimation((animation != null) ? animation.name : null);
    };
    ModelRendererUpdater.prototype._onModelAssetEdited = function (id, command) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var commandCallback = this[("_onEditCommand_" + command)];
        if (commandCallback != null)
            commandCallback.apply(this, args);
        if (this.editAssetCallbacks != null) {
            var editCallback = this.editAssetCallbacks.model[command];
            if (editCallback != null)
                editCallback.apply(null, args);
        }
    };
    ModelRendererUpdater.prototype._onEditCommand_setModel = function () {
        this._setModel();
    };
    ModelRendererUpdater.prototype._onEditCommand_setMaps = function (maps) {
        var _this = this;
        // TODO: Only update the maps that changed, don't recreate the whole model
        this._prepareMaps(this.modelAsset.pub.textures, function () {
            _this._setModel();
        });
    };
    ModelRendererUpdater.prototype._onEditCommand_newAnimation = function (animation, index) {
        this.modelRenderer.updateAnimationsByName();
        this._playAnimation();
    };
    ModelRendererUpdater.prototype._onEditCommand_deleteAnimation = function (id) {
        this.modelRenderer.updateAnimationsByName();
        this._playAnimation();
    };
    ModelRendererUpdater.prototype._onEditCommand_setAnimationProperty = function (id, key, value) {
        this.modelRenderer.updateAnimationsByName();
        this._playAnimation();
    };
    ModelRendererUpdater.prototype._onEditCommand_setMapSlot = function (slot, name) { this._setModel(); };
    ModelRendererUpdater.prototype._onEditCommand_deleteMap = function (name) { this._setModel(); };
    ModelRendererUpdater.prototype._onEditCommand_setProperty = function (path, value) {
        switch (path) {
            case "unitRatio":
                this.modelRenderer.setUnitRatio(value);
                break;
            case "opacity":
                if (!this.overrideOpacity)
                    this.modelRenderer.setOpacity(value);
                break;
        }
    };
    ModelRendererUpdater.prototype._onModelAssetTrashed = function () {
        this.modelAsset = null;
        this.modelRenderer.setModel(null);
        // FIXME: the updater shouldn't be dealing with SupClient.onAssetTrashed directly
        if (this.editAssetCallbacks != null)
            SupClient.onAssetTrashed();
    };
    ModelRendererUpdater.prototype._onShaderAssetReceived = function (assetId, asset) {
        this.shaderPub = asset.pub;
        this._setModel();
    };
    ModelRendererUpdater.prototype._onShaderAssetEdited = function (id, command) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (command !== "editVertexShader" && command !== "editFragmentShader")
            this._setModel();
    };
    ModelRendererUpdater.prototype._onShaderAssetTrashed = function () {
        this.shaderPub = null;
        this._setModel();
    };
    ModelRendererUpdater.prototype.config_setProperty = function (path, value) {
        switch (path) {
            case "modelAssetId":
                if (this.modelAssetId != null)
                    this.client.unsubAsset(this.modelAssetId, this.modelSubscriber);
                this.modelAssetId = value;
                this.modelAsset = null;
                this.modelRenderer.setModel(null, null);
                if (this.modelAssetId != null)
                    this.client.subAsset(this.modelAssetId, "model", this.modelSubscriber);
                break;
            case "animationId":
                this.animationId = value;
                if (this.modelAsset != null)
                    this._playAnimation();
                break;
            case "castShadow":
                this.modelRenderer.setCastShadow(value);
                break;
            case "receiveShadow":
                this.modelRenderer.threeMesh.receiveShadow = value;
                this.modelRenderer.threeMesh.material.needsUpdate = true;
                break;
            case "overrideOpacity":
                this.overrideOpacity = value;
                this.modelRenderer.setOpacity(value ? null : this.modelAsset.pub.opacity);
                break;
            case "opacity":
                this.modelRenderer.setOpacity(value);
                break;
            case "color":
                var hex = parseInt(value, 16);
                this.modelRenderer.setColor((hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255);
                break;
            case "materialType":
                this.materialType = value;
                this._setModel();
                break;
            case "shaderAssetId":
                if (this.shaderAssetId != null)
                    this.client.unsubAsset(this.shaderAssetId, this.shaderSubscriber);
                this.shaderAssetId = value;
                this.shaderPub = null;
                this.modelRenderer.setModel(null);
                if (this.shaderAssetId != null)
                    this.client.subAsset(this.shaderAssetId, "shader", this.shaderSubscriber);
                break;
        }
    };
    return ModelRendererUpdater;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModelRendererUpdater;

},{}]},{},[1]);
