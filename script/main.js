
var DEBUG = true
var WindowLoaded = false
var canvas = document.getElementById("display")
var context = canvas.getContext("2d")

// register EventListener
window.onload = resizeActivity
window.onresize = resizeActivity
window.onclick = distributeEvent
window.oncontextmenu = distributeEvent
window.onkeyup = distributeEvent

/** When the window size changes, resize the current Activity */
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
    // When the user gesture is triggered for the first time
    // Create and Resume audioContext for FileUtils.loadMusic()
    if (audioContext === undefined){ 
        audioContext = new (window.AudioContext || window.webkitAudioContext)()  
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
    }

    // Browser default action corresponding to cancel the event
    event.preventDefault()

    // Distribute events to the current Activity
    let activity = Activity.getCurrentActivity()
    if (activity !== null && activity.isRunning){
        return activity.distributeEvent(event)
    }
    return false
}

/** Continuously draw the current Activity */
function render(){
    let activity = Activity.getCurrentActivity()
    if (activity !== null)
        activity.render(context) // Draw this frame animation
    window.requestAnimationFrame(render) // request Draw next frame animation
}
window.requestAnimationFrame(render)

// Start game
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