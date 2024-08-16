const startScreenWidth = 1012
const startScreenHeight = 453
const backgroundWidth = 1012
const backgroundHeight = 396
const groundY = 360

var DEBUG = true
var WindowLoaded = false

var canvas = document.getElementById("display")
var context = canvas.getContext("2d")
var scenes = new Scenes(backgroundWidth, backgroundHeight, groundY)

// register EventListener
window.onload = resizeActivity
window.onresize = resizeActivity
window.onclick = distributeEvent
window.oncontextmenu = distributeEvent
window.onkeyup = distributeEvent

/**
 * When the window size changes, resize the current Activity
 */
function resizeActivity(){
    WindowLoaded = true
    let activity = Activity.getCurrentActivity()
    if (activity !== null){
        activity.onResize()
    }
}

/**
 * Distribute the registered events to the current Activity
 * @param {Event} event Distribute event
 * @returns {boolean} if consume event, return true
 */
function distributeEvent(event)
{
    // When the user gestu re is triggered for the first time
    // Create and Resume audioContext for FileUtils.loadMusic()
    if (audioContext === undefined){ 
        audioContext = new (window.AudioContext || window.webkitAudioContext)()  
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
    }

    // Distribute events to the current Activity
    let activity = Activity.getCurrentActivity()
    if (activity !== null){
        return activity.distributeEvent(event)
    }
    return false
}

/**
 * Continuously draw the current Activity
 */
function render(){
    let activity = Activity.getCurrentActivity()
    if (activity !== null)
        activity.render(context) // Draw this frame animation
    window.requestAnimationFrame(render) // request Draw next frame animation
}
window.requestAnimationFrame(render)


class StartScreen extends Activity
{
    constructor(){
        super()
        this.startImage = null
        FileUtils.loadImage(Res.pictures.game_over)
        .then(image => {
            this.startImage = image
            return image
        })
    }

    onResize(){
        putDisplayElementToMiddle(startScreenWidth, startScreenHeight, window.innerWidth, window.innerHeight)
    }

    render(context){
        if(this.startImage !== null)
            context.drawImage(this.startImage, 0, 0)
    }

    distributeEvent(event)
    {
        if(this.startImage !== undefined){
            Activity.startActivity(new GameScreen())
        }
    }
}

class GameScreen extends Activity
{
    constructor(){
        super()
        this.gameIcons = null
        FileUtils.loadAnimation(Res.animation.icon_item).then(icons => {
            this.gameIcons = icons
            return icons
        })
    }

    onStart(){
        scenes.mGameManger.init()
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
        scenes.update()
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
        return scenes.dispatchEvent(event)
    }
}
Activity.startActivity(new StartScreen())

/**
 * Scale the display element according to the scale of the source image, 
 * allowing it to fully display the source image and stay in the middle of the target area
 * @param {number} srcWidth source image width
 * @param {number} srcHeight source image height
 * @param {number} dstWidth target area width
 * @param {number} dstHeight target area height
 */
function putDisplayElementToMiddle(srcWidth, srcHeight, dstWidth, dstHeight)
{
    // The size of the final displayed is a multiple of the zoom of the source image, 
    // which scales the canvas to make the source image fully drawn
    const size = calcMaximumSize(srcWidth, srcHeight, dstWidth, dstHeight)
    const newWidth = size[0]
    const newHeight = size[1]
    const scale = newWidth / srcWidth
    
    // Calculate the gap between the size of the target area and the source image,
    // and assign the same gap on both sides to make the elements displayed in the middle
    const left = (dstWidth - newWidth) / 2
    const top = (dstHeight - newHeight) / 2
    setDisplayElement(Math.floor(left), Math.floor(top), 
                        Math.floor(newWidth), Math.floor(newHeight), scale)
}

/**
 * Calculate the maximum size that 
 * the source image can be fully displayed in the target area
 * @param {number} srcWidth source image width
 * @param {number} srcHeight source image height
 * @param {number} dstWidth target area width
 * @param {number} dstHeight target area height
 * @returns {Array<number>} An array of length 2, 
 *      Contains the calculated size (width, height)
 */
function calcMaximumSize(srcWidth, srcHeight, dstWidth, dstHeight)
{
    // If the size of the source image exceeds the target area, 
    // scale it until it can be displayed in the target area
    if(srcWidth > dstWidth){
        const sacle = srcWidth / dstWidth;
        srcWidth /= sacle; 
        srcHeight /= sacle;
    }
    if(srcHeight > dstHeight){
        const sacle = srcHeight / dstHeight;
        srcWidth /= sacle;
        srcHeight /= sacle;
    }
    
    // Calculate the width and height of the source image separately,
    // and can also zoom in the multiples of the target area,
    // and take the minimum zoom factor to scale the width and height,
    // and ensure that the width and height do not exceed the target area
    const sacleWidth = dstWidth / srcWidth;
    const sacleHeight = dstHeight / srcHeight;
    const maxSacle = Math.min(sacleWidth, sacleHeight);
    return new Array(srcWidth * maxSacle, srcHeight * maxSacle)
}

/**
 * Set the canvas element for display to the specified size, 
 * Set the sacle matrix, Map the source image to the target area
 * @param {number} left left position 
 * @param {number} top top position
 * @param {number} width width of canvas element
 * @param {number} height height of canvas element
 * @param {number} sacle canvas grid line sacle multiple
 */
function setDisplayElement(left, top, width, height, sacle)
{
    // set the drawing area
    canvas.width = width 
    canvas.height = height
    // set canvas element size
    canvas.style.position = "absolute"
    canvas.style.left = left + "px"
    canvas.style.top = top + "px"
    canvas.style.width = width + "px"
    canvas.style.height = height + "px"
    // setSacle to Map the source image to the target area
    context.setTransform(sacle, 0, 0, sacle, 0, 0)
}