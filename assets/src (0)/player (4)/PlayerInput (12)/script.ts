// the input module allow us to change keybindings
// it also gives us access to getter to preprocess the player inputs
class PlayerInput {
    
    // store the keys of our layout
    private keys : string[];
    
    // count down the time passed since the last jump-key press
    private jumpCounter : number;
    
    public constructor( layout? : string ){
        // we create an array to store our input layout
        this.keys = [];
        // we assert that the layout is "QWERTY"
        this.keys["forward" ] = "W";
        this.keys["backward"] = "S";
        this.keys["left"    ] = "A";
        this.keys["right"   ] = "D";
        this.keys["jump"    ] = "SPACE";              
        
        // now we change the keys based on the keyboard layout
        switch( layout ){
            case "QWERTY" : break; // english
            case "QWERTZ" : break; // german
            case "QZERTY" : // italian
                this.keys["forward"] = "Z";
                break;
            case "AZERTY" : // french
                this.keys["forward"] = "Z";
                this.keys["left"   ] = "Q";
                break;
            // if you wish to add more keyboard layout,
            // you can add more cases here
        }
    }
    public update(){
        // we use a counter for the jump action because in games,
        // the player is used to be able to jump right after an other jump.
        // But if he touch the ground after having pressed the jump key,
        // the system will register that he wasn't on the ground when he pressed the jump key.
        // And therefore, the controller will not jump.
        // To avoid that, we create a counter that will tell if the player pressed the jump key,
        // during the last milliseconds.
        
        // if the player is pressing the jump key
        if( Sup.Input.wasKeyJustPressed(this.keys["jump"]) ){
            // we set the countdown
            this.jumpCounter = 10; // count down in frame : 10 frames = 0.17s
        }
        // countdown
        if( this.jumpCounter > 0 ){
            --this.jumpCounter;
        }
    }
    /* GETTERS */
    // return the mouse movement of the player
    public get Look() : Sup.Math.XY{
        // we directly return the mouse delta from Sup.Input
        return Sup.Input.getMouseDelta();
    }                   
    // return the keys pressed by the player on X-axis and Y-
    public get Movement() : Sup.Math.XY{
        // we want to return the movement of the player on both axis directly
        let movement = {x:0,y:0}; // x -> left/right , y -> forward/backward
        // we don't use if else statement because if the player press two opposite keys at the same time,
        // we want the controller to stay at the same place
        if(Sup.Input.isKeyDown(this.keys["forward" ])) ++movement.y;
        if(Sup.Input.isKeyDown(this.keys["backward"])) --movement.y;
        if(Sup.Input.isKeyDown(this.keys["left"    ])) --movement.x;
        if(Sup.Input.isKeyDown(this.keys["right"   ])) ++movement.x;
        return movement;
    }
    // return true if the player pressed the jump key in the last milliseconds
    public get Jump() : boolean{
        // if the player press the jump key, during the last milliseconds
        if( this.jumpCounter > 0 ){
            // we reset the counter
            this.jumpCounter = 0;
            return true;
        }
        return false;
    }
}
