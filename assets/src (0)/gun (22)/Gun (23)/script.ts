class Gun extends Sup.Behavior {
    
    // we can set the bullet path as a public attribute,
    // so we can change it in the component editor of the prefab
    public bullet   : string = "prefab/Bullet";
    public fireRate : number = 20; // how fast do we shoot bullets
    
    protected emitter : Sup.Actor;
    
    private timer : number = 0;
    
    public awake() {
        this.emitter = this.actor.getChild("Emitter");
    }

    public update() {
        // if the timer is set, we decrement it
        if( this.timer > 0 ) --this.timer;
        
        // if the timer allow us to shoot and the player is pulling the trigger
        if( this.timer <= 0 && Sup.Input.isMouseButtonDown(0) ){
            // we want to cap the amout of bullets produce while holding the trigger
            this.timer = this.fireRate;
            
            // we create a new bullet
            let bullet = Sup.appendScene(this.bullet)[0];
            // we call the init function on the bullet
            let behavior = bullet.getBehavior(Bullet);
            behavior.init(this.emitter.getPosition(), this.emitter.getOrientation());
            
            // the behavior of the bullet will take care of it's movement from now on
        }
    }
}
Sup.registerBehavior(Gun);
