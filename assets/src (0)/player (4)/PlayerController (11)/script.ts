class PlayerController extends Sup.Behavior {
    
    // those allow us to control the basic attributes of our First Person Controller
    public keyboard    : string;
    public moveSpeed   : number = 20;
    public jumpForce   : number = 30;
    public sensitivity : number = 0.6;
    
    // we declare the modules of our controller
    public input : PlayerInput;
    public look  : PlayerLook;
    public move  : PlayerMove;
    
    // we keep track of the three Actors that form our controller :
    // the current actor of this script, with the cannonbody attached to it
    public torso : Sup.Actor; // the actor that allow us to rotate the controller horizontally
    public head  : Sup.Actor; // the actor that allow us to rotate the camera vertically
    
    public awake() {
        // we need to recover our actors
        this.torso = this.actor.getChild("Torso");
        this.head  = this.actor.getChild("Head" );
        
        // we initialize our modules
        this.input = new PlayerInput(this.keyboard);
        this.look  = new PlayerLook(this);
        this.move  = new PlayerMove(this);
        
        // we want to capture the mouse of the player
        Sup.Input.lockMouse();
    }
    
    public update() {
        // we update each module in sequence
        this.input.update();
        this.look .update();
        this.move .update();
        // it allow us to make sure to update the modules in the right order
        
        // if the player press escape, the cursor is released
        if(Sup.Input.isKeyDown("ESCAPE")){
            Sup.Input.unlockMouse();
        }
    }
}
Sup.registerBehavior(PlayerController);
