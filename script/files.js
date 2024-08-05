class Res
{
    static pictures_directory = "../res/pictures/"
    static animation_directory = "../res/animation/"

    constructor()
    {
        class pictures
        {
            static background = "background.png"
            static hero_run = "hero_run.png"
            static hero_jump = "hero_jump.png"
            static hero_down = "hero_down.png"
            static lion_run = "lion_run.png"
        }

        class animation
        {
            static hero_run = "hero_run.json"
            static hero_jump = "hero_jump.json"
            static hero_down = "hero_down.json"
            static lion_run = "lion_run.json"
        }

        this.pictures = pictures
        this.animation = animation
    }
}

var R = new Res()

class FileUtils
{
    /** @type {Map<string, object>} */
    static mPathToData = new Map()

    /**
     * load image file from pictures directory
     * @param {string} path The path to the image file relative pictures directory
     * @returns {Promise<CanvasImageSource>} 
     *      A Promise that resolves to a CanvasImageSource, 
     *      Handle image in then(), and must return image for next promise 
     */
    static loadImage(path) 
    {
        path = Res.pictures_directory + path
        let data = this.mPathToData.get(path)
        
        if(data === undefined){
            // The path is first load
            console.log("load image from " + path)
            let loadPromise = this.newImagePromise(path)
                .then(image => {
                    // on image load, save it in the map
                    this.mPathToData.set(path, image)
                    return image //Return the image to handle the subsequent promise
                })
            // before the image loading completes, save "load promise" in the map
            this.mPathToData.set(path, loadPromise)
            return loadPromise
        }

        if(data instanceof Promise){
            // the image is loading, return "load promise"
            // onload, "load promise" will call each callback
            return data
        }
        else if(data instanceof CanvasImageSource){
            // the image is already loaded, return resolved Promise
            return Promise.resolve(data)
        }
        // Handle any other unexpected cases
        return Promise.reject(new Error('Invalid data type for ' + path));
    }

    /**
     * load image file from path in background thread
     * @private
     * @param {string} path The path to the image file
     * @returns {Promise<CanvasImageSource>} A Promise that resolves to a CanvasImageSource
     */
    static newImagePromise(path)
    {
        return fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch image from ${path}`);
                }
                return response.blob();
            })
            .then(blob => createImageBitmap(blob))
            .catch(error => {
                console.error(`Error loading image from ${path}:`, error);
                throw error; // rethrow the error to propagate it further
            });
    }

    /**
     * load animation file from animation directory
     * @param {string} path The path to the animation file relative animation directory
     * @returns {Promise<AnimationFrames>}
     *      A Promise that resolves to a AnimationFrames, 
     *      Handle frames in then(), and must return frames for next promise 
     */
    static loadAnimation(path)
    {
        path = Res.animation_directory + path
        let data = this.mPathToData.get(path)

        if(data === undefined){
            console.log("load animation from " + path)
            let loadPromise = this.newFramesPromise(path)
                .then(frames => {
                    this.mPathToData.set(path, frames)
                    return frames
                })
            this.mPathToData.set(path, loadPromise)
            return loadPromise
        }

        if(data instanceof Promise){
            return data
        }
        else if(data instanceof AnimationFrames){
            return Promise.resolve(data)
        }
        return Promise.reject(new Error('Invalid data type for ' + path));
    }

    /**
     * load animation file from path in background thread
     * @private 
     * @param {string} path The path to the image file
     * @returns {Promise<AnimationFrames>} A Promise that resolves to a AnimationFrames
     */
    static newFramesPromise(path)
    {
        return fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json()
            })
            .then(object => {
                return this.loadImage(object.imagePath)
                    .then(image => {
                        let frameBounds = new Array()
                        for(let bounds of object.frameBounds){
                            let rect = new Rect(bounds[0], bounds[1], bounds[2], bounds[3])
                            frameBounds.push(rect)
                        }
                        return new AnimationFrames(image, frameBounds)
                    })
            })
            .catch(error => {
                console.error(`Error loading frames from ${path}:`, error);
                throw error; // rethrow the error to propagate it further
            });
    }
}