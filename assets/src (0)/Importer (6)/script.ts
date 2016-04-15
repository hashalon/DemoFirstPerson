// we add a scripts from outside sources
declare let window;

// the script we import add functionnalities to THREE.js
// therefore we need to declare THREE before importing them
declare let THREE;
THREE = window.SupEngine.THREE;

// this function allow us to import scripts from outside source and use them in Superpowers
(function (){
    let scripts : string[] = [
        // postprocess scripts
        "http://threejs.org/examples/js/postprocessing/EffectComposer.js",
        "http://threejs.org/examples/js/postprocessing/ClearPass.js",
        "http://threejs.org/examples/js/postprocessing/RenderPass.js",
        "http://threejs.org/examples/js/postprocessing/MaskPass.js",
        "http://threejs.org/examples/js/postprocessing/ShaderPass.js",
        // shader scripts
        "http://threejs.org/examples/js/shaders/CopyShader.js",
        "http://threejs.org/examples/js/shaders/DotScreenShader.js",
        "http://threejs.org/examples/js/shaders/RGBShiftShader.js"
    ];
    for( let script of scripts ){
        let script_div = window.document.createElement('script');
        script_div.type = "text/javascript";
        script_div.src = script;
        window.document.body.appendChild(script_div);
    }
})();
