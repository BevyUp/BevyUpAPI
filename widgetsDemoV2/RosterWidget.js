(function ($) {
   
    // Register the callback to the init script
    window.initCallbackHooks = window.initCallbackHooks || [];
    window.initCallbackHooks.push(initCallback);

    // Member variables to store model references
    var m_SessionModel;
    
    // This callback initializes the widget by getting the SessionModel
    function initCallback(isInSession) {
        if (isInSession) {
            BevyUpApi.getSessionModel().done(getSessionModelCallback).fail(getSessionModelCallbackFailure);
        }
    }

    // This is the success callback to the sessionModel request
    // At this point, we have all of the data needed to power the widget, so we attach the associated html to the DOM
    function getSessionModelCallback(sessionModel) {
        m_SessionModel = sessionModel;

        var parent = document.body.querySelector(".identityParent") || document.body;

        var localParticipant = sessionModel.getLocalParticipant();
        if (window.bevyupAgentMode && !localParticipant.getIsAgent()) {
            // This widget only needs to show for agents when in agentMode
            return;
        }

        appendWidgetHtmlToDom(localParticipant, sessionModel.getRemoteParticipants(), parent);
    }

    // Handler for failures
    function getSessionModelCallbackFailure(err) {
        log("(error) getSessionModelCallbackFailure: " + err);
    }
    
    // This function configures the HTML of the widget with the information about the localParticipant
    // and if there are remoteParticipants, it will add the first one's information
    function appendWidgetHtmlToDom(localParticipant, remoteParticipants, parent) {
        var container = document.createElement('div');
        container.className = "bevyupIdentificationWidget";

        var html = 
"<h2>User Identity</h2>\
<div class='content'>\
    <div class='welcomeText'>Welcome, <span class='welcomeUserName'>" + localParticipant.getName() + "</span>!</div>\
    <a class='dashboardLink' href='http://agent.bevyup.com'>Dashboard</a>\
    <div class='logOutLink'>Log Out</div>\
</div>";

        container.innerHTML = html;

        // Hook up the logOutLink click handler
        var logOutLink = $(container).find('.logOutLink');
        logOutLink.click(logOutLinkClicked);

        if (remoteParticipants != null && remoteParticipants.length > 0) {
            var remoteParticipant = remoteParticipants[0];
            var remoteParticipantContainer = document.createElement('div');
            remoteParticipantContainer.className = "content";

            var remotePartHtml =
"<div class='welcomeText'>RemoteUser</div>\
<div>Name: " + remoteParticipant.getName() + "</div>\
<div>Link: " + window.location.origin + window.location.pathname + "?overrideInviteId=" + remoteParticipant.getInviteId() + "</div>";
            
            remoteParticipantContainer.innerHTML = remotePartHtml;
            container.appendChild(remoteParticipantContainer);
        }

        parent.appendChild(container);
    }

    // When a user clicks logout, this widget will call the leaveSession function on the BevyUpApi.
    function logOutLinkClicked() {
        m_SessionModel.leaveSession().then(leaveSessionCallback, leaveSessionCallbackFailure);
    }

    // When leaveSession's callback is called, navigate to the user to a designated location
    function leaveSessionCallback() {
        // Refresh page without query string arguments
        window.location.href = window.location.origin + window.location.pathname;
    }

    // Handler for errors
    function leaveSessionCallbackFailure(err) {
        log("(error) leaveSessionCallbackFailure: " + err);
    }
    
    // Utility function to log to console with a prefix
    function log(s) {
        if (window.console) {
            console.log("BevyUp Sample> " + s);
        }
    }
    
}(jQuery));