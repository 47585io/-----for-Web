class FrameAnimation
{
    /**
     * 
     * @param {AnimationFrames} frames 
     */
    constructor(frames){
        this.mAnimationFrames = frames
        this.mAnimationListener = null
        this.mFrameDuartion = 10
        this.delta = 0
    }

    start(){
        this.delta = 0
        if(this.mAnimationListener !== null)
            this.mAnimationListener.onAnimationStart()
    }

    update(){
        let animationDuartion = this.mFrameDuartion * this.mAnimationFrames.mFrameBounds.length
        if(this.delta + 1 < animationDuartion)
            this.delta++
    }

    getCurrentImage(){
        return this.mAnimationFrames.mCurrentImage
    }
    getCurrentImageBounds(){
        let currentIndex = this.delta / this.mFrameDuartion
        return this.mAnimationFrames.mFrameBounds[currentIndex]
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
    onAnimationStart(){}

    onAnimationUpdate(){}

    onAnimationEnd(){}
}