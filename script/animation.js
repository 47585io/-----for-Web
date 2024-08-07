class FrameAnimation
{
    /**
     * 
     * @param {Array<Sprite>} frames 
     */
    constructor(frames){
        this.keyFrames = frames
        this.mAnimationListener = null
        this.frameDuartion = 5
        this.animationDuartion = this.frameDuartion * this.getFrameCount()
        this.delta = 0
        this.currentIndex = 0
    }

    /**
     * reset time for animation
     */
    start(){
        this.delta = 0
        this.currentIndex = 0
        if(this.mAnimationListener !== null)
            this.mAnimationListener.onAnimationStart(this)
    }

    /**
     * Update time to next frame, 
     */
    update()
    {
        this.delta++;
        if(this.delta === this.animationDuartion && this.mAnimationListener !== null)
            this.mAnimationListener.onAnimationEnd(this)
        
        let frameCount = this.getFrameCount()
        let lastIndex = this.currentIndex
        this.currentIndex = Math.floor(this.delta / this.frameDuartion)
        this.currentIndex = this.currentIndex < frameCount ? this.currentIndex : frameCount - 1
        if(lastIndex < this.currentIndex && this.mAnimationListener !== null)
            this.mAnimationListener.onAnimationUpdate(this)
    }

    /**
     * set each keyframe duartion, and calcute animation duartion,
     * @param {number} duartion Duartion of switch to the next keyframe,
     * duration refers to the number of times you call update (or the real number of frames)
     */
    setFrameDuartion(duartion){
        this.frameDuartion = duartion
        this.animationDuartion = this.frameDuartion * this.getFrameCount()
    }

    /**
     * set animation duartion, but not calcute keyframe duartion.
     * you can set a shorter time than normal animation duartion to end the animation early,
     * you can set a longer time than the normal animation duartion to extend the animation time
     * @param {number} duartion 
     */
    setAnimationDuartion(duartion){
        this.animationDuartion = duartion
    }

    /**
     * @param {AnimationListener} listener 
     */
    setAnimationListener(listener){
        this.mAnimationListener = listener
    }

    /**
     * get keyFrame of current delta time
     * @returns {Sprite} 
     */
    getCurrentFrame(){
        return this.keyFrames[this.currentIndex]
    }
    getFrameAt(index){
        return this.keyFrames[index]
    }
    getFrameCount(){
        return this.keyFrames.length
    }
}

/**
 * This class is used to represent an image
 * of a rectangle area in the source image
 */
class Sprite
{
    /**
     * Create an Sprite with the specified source image and rectangular area
     * @param {CanvasImageSource} image 
     * @param {Rect} bounds 
     */
    constructor(image, bounds){
        this.image = image
        this.bounds = bounds
    }
}

class AnimationListener
{
    onAnimationStart(animation){}

    onAnimationUpdate(animation){}

    onAnimationEnd(animation){}
}

/**
 * Listener for repeating animation
 */
class RepeatAnimationListener extends AnimationListener
{
    onAnimationEnd(animation){
        animation.start()
    }
}