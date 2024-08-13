/**
 * The Base Class for all obstacles in the game.
 * 
 * This class serves as the foundation for creating various types of obstacles. 
 * All obstacle objects added to the scenes should inherit from this class to 
 * ensure consistent behavior and properties. It manages the basic attributes 
 * and functionality required for obstacles, including bounds, animations, and 
 * scenes management.
 */
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

    /**
     * load Animation at first time for the obstacle
     * @param {string} path load animation path (call to FileUtils.loadAnimation(path))
     * @param {(animation: FrameAnimation) => void} configAnimation
     *      the callback are used to animation or perform other operations,
     *      it is called at the end of the function without worrying about any dependencies
     * @param {boolean} setActive if true, startAnimation to it,
     *      and set mBounds to the size of the first frame of the animation
     */
    loadAnimation(path, configAnimation = undefined, setActive = true)
    {
        FileUtils.loadAnimation(path)
            .then(frames => {
                let animation = new FrameAnimation(frames)
                if(setActive){
                    this.startAnimation(animation)
                    this.mBounds.set(this.mActiveAnimation.getCurrentFrame().bounds)
                }
                if(configAnimation !== undefined)
                    configAnimation(animation)
                return frames
            })
    }

    kill(){
        this.mPrivateFlags |= (1 << Obstacle.ACTIVE_SHIFT)
    }
    isActive(){
        return (this.mPrivateFlags >> Obstacle.ACTIVE_SHIFT & 1) === 0
    }
    setCanCollision(can){
        if(can)
            this.mPrivateFlags &= ~(1 << Obstacle.COLLISION_SHIFT)
        else
            this.mPrivateFlags |= (1 << Obstacle.COLLISION_SHIFT)
    }
    canCollision(){
        return this.isActive() && 
            (this.mPrivateFlags >> Obstacle.COLLISION_SHIFT & 1) === 0
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
            let srcBounds = this.mActiveAnimation.getCurrentFrame().bounds
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
            let frame = this.mActiveAnimation.getCurrentFrame()
            let image = frame.image
            let srcBounds = frame.bounds
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
    handleEvent(event){
        return false
    }
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
        this.hitSound = null
    }

    prepare(finish)
    {
        // Each task completes, prepareCount--
        // When all tasks are completed, call finish
        let prepareCount = 4

        FileUtils.loadMusic(Res.music.hit).then(sound => {
            this.hitSound = sound
            if(--prepareCount === 0)
                finish(this)
            return sound
        })

        this.loadAnimation(Res.animation.hero_run, animation => {
            animation.mAnimationListener = new RepeatAnimationListener()
            this.mAnimations[Hero.STATE_RUN] = animation
            if(--prepareCount === 0)
                finish(this)
        })
        
        this.loadAnimation(Res.animation.hero_jump, animation => {
            animation.mAnimationListener = new SwitchAnimationListener(this, Hero.STATE_RUN)
            this.mAnimations[Hero.STATE_JUMP] = animation
            if(--prepareCount === 0)
                finish(this)
        }, false)

        this.loadAnimation(Res.animation.hero_down, animation => {
            animation.setAnimationDuartion(60)
            animation.mAnimationListener = new SwitchAnimationListener(this, Hero.STATE_RUN)
            this.mAnimations[Hero.STATE_DOWN] = animation
            if(--prepareCount === 0)
                finish(this)
        }, false)
        
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

    hurt(attack){
        this.healthy -= attack
        creatAudioBufferSourceNode(this.hitSound).start()
    }

    update(){
        super.update()
        let jumpHeight = this.jumpStart - this.mBounds.bottom
        if(this.mState === Hero.STATE_JUMP && jumpHeight >= Hero.JUMP_HEIGHT){
            this.ySpeed = 0
        }
        this.mBounds.offset(this.xSpeed, this.ySpeed)
    }

    handleEvent(event)
    {
        if(this.mState === Hero.STATE_RUN)
        {
            if((event.type === "click" || 
               (event.type === "keyup" && event.key === "ArrowUp"))){
                this.ySpeed = -(this.mScenes.mGravity * 2)
                this.jumpStart = this.mBounds.bottom
                this.switchState(Hero.STATE_JUMP)
                return true
            }
            else if((event.type === "contextmenu" ||
               (event.type === "keyup" && event.key === "ArrowDown"))){
                this.switchState(Hero.STATE_DOWN)
                return true
            }
        }
        return false
    }
}

class Lion extends Obstacle
{
    constructor(){
        super()
        this.xSpeed = 1
        this.attack = 1
    }

    prepare(finish){
        this.loadAnimation(Res.animation.lion_run, animation => {
            animation.setAnimationListener(new RepeatAnimationListener())
            finish(this)
        }) 
    }

    update(){
        super.update()
        this.mBounds.offset(-this.xSpeed, 0)
    }

    onCollision(other){
        if(other instanceof Hero){
            other.hurt(this.attack)
            other.mBounds.offset(-this.xSpeed * 10, 0)
        }
    }
}

class Tortoise extends Obstacle
{
    static BROKEN_SHIFT = 29

    constructor(){
        super()
        this.attack = 1
    }

    broken(){
        this.mPrivateFlags |= (1 << Tortoise.BROKEN_SHIFT)
    }
    isBroken(){
        return (this.mPrivateFlags >> Tortoise.BROKEN_SHIFT & 1) === 1
    }

    prepare(finish)
    {
        this.loadAnimation(Res.animation.tortoise_dead, animation => {
            animation.setFrameDuartion(20)
            animation.setAnimationListener(new KillAnimationListener(this))
            finish(this)
        })

        class KillAnimationListener extends AnimationListener
        {
            constructor(obstacle){
                super()
                this.obstacle = obstacle
            }
            onAnimationEnd(animation){
                this.obstacle.kill()
            }
        }
    }

    update(){
        if(this.isBroken()) super.update()
    }

    onCollision(other)
    {
        if(other instanceof Hero)
        {
            if(other.mState === Hero.STATE_JUMP && other.ySpeed >= 0){
                let cx = other.mBounds.centerX()
                let off = other.mBounds.width() / 4
                if (cx >= this.mBounds.left - off && cx <= this.mBounds.right + off)
                    this.broken()
            }
            else if(other.mState !== Hero.STATE_DOWN){
                other.hurt(this.attack)
            }
        }
    }
}

class Pillar extends Obstacle
{
    prepare(finish){
        this.loadAnimation(Res.animation.pillar_style, animation => {
            animation.currentIndex = Math.floor(Math.random() * animation.getFrameCount())
            this.mBounds.set(animation.getCurrentFrame().bounds)
            finish(this)
        })
    }

    update(){
        this.mBounds.offset(0, -this.mScenes.mGravity)
    }

    onCollision(other){
        if(other instanceof Hero)
            other.mBounds.offset(-other.xSpeed, 0)
    }
}