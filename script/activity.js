class Activity
{
    static mActivityStack = new Array()
    static mCurrentIndex = -1

    static startActivity(activity) 
    {
        if (Activity.mCurrentIndex >= 0) {
            const currentActivity = Activity.mActivityStack[Activity.mCurrentIndex];
            currentActivity.onPause(); 
        }
        Activity.mActivityStack.push(activity);
        Activity.mCurrentIndex++;
        activity.onStart(); 
    }

    static exitActivity() 
    {
        if (Activity.mCurrentIndex < 0) return;
        
        const activity = Activity.mActivityStack.pop();
        Activity.mCurrentIndex--;
        activity.onStop(); 
        if (Activity.mCurrentIndex >= 0) {
          const previousActivity = Activity.mActivityStack[Activity.mCurrentIndex];
          previousActivity.onResume();
        }
    }

    /**
     * 
     * @returns {Activity}
     */
    static getCurrentActivity(){
        return this.mCurrentIndex >= 0 ? this.mActivityStack[this.mCurrentIndex] : null
    }
  
    onStart(){}

    onPause(){}
    
    onResume(){}
    
    onStop(){}

    render(context){}

    distributeEvent(event){}
}