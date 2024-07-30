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
    /**
     * load image file from pictures directory
     * @param {string} path 
     * @returns {Promise<CanvasImageSource>} 
     */
    static async loadImage(path) 
    {
        path = Res.pictures_directory + path
        console.log("load " + path)
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            return await createImageBitmap(blob);
        } catch (error) {
            console.error('Fetch or image processing failed:', error);
            throw error; 
        }
    }

    static getAnimation(){

    }
}