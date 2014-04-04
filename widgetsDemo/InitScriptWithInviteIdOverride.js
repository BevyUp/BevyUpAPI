(function ($) {

    function log(s) {
        if (window.console) {
            console.log("BevyUp Sample> " + s);
        }
    }

    // This sample script allows the server to provide an InviteId for this user
    // This function uses window.userInviteId if defined, then it looks for a url parameter of overrideInviteId
    var overrideInviteId;
    if (window.userInviteId) {
        overrideInviteId = window.userInviteId;
    }
    else {
        var overrideInviteIdResult = window.location.search.match(new RegExp("overrideInviteId=([^&#]+)"));

        if (overrideInviteIdResult) {
            overrideInviteId = overrideInviteIdResult[1];
        }        
    }    

    // Once BevyUp is ready for handling API calls, it will call this function.  This function 
    // sets the overrideInviteId if configured and then calls the init function
    window.bevyUpPartnerAsyncInit = function () {
        if (overrideInviteId) {
            BevyUpApi.setInviteId(overrideInviteId);
        }

        BevyUpApi.init(initCallback);
    };

    // When the BevyUpApi initialization process is completed, this function:
    // 1. If no overrideInviteId was set, gets the inviteId in order to send it to the server
    // 2. Calls all the functions that have added itself to window.initCallbackHooks
    function initCallback(error, sessionFound) {
        if (error) {
            log("(error) init call failed: " + error);
            return;
        }

        if (!sessionFound) {
            if (overrideInviteId) {
                log("(error) Invalid override inviteId in URL");
            }
            else {
                log("No current session found");
            }
        }

        if (!overrideInviteId) {
            BevyUpApi.getInviteId(getInviteIdCallback);
        }

        if (window.initCallbackHooks) {
            window.initCallbackHooks.forEach(function (func) {
                func(sessionFound);
            });
        }
    }

    // In the callback to getInviteId, this function logs a console statement to send
    // the inviteId to the server
    function getInviteIdCallback(error, inviteId) {
        if (error) {
            log("(error) getInviteId call failed: " + error);
            return;
        }

        log("Sending new InviteId information to the server: " + inviteId);
    }

}(jQuery));