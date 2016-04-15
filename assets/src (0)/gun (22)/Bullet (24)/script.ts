class Bullet extends Sup.Behavior {
    
    public speed : number = 0.5; // speed of the bullet
    public timer : number = 180; // life time of the bullet in frames
    
    private vector : CANNON.Vec3; // will allow us to perform raycasts
    
    public init( position : Sup.Math.Vector3, orientation : Sup.Math.Quaternion ) {
        
        // we move the bullet to the right location
        this.actor.setPosition   (position   );
        this.actor.setOrientation(orientation);
        
        // we create a vector of the right length pointing in the right direction
        let vector = new Sup.Math.Vector3(0,0,-this.speed);
        vector.rotate(orientation);
        
        // we convert the vector into a CANNON.Vec3
        this.vector = new CANNON.Vec3(vector.x, vector.y, vector.z);
    }

    public update() {
        // we decrement the timer
        --this.timer;
        // if the timer is over, we destroy the bullet to avoid over charge the memory with useless bullets
        if( this.timer < 0 ) this.actor.destroy();
        
        // we recover the current position of the bullet
        let pos = this.actor.getPosition();
        
        // we want to cast a ray from its current position and its position at the next frame
        let from = new CANNON.Vec3(pos.x, pos.y, pos.z);
        let to   = from.clone();
        to = to.vadd(this.vector);
        
        // we cast a ray in front of the bullet
        let result = this.raycast(from, to);
        
        // if we have collided with something
        if( result.hasHit ){
            // we can do stuff here to deal damage, or create cool particle effects
            // but we're going to keep it simple
            Sup.log(result);
            this.actor.destroy();
        }
        this.actor.moveOrientedZ(-this.speed);
    }
    
    // generate a raycast from position 1 to position 2, -1 = no filter
    protected raycast( from:CANNON.Vec3, to:CANNON.Vec3, filter:number = -1 ) : CANNON.RaycastResult{
        // options of the raycast
        let iray : CANNON.IRayIntersectWorldOptions = {
            mode   : CANNON.Ray.ANY,
            result : null,
            skipBackfaces : true, // we don't need to check collision for back faces
            collisionFilterMask  : filter, // filter which body we want collide with
            collisionFilterGroup : -1,     // -1 = no filter
            from : from, // start point of the ray
            to   : to,   // end   point of the ray
            callback : null
        };
        let ray = new CANNON.Ray();
        
        // we cast our ray in the current CANNON.World
        ray.intersectWorld(Game.world, iray);
        return ray.result;
    }
}
Sup.registerBehavior(Bullet);
