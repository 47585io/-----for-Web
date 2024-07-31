
class Rect 
{
    /**
     * Create a rectangle.
     * @param {number} x - The x coordinate of the top-left corner.
     * @param {number} y - The y coordinate of the top-left corner.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     */
    constructor(x, y, width, height) 
    {
        /** @type {number} */
        this.x = x; // x coordinate of top-left corner
        /** @type {number} */
        this.y = y; // y coordinate of top-left corner
        /** @type {number} */
        this.width = width; // width of the rectangle
        /** @type {number} */
        this.height = height; // height of the rectangle
    }

    offset(dx, dy){
        this.x += dx
        this.y += dy
    }

    contains(x, y){

    }

    contains(x, y, width, height){

    }

    intersects(x, y, width, height){

    }

    
}
