(function ($) {
    var locationLowerCase = window.location.href.toLowerCase(),
        bevyupStyleBoardDiv,
        tooldisplayDiv,
        auxTooldisplayDiv,
        newlyAddedToolDiv,
        currentToolsCount = 0,
        currentAuxToolsCount = 0,
        demoProductInfo = {
            bup_id: "3035710",
            bup_name: "'Live In' Leggings",
            bup_imageUrl: "//g.nordstromimage.com/imagegallery/store/product/Large/15/_8054895.jpg",
            bup_price: "52.00",
            nord_style: "12423",
        };

    function log(s) {
        if (window.console) {
            console.log("BevyUp Sample> " + s);
        }
    }

    //
    // BevyUp API Setup
    //

    function initCallback(error, sessionFound) {
        if (error) {
            log("(error) init call failed: " + error);
            return;
        }

        if (!sessionFound) {
            log("No current session found");
            return;
        }

        BevyUpApi.getTagDefinitions(getTagDefinitionsCallback);
        BevyUpApi.getSessionTools(getSessionToolsCallback);
        BevyUpApi.getAuxSessionTools(getAuxSessionToolsCallback);
        BevyUpApi.getParticipants(getParticipantsCallback);
        BevyUpApi.onNewTool(newToolReceived);
    }

    //
    // Callbacks
    //

    function getParticipantsCallback(error, localParticipant, remoteParticipants) {
        if (error || !localParticipant) {
            log("(error) getParticipants call failed: " + error);
            return;
        }

        if (localParticipant.isAgent) {
            // Change the color of the widget
            bevyupStyleBoardDiv.addClass("agentSide");
        }

        if (!remoteParticipants || remoteParticipants.length == 0) {
            // If we are alone in the session, add the generate link button
            updateWithRemoteParticipantInformation(null);
        } else {
            // Display the remote link
            updateWithRemoteParticipantInformation(remoteParticipants[0].inviteLink);
        }
    }

    function getTagDefinitionsCallback(error, tagDefinitions) {
        if (error) {
            log("(error) getTagDefinitions failed: " + error);
            return;
        }

        log("Tags (" + tagDefinitions.length + "):");
        for (key in tagDefinitions) {
            var tagDefinition = tagDefinitions[key];

            log(" - " + tagDefinition.tagDefinitionId + ": " + tagDefinition.tagName);
        }
    }

    function getSessionToolsCallback(error, sessionTools) {
        if (error) {
            log("(error) getSessionTools failed: " + error);
            return;
        }

        currentToolsCount = sessionTools.length;
        updateToolCount();

        log("Session Tools (" + sessionTools.length + "):");
        for (key in sessionTools) {
            var sessionTool = sessionTools[key];

            log(" - " + sessionTool.toolId + "," + sessionTool.toolType + "," + sessionTool.timestamp);
        }
    }

    function getAuxSessionToolsCallback(error, sessionTools) {
        if (error) {
            log("(error) getAuxSessionTools failed: " + error);
            return;
        }

        currentAuxToolsCount = sessionTools.length;
        updateToolCount();

        log("Aux Session Tools (" + sessionTools.length + "):");
        for (key in sessionTools) {
            var sessionTool = sessionTools[key];

            console.warn("- " + sessionTool.toolId + "," + sessionTool.toolType + "," + sessionTool.timestamp);
        }
    }

    function generateLinkCallback(error, newLink) {
        if (error) {
            log("(error) generateLink failed: " + error);
            return;
        }

        updateWithRemoteParticipantInformation(newLink);
    }

    function newToolReceived(toolData) {
        currentToolsCount++;
        updateToolCount();

        newlyAddedToolDiv.text("New tool added: " + JSON.stringify(toolData));
        log("ToolReceived: " + JSON.stringify(toolData));
    }

    //
    // Demo environment setup
    //

    function updateToolCount(isAux) {
        tooldisplayDiv.text("SessionTools: " + currentToolsCount);
        auxTooldisplayDiv.text("AuxSessionTools: " + currentAuxToolsCount);
    }

    function updateWithRemoteParticipantInformation(remoteParticipantLink) {
        if (remoteParticipantLink) {
            // Display the link
            bevyupStyleBoardDiv.addClass("remoteLinkFound").removeClass("remoteLinkNotFound");
            bevyupStyleBoardDiv.find(".remoteInviteLink").html("Remote: <a href='" + remoteParticipantLink + "'>" + remoteParticipantLink + "</a>");
        }
        else {
            bevyupStyleBoardDiv.addClass("remoteLinkNotFound");
        }
    }

    function setupDemoWidget() {
        loadcss("//b.bevyup.com/Styles/Demo/Styles.css");
        bevyupStyleBoardDiv = $(
"<div class='bevyupStyleBoardDiv'>\
    <button class='addTagButton'>Add Tag</button>\
    <button class='addCommentButton'>Add Comment</button>\
    <div class='toolCountDisplay'></div>\
    <div class='auxToolCountDisplay'></div>\
    <div class='newlyAddedTool'></div>\
    <button class='generateLinkButton'>GenerateLink</button>\
    <div class='remoteInviteLink'></div>\
</div>");

        var addTagButton = bevyupStyleBoardDiv.find('.addTagButton'),
            addCommentButton = bevyupStyleBoardDiv.find('.addCommentButton'),
            generateLinkButton = bevyupStyleBoardDiv.find('.generateLinkButton');

        addTagButton.click(addTagClicked);
        addCommentButton.click(addCommentClicked);
        generateLinkButton.click(generateLinkButtonClicked);

        tooldisplayDiv = bevyupStyleBoardDiv.find('.toolCountDisplay');
        auxTooldisplayDiv = bevyupStyleBoardDiv.find('.auxToolCountDisplay');
        newlyAddedToolDiv = bevyupStyleBoardDiv.find('.newlyAddedTool');

        $("body").append(bevyupStyleBoardDiv);
    }

    function addTagClicked() {
        BevyUpApi.addTag("#LipstickOfTheYear", demoProductInfo);
    }

    function addCommentClicked() {
        BevyUpApi.addComment("I love it!", demoProductInfo);
    }

    function generateLinkButtonClicked() {
        BevyUpApi.generateInviteLink(generateLinkCallback);
    }

    function loadcss(url) {
        var node = document.createElement("link")
        node.setAttribute("rel", "stylesheet")
        node.setAttribute("type", "text/css")
        node.setAttribute("href", url)
        document.getElementsByTagName("head")[0].appendChild(node)
    }

    //
    // Register the BevyUp callback
    //

    window.bevyUpPartnerAsyncInit = function () {
        setupDemoWidget();

        BevyUpApi.init(initCallback);
    };

}(jQuery));