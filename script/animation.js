class FrameAnimation
{
    /**
     * 
     * @param {AnimationFrames} frames 
     */
    constructor(frames){
        this.mAnimationFrames = frames
        this.mAnimationListener = null
        this.frameDuartion = 5
        this.animationDuartion = this.frameDuartion * this.getFrameCount()
        this.delta = 0
        this.currentIndex = 0
    }

    start(){
        this.delta = 0
        this.currentIndex = 0
        if(this.mAnimationListener !== null)
            this.mAnimationListener.onAnimationStart(this)
    }

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

    setFrameDuartion(duartion){
        this.frameDuartion = duartion
        this.animationDuartion = this.frameDuartion * this.getFrameCount()
    }
    setAnimationDuartion(duartion){
        this.animationDuartion = duartion
    }
    setAnimationListener(listener){
        this.mAnimationListener = listener
    }

    getCurrentImage(){
        return this.mAnimationFrames.mCurrentImage
    }
    getCurrentImageBounds(){
        return this.mAnimationFrames.mFrameBounds[this.currentIndex]
    }
    getImageBoundsAt(index){
        return this.mAnimationFrames.mFrameBounds[index]
    }
    getFrameCount(){
        return this.mAnimationFrames.mFrameBounds.length
    }
}

class AnimationFrames
{
    /**
     * 
     * @param {CanvasImageSource} image 
     * @param {Array<Rect>} bounds 
     */
    constructor(image, bounds){
        this.mCurrentImage = image
        this.mFrameBounds = bounds
    }
}

class AnimationListener
{
    onAnimationStart(animation){}

    onAnimationUpdate(animation){}

    onAnimationEnd(animation){}
}

class RepeatAnimationListener extends AnimationListener
{
    onAnimationStart(animation){}

    onAnimationUpdate(animation){}

    onAnimationEnd(animation){
        animation.start()
    }
}