class Obstacle
{ 
    constructor(){
        this.mBounds = new Rect()
        this.mActiveAnimation = null
    }

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