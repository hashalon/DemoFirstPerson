class PlayerLook {
    
    // we need those value to clamp the movement of the camera
    protected static halfPI : number = Math.PI*0.5;
    protected static TAU    : number = Math.PI*2;
    
    protected player : PlayerController;
    
    // we store the current angle of the player because Quaternion conversion is not precise enough
    public angle : Sup.Math.XY;
    
    public constructor ( controller : PlayerController ){
        this.player = controller;
        this.angle  = {x:0,y:0};
    }
    
    public update() {
        // we recover the inputs of the player
        let input = this.player.input.Look;
        
        // we apply the sensitivity to our inputs
        input.x *= -this.player.sensitivity;
        input.y *=  this.player.sensitivity;
        
        // we rotate the torso horizontally
        this.player.torso.rotateLocalEulerY(input.x); // we rotate on the Y-axis
        this.angle.x += input.x;
        this.angle.x %= PlayerLook.TAU;
        
        // we rotate the head vertically
        this.player.head.rotateLocalEulerX(input.y);
        this.angle.y += input.y;
        
        // we clamp the movement of the head
        let hPI = PlayerLook.halfPI;
        if( this.angle.y > hPI ){ // we clamp the value upward
            this.player.head.setLocalEulerX(hPI);
            this.angle.y = hPI;
        }else if( this.angle.y < -hPI ){ // we clamp the value downward
            this.player.head.setLocalEulerX(-hPI);
            this.angle.y = -hPI;
        }
    }
}
