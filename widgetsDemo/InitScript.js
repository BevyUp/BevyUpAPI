(function ($) {

    function log(s) {
        if (window.console) {
            console.log("BevyUp Sample> " + s);
        }
    }
    
    // Once BevyUp is ready for handling API calls, it will call this function.  
    window.bevyUpPartnerAsyncInit = function () {
        BevyUpApi.init(initCallback);
    };

    // When the BevyUpApi initialization process is completed, this function calls all 
    // the functions that have added itself to window.initCallbackHooks
    function initCallback(error, sessionFound) {
        if (error) {
            log("(error) init call failed: " + error);
            return;
        }

        if (!sessionFound) {
            log("No current session found");
        }
		
        if (window.initCallbackHooks) {
            window.initCallbackHooks.forEach(function (func) {
                func(sessionFound);
            });
        }
    }

}(jQuery));