(function ($) {

    // Register the callback to the init script
    window.initCallbackHooks = window.initCallbackHooks || [];
    window.initCallbackHooks.push(initCallback);
    
    function initCallback(isInSession) {
        // Check if the local user is an agent.
        if(window.bevyupAgentMode){
            // In agent mode, only show the widget when in a session
            if(isInSession){
                checkAgentStatus();
            }
            else{
                return;
            }
        }
        else {
            // Wire up event listeners
            hookUpButtons();
            $(document.documentElement).addClass("gs_showAddProductButton");
        }
    }

    // Finds all the "Add To TagBoard" buttons on the page
    // and hooks up our click handler.
    function hookUpButtons() {
        var buttons = document.querySelectorAll('button.addToTagBoard');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", onButtonClicked);
        }
    }

    // Check if the local user is an agent, and if so, reflects
    // that information as a CSS class on the documentElement.
    function checkAgentStatus() {
        // Get Participants via the SessionModel API
        
        // Get the session model
        BevyUpApi.getSessionModel()
        .then(function(sessionModel) {
            // Check if the local user is marked as an agent.
            if (sessionModel.getLocalParticipant().getIsAgent()) {                
                // Wire up event listeners
                hookUpButtons();

                // Local user is an agent, mark this state on our documentElement so 
                // we can use it in CSS visibility rules.
                $(document.documentElement).addClass("gs_localAgent");
            }
        })
        .fail(function(err) {
            log("(error) getSessionModel call failed: " + err);
        });
    }

    // Called whenever an "Add to TagBoard" button is clicked
    function onButtonClicked(event) {
        // Closure store the button for later.
        var button = this;
        // Disabling button so the user can't click again.
        button.disabled = true;

        // Pull the productId from the data attribute on the button.
        var productId = $(button).data("productId").toString();
        
        // Lookup the productData object for this product in our global dictionary.
        var productInfo = productData[productId];

        // Add a "save" tool for this product.
        addProductToList("Board", productInfo).done(function() {
            // Product successfully added.
            // Add a class and change the text so our UI
            // responds to this state change.
            $(button).addClass('added');
            button.textContent = "Added!";
        }).fail(function (err) {
            // Re-enable the button so the user can try again
            button.disabled = false;
            log("(error) addSaveTool call failed: " + err);
        });
    }
    
    // Starts an asynchronous "Add product to list" operation, and returns a Deferred/Promise of it.
    function addProductToList(listName, productData) {
        // Get the Product Lists for the current session.
        return BevyUpApi.getProductListsModel()
        .then(function(listsModel) {
            // Use it to get the named list.
            return listsModel.getOrCreateProductList(listName);
        })
        .then(function(list) {
            // Add the product to the list.
            return list.addProduct(productData);
        });
    }

    // Utility function to log to console with a prefix
    function log(s) {
        if (window.console) {
            console.log("BevyUp Sample> " + s);
        }
    }
})(jQuery);