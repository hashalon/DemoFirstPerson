abstract class Game {
    
    // the physic engine's world
    public static world : CANNON.World;
    
    // no friction material for Character Controllers
    public static material : CANNON.Material;
    
    public static init(){
        Game.world = Sup.Cannon.getWorld();
        Game.world.gravity.set( 0, -6000/Sup.Game.getFPS(), 0 );
        Game.world.defaultContactMaterial.friction = 0.1;
        
        Game.material = new CANNON.Material("playerMaterial");
        Game.world.addContactMaterial(new CANNON.ContactMaterial(Game.material, Game.world.defaultMaterial, {
            friction: 0,
            restitution: 0,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3
        }));
    }
}
Game.init();
