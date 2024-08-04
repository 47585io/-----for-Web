class FrameAnimation
{
    /**
     * 
     * @param {AnimationFrames} frames 
     */
    constructor(frames){
        this.mAnimationFrames = frames
        this.mAnimationListener = null
        this.mFrameDuartion = 5
        this.delta = 0
        this.currentIndex = 0
    }

    start(){
        this.delta = 0
        this.currentIndex = 0
        if(this.mAnimationListener !== null)
            this.mAnimationListener.onAnimationStart(this)
    }

    update(){
        let animationDuartion = this.mFrameDuartion * this.mAnimationFrames.mFrameBounds.length
        let lastIndex = this.currentIndex
        if(this.delta + 1 < animationDuartion){
            this.delta++
        }else if(this.mAnimationListener !== null){
            this.mAnimationListener.onAnimationEnd(this)
        }
        this.currentIndex = Math.floor(this.delta / this.mFrameDuartion)
        if(lastIndex < this.currentIndex && this.mAnimationListener !== null)
            this.mAnimationListener.onAnimationUpdate(this)

    }

    getCurrentImage(){
        return this.mAnimationFrames.mCurrentImage
    }
    getCurrentImageBounds(){
        return this.mAnimationFrames.mFrameBounds[this.currentIndex]
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