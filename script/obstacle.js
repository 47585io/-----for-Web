class Obstacle
{ 
    static ACTIVE_SHIFT = 31
    static COLLISION_SHIFT = 30

    constructor(){
        this.mBounds = new Rect()
        this.mActiveAnimation = null
        this.mPrivateFlags = 0
    }

    kill(){
        this.mPrivateFlags |= (1 << Obstacle.ACTIVE_SHIFT)
    }
    isActive(){
        return (this.mPrivateFlags >> Obstacle.ACTIVE_SHIFT & 1) == 0
    }
    setCantCollision(){
        this.mPrivateFlags |= (1 << Obstacle.COLLISION_SHIFT)
    }
    canCollision(){
        return this.isActive() && 
            (this.mPrivateFlags >> Obstacle.COLLISION_SHIFT & 1) == 0
    }

    /**
     * The method of callback before draw
     * update your state
     */
    update(){}

    /** 
     * The method of callback when the refresh of each frame arrives, 
     * @param {CanvasRenderingContext2D} context draw your own images on the canvas
     */
    draw(context) {
        
    }

    /**
     * The method of callback when you collide with another obstacle, 
     * @param {Obstacle} other colliding other obstacle
     */
    onCollision(other){}

    /**
     * The method of callback when you can receive a DOM event, 
     * @param {Event} event rceived event
     * @returns {boolean} if consume event, return ture
     */
    handleEvent(event){}
}

class Hero extends Obstacle
{
    static heroJumpHeight = 100

    constructor(){
        super()
        this.speed = 5
    }

    handleEvent(event){
       
    }
}