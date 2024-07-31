class Scenes
{
    /**
     * Create a specified size scenes
     * @param {number} width  scenes width
     * @param {number} height scenes height
     */
    constructor(width, height, groudY)
    {
        /** @type {CanvasImageSource} */
        this.mBackgroundImage = null
        this.mWidth = width
        this.mHeight = height
        this.mGroundY = groudY
        this.mScroll = 0

        this.mCurrentHero = new Hero()
        /** @type {Array<Obstacle>} */
        this.mObstacles = new Array()
        this.mCollisionCallback = null
    }

    resize(width, height)
    {
        this.mWidth = width
        this.mHeight = height

        // put hero in the middle of the scenes
        // and calculate it offset from the last position
        // offset obstacles in the scenes
        // so that they remain the same relative to the position of the hero
        let middle = width / 2
        
    }

    /**
     * Get all obstacles in the specified rectangle
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height
     * @returns {Array<Obstacle>} An array of all obstacles overlapping with the specified rectangle
     */
    getObstacles(x, y, width, height)
    {
        let ret = new Array()
        for(let obstacle of this.mObstacles){
            if(obstacle.mBounds.intersects(x, y, width, height))
                ret.push(obstacle)
        }
        return ret
    }

    /**
     * 
     */
    update()
    {
        this.mScroll += this.mCurrentHero.speed
        this.mCurrentHero.update()
        for(let i = 0; i < this.mObstacles.length; ++i){
            if(this.mObstacles[i].isActive())
                this.mObstacles[i].update()
            else
                this.mObstacles.splice(i--, 1)
        }
        if(this.mCollisionCallback != null)
            this.checkCollision()
    }

    checkCollision()
    {
        for(var obstacle of this.mObstacles){
            if(this.mCurrentHero.mBounds.intersects(obstacle.mBounds)){
                this.mCollisionCallback.onCollision(this.mCurrentHero, obstacle)
            }
        }
    }

    /**
     * Draw scenes background and obstacles in the scenes
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context){
        this.drawBackground(context)
        this.dispatchDraw(context)
    }

    /**
     * Draw background image of the scenes
     * @param {CanvasRenderingContext2D} context 
     */
    drawBackground(context){
        if(this.mBackgroundImage != null)
            this.drawCoverImage(context, this.mBackgroundImage, this.mScroll, 0, this.mWidth)
    }

    /**
     * Draw a background image that covers the width of the scenes
     * @param {CanvasRenderingContext2D} context 
     * @param {CanvasImageSource} image 
     * @param {number} scroll Where the scene scroll
     * @param {number} y Ordinate of drawing image
     * @param {number} display Scenes width
     */
    drawCoverImage(context, image, scroll, y, display)
    {
        // Suppose the background is a stitched together with countless pictures  
        // From the start position to the end position, draw back one by one until the scenes is covered  
        // Current position % Image width = Offset in the current picture  
        // Through min (the remaining width of the picture, the remaining width of the scenes), calculate the width of the current picture to be drawn to the scenes 
        // After the current picture is drawn, startOffset += drawWidth

        const imageWidth = image.width
        const imageHeight = image.height
        let startOffset = scroll
        let endOffset = startOffset + display
        
        while(startOffset < endOffset){
            const imageOffset = startOffset % imageWidth;
            const drawWidth = Math.min(imageWidth - imageOffset, endOffset - startOffset)
            context.drawImage(image, imageOffset, 0, drawWidth, imageHeight,
                startOffset - scroll, y, drawWidth, imageHeight)
            startOffset += drawWidth
        }
    }

    dispatchDraw(context)
    {
        this.mCurrentHero.draw(context)
        for(let obstacle of this.mObstacles){
            if(obstacle.mBounds.intersects(0, 0, this.mWidth, this.mHeight))
                obstacle.draw(context)
        }
    }

    dispatchEvent(event){

    }
}

class CollisionCallback{
    onCollision(o1, o2){}
}

class GameManger extends CollisionCallback
{
    constructor(scenes){
        this.mScenes = scenes
    }

    stop(){

    }

    resume(){
        
    }

    exit(){

    }
}