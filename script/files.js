class Res
{
    static pictures_directory = "../res/pictures/"
    static animation_directory = "../res/animation/"
    static music_directory = "../res/music"
    
    static pictures = class
    {
        static over = "over.png"
        static background = "background.png"
        static hero_run = "hero_run.png"
        static hero_jump = "hero_jump.png"
        static hero_down = "hero_down.png"
        static lion_run = "lion_run.png"
        static pillar_style = "pillar_style.png"
        static tortoise_dead = "tortoise_dead.png"
    }
    
    static animation = class
    {
        static hero_run = "hero_run.json"
        static hero_jump = "hero_jump.json"
        static hero_down = "hero_down.json"
        static lion_run = "lion_run.json"
        static pillar_style = "pillar_style.json"
        static tortoise_dead = "tortoise_dead.json"
    }

    static music = class
    {
        static background = "background.mp3"
        static hit = "hit.mp3"
    }
}

var audioContext = new window.AudioContext();

class FileUtils
{
    /** @type {Map<string, object>} cached loaded files data */
    static mPathToData = new Map()

    /**
     * load image file from pictures directory
     * @param {string} relativePath The path to the image file relative pictures directory
     * @returns {Promise<CanvasImageSource>} 
     *      A Promise that resolves to a CanvasImageSource, 
     *      Handle image in then(), and must return image for next promise 
     */
    static loadImage(relativePath) 
    {
        return this.loadCachedData(Res.pictures_directory + relativePath, path => {
            return fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.blob()
            })
            .then(blob => createImageBitmap(blob))
            .catch(error => {
                console.error(`Error loading data from ${path}:`, error)
                throw error // rethrow the error to propagate it further
            });
        })
    }

    /**
     * load animation file from animation directory
     * @param {string} relativePath The path to the animation file relative animation directory
     * @returns {Promise<Array<Sprite>>}
     *      A Promise that resolves to animation frames, 
     *      Handle frames in then(), and must return frames for next promise 
     */
    static loadAnimation(relativePath) 
    {
        return this.loadCachedData(Res.animation_directory + relativePath, path => {
            return fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.json()
            })
            .then(object => {
                return this.loadImage(object.imagePath)
                    .then(image => {
                        let frames = new Array()
                        for(let bounds of object.frameBounds){
                            let rect = new Rect(bounds[0], bounds[1], bounds[2], bounds[3])
                            frames.push(new Sprite(image, rect))
                        }
                        return frames
                    })
            })
            .catch(error => {
                console.error(`Error loading data from ${path}:`, error)
                throw error // rethrow the error to propagate it further
            });
        })
    }

    /**
     * load music file from music directory
     * @param {string} relativePath The path to the music file relative music directory
     * @returns {Promise<AudioBufferSourceNode>}
     *      A Promise that resolves to a AudioBufferSourceNode,
     *      Handle music in then(), and must return music for next promise 
     */
    static loadMusic(relativePath) 
    {
        return this.loadCachedData(Res.music_directory + relativePath, path => {
            return fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.arrayBuffer()
            })
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                let source = audioContext.createBufferSource()
                source.buffer = audioBuffer
                source.connect(audioContext.destination)
                return source
            })
            .catch(error => {
                console.error(`Error loading data from ${path}:`, error)
                throw error // rethrow the error to propagate it further
            });
        })
    }

    /**
     * Load data and cache it using mPathToData map
     * @private
     * @param {string} path The path to the data file
     * @param {(path: string) => Promise} createData 
     *      Callback function to create data, called only once on first load path
     * @returns {Promise} A Promise that resolves to data.
     *      If on first load path, return new Promise, else return cached Promise
     */
    static loadCachedData(path, createData) 
    {
        let data = this.mPathToData.get(path)
        if (data === undefined) {
            // First time loading the path
            console.log("Loading data from " + path)
            // Save the "load promise" in the map
            data = createData(path)
            this.mPathToData.set(path, data)
        }
        // Return the "load promise"
        // If the data is still loading, 
        // the registered callbacks in then() will be called on fulfillment
        // If the data is already fulfilled, 
        // the callback passed to then() will be called immediately
        return data
    }
}