/**
 * Each Activity is an interface, 
 * and they have their own drawing and event handling methods.
 * 
 * In the Activity class, 
 * there is a static stack to save all activities
 * 
 * Operate it through startActivity and exitActivity, 
 * and use getCurrentActivity to get the Activity at the top of the stack.
 * 
 * Try to have many Activities, 
 * but always keep only one Activity in the foreground.
 * Usually you should use getCurrentActivity() in external code to get the current Activity, 
 * and then only draw that Activity or dispatch events to it.
 */
class Activity
{
    static mActivityStack = new Array()
    static mCurrentIndex = -1

    /**
     * Add an Activity to the top of the stack
     * @param {Activity} activity 
     */
    static startActivity(activity) 
    {
        if (Activity.mCurrentIndex >= 0) {
            const currentActivity = Activity.mActivityStack[Activity.mCurrentIndex];
            currentActivity.onPause(); 
        }
        Activity.mActivityStack.push(activity);
        Activity.mCurrentIndex++;
        activity.onStart(); 
        if(WindowLoaded){
            activity.onResize()
        }
    }

    /**
     * Remove the activity at the top of the stack
     */
    static exitActivity() 
    {
        if (Activity.mCurrentIndex < 0) return;

        const activity = Activity.mActivityStack.pop();
        Activity.mCurrentIndex--;
        activity.onStop(); 
        if (Activity.mCurrentIndex >= 0) {
            const previousActivity = Activity.mActivityStack[Activity.mCurrentIndex];
            previousActivity.onResume();
            if(WindowLoaded){
                previousActivity.onResize()
            }
        }
    }

    /**
     * Get the activity at the top of the stack
     * @returns {Activity | null} If the stack is not empty, 
     *      returns the activity at the top of the stack, otherwise returns null
     */
    static getCurrentActivity(){
        return this.mCurrentIndex >= 0 ? this.mActivityStack[this.mCurrentIndex] : null
    }

    /**
     * When the Activity Add to the stack,
     * the method is called
     */
    onStart(){}

    /**
     * When the Activity is switched to the background, 
     * the method is called
     */
    onPause(){}
    
    /**
     * When the Activity is resume to the foreground, 
     * the method is called
     */
    onResume(){}
    
    /**
     * When the Activity Remove from the stack,
     * the method is called
     */
    onStop(){}

    /**
     * When the size of the window containing the Activity changes,
     * the method is called
     */
    onResize(){}

    /**
     * The method of callback when the Activity render in the foreground
     * @param {CanvasRenderingContext2D} context 
     */
    render(context){}

    /**
     * The method of callback when the Activity receive a DOM event
     * @param {Event} event 
     * @returns {boolean} if consume event, return ture
     */
    distributeEvent(event){
        return false
    }
}