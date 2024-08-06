class Obstacle
{ 
    static ACTIVE_SHIFT = 31
    static COLLISION_SHIFT = 30
    static OBSTACLE_PRIORITY = 255;

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
     * The method of callback on you added to the scenes
     * @param {Scenes} scenes Scenes you are added to
     */
    onAddToScenes(scenes){}

    /**
     * The method of callback on you remove from the scenes
     * @param {Scenes} scenes Scenes you are remove from
     */
    onRemoveFromScenes(scenes){}

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
    setCanCollision(can){
        if(can)
            this.mPrivateFlags &= ~(1 << Obstacle.COLLISION_SHIFT)
        else
            this.mPrivateFlags |= (1 << Obstacle.COLLISION_SHIFT)
    }
    canCollision(){
        return this.isActive() && 
            (this.mPrivateFlags >> Obstacle.COLLISION_SHIFT & 1) == 0
    }
    setPriority(priority){
        this.mPrivateFlags |= (priority & Obstacle.OBSTACLE_PRIORITY)
    }
    getPriority(){
        return this.mPrivateFlags & Obstacle.OBSTACLE_PRIORITY
    }

    /**
     * The method of callback before draw, update your state
     */
    update()
    {
        // set the size of the target rectangle with the size of the source rectangle
        // default is to use the bottom and left
        if(this.mActiveAnimation !== null){
            this.mActiveAnimation.update()
            let srcBounds = this.mActiveAnimation.getCurrentImageBounds()
            let dstBounds = this.mBounds
            dstBounds.right = dstBounds.left + srcBounds.width()
            dstBounds.top = dstBounds.bottom - srcBounds.height()
        }
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
    static JUMP_HEIGHT = 150
    static STATE_RUN = 0
    static STATE_JUMP = 1
    static STATE_DOWN = 2

    constructor(){
        super()
        this.xSpeed = 5
        this.ySpeed = 0
        this.jumpStart = 0
        this.healthy = 10
        this.mState = Hero.STATE_RUN
        this.mAnimations = new Array(3)
    }

    prepare(finish)
    {
        // Arrow functions do not have their own scope, 
        // function and class have their own scope
        let prepareCount = 0
        FileUtils.loadAnimation(R.animation.hero_run)
            .then(run => {
                let animation = new FrameAnimation(run)
                animation.mAnimationListener = new RepeatAnimationListener()
                this.mAnimations[Hero.STATE_RUN] = animation
                this.switchState(Hero.STATE_RUN)
                this.mBounds.set(this.mActiveAnimation.getCurrentImageBounds())
                // Each task completes, prepareCount++
                // When all tasks are completed, call finish
                prepareCount++;
                if(prepareCount === this.mAnimations.length)
                    finish(this)
                return run
            })
        FileUtils.loadAnimation(R.animation.hero_jump)
            .then(jump => {
                let animation = new FrameAnimation(jump)
                animation.mAnimationListener = new SwitchAnimationListener(this, Hero.STATE_RUN)
                this.mAnimations[Hero.STATE_JUMP] = animation
                prepareCount++;
                if(prepareCount === this.mAnimations.length)
                    finish(this)
                return jump
            })
        FileUtils.loadAnimation(R.animation.hero_down)
            .then(down => {
                let animation = new FrameAnimation(down)
                animation.setAnimationDuartion(60)
                animation.mAnimationListener = new SwitchAnimationListener(this, Hero.STATE_RUN)
                this.mAnimations[Hero.STATE_DOWN] = animation
                prepareCount++;
                if(prepareCount === this.mAnimations.length)
                    finish(this)
                return down
            })
        /**
         * default, need to be defined before using the class, 
         * but execute loadAnimation callback has a delay, So class is defined first
         */
        class SwitchAnimationListener extends AnimationListener
        {
            constructor(hero, state){
                super()
                this.hero = hero
                this.state = state
            }
            onAnimationEnd(animation){
                this.hero.switchState(this.state)
            }
        }
    }

    switchState(state){
        this.mState = state
        this.startAnimation(this.mAnimations[state])
    }

    update(){
        super.update()
        let jumpHeight = this.jumpStart - this.mBounds.bottom
        if(this.mState === Hero.STATE_JUMP && jumpHeight >= Hero.JUMP_HEIGHT){
            this.ySpeed = 0
        }
        this.mBounds.offset(this.xSpeed, this.ySpeed)
    }

    handleEvent(event){
        if(event.type === "click" && this.mState === Hero.STATE_RUN){
            this.ySpeed = -(this.mScenes.mGravity * 2)
            this.jumpStart = this.mBounds.bottom
            this.switchState(Hero.STATE_JUMP)
        }
        else if(event.type === "contextmenu" && this.mState === Hero.STATE_RUN){
            this.switchState(Hero.STATE_DOWN)
        }
    }
}

class Lion extends Obstacle
{
    constructor(){
        super()
        this.xSpeed = 5
        this.attack = 1
    }

    prepare(finish){
        FileUtils.loadAnimation(R.animation.lion_run)
            .then(run => {
                let animation = new FrameAnimation(run)
                animation.setAnimationListener(new RepeatAnimationListener())
                this.startAnimation(animation)
                finish(this)
            })
    }

    onCollision(other){
        if(other instanceof Hero){
            other.healthy -= this.attack
            other.mBounds.offset(-this.xSpeed, 0)
        }
    }
}

class Tortoise extends Obstacle
{

}

class Pillar extends Obstacle
{
    constructor(){
        super()
    }

    prepare(finish){
        FileUtils.loadAnimation()
    }

    update(){
        this.mBounds.offset(0, -this.mScenes.mGravity)
    }
}