class GameBoyPostProcess extends PostProcess {
    public start() {
        super.start();
        // we give the path to the shader in the asset manager
        this.addShader("res/shaders/GameBoy", true);
    }
}
Sup.registerBehavior(GameBoyPostProcess);
