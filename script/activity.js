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
 * Usually you should use getCurrentActivity() in external code to get the current Activity, 
 * and then only draw that Activity or dispatch events to it.
 */
class Activity
{
    static mActivityStack = new Array()
    static mCurrentIndex = -1

    constructor(){
        this.isRunning = false
    }

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
        if(WindowLoaded){
            activity.onResize()
        }
    }

    /**
     * Remove the activity at the top of the stack,
     * and switch to the previous activity
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
            if(WindowLoaded){
                previousActivity.onResize()
            }
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

    /**
     * When the Activity Add to the stack,
     * the method is called
     */
    onStart(){
        this.isRunning = true
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
        if(this.startImage !== null)
            context.drawImage(this.startImage, 0, 0)
    }

    distributeEvent(event){
        if(this.startImage !== null)
            Activity.startActivity(new GameScreen())
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

        this.gameIcons = null
        FileUtils.loadAnimation(Res.animation.icon_item).then(icons => {
            this.gameIcons = icons
            return icons
        })

        this.mScenes.mGameManger.exit = 
    }

    onStop(){
        this.mBackgroundMusic.stop()
    }
    
    /**
     * When the window size changes, adjust the canvas size
     */
    onResize(){
        putDisplayElementToMiddle(scenes.mWidth, scenes.mHeight, window.innerWidth, window.innerHeight)
    }

    /**
     * Update and draw game scenes
     * @param {CanvasRenderingContext2D} context 
     */
    render(context){
        if(this.isRunning){
            scenes.update()
        }
        scenes.draw(context)
        this.drawGameStatePanel(context)
    }
    
    drawGameStatePanel(context)
    {
        if(this.gameIcons !== null && scenes.mCurrentHero !== null){
            let s = this.gameIcons[Res.icon.clover]
            let heal = scenes.mCurrentHero.healthy
            let x = this.drawIcon(context, s, 0, 0, heal)
            let sprite = this.gameIcons[Res.icon.surround_star]
            this.drawIcon(context, sprite, x  + 10, 0, scenes.mGameManger.getHeroScore().toString())
        }
    }

    /**
     * Draw Icon and text, include in a rectangle
     * @param {CanvasRenderingContext2D} context 
     * @param {Sprite} sprite icon to draw
     * @param {number} x start position
     * @param {number} y start position
     * @param {string} text text to draw
     * @returns {number} X coordinate of the end position drawn
     */
    drawIcon(context, sprite, x, y, text)
    {
        const div = 10
        let bounds = sprite.bounds
        let imageWidth = sprite.bounds.width()
        let imageHeight = sprite.bounds.height()
        let textMetrics = context.measureText(text)
        let textWidth = textMetrics.width
        let textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

        context.fillStyle = "rgba(0, 0, 0, 0.5)"
        context.beginPath()
        context.roundRect(x, y, imageWidth + textWidth + 3 * div, imageHeight + 2.* div, 10)
        context.fill()

        context.drawImage(sprite.image, bounds.left, bounds.top, imageWidth, imageHeight,
            x + div, y + div, imageWidth, imageHeight)

        
        context.fillStyle = "rgb(255, 255, 255)"
        context.font = "35px monospace"
        context.textBaseline = "top"
        let off = (imageHeight - textHeight) / 2
        context.fillText(text, x + imageWidth + 2 * div, y + div + off)
        return x + imageWidth + textWidth + 3 * div
    }

    /**
     * Distribute events to the scenes
     * @param {Event} event Distribute event
     * @returns {boolean} if consume event, return true
    */
    distributeEvent(event){
        if(!this.isPause){
            return scenes.dispatchEvent(event)
        }
    }
}