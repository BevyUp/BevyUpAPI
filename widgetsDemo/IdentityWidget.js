(function ($) {
   
    // Register the callback to the init script
    window.initCallbackHooks = window.initCallbackHooks || [];
    window.initCallbackHooks.push(initCallback);

    // This callback initializes the widget by getting the participants for this session
    function initCallback(isInSession) {
        if(isInSession){
            BevyUpApi.getParticipants(getParticipantsCallback);
        }
    }

    // With the list of participants, this function checks if the local participant is an agent.
    // If the participant is an agent, this widget does not append the html to the DOM
    function getParticipantsCallback(error, localParticipant, remoteParticipants) {
        if (error || !localParticipant) {
            log("(error) getParticipants call failed: " + error);
            return;
        }

        if (window.bevyupAgentMode && !localParticipant.getIsAgent()) {
            // This widget only needs to show for agents
            return;
        }

        // This will allow the sample pages to control where this widget will be appended
        var parent = document.body.querySelector(".identityParent") || document.body;

        appendWidgetHtmlToDom(localParticipant.getName(), parent);
    }
    
    // This function configures the HTML of the widget with the name of the agent and appends it to the DOM
    function appendWidgetHtmlToDom(name, parent) {
        var container = document.createElement('div');
        container.className = "bevyupIdentificationWidget";

        var html = 
"<div class='bevyupIdentificationWidget'>\
    <h2>User Identity</h2>\
    <div class='content'>\
        <div class='welcomeText'>Welcome, <span class='welcomeUserName'>" + name + "</span>!</div>\
        <a class='dashboardLink' href='http://agent.bevyup.com'>Dashboard</a>\
        <div class='logOutLink'>Log Out</div>\
    </div>\
</div>";

        container.innerHTML = html;

        var logOutLink = $(container).find('.logOutLink');

        logOutLink.click(logOutLinkClicked);

        parent.appendChild(container);
    }

    // When a user clicks logout, this widget will call the leaveSession function on the BevyUpApi.
    function logOutLinkClicked() {
        BevyUpApi.leaveSession(leaveSessionCallback);
    }

    // When leaveSession's callback is called, navigate to the user to a designated location
    function leaveSessionCallback(error) {
        if (error) {
            log("(error) leaveSession call failed: " + error);
            return;
        }

        // Refresh page without query string arguments
        window.location.href = window.location.origin + window.location.pathname;
    }

    // Utility function to log to console with a prefix
    function log(s) {
        if (window.console) {
            console.log("BevyUp Sample> " + s);
        }
    }
    
}(jQuery));