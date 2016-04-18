// this behavior only work when added to an actor with a camera
class PostProcess extends Sup.Behavior {
    
    // will load shaders that are defined in the assets manager
    public shaderPaths : string; // format : "path1/shader1;path2/shader2"
    public useSkybox   : boolean = false;
    
    protected composer; // of type EffectComposer
    
    // since we use outside scripts, we need to make sure they are imported before using them
    public start() {
        // the camera component
        let camera = (<any>this.actor.camera).__inner;
        let gameInstance = (<any>this.actor).__inner.gameInstance;
        
        // our current THREE.js scene
        let scene    = gameInstance.threeScene;
        // our current THREE.js renderer
        let renderer = gameInstance.threeRenderer;
        // we create a new composer that will apply its renders to the current renderer
        let composer = new THREE.EffectComposer(renderer);
        // if we're not using a skybox, we clear the canvas from the previous render
        if(!this.useSkybox) composer.addPass(new THREE.ClearPass());
        // we add the render of the scene from the camera as the first pass
        composer.addPass(new THREE.RenderPass(scene, camera.threeCamera));
        
        // we recover the old render function
        let oldRender = camera.render;
        // we change the render function
        camera.render = function(){
            // we call the old render function
            oldRender.apply(this,arguments);
            // we recover the dimension of the renderer viewport
            let dim : {
                x:number, // x position
                y:number, // y position
                z:number, // width
                w:number  // height
            } = {x:0,y:0,z:0,w:0};
            gameInstance.threeRenderer.getViewport(dim);
            // reset the size of the composer based on the viewport
            composer.setSize( dim.z, dim.w );
            // we apply the render of the composer to the renderer
            composer.render();
        };
        
        // we store the composer as an attribute of the class
        this.composer = composer;
        
        // if we have set shader paths
        if( this.shaderPaths != null ){
            let paths = this.shaderPaths.split(";");
            for( let path of paths ){
                this.addShader(path,false);
            }
            // we recover the last passes, and we render it to the screen
            this.composer.passes[this.composer.passes.length-1].renderToScreen = true;
        }
    }
    
    public addPass( pass ){
        this.composer.addPass(pass);
    }
    
    // this function create a shader
    public addShader( shader : string|Sup.Shader, renderToScreen : boolean ){
        // if the given value is a path
        if(typeof shader === 'string'){
            // we remplace the path by our shader
            shader = Sup.get((<string>shader), Sup.Shader);
        }
        // if the shader is null, we mustn't add it to the passes
        if( shader == null ) return;
        
        // we need to convert the uniforms in the right format
        let uniforms = {};
        for( let uni of (<any>shader).__inner.uniforms ){
            // values can have various types
            let value = null;
            switch( uni.type ){
                case 't' : // texture
                    break;
                case 'f' : // float
                    value = parseFloat(uni.value);
                    break;
                case 'c' : // color
                    value = new THREE.Color(uni.value);
                    break;
                case 'v2' : // vector2
                    value = new THREE.Vector2(uni.value[0],uni.value[1]);
                    break;
                case 'v3' : // vector3
                    value = new THREE.Vector3(uni.value[0],uni.value[1],uni.value[2]);
                    break;
                case 'v4' : // vector4
                    value = new THREE.Vector4(uni.value[0],uni.value[1],uni.value[2],uni.value[3]);
                    break;
            }
            // we create the uniforms with the right type
            uniforms[uni.name] = {
                type  : uni.type,
                value : value
            };
        }
        
        // we create the new Shader
        let threeShader = {
            uniforms: uniforms,
            vertexShader: (<any>shader).__inner.vertexShader.text,
            fragmentShader: (<any>shader).__inner.fragmentShader.text
        };
        // we create the new shaderpass
        let pass = new THREE.ShaderPass(threeShader);
        // if the shader is the last one, set this to true, false otherwise
        pass.renderToScreen = renderToScreen;
        
        // we finally add the pass to the composer
        this.composer.addPass(pass);
    }
}
Sup.registerBehavior(PostProcess);
