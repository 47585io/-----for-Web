/**
 * Rect holds four integer coordinates for a rectangle.
 * The rectangle is represented by the coordinates of its 4 edges (left, top, right bottom).
 * These fields can be accessed directly.
 * Use width() and height() to retrieve the rectangle's width and height.
 */
class Rect
{
    /**
     * Create a new rectangle by the specified coordinates or another rectangle
     * @description The constructor has 3 operations:
     * - Rect() Creat empty rectangle (0, 0, 0, 0)
     * - Rect(left: number, top: number, right: number, bottom: number) 
     *          Create a new rectangle by the specified edges
     * - Rect(r: Rect) Create a new rectangle by copying another rectangle
     */
    constructor(){
        if(arguments.length == 0)
            this.set(0, 0, 0, 0)
        else
            this.set(...arguments)
    }
    
    /**
     * @returns {string} Rect(left, top, right, bottom)
     */
    toString(){
        return "Rect(" + this.left + ", " + this.top + ", " + this.right + ", " + this.bottom + ")"
    }

    /**
     * @returns {boolean} Returns true if the rectangle is empty (left >= right or top >= bottom)
     */
    isEmpty() {
        return this.left >= this.right || this.top >= this.bottom;
    }

    /**
     * @returns {number} the rectangle's width
     */
    width() {
        return this.right - this.left;
    }

    /**
     * @returns {number} the rectangle's height
     */
    height() {
        return this.bottom - this.top;
    }

    /**
     * 
     * @returns {number} the rectangle's area
     */
    area(){
        return (this.right - this.left) * (this.bottom - this.top)
    }

    /**
     * @returns {number} the horizontal center of the rectangle
     */
    centerX() {
        return (this.left + this.right) >> 1;
    }

    /**
     * @returns {number} the vertical center of the rectangle
     */
    centerY() {
        return (this.top + this.bottom) >> 1;
    }

    /**
     * Set the rectangle's coordinates by the specified values or another rectangle
     * @description The function has 2 operations:
     * - set(left: number, top: number, right: number, bottom: number)
     * - set(r: Rect) 
     */
    set(){
        if(arguments.length === 4 && typeof arguments[0] === "number" && typeof arguments[1] === "number" && typeof arguments[2] === "number" && typeof arguments[3] === "number"){
            this.setRectByValues(arguments[0], arguments[1], arguments[2], arguments[3])
        }else if(arguments.length === 1 && arguments[0] instanceof Rect){
            let r = arguments[0]
            this.setRectByValues(r.left, r.top, r.right, r.bottom)
        }
    }

    /**
     * Set the rectangle's coordinates to the specified values
     * @private
     * @param {number} left   The X coordinate of the left side of the rectangle
     * @param {number} top    The Y coordinate of the top of the rectangle
     * @param {number} right  The X coordinate of the right side of the rectangle
     * @param {number} bottom The Y coordinate of the bottom of the rectangle
     */
    setRectByValues(left, top, right, bottom){
        this.left = left
        this.top = top
        this.right = right
        this.bottom = bottom
    }

    /**
     * Offset the rectangle by adding dx to its left and right coordinates, and
     * adding dy to its top and bottom coordinates
     * @param {number} dx The amount to add to the rectangle's left and right coordinates
     * @param {number} dy The amount to add to the rectangle's top and bottom coordinates
     */
    offset(dx, dy){
        this.left += dx
        this.right += dx
        this.top += dy
        this.bottom += dy
    }

    /**
     * Offset the rectangle to a specific (x, y) position,
     * keeping its width and height the same
     * @param {number} x The new "left" coordinate for the rectangle
     * @param {number} y The new "top" coordinate for the rectangle
     */
    offsetTo(x, y) {
        this.right += x - this.left;
        this.bottom += y - this.top;
        this.left = x;
        this.top = y;
    }

    /**
     * Insets the rectangle on all sides specified by the insets.
     * * @description The function has 3 operations:
     * - inset(x: number, y: number)
     * - inset(left: number, top: number, right: number, bottom: number)
     * - inset(r: Rect)
     */
    inset(){
        if(arguments.length === 2 && typeof arguments[0] === "number" && typeof arguments[1] === "number"){
            this.insetWithValues(arguments[0], arguments[1], arguments[0], arguments[1])
        }else if(arguments.length === 4 && typeof arguments[0] === "number" && typeof arguments[1] === "number" && typeof arguments[2] === "number" && typeof arguments[3] === "number"){
            this.insetWithValues(arguments[0], arguments[1], arguments[2], arguments[3])
        }else if(arguments.length === 1 && arguments[0] instanceof Rect){
            let r = arguments[0]
            this.insetWithValues(r.left, r.top, r.right, r.bottom)
        }
    }

    /**
     * Insets the rectangle on all sides specified by the insets.
     * @private
     * @param left The amount to add from the rectangle's left
     * @param top The amount to add from the rectangle's top
     * @param right The amount to subtract from the rectangle's right
     * @param bottom The amount to subtract from the rectangle's bottom
     */
    insetWithValues(left, top, right, bottom) {
        this.left += left;
        this.top += top;
        this.right -= right;
        this.bottom -= bottom;
    }

    /**
     * Returns true if the specified rectangle is equal to this rectangle
     * @description The function has 2 operations:
     * - equals(left: number, top: number, right: number, bottom: number): boolean
     * - equals(r: Rect): boolean
     * @returns {boolean} true if the specified rectangle is equal to this rectangle
     */
    equals(){
        if(arguments.length === 4 && typeof arguments[0] === "number" && typeof arguments[1] === "number" && typeof arguments[2] === "number" && typeof arguments[3] === "number"){
            return this.equalsWithValues(arguments[0], arguments[1], arguments[2], arguments[3])
        }else if(arguments.length === 1 && arguments[0] instanceof Rect){
            let r = arguments[0]
            return this.equalsWithValues(r.left, r.top, r.right, r.bottom)
        }
        return false
    }

    /**
     * Returns true if the specified rectangle is equal to this rectangle
     * @private 
     * @param {number} left The left side of the rectangle to compare
     * @param {number} top The top side of the rectangle to compare
     * @param {number} right The right side of the rectangle to compare
     * @param {number} bottom The bottom side of the rectangle to compare
     * @returns {boolean} ture if the specified rectangle is equal to this rectangle
     */
    equalsWithValues(left, top, right, bottom){
        return left == this.left && top == this.top && 
                right == this.right && bottom == this.bottom;
    }

    /**
     * Returns true if the specified rectangle is inside or equal to this rectangle
     * @description The function has 3 operations:
     * - contains(x: number, y: number): boolean (check rect whether contains point)
     * - contains(left: number, top: number, right: number, bottom: number): boolean
     * - contains(r: Rect): boolean
     * @returns {boolean} true if the specified rectangle is inside or equal to this rectangle
     */
    contains(){
        if(arguments.length === 2 && typeof arguments[0] === "number" && typeof arguments[1] === "number"){
            return this.containsWithValues(arguments[0], arguments[1], arguments[0], arguments[1])
        }else if(arguments.length === 4 && typeof arguments[0] === "number" && typeof arguments[1] === "number" && typeof arguments[2] === "number" && typeof arguments[3] === "number"){
            return this.containsWithValues(arguments[0], arguments[1], arguments[2], arguments[3])
        }else if(arguments.length === 1 && arguments[0] instanceof Rect){
            let r = arguments[0]
            return this.containsWithValues(r.left, r.top, r.right, r.bottom)
        }
        return false
    }

    /**
     * Returns true if the 4 specified sides of a rectangle are inside or 
     * equal to this rectangle.
     * @private
     * @param {number} left The left side of the rectangle being tested for containment
     * @param {number} top The top of the rectangle being tested for containment
     * @param {number} right The right side of the rectangle being tested for containment
     * @param {number} bottom The bottom of the rectangle being tested for containment
     * @return {boolean} true if the 4 specified sides of a rectangle are inside or
     *              equal to this rectangle
     */
    containsWithValues(left, top, right, bottom){
        return this.left <= left && this.top <= top &&
                this.right >= right && this.bottom >= bottom
    }

    /**
     * Returns true if this rectangle intersects the specified rectangle
     * @description The function has 2 operations:
     * - intersects(left: number, top: number, right: number, bottom: number): boolean
     * - intersects(r: Rect): boolean
     * @returns {boolean} true if the specified rectangle intersects this rectangle
     */
    intersects(){
        if(arguments.length === 4 && typeof arguments[0] === "number" && typeof arguments[1] === "number" && typeof arguments[2] === "number" && typeof arguments[3] === "number"){
            return this.intersectsWithValues(arguments[0], arguments[1], arguments[2], arguments[3])
        }else if(arguments.length === 1 && arguments[0] instanceof Rect){
            let r = arguments[0]
            return this.intersectsWithValues(r.left, r.top, r.right, r.bottom)
        }
        return false
    }

    /**
     * Returns true if this rectangle intersects the specified rectangle
     * @private
     * @param {number} left The left side of the rectangle being tested for intersection
     * @param {number} top The top of the rectangle being tested for intersection
     * @param {number} right The right side of the rectangle being tested for intersection
     * @param {number} bottom The bottom of the rectangle being tested for intersection
     * @return {boolean} true if the specified rectangle intersects this rectangle
     */
    intersectsWithValues(left, top, right, bottom){
        return this.left < right && left < this.right && 
                this.top < bottom && top < this.bottom;
    }

    /**
     * if this rectangle intersects the specified rectangle, 
     * return true and set this rectangle to that intersection,
     * otherwise return false and do not change this rectangle
     * @description The function has 2 operations:
     * - setIntersects(left: number, top: number, right: number, bottom: number): boolean
     * - setIntetsects(r: Rect): boolean
     * @returns {boolean} true if the specified rectangle and this rectangle intersect
     *              (and this rectangle is then set to that intersection) else
     *              return false and do not change this rectangle.
     */
    setIntersects(){
        if(arguments.length === 4 && typeof arguments[0] === "number" && typeof arguments[1] === "number" && typeof arguments[2] === "number" && typeof arguments[3] === "number"){
            return this.setIntersectsWithValues(arguments[0], arguments[1], arguments[2], arguments[3])
        }else if(arguments.length === 1 && arguments[0] instanceof Rect){
            let r = arguments[0]
            return this.setIntersectsWithValues(r.left, r.top, r.right, r.bottom)
        }
        return false
    }

    /**
     * If the rectangle specified by left,top,right,bottom intersects this
     * rectangle, return true and set this rectangle to that intersection,
     * otherwise return false and do not change this rectangle.
     * Note: To just test for intersection, use {@link intersects()}.
     * @private
     * @param {number} left The left side of the rectangle being intersected with this rectangle
     * @param {number} top The top of the rectangle being intersected with this rectangle
     * @param {number} right The right side of the rectangle being intersected with this rectangle.
     * @param {number} bottom The bottom of the rectangle being intersected with this rectangle.
     * @return {boolean} true if the specified rectangle and this rectangle intersect
     *              (and this rectangle is then set to that intersection) else
     *              return false and do not change this rectangle.
     */
    setIntersectsWithValues(left, top, right, bottom){
        if (this.left < right && left < this.right && this.top < bottom && top < this.bottom) {
            if (this.left < left) this.left = left;
            if (this.top < top) this.top = top;
            if (this.right > right) this.right = right;
            if (this.bottom > bottom) this.bottom = bottom;
            return true;
        }
        return false;
    }

    /**
     * Update this Rect to enclose itself and the specified rectangle
     * @description The function has 3 operations:
     * - union(x: number, y: number) (union Point)
     * - union(left: number, top: number, right: number, bottom: number)
     * - union(r: Rect)
     */
    union(){
        if(arguments.length === 2 && typeof arguments[0] === "number" && typeof arguments[1] === "number"){
            this.unionWithValues(arguments[0], arguments[1], arguments[0], arguments[1])
        }else if(arguments.length === 4 && typeof arguments[0] === "number" && typeof arguments[1] === "number" && typeof arguments[2] === "number" && typeof arguments[3] === "number"){
            this.unionWithValues(arguments[0], arguments[1], arguments[2], arguments[3])
        }else if(arguments.length === 1 && arguments[0] instanceof Rect){
            let r = arguments[0]
            this.unionWithValues(r.left, r.top, r.right, r.bottom)
        }
    }

    /**
     * Update this Rect to enclose itself and the specified rectangle
     * @private
     * @param {number} left The left edge being unioned with this rectangle
     * @param {number} top The top edge being unioned with this rectangle
     * @param {number} right The right edge being unioned with this rectangle
     * @param {number} bottom The bottom edge being unioned with this rectangle
     */
    unionWithValues(left, top, right, bottom){
        if (this.left > left) this.left = left;
        if (this.top > top) this.top = top;
        if (this.right < right) this.right = right;
        if (this.bottom < bottom) this.bottom = bottom;
    }

    /**
     * Scale the rectangle by the specified multiple 
     * @param {number} sacle Sacle multiple
     */
    sacle(sacle){
        if(sacle != 1.0){
            this.left *= sacle
            this.top *= sacle
            this.right *= sacle
            this.bottom *= sacle
        }
    }

    /**
     * Swap top/bottom or left/right if there are flipped (left > right or top > bottom)
     */
    sort(){
        if (this.left > this.right) {
            let temp = this.left;
            this.left = right;
            this.right = temp;
        }
        if (this.top > this.bottom) {
            let temp = this.top;
            this.top = bottom;
            this.bottom = temp;
        }
    }
}

/**
 * Utility class for rectangle operations.
 */
class RectUtils
{
    /**
     * Computes the union rectangle of all rectangles in the array
     * @param  {...Rect} rects All rectangles to be union
     * @returns {Rect}  Return Union rectangle if rects.length > 0,
     *                  otherwise return the empty rectangle
     */
    static getUnionRect(...rects){
        let ret = new Rect()
        for(let r of rects){
            ret.union(r)
        }
        return ret
    }

    /**
     * Computes the intersects rectangle of two rectangles
     * @param {Rect} r1 First rectangle
     * @param {Rect} r2 Second rectangle
     * @returns {Rect}  Returns the rectangle they intersect if the two rectangles intersect, 
     *                  otherwise return the empty rectangle
     */
    static getIntersectsRect(r1, r2){
        let ret = new Rect()
        if(r1.intersects(r2)){
            ret.set(r1)
            ret.setIntersects(r2)
        }
        return ret
    }

    /**
     * Computes the rectangle of the src rectangle is inseted the insets rectangle
     * @param {Rect} src source rectangle
     * @param {Rect} insets insets rectangle
     * @returns {Rect} Returns a new rectangle they insets
     */
    static getInsetRect(src, insets){
        let ret = new Rect(src)
        ret.inset(insets)
        return ret
    }
}
