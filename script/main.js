/**
 * See index.html, before main.js,
 * import files.js
 */

const backgroundHeight = 396

var canvas = document.getElementById("display")
var context = canvas.getContext("2d")
context.save() // first save
var scenes = new Scenes(0, 0)
FileUtils.loadImage(R.pictures.background).then(res => {scenes.mBackgroundImage = res})
window.onload = resizeGameDisplay
window.addEventListener('resize', resizeGameDisplay);

/**
 * When the window size changes, 
 * adjust the canvas size and scenes size so that the background is full of window
 */
function resizeGameDisplay()
{
    let width = window.innerWidth
    let height = window.innerHeight
    // The scaling of the window relative to the source image
    let sacle = Math.fround(height) / backgroundHeight 
    // The size of the scenes is the size of the source image
    scenes.mHeight = backgroundHeight
    // Calculate the window width corresponding to the source width before scaling
    scenes.mWidth = Math.floor(width / sacle)
    // sacle canvas
    setGameDisplayElement(width, height, sacle)
}

/**
 * Set the canvas element for display to the specified size, 
 * Set the sacle matrix, Map the source image to the target area
 * @param {number} width width of canvas element
 * @param {number} height height of canvas element
 * @param {number} sacle canvas grid line sacle multiple
 */
function setGameDisplayElement(width, height, sacle)
{
    // set the drawing area
    canvas.width = width 
    canvas.height = height
    // set canvas element size
    canvas.style.width = width + "px"
    canvas.style.height = height + "px"

    context.restore() // clear the last state
    context.save()    // save original state
    // clipRect to Avoid drawing beyond the visible area
    context.beginPath()
    context.rect(0, 0, width, height)
    context.clip() 
    // setSacle to Map the source image to the target area
    context.scale(sacle, sacle) 
}

function render(){
    scenes.update()
    scenes.draw(context) // Draw this frame animation
    window.requestAnimationFrame(render) // request Draw next frame animation
}
window.requestAnimationFrame(render)