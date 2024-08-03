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

        class animation{}

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
     * @param {string} path The path to the image file
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
            console.log("load " + path)
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
     * 
     * @param {string} path 
     * @returns {AnimationFrames}
     */
    static loadAnimation(path)
    {
        path = Res.animation_directory + path
        let data = this.mPathToData.get(path)

        if(data === undefined){
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
     * 
     * @param {string} path 
     * @returns {Promise<AnimationFrames>}
     */
    static newFramesPromise(path)
    {
        this.loadTextFile(path)
            .then(text => {
                let data = JSON.parse(text)
                this.loadImage(data.imagePath)
                    .then(image => {
                        let boundsArray = new Array()
                        for(let bounds of data.frameBounds){
                            let rect = new Rect(bounds[0], bounds[1], bounds[2], bounds[3])
                            boundsArray.push(rect)
                        }
                        return new AnimationFrames(image, boundsArray)
                    })
            })
    }

    /**
     * 
     * @param {string} path 
     * @returns {Promise<string>}
     */
    static loadTextFile(path) 
    {
        return fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); 
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }
}