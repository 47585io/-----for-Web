/**
 * A class for storing obstacles, 
 * managing the update, drawing, collision and event of a group of obstacles.
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
        this.mGameManger = new GameManger(this)
    }

    /**
     * Add an obstacle to the scenes, 
     * and reorders the obstacle array in order of priority.
     * obstacles with lower priority will be placed earlier in the list, 
     * obstacles earlier in the list will be drawn first
     * @param {Obstacle} obstacle 
     */
    addObstacle(obstacle)
    {
        obstacle.mScenes = this
        this.mObstacles.push(obstacle)
        this.mObstacles.sort((o1, o2) =>{
            return o1.getPriority() - o2.getPriority()
        })
        obstacle.onAddToScenes(this)
    }

    /**
     * Remove elements from the specified position in the array
     * Remove an element in an ordered array will not mess up the order of the array
     * @private
     * @param {number} index 
     */
    removeObstacleAt(index)
    {
        const obstacle = this.mObstacles[index]
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
        const ret = new Array()
        for(const obstacle of this.mObstacles){
            if(obstacle.mBounds.intersects(left, top, right, bottom))
                ret.push(obstacle)
        }
        return ret
    }

    /**
     * Update the location of obstacles in the scenes, 
     * and Check their collisions, 
     * and clear all dead obstacle or leave the scenes,
     * and Creat new obstacle on the right side of the scenes 
     */
    update()
    {
        if(this.mCurrentHero === null){
            return
        }

        // Follow hero
        const hero = this.mCurrentHero
        this.mScroll += hero.xSpeed

        // Update the location of each obstacle
        for(const obstacle of this.mObstacles){
            obstacle.mBounds.offset(-hero.xSpeed, this.mGravity)
            obstacle.update()
        }

        // Check hero's collision with each obstacle
        if(hero.canCollision()){
            const heroCollisionBounds = hero.getCollisionBounds()
            for(const obstacle of this.mObstacles){
                if(obstacle !== hero && obstacle.canCollision() 
                    && heroCollisionBounds.intersects(obstacle.getCollisionBounds()))
                    this.mGameManger.onCollision(hero, obstacle)
            }
        }

        // Clear all dead obstacle or leave the scenes
        for(let i = 0; i < this.mObstacles.length; ++i){
            const obstacle = this.mObstacles[i]
            if(!obstacle.isActive() || obstacle.mBounds.right < 0){
                this.removeObstacleAt(i--)
            }
        }

        // Keep obstacles in the scenes above the ground
        for(const obstacle of this.mObstacles){
            if(obstacle.mBounds.bottom > this.mGroundY){
                const yOffset = obstacle.mBounds.bottom - this.mGroundY
                obstacle.mBounds.offset(0, -yOffset)
            }
        }

        // Creat new obstacle on the right side of the scenes 
        this.mGameManger.creatObstacleIfhasNext()
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
        for(const obstacle of this.mObstacles){
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
        // Only hero receive the event
        if(this.mCurrentHero !== null){
            return this.mCurrentHero.handleEvent(event)
        }
        return false
    }
}

/**
 * The scenes is responsible for traversing all obstacles, 
 * but the complex logic will be handed over to this class
 */
class GameManger 
{
    static OBSTACLE_CREAT_TIME = 300
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
        
        // creat hero and put in the middle of the scenes
        const hero = new Hero()
        hero.prepare(obstacle => {
            this.mScenes.addObstacle(obstacle)
            this.mScenes.mCurrentHero = obstacle 
            const dx = (this.mScenes.mWidth >> 1) - (obstacle.mBounds.width() >> 1)
            obstacle.mBounds.offsetTo(dx, 0)
        })
    }

    /**
     * Returns the score of the hero
     * @returns {number}
     */
    getHeroScore(){
        return this.mScenes.mScroll + this.mScenes.mCurrentHero.score
    }

    /**
     * This method is used to handle and dispatch collision logic
     * @param {Hero} hero 
     * @param {Obstacle} other 
     */
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

    /**
     * The empty method of callback when the game exits, 
     * You can overwrite this method to listen to the game exit logic
     */
    exit(){}

    /** 
     * If the time to create the obstacle is reached, 
     * create a random obstacle 
     */
    creatObstacleIfhasNext()
    {
        if(this.timer === GameManger.OBSTACLE_CREAT_TIME){
            this.creatObstacle()
            this.timer = 0
        }
        this.timer++
    }

    /** Creat new obstacle on the right side of the scenes */
    creatObstacle()
    {
        const kind = Math.floor(Math.random() * GameManger.OBSTACLE_KIND_COUNT)
        const obstacle = new GameManger.OBSTACLE_KIND[kind]
        obstacle.prepare(obstacle => {
            if(obstacle instanceof Lion || obstacle instanceof Tortoise){
                const dy = this.mScenes.mGroundY - obstacle.mBounds.height()
                obstacle.mBounds.offsetTo(this.mScenes.mWidth, dy)
            }
            else if(obstacle instanceof Pillar){
                obstacle.mBounds.offsetTo(this.mScenes.mWidth, 0)
            }
            this.mScenes.addObstacle(obstacle)
        })
    }
}