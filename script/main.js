
const startScreenWidth = 1012
const startScreenHeight = 453
const backgroundHeight = 396
const groundY = 360

var canvas = document.getElementById("display")
var context = canvas.getContext("2d")
context.save() // first save
var scenes = new Scenes(0, 0, groundY)

// register EventListener
canvas.addEventListener('touchend', distributeEvent, {passive: false});
canvas.addEventListener("click", distributeEvent)
canvas.addEventListener("contextmenu", distributeEvent)
canvas.addEventListener("keyup", distributeEvent)
window.onload = distributeEvent
window.addEventListener("resize", distributeEvent);

/**
 * Distribute the registered events to the current Activity
 * @param {Event} event Distribute event
 * @returns {boolean} if consume event, return true
 */
function distributeEvent(event)
{
    // When the user gesture is triggered for the first time
    // Create and Resume audioContext for FileUtils.loadMusic()
    if (audioContext === undefined && event.type !== "load" && event.type !== "resize"){ 
        audioContext = new (window.AudioContext || window.webkitAudioContext)();   
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    // Browser default action corresponding to cancel the event
    // On the computer, cancel the menu that opens when "contextmenu" is canceled
    // On the phone, double-click the zoom window when "touchend" is canceled
    event.preventDefault()
    // "touchend" event only triggers on the phone
    // For convenience, convert it to "click" event
    // Because event.preventDefault() will cancel the "click" event
    if(event.type === "touchend"){
        event = new MouseEvent("click")
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
        this.startImage = undefined
        FileUtils.loadImage(Res.pictures.game_over)
            .then(image => {
                this.startImage = image
                return image
            })
    }

    onResume(){
        this.resizeStartScreen()
    }

    render(context){
        if(this.startImage !== undefined)
            context.drawImage(this.startImage, 0, 0)
    }

    distributeEvent(event)
    {
        if(event.type === "load" || event.type === "resize"){
            this.resizeStartScreen()
        }
        else if(this.startImage !== undefined){
            Activity.startActivity(new GameScreen())
        }
    }

    resizeStartScreen()
    {
        let srcWidth = startScreenWidth
        let srcHeight = startScreenHeight
        let dstWidth = window.innerWidth
        let dstHeight = window.innerHeight
    
        let size = this.calcMinimumSize(srcWidth, srcHeight, dstWidth, dstHeight)
        let newWidth = Math.floor(size[0]) 
        let newHeight = Math.floor(size[1])
        let scale = newWidth / srcWidth
    
        let left = (dstWidth - newWidth) >> 1
        let top = (dstHeight - newHeight) >> 1
        setDisplayElement(left, top, newWidth, newHeight, scale)
    }

    calcMinimumSize(srcWidth, srcHeight, dstWidth, dstHeight)
    {
        if(srcWidth > dstWidth){
            let sacle = srcWidth / dstWidth;
            srcWidth /= sacle; 
            srcHeight /= sacle;
        }
        if(srcHeight > dstHeight){
            let sacle = srcHeight / dstHeight;
            srcWidth /= sacle;
            srcHeight /= sacle;
        }
        
        let sacleWidth = dstWidth / srcWidth;
        let sacleHeight = dstHeight / srcHeight;
        let maxSacle = Math.min(sacleWidth, sacleHeight);
        return new Array(srcWidth * maxSacle, srcHeight * maxSacle)
    }
}
let lastTouchEnd = 0;
class GameScreen extends Activity
{
    onStart(){
        this.resizeGameDisplay()
    }

    /**
     * Update and draw game scenes
     * @param {CanvasRenderingContext2D} context 
     */
    render(context){
        scenes.update()
        scenes.draw(context)
    }

    /**
     * Distribute events to the scenes
     * @param {Event} event Distribute event
     * @returns {boolean} if consume event, return true
    */
    distributeEvent(event)
    {
        // Window onload or resize, resizeGameDisplay
        // But don't send the event to the scenes
        if(event.type === "load" || event.type === "resize"){
            this.resizeGameDisplay()
            return true
        }
        return scenes.dispatchEvent(event)
    }

    /**
     * When the window size changes, 
     * adjust the canvas size and scenes size 
     * so that the background is full of window
     */
    resizeGameDisplay()
    {
        let width = window.innerWidth
        let height = window.innerHeight
        // The scaling of the window relative to the source image
        let sacle = Math.fround(height) / backgroundHeight 
        // The size of the scenes is the size of the source image
        let scenesHeight = backgroundHeight
        // Calculate the window width corresponding to the source width before scaling
        let scenesWidth = Math.floor(width / sacle)
        scenes.resize(scenesWidth, scenesHeight)
        // sacle canvas
        setDisplayElement(0, 0, width, height, sacle)
    }
}
Activity.startActivity(new StartScreen())

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

    context.restore() // clear the last state
    context.save()   // save original state
    // clipRect to Avoid drawing beyond the visible area
    context.beginPath()
    context.rect(0, 0, width, height)
    context.clip() 
    // setSacle to Map the source image to the target area
    context.scale(sacle, sacle) 
}
