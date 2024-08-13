/**
 * A class for storing obstacles, 
 * managing the update, drawing and event of a group of obstacles.
 * 
 * Never add or remove obstacles directly！ 
 * This can lead to unpredictable errors in the traversal.
 * 
 * You must use addObstacle(obstacle, true) to add obstacle,
 * This will assign it an appropriate time to add. (not in the traversal)
 * 
 * You must use obstacle.kill() to remove obstacle,
 * This will assign it an appropriate time to remove. (not in the traversal)
 */
class Scenes
{
    /**
     * Create a specified size scenes
     * @param {number} width  scenes width
     * @param {number} height scenes height
     * @param {number} groudY groud position
     */
    constructor(width, height, groudY)
    {
        this.mBackgroundImage = null
        this.mWidth = width
        this.mHeight = height
        this.mGroundY = groudY
        this.mGravity = 5
        this.mScroll = 0

        this.mCurrentHero = null
        this.mObstacles = new Array()
        this.mCachedObstacles = new Array()
        this.mGameManger = new GameManger(this)
    }

    /**
     * Resize scenes, and adjust the position of obstacles in the scenes
     * @param {number} width 
     * @param {number} height 
     */
    resize(width, height)
    {
        this.mWidth =  width
        this.mHeight = height

        // put hero in the middle of the scenes
        // and calculate it offset from the last position
        // offset obstacles in the scenes
        // so that they remain the same relative to the position of the hero
        if(this.mCurrentHero !== null){
            let middle = width >> 1
            let bounds = this.mCurrentHero.mBounds
            let dx = middle - (bounds.width() >> 1) - bounds.left
            for(let obstacle of this.mObstacles){
                obstacle.mBounds.offset(dx, 0)
            }
        }
    }

    /**
     * Add an obstacle to the scenes, 
     * and reorders the obstacle array in order of priority.
     * obstacles with lower priority will be placed earlier in the list, 
     * obstacles earlier in the list will be drawn first
     * @param {Obstacle} obstacle 
     * @param {boolean} cached if cached === true
     *      Delayed adding of an obstacle to the scenes, 
     * T    his will assign it an appropriate time to add. (not in the traversal)
     */
    addObstacle(obstacle, cached = false)
    {
        if(cached){
            this.mCachedObstacles.push(obstacle)
            return
        }

        obstacle.mScenes = this
        this.mObstacles.push(obstacle)
        this.mObstacles.sort((o1, o2) =>{
            return o1.getPriority() - o2.getPriority()
        })
        obstacle.onAddToScenes(this)
    }

    /**
     * Remove elements from the specified position in the array
     * Renove an element in an ordered array will not mess up the order of the array
     * @private
     * @param {number} index 
     */
    removeObstacleAt(index)
    {
        let obstacle = this.mObstacles[index]
        this.mObstacles.splice(index, 1)
        obstacle.mScenes = null
        obstacle.onRemoveFromScenes(this)

        if(obstacle === this.mCurrentHero){
            // if hero removed, exit game
            this.mCurrentHero = null
            this.mGameManger.exit()
        }
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

    /**
     * Clear all obstacles in the scenes, 
     * and reset scenes state
     */
    clear(){
       this.mObstacles.splice(0, this.mObstacles.length)
       this.mCachedObstacles.splice(0, this.mCachedObstacles.length)
       this.mCurrentHero = null
    }

    /**
     * Update the location of obstacles in the scenes, 
     * and check their collisions, 
     * and clear all dead obstacle or leave the scenes
     */
    update()
    {
        if(this.mCurrentHero === null){
            return
        }
        // Follow hero
        let hero = this.mCurrentHero
        this.mScroll += hero.xSpeed

        // Update the location of each obstacle
        for(let obstacle of this.mObstacles){
            obstacle.mBounds.offset(-hero.xSpeed, this.mGravity)
            obstacle.update()
        }

        // Check hero's collision with each obstacle
        if(hero.canCollision()){
            for(let obstacle of this.mObstacles){
                if(obstacle !== hero && obstacle.canCollision() 
                    && hero.mBounds.intersects(obstacle.mBounds))
                    this.mGameManger.onCollision(hero, obstacle)
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
                this.removeObstacleAt(i--)
            }
        }

        // Creat new obstacle on the right side of the scenes 
        this.mGameManger.creatObstacleIfhasNext()
        // Add all cached obstacle to the scenes
        for(let obstacle of this.mCachedObstacles){
            this.addObstacle(obstacle)
        }
        this.mCachedObstacles.splice(0, this.mCachedObstacles.length)
    }

    /**
     * Draw scenes background and obstacles in the scenes
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context)
    {
        // Draw background image of the scenes
        if(this.mBackgroundImage !== null){
            this.drawCoverImage(context, this.mBackgroundImage, this.mScroll, 0, this.mWidth)
        }
        
        // Draw obstacles in the scenes
        // Only obstacles that are drawn in the visual area
        // because some obstacles may exceed the scenes at resize
        for(let obstacle of this.mObstacles){
            if(obstacle.mBounds.intersects(0, 0, this.mWidth, this.mHeight))
                obstacle.draw(context)
        }
    }

    /**
     * Draw a background image that covers the width of the scenes
     * @param {CanvasRenderingContext2D} context 
     * @param {CanvasImageSource} image 
     * @param {number} scroll Where the scenes scroll
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

    /**
     * Dispatch Event to obstacles in the scenes
     * @param {Event} event dispatch event
     * @returns {boolean} If there is an obstacle consume event, return true
     */
    dispatchEvent(event){
        // In fact, only hero receive the event
        if(this.mCurrentHero !== null){
            return this.mCurrentHero.handleEvent(event)
        }
        return false
    }
}

class GameManger 
{
    static MIN_CREAT_TIME = 50
    static MAX_CREAT_TIME = 100

    static OBSTACLE_KIND_COUNT = 3
    static OBSTACLE_KIND = [
        Lion, 
        Pillar, 
        Tortoise
    ]

    constructor(scenes)
    {
        this.mScenes = scenes
        this.timer = 0
        this.nextTime = this.randInt(GameManger.MIN_CREAT_TIME, GameManger.MAX_CREAT_TIME)

        FileUtils.loadImage(Res.pictures.background)
            .then(res => {
                scenes.mBackgroundImage = res
                return res
            })
    }

    init(){
        let hero = new Hero()
        hero.prepare(obstacle => {
            scenes.addObstacle(obstacle)
            scenes.mCurrentHero = obstacle
            scenes.resize(scenes.mWidth, scenes.mHeight)
        })
    }

    onCollision(hero, other)
    {
        // Lion and Tortoise can only collide once with Hero
        if(other instanceof Lion || other instanceof Tortoise){
            other.onCollision(hero)
            other.setCanCollision(false)
        }
        else if(other instanceof Pillar){
            other.onCollision(hero)
        }
    }

    exit(){

    }

    creatObstacleIfhasNext(){
        if(this.timer === this.nextTime){
            this.creatObstacle()
            this.timer = 0
            this.nextTime = this.randInt(GameManger.MIN_CREAT_TIME, GameManger.MAX_CREAT_TIME)
        }
        this.timer++
    }

    /** Creat new obstacle on the right side of the scenes */
    creatObstacle()
    {
        let kind = 2//this.randInt(0, GameManger.OBSTACLE_KIND_COUNT)
        let obstacle = new GameManger.OBSTACLE_KIND[kind]
        obstacle.prepare(obstacle => {
            if(obstacle instanceof Lion || obstacle instanceof Tortoise){
                let dy = this.mScenes.mGroundY - obstacle.mBounds.height()
                obstacle.mBounds.offsetTo(this.mScenes.mWidth, dy)
            }
            else if(obstacle instanceof Pillar){
                obstacle.mBounds.offsetTo(this.mScenes.mWidth, 0)
            }
            this.mScenes.addObstacle(obstacle)
        })
    }

    /**
     * Randomly generate integers within the specified range
     * @param {number} min range start
     * @param {number} max range end
     * @returns {number} Returns a random integer between (min, max),
     *                   include min, but not include max
     */
    randInt(min, max){
        return Math.floor(Math.random() * (max - min)) + min;
    }
}