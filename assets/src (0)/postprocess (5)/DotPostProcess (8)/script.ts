// Based on this example :
// http://threejs.org/examples/#webgl_postprocessing
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing.html
class DotPostProcess extends PostProcess {
    public start() {
        super.start();
        
        // we want to add nice effects
        
        // dot effect
        let dot_effect = new THREE.ShaderPass( THREE.DotScreenShader );
        dot_effect.uniforms['scale'].value = 4;
        //effect.renderToScreen = true;
        this.composer.addPass(dot_effect);
        
        // rgb shift effect
        let rgbshift_effect = new THREE.ShaderPass( THREE.RGBShiftShader );
		rgbshift_effect.uniforms['amount'].value = 0.0015;
		rgbshift_effect.renderToScreen = true;
		this.composer.addPass(rgbshift_effect);
        
        // to add other effects, you can import them in the importer
        // create a new script and call addPass(pass) on PostProcess
        // or you can call addShader(shader,renderToScreen)
    }
}
Sup.registerBehavior(DotPostProcess);
