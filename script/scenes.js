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
        this.mGravity = 5
        this.mScroll = 0

        // can not， must ...
        this.mCurrentHero = new Hero()
        /** @type {Array<Obstacle>} */
        this.mObstacles = new Array()
        this.addObstacle(this.mCurrentHero)
        this.mGameManger = new GameManger(this)
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
        let bounds = this.mCurrentHero.mBounds
        bounds.left = middle
        bounds.bottom = this.mGroundY
    }

    /**
     * Creat new obstacle on the right side of the scenes
     */
    creatObstacle(){

    }

    addObstacle(obstacle){
        obstacle.mScenes = this
        this.mObstacles.push(obstacle)
    }

    /**
     * Get all obstacles in the specified rectangle
     * @param {number} left
     * @param {number} top
     * @param {number} right
     * @param {number} bottom
     * @returns {Array<Obstacle>} An array of all obstacles overlapping with the specified rectangle
     */
    getObstacles(left, top, right, bottom)
    {
        let ret = new Array()
        for(let obstacle of this.mObstacles){
            if(obstacle.mBounds.intersects(left, top, right, bottom))
                ret.push(obstacle)
        }
        return ret
    }

    clear(){
        this.mObstacles.splice()
        Object
    }

    /**
     * Update the location of obstacles in the scenes
     * and check their collisions
     */
    update()
    {
        // Follow hero
        this.mScroll += this.mCurrentHero.mSpeed

        // Update the location of each obstacle
        for(let i = 0; i < this.mObstacles.length; ++i){
            this.mObstacles[i].mBounds.offset(-this.mCurrentHero.mSpeed, this.mGravity)
            this.mObstacles[i].update()
        }

        // Check hero's collision with each obstacle
        if(this.mCollisionCallback != null && this.mCurrentHero.canCollision()){
            let hero = this.mCurrentHero
            for(let i = 1; i < this.mObstacles.length; ++i){
                let obstacle = this.mObstacles[i]
                if(obstacle.canCollision() && hero.mBounds.intersects(obstacle.mBounds))
                    this.mCollisionCallback.onCollision(hero, obstacle)
            }
        }

        // Keep obstacles in the scenes above the ground
        for(let obstacle of this.mObstacles){
            if(obstacle.mBounds.bottom > this.mGroundY){
                let yOffset = obstacle.mBounds.bottom - this.mGroundY
                obstacle.mBounds.offset(0, -yOffset)
            }
        }
        
        // Clear all dead obstacle or leave the scenes
        for(let i = 0; i < this.mObstacles.length; ++i){
            let obstacle = this.mObstacles[i]
            if(!obstacle.isActive() || obstacle.mBounds.right < 0){
                this.mObstacles.splice(i--, 1)
                // if hero dead, exit game
                if(obstacle === this.mCurrentHero)
                    this.mGameManger.exit()
            }
        }

        // Creat new obstacle on the right side of the scenes
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
        super()
        this.mScenes = scenes
    }

    stop(){

    }

    resume(){
        
    }

    exit(){

    }

    hasNextObstacle(){}

    nextObstacle(){
        
    }
}