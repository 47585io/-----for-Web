/**
 * Each Activity is an interface, 
 * and they have their own drawing and event handling methods.
 * 
 * In the Activity class, 
 * there is a static stack to save all activities
 * 
 * Operate it through startActivity and exitActivity, 
 * and use getCurrentActivity to get the Activity at the top of the stack.
 * 
 * Try to have many Activities, 
 * but always keep only one Activity in the foreground.
 * 
 * Usually you should use getCurrentActivity() in external code to get the current Activity, 
 * and then only draw that Activity or dispatch events to it.
 */
class Activity
{
    static mActivityStack = new Array()
    static mCurrentIndex = -1

    /**
     * Add an Activity to the top of the stack, 
     * and switch to the activity
     * @param {Activity} activity 
     */
    static startActivity(activity) 
    {
        if (Activity.mCurrentIndex >= 0) {
            const currentActivity = Activity.mActivityStack[Activity.mCurrentIndex];
            currentActivity.onPause(); 
        }
        Activity.mActivityStack.push(activity);
        Activity.mCurrentIndex++;
        activity.onStart(); 
    }

    /**
     * Remove the activity at the top of the stack,
     * and switch to the last activity
     */
    static exitActivity() 
    {
        if (Activity.mCurrentIndex < 0) return;

        const activity = Activity.mActivityStack.pop();
        Activity.mCurrentIndex--;
        activity.onStop(); 
        if (Activity.mCurrentIndex >= 0) {
            const previousActivity = Activity.mActivityStack[Activity.mCurrentIndex];
            previousActivity.onResume();
        }
    }

    /**
     * Get the activity at the top of the stack
     * @returns {Activity | null} If the stack is empty, returns null
     */
    static getCurrentActivity(){
        return this.mCurrentIndex >= 0 ? this.mActivityStack[this.mCurrentIndex] : null
    }

    /**
     * Get the count of the Activity in the stack
     * @returns {number} activity count 
     */
    static getActivityCount(){
        return this.mActivityStack.length
    }

    /** Activity onCreat */
    constructor(){
        this.isRunning = false
    }

    /**
     * When the Activity Add to the stack,
     * the method is called
     */
    onStart(){
        this.isRunning = true
        if(WindowLoaded) this.onResize()
    }

    /**
     * When the Activity is switched to the background, 
     * the method is called
     */
    onPause(){
        this.isRunning = false
    }
    
    /**
     * When the Activity is resume to the foreground, 
     * the method is called
     */
    onResume(){
        this.isRunning = true
        if(WindowLoaded) this.onResize()
    }
    
    /**
     * When the Activity Remove from the stack,
     * the method is called
     */
    onStop(){
        this.isRunning = false
    }

    /**
     * When the size of the window containing the Activity changes,
     * the method is called
     */
    onResize(){}

    /**
     * The method of callback when the Activity render in the foreground
     * @param {CanvasRenderingContext2D} context 
     */
    render(context){}

    /**
     * The method of callback when the Activity receive a DOM event
     * @param {Event} event 
     * @returns {boolean} if consume event, return ture
     */
    distributeEvent(event){
        return false
    }
}

let save = localStorage.getItem("score")
let maxScore = save === null ? 0 : new Number(save)

/**
 * Game start interface
 */
class StartScreen extends Activity
{
    static startWidth = 1012
    static startHeight = 453

    constructor(){
        super()
        this.startImage = null
        FileUtils.loadImage(Res.pictures.game_over).then(image => {
            this.startImage = image
            return image
        })
    }

    onResize(){
        putDisplayElementToMiddle(StartScreen.startWidth, StartScreen.startHeight,
             window.innerWidth, window.innerHeight)
    }

    render(context){
        if(this.startImage !== null){
            context.drawImage(this.startImage, 0, 0)
            drawIcon(context, Res.icon.surround_star, 0, 0, maxScore)
        }   
    }

    distributeEvent(event){
        if(this.isRunning && this.startImage !== null){
            Activity.startActivity(new GameScreen())
            return true
        }
        return false
    }
}

class GameScreen extends Activity
{
    static backgroundWidth = 1012
    static backgroundHeight = 396
    static groundY = 360

    constructor()
    {
        super()
        this.mScenes = new Scenes(GameScreen.backgroundWidth, 
            GameScreen.backgroundHeight, GameScreen.groundY)

        FileUtils.loadImage(Res.pictures.background).then(res => {
            this.mScenes.mBackgroundImage = res
            return res
        })

        this.mBackgroundMusic = null
        FileUtils.loadMusic(Res.music.background).then(sound => {
            this.mBackgroundMusic = creatAudioBufferSourceNode(sound)
            this.mBackgroundMusic.loop = true
            this.mBackgroundMusic.start()
            return sound
        })

        this.mScenes.mGameManger.exit = function(){
            Activity.exitActivity()
        }
    }

    onPause(){
        super.onPause()
        audioContext.suspend()
    }

    onResume(){
        super.onResume()
        audioContext.resume()
    }

    onStop(){
        super.onStop()
        localStorage.setItem("score", maxScore.toString())
        this.mBackgroundMusic.stop()
    }
    
    /** When the window size changes, adjust the canvas size */
    onResize(){
        putDisplayElementToMiddle(this.mScenes.mWidth, this.mScenes.mHeight, 
            window.innerWidth, window.innerHeight)
    }

    /**
     * Update and draw game scenes
     * @param {CanvasRenderingContext2D} context 
     */
    render(context){
        if(this.isRunning){
            this.mScenes.update()
        }
        this.mScenes.draw(context)
        this.drawGameStatePanel(context)
    }
    
    drawGameStatePanel(context){
        if(this.mScenes.mCurrentHero !== null){
            const heal = this.mScenes.mCurrentHero.healthy
            const x = drawIcon(context, Res.icon.clover, 0, 0, heal.toString())
            const score = this.mScenes.mGameManger.getHeroScore()
            drawIcon(context, Res.icon.surround_star, x + div, 0, score.toString())
            maxScore = score > maxScore ? score : maxScore
        }
    }

    /**
     * Distribute events to the scenes
     * @param {Event} event Distribute event
     * @returns {boolean} if consume event, return true
    */
    distributeEvent(event){ 
        return this.isRunning ? this.mScenes.dispatchEvent(event) : false
    }
}

const div = 10
let gameIcons = null
FileUtils.loadAnimation(Res.animation.icon_item).then(icons => {
    gameIcons = icons
    return icons
})

/**
 * Draw Icon and text, include in a rectangle
 * @param {CanvasRenderingContext2D} context 
 * @param {number} icon icon to draw
 * @param {number} x start position
 * @param {number} y start position
 * @param {string} text text to draw
 * @returns {number} X coordinate of the end position drawn
 */
function drawIcon(context, icon, x, y, text)
{
    if(gameIcons === null){
        return x
    }

    const sprite = gameIcons[icon]
    const bounds = sprite.bounds
    const imageWidth = bounds.width()
    const imageHeight = bounds.height()

    const textMetrics = context.measureText(text)
    const textWidth = textMetrics.width
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

    const rectWidth = imageWidth + textWidth + 3 * div
    context.fillStyle = "rgba(0, 0, 0, 0.5)"
    context.beginPath()
    context.roundRect(x, y, rectWidth, imageHeight + 2 * div, div)
    context.fill()

    context.drawImage(sprite.image, bounds.left, bounds.top, imageWidth, imageHeight,
        x + div, y + div, imageWidth, imageHeight)
    
    context.fillStyle = "rgb(255, 255, 255)"
    context.font = "35px monospace"
    context.textBaseline = "top"
    const off = (imageHeight - textHeight) / 2
    context.fillText(text, x + imageWidth + 2 * div, y + div + off)
    return x + rectWidth
}