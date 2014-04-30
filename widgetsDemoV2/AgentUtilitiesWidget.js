(function ($) {
    
    // Register the callback to the init script
    window.initCallbackHooks = window.initCallbackHooks || [];
    window.initCallbackHooks.push(initCallback);

    // Member variables to store model references
    var m_AgentModel;

    // When within a session, this widget queries the sessionModel to decide
    // whether the local participant is an agent
    function initCallback(isInSession) {
        if (isInSession) {
            BevyUpApi.getSessionModel().done(getSessionModelCallback);
        }
    }

    // If the local participant is an agent, we will query the agentModel
    // Note: This widget will fail to getAgentModel unless the current browser is logged onto the BevyUp agent portal
    function getSessionModelCallback(sessionModel) {
        if (!sessionModel.getLocalParticipant().getIsAgent()) {
            return;
        }

        BevyUpApi.getAgentModel().done(getAgentModelCallback).fail(getAgentModelCallbackFailure);
    }

    // This is the success callback to the agentModel request
    // At this point, we have all of the data needed to power the widget, so we attach the associated html to the DOM
    function getAgentModelCallback(agentModel) {
        m_AgentModel = agentModel;

        var parent = document.body.querySelector(".agentParent") || document.body;

        appendWidgetHtmlToDom(parent);
    }

    // There are some reasons why the agentModel request could fail
    // This handler will log them to the console
    function getAgentModelCallbackFailure(err) {
        log("(error) getAgentModelCallbackFailure: " + err);
    }
    
    // This function configures the HTML of the widget with the name of the agent, adds a link for creating a new session,
    // and appends it to the DOM
    function appendWidgetHtmlToDom(parent) {
        var container = document.createElement('div');
        container.className = "bevyup_agent_utilities_widget";

        var html = 
"<h2>Agent Utilities</h2>\
<div class='content'>\
    <div class='agentId'>" + m_AgentModel.getAgentId() + "</div>\
    <a class='createSessionLink' href='javascript:void(0);'>Create a new session</a>\
</div>";

        container.innerHTML = html;

        var createSessionLink = $(container).find('.createSessionLink');
        createSessionLink.click(createSessionLinkClicked);

        parent.appendChild(container);
    }

    // When a user clicks the create session link, this widget will call the createAgentSessionAndInvite function on the agentModel.
    function createSessionLinkClicked() {
        m_AgentModel.createAgentSessionAndInvite("Guest" + Date.now()).then(createAgentSessionAndInviteSuccess, createAgentSessionAndInviteFailure);
    }
    
    // If the createAgentSessionAndInvite was successful, this widget will navigate with that inviteId as the override
    function createAgentSessionAndInviteSuccess(inviteId) {
        window.location.href = window.location.origin + window.location.pathname + "?overrideInviteId=" + inviteId;
    }

    // Handler for failures
    function createAgentSessionAndInviteFailure(err) {
        log("(error) createAgentSessionAndInviteFailure: " + err);
    }

    // Utility function to log to console with a prefix
    function log(s) {
        if (window.console) {
            console.log("BevyUp Sample> " + s);
        }
    }
    
}(jQuery));