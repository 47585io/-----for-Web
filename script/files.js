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
     * @returns {Promise<CanvasImageSource>} A Promise that resolves to a CanvasImageSource
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

    static loadAnimation(path)
    {
       
    }
}