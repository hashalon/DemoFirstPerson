class PlayerMove {
    
    protected player : PlayerController;
    
    protected grounded    : boolean;
    
    public constructor( controller : PlayerController ){
        this.player      = controller;
        this.grounded    = false;
        
        this.player.actor.cannonBody.body.material = Game.material;
        
        // we add an event to know if our player is grounded or not
        this.player.actor.cannonBody.body.addEventListener("collide", (event) => {
            // if we register a surface with a normal pointing upward, then we are grounded
            if(event.contact.ni.y > 0.9) this.grounded = true;
        });
    }
    
    public update() {
        // we recover the inputs of the player
        let input = this.player.input.Movement;
        let jump  = this.player.input.Jump;
        
        // we recover the horizontal angle of our player
        let angle = this.player.look.angle.x;
        // we recover the cannonbody of the player
        let body = this.player.actor.cannonBody.body;
        
        // we recover the old velocity and we create our new velocity vector to apply to our body
        let velocity = new CANNON.Vec3();
        
        // we calculate the velocity horizontally
        velocity.x = ( input.x*Math.cos(angle) - input.y*Math.sin(angle)) * this.player.moveSpeed;
        velocity.z = (-input.x*Math.sin(angle) - input.y*Math.cos(angle)) * this.player.moveSpeed;
        
        // we keep the same vertical velocity
        velocity.y = body.velocity.y;
        
        // if we are grounded and the player press the jump key
        if( this.grounded && jump ){
            this.grounded = false; // we are no longer grounded
            velocity.y = this.player.jumpForce; // we jump
        }
        
        // we apply the velocity to the player
        body.velocity = velocity;
    }
}
