class Obstacle
{ 
    static ACTIVE_SHIFT = 31
    static COLLISION_SHIFT = 30

    constructor(){
        this.mBounds = new Rect()
        this.mActiveAnimation = null
        this.mPrivateFlags = 0
        this.mScenes = null
    }

    /**
     * 
     * @param {FrameAnimation} animation 
     */
    startAnimation(animation){
        this.mActiveAnimation = animation
        this.mActiveAnimation.start()
    }

    loadAnimation(path){
        FileUtils.loadAnimation(path)
            .then(frames => {
                let animation = new FrameAnimation(frames)
                this.startAnimation(animation)
                return frames
            })
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
    update(){
        if(this.mActiveAnimation !== null)
            this.mActiveAnimation.update()
    }

    /** 
     * The method of callback when the refresh of each frame arrives, 
     * @param {CanvasRenderingContext2D} context draw your own images on the canvas
     */
    draw(context) 
    {
        if(this.mActiveAnimation !== null){
            let image = this.mActiveAnimation.getCurrentImage()
            let srcBounds = this.mActiveAnimation.getCurrentImageBounds()
            let dstBounds = this.mBounds
            context.drawImage(image, srcBounds.left, srcBounds.top, srcBounds.width(), srcBounds.height(),
                dstBounds.left, dstBounds.top, dstBounds.width(), dstBounds.height())
        }
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
        this.loadAnimation(R.animation.hero_run)
    }

    update(){
        if(this.mActiveAnimation === null)
            return
        let srcBounds = this.mActiveAnimation.getCurrentImageBounds()
        let dstBounds = this.mBounds
        dstBounds.right = dstBounds.left + srcBounds.width()
        dstBounds.top = dstBounds.bottom - srcBounds.height()
    }

    handleEvent(event){
       
    }
}