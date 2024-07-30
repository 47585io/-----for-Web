class Scenes
{
    /**
     * Create a specified size scenes
     * @param {number} width  scenes width
     * @param {number} height scenes height
     */
    constructor(width, height)
    {
        /** @type {CanvasImageSource} */
        this.mBackgroundImage = null
        this.mWidth = width
        this.mHeight = height
        this.mScroll = 0
    }

    resize(width, height){
        this.mWidth = width
        this.mHeight = height
    }

    /**
     * 
     */
    update(){
        this.mScroll += 5
    }

    /**
     * Draw scenes background and elements in the scenes
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context){
        this.drawBackground(context)
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
}


class GameManger
{
    
}