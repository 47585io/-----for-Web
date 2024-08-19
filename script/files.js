class Res
{
    static pictures_directory = "../res/pictures/"
    static animation_directory = "../res/animation/"
    static music_directory = "../res/music/"
    
    static pictures = class
    {
        static game_over = "game_over.png"
        static background = "background.png"
        static hero_run = "hero_run.png"
        static hero_jump = "hero_jump.png"
        static hero_down = "hero_down.png"
        static lion_run = "lion_run.png"
        static pillar_style = "pillar_style.png"
        static tortoise_dead = "tortoise_dead.png"
        static icon_item = "icon_item.png"
    }
    
    static animation = class
    {
        static hero_run = "hero_run.json"
        static hero_jump = "hero_jump.json"
        static hero_down = "hero_down.json"
        static lion_run = "lion_run.json"
        static pillar_style = "pillar_style.json"
        static tortoise_dead = "tortoise_dead.json"
        static icon_item = "icon_item.json"
    }

    static music = class
    {
        static background = "background.mp3"
        static hit = "hit.mp3"
    }

    static icon = class
    {
        static fire = 0
        static snow = 1
        static thunder = 2
        static boow = 3
        static water = 4
        static bud = 5

        static clover = 6
        static lucky = 7
        static rose = 8
        static lily = 9
        static withered = 10
        static wheat = 11

        static red_love = 12
        static orange_love = 13
        static yellow_love = 14
        static green_love = 15
        static broken_love = 16
        static strawberry = 17

        static sun = 18
        static moon = 19
        static star = 20
        static light_star = 21
        static surround_star = 22
        static shining_stars = 23

        static diamond = 24
        static gift_box = 25
    }
}

var audioContext // create after

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
                        let frameBounds = object.frameBounds
                        let frameInsets
                        if("frameInsets" in object){
                            frameInsets = object.frameInsets
                        }

                        const frames = new Array(frameBounds.length)
                        for(let i = 0; i < frameBounds.length; ++i)
                        {
                            let bounds = new Rect(...frameBounds[i])
                            if(frameInsets !== undefined){
                                let insets = new Rect(...frameInsets[i])
                                frames[i] = new InsetSprite(image, bounds, insets)
                            }else{
                                frames[i] = new Sprite(image, bounds)
                            }
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
     * @returns {Promise<AudioBuffer>}
     *      A Promise that resolves to a AudioBuffer, 
     *      Handle audio in then(), and must return audio for next promise 
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

/**
 * Create a AudioBufferSourceNode with the specified AudioBuffer,
 * and connect it to the sound output device
 * @param {AudioBuffer} audioBuffer 
 * @returns {AudioBufferSourceNode}
 */
function creatAudioBufferSourceNode(audioBuffer){
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)
    return source
}