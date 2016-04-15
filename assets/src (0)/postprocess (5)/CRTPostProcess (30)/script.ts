class CRTPostProcess extends PostProcess {
    public start() {
        super.start();
        // we give the path to the shader in the asset manager
        this.addShader("res/shaders/CRT",true);
    }
}
Sup.registerBehavior(CRTPostProcess);
