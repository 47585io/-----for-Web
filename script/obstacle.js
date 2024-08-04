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
     * The method of callback before you will added to the scenes, 
     * prepare your data until you're ready to call finish, 
     * you must set your mActiveAnimation and mBounds
     * @param {(obstacle: Obstacle) => void} finish  finish(this), 
     *      The callback of When the data preparation is completed, 
     *      it is used to notify the scenes to add you to the scenes
     */
    prepare(finish){}

    /**
     * switch mActiveAnimation to animation and start animation
     * @param {FrameAnimation} animation 
     */
    startAnimation(animation){
        this.mActiveAnimation = animation
        this.mActiveAnimation.start()
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
     * The method of callback before draw, update your state
     */
    update(){
        if(this.mActiveAnimation !== null)
            this.mActiveAnimation.update()
    }

    /** 
     * The method of callback when the refresh of each frame arrives
     * @param {CanvasRenderingContext2D} context draw your own images on the canvas
     */
    draw(context) 
    {
        // Draw the image of the current frame of
        // the mActiveAnimation in the location of mBounds
        if(this.mActiveAnimation !== null){
            let image = this.mActiveAnimation.getCurrentImage()
            let srcBounds = this.mActiveAnimation.getCurrentImageBounds()
            let dstBounds = this.mBounds
            context.drawImage(image, srcBounds.left, srcBounds.top, srcBounds.width(), srcBounds.height(),
                dstBounds.left, dstBounds.top, dstBounds.width(), dstBounds.height())
        }
    }

    /**
     * The method of callback when you collide with another obstacle
     * @param {Obstacle} other colliding other obstacle
     */
    onCollision(other){}

    /**
     * The method of callback when you can receive a DOM event
     * @param {Event} event rceived event
     * @returns {boolean} if consume event, return ture
     */
    handleEvent(event){}
}

class Hero extends Obstacle
{
    static JUMP_HEIGHT = 100
    static STATE_RUN = 0
    static STATE_JUMP = 1
    static STATE_DOWN = 2

    constructor(){
        super()
        this.mSpeed = 5
        this.mState = Hero.STATE_RUN
        this.mAnimations = new Array(3)
    }

    prepare(finish)
    {
        FileUtils.loadAnimation(R.animation.hero_run)
            .then(run => {
                this.mAnimations[Hero.STATE_RUN] = new FrameAnimation(run)
                this.switchState(Hero.STATE_RUN)
                this.mBounds.set(this.mActiveAnimation.getCurrentImageBounds())
                finish(this)
                return run
            })
    }

    switchState(state){
        this.mState = state
        this.startAnimation(this.mAnimations[state])
    }

    update(){
        super.update()
        this.mBounds.offset(this.mSpeed, 0)
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