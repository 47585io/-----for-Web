class Animation
{
    /**
     * 
     * @param {AnimationFrames} frames 
     */
    constructor(frames){
        this.mAnimationFrames = frames
        this.mAnimationListener = null
        this.mFrameDuartion = 10
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