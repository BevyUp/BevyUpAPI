(function ($) {

    // Register the callback to the init script
    window.initCallbackHooks = window.initCallbackHooks || [];
    window.initCallbackHooks.push(initCallback);

    // This callback initializes the widget by getting the ChatsModel
    function initCallback(isInSession) {
        if (isInSession) {
            BevyUpApi.getChatsModel().done(getChatsModelCallback).fail(getChatsModelCallbackFailure);
        }
    }
    
    // This is the success callback to the chatModel request
    // At this point, we have all of the data needed to power the widget, so we attach the associated html to the DOM
    function getChatsModelCallback(chatsModel) {
        var parent = document.body.querySelector(".chatParent") || document.body;
        new ChatWidgetView(chatsModel, parent);
    }

    // Handler for failures
    function getChatsModelCallbackFailure(err) {
        log("(error) getChatsModelCallbackFailure: " + err);
    }

    // The UI side of our Chat widget.
    // chatsModel: a ChatsModel instance to build the ChatWidget from.
    // parent: An optional parent Element to append the ChatWidgetView to.
    function ChatWidgetView(chatsModel, parent) {
        // Create our main elements.
        var container = setupContainer();

        // Hold references to various elements we will
        // need to update with chat changes.
        var chatInput = container.querySelector('.cw_chatInput');
        var chatsList = container.querySelector('.cw_list');
        var chatStatus = container.querySelector('.cw_chatStatus');

        // Register to ChatsModel events and process the existing chats
        hookUpToChatsModel(chatsModel);

        // Hook up the keyup operation to capture user actions
        // Using keyup instead of keydown in order to be able to capture deletes of text
        // to call setIsUserTyping(false)
        chatInput.addEventListener("keyup", updateChatKeyUp);
        
        // Attach the container to the parent.
        parent.appendChild(container);
        
        // Handler for the keyup event for the chatInput
        // This chat looks for the "enter" key to send a message
        // and it also updates the chatsModel's isUserTyping status
        // so the other users are notified of the changes
        function updateChatKeyUp(e) {
            if (e.keyCode == 13 && !e.shiftKey) {
                var input = e.target.value;
                e.target.value = "";

                chatsModel.createNewUserChat(input);
                chatsModel.setIsUserTyping(false);

                e.preventDefault();
            }
            else if(e.target.value == ""){
                chatsModel.setIsUserTyping(false);
            }
            else {
                chatsModel.setIsUserTyping(true);
            }
        }

        // Setup the ChatWidgetView's main HTML/elements
        function setupContainer() {
            var container = document.createElement('div');
            container.className = "bevyup_chat_widget";

            var html = "\
<h2>Chat</h2>\
<div class='cw_chatArea'>\
    <ul class='cw_list'></ul>\
    <textarea class='cw_chatInput'></textarea>\
    <div class='cw_chatStatus'></div>\
</div>";
            container.innerHTML = html;
            return container;
        };

        // Process existing chats on the chatsModel
        // and subscribe to the events we need
        function hookUpToChatsModel(chatsModel) {
            // Loop over the chatsModel chats index
            chatsModel.getChats().forEach(function (chat) {
                spawnChatView(chat);
            });

            // Hook up to the 'New chat added' event
            chatsModel.onChatAdded(function (chat) {
                // Create a list item for the new chat
                spawnChatView(chat);
            });

            // Hook up to the 'On Is User Typing Changed' event
            chatsModel.onIsUserTypingChanged(function (participant, isTyping) {
                chatStatus.textContent = isTyping ? participant.getName() + " is typing..." : "";
            });
        }

        // Create a ChatView and add it to our ul (chats list)
        // and scroll to it
        function spawnChatView(chat) {
            var chatView = new ChatView(chat);
            chatsList.appendChild(chatView.element);
            chatView.element.scrollIntoView();
        }

        // Represents the elements/UI for a given chat in our TagBoard
        // chat: A Chat model (sub-model of ChatsModel)
        function ChatView(chat) {
            var that = this;
            this.chat = chat;

            // Create our basic HTML structure
            // and insert some static pieces of
            // info from the chatData
            //
            // The cw_partImageWrapper's background-color is currently based on whether the 
            // chat's participant is an agent or not.  This can become much more complex depending on
            // your business needs
            var container = document.createElement('li');
            container.className = "cw_chatView";
            container.innerHTML = "\
<div class='cw_partImageWrapper " + (chat.getParticipant().getIsAgent() ? "cw_agentUser" : "cw_customerUser") + "'>\
    <img src='" + chat.getParticipant().getImage() + "'>\
</div>\
<div class='cw_text'>\
</div>";
            container.querySelector(".cw_text").textContent = chat.getMessage();
            
            this.element = container;
        }
    }

    // Utility function to log to console with a prefix
    function log(s) {
        if (window.console) {
            console.error("BevyUp Sample> " + s);
        }
    }

}(jQuery));