// the purpose of this script is to rotate the collider of the Player cannonBody
// it wont be necessary in future version of superpowers (current v0.19.0)
class RotateCollider extends Sup.Behavior {
    start() {
        // we create a rotation to rotate the cylinder shape
        let quat = new Sup.Math.Quaternion();
        quat.setFromYawPitchRoll( 0, -Math.PI*0.5, 0 );
        // we convert the Sup Quaternion to a CANNON Quaternion
        let cannonQuat = new CANNON.Quaternion(
            quat.x, quat.y, quat.z, quat.w
        );
        (<any>this.actor.cannonBody.body).shapeOrientations[0] = cannonQuat;
        
        for( let body of Game.world.bodies ){
            Sup.log(body);
        }
    }
    update(){
        // we don't need this behavior anymore
        this.destroy();
    }
}
Sup.registerBehavior(RotateCollider);
