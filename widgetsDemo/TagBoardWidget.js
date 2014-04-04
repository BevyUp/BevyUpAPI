(function ($) {

    // Register the callback to the init script
    window.initCallbackHooks = window.initCallbackHooks || [];
    window.initCallbackHooks.push(initCallback);
    
    function initCallback(isInSession) {
        if (!isInSession && window.bevyupAgentMode) {
            return;
        }
        
        ToolsModel.createFromApiAsync(function (err, toolsModel) {
            if (err) {
                // If there was an error with getting tools
                // from the API, bubble the error up.
                if (onError) onError(err);
            } else {
                // This allows the sample pages to control where this widget will be appended
                var parent = document.body.querySelector(".tagboardParent") || document.body;

                new TagBoard(toolsModel, parent);
            }
        });
    }

    // The UI side of our TagBoard widget.
    // toolsModel: a ToolsModel instance to build the TagBoard from.
    // parent: An optional parent Element to append the TagBoard to.
    function TagBoard(toolsModel, parent) {
        // Create our main TagBoard elements.
        var container = setupContainer();
        
        // Hold references to various elements we will
        // need to update with product changes.
        var productCountHeader = container.querySelector('.counter');
        var productsList = container.querySelector('ul');

        // Register to ToolsModel events and process the existing tools
        hookUpToToolsModel(toolsModel);
        
        // Initialize our "N Items" header
        updateProductCount();

        // Attach ourselves to our parent.
        parent.appendChild(container);

        // Updates the "N Items" header based on the current ToolsModel product count
        function updateProductCount() {
            productCountHeader.textContent = 'Tagboard (' + toolsModel.nonHiddenProductCount + ' items)';
        }

        // Setup the TagBoard's main HTML/elements
        function setupContainer() {
            var container = document.createElement('div');
            container.className = "bevyup_tagBoard_widget";

            // Dummy "Go to board" link here for now.
            var html = "\
<h2 class='counter'></h2>\
<ul class='tbw_list'></ul>";
            container.innerHTML = html;
            return container;
        };

        // Process existing tools on the toolsModel
        // and subscribe to the events we need
        function hookUpToToolsModel(toolsModel) {
            // Loop over the toolsModel products index
            for (var key in toolsModel.products) {
                if (toolsModel.products.hasOwnProperty(key)) {
                    // Create the Product list item 'view' for each product.
                    spawnProductView(toolsModel.products[key]);
                }
            }

            // Hook up to the 'New product added' event
            toolsModel.newProductCallbacks.push(function (product) {
                // Create a list item for the new product
                spawnProductView(product);
            });

            // Since any tool could be a "hide" tool,
            // we'll want to update our "N Items" header 
            // on every tool change.
            toolsModel.newToolCallbacks.push(updateProductCount);
            toolsModel.toolRemovedCallbacks.push(updateProductCount);
        }

        // Create a ProductView and add it to our ul (products list)
        function spawnProductView(product) {
            var productView = new ProductView(product);
            productsList.appendChild(productView.element);
        }

        // Represents the elements/UI for a given product in our TagBoard
        // product: A Product model (sub-model of ToolsModel)
        function ProductView(product) {
            var that = this;
            this.product = product;

            // Create our basic HTML structure
            // and insert some static pieces of
            // info from the productData
            var container = document.createElement('li');
            container.className = "tbw_productView";
            container.innerHTML = "\
<div class='tbw_prodImg'></div>\
<div class='tbw_prodInfo'>\
    <div class='tbw_prodName'>" + product.productData.bup_name + "</div>\
    <div class='tbw_prodPrice'>" + product.productData.bup_price + "</div>\
    <a href='javascript:void(0);' class='tbw_removeButton'>Hide</a>\
    <div class='tbw_prodCommentCount'></div>\
</div>";
            // Set up the productImage using background-image
            container.querySelector('.tbw_prodImg').style.backgroundImage = 'url("' + product.productData.bup_imageUrl + '")';
            container.querySelector(".tbw_removeButton").addEventListener("click", function () {
                product.addHideTool(function (err) {
                    log("(error) addHideTool call failed: " + err);
                });
            });

            // Store a reference to the "comment count" element so we can update if a new comment tool is placed.
            var commentCount = container.querySelector('.tbw_prodCommentCount');

            this.element = container;

            // Updates .tbw_prodCommentcount with the current comment count
            function updateCommentCount() {
                commentCount.textContent = this.product.commentCount.toString();
            }

            function updateHideStatus() {
                // Toggle visibility based on hidden status.
                $(container).toggle(!this.product.isHidden());
            }

            // Initialize our comment count element.
            updateCommentCount.call(this);
            updateHideStatus.call(this);

            // Registering product event handlers.
            product.addNewToolCallback(function (tool) {
                // New tool was added to the product,
                // update the comment count if it has changed.
                updateCommentCount.call(that);
                // Update visibility
                updateHideStatus.call(that);
            });
            product.addToolRemovedCallback(function (tool) {
                // New tool was removed from the product,
                // update the comment count if it has changed.
                updateCommentCount.call(that);
                // Update visibility
                updateHideStatus.call(that);
            });
            product.addRemovedCallback(function () {
                // The product is removed (all tools removed)
                // Remove it from the tagboard.
                container.parentElement.removeChild(container);
            });
        }
    }

    // Factory to create and bootstrap a ToolsModel instance from the BevyUpAPI
    // Pass in a reference to the BevyUpAPI, and a callback to fire when the action completes.
    // On error, callback will fire with the error from the BevyUp API.
    // On success, callback will fire with null for the first argument and the ToolsModel instance for the second.
    ToolsModel.createFromApiAsync = function (callback) {
        BevyUpApi.getSessionTools(function (err, tools) {
            if (err) {
                callback(err);
            } else {
                // Create the ToolsModel, a local cache of all known tools/products
                var toolsModel = new ToolsModel();

                // Process existing tools heard about from getSessionTools
                tools.forEach(function (tool) {
                    // Add these tools to our local model.
                    toolsModel.notifyNewTool(tool);
                });

                // Hook up to the NewTool event so we can 
                // process any tools the user places.
                BevyUpApi.onNewTool(function (tool) {
                    // Heard a new tool from API, add it to our model.
                    toolsModel.notifyNewTool(tool);
                });

                // Hook up to the RemovedTool event so we can
                // process any deleted tools
                BevyUpApi.onRemovedTool(function (tool) {
                    // Heard a removed tool from the API,
                    // remove it from our model.
                    toolsModel.notifyRemovedTool(tool);
                });

                // Let the caller know of our success and give him the ToolsModel.
                callback(null, toolsModel);
            }
        });
    }

    // ToolsModel models the state of all tools and products of the current session.
    function ToolsModel() {
        // Tracking all known products, indexed on bup_id
        this.products = {};
        // Keeping track of the number of products
        this.productCount = 0;
        // Number of products that the user hasn't chosen to "remove"/hide.
        this.nonHiddenProductCount = 0;
        // Basic eventing infrastructure--list of callbacks to fire
        // when a new product/tool is added or removed
        this.newProductCallbacks = [];
        this.productRemovedCallbacks = [];
        this.newToolCallbacks = [];
        this.toolRemovedCallbacks = [];
    }
    // Set up ToolsModel methods
    ToolsModel.prototype = (function () {
        // Everything defined in this closure but
        // not returned is considered a private ToolsModel structure/method

        // Model of a product, containing information
        // about various tools placed on that product.
        function Product(productId, productData, toolsModel) {
            this.productId = productId;
            // Back reference to the ToolsModel this product is a part of
            this.toolsModel = toolsModel;

            // This is the ProductData structure
            this.productData = productData;

            // Keeping track of counts of various types
            // of tools, for use in the UI.
            this.commentCount = 0;
            this.stickerCount = 0;
            this.toolCount = 0;
            // An index of the "Hide" tools placed on this product, by toolId
            this.hideTools = {};

            // Basic eventing infrastructure,
            // for new tools added to this product
            this.newToolCallbacks = [];
            // Tools being removed from this product
            this.toolRemovedCallbacks = [];
            // And the Product itself being removed
            // (when no tools remain on it)
            this.removedCallbacks = [];

            // An index of the tools placed on this product, by toolId
            this.toolsById = {};
        }

        // Helper prototypes for subscribing/unsubscribing to the event
        Product.prototype.addNewToolCallback = function (cb) {
            return this.newToolCallbacks.push(cb) - 1;
        }
        Product.prototype.removeNewToolCallback = function (idx) {
            this.newToolCallbacks[idx] = function () { };
        }
        Product.prototype.addToolRemovedCallback = function (cb) {
            return this.toolRemovedCallbacks.push(cb) - 1;
        }
        Product.prototype.removeRemovedToolCallback = function (idx) {
            this.toolRemovedCallbacks[idx] = function () { };
        }
        Product.prototype.addRemovedCallback = function (cb) {
            return this.removedCallbacks.push(cb) - 1;
        }
        Product.prototype.removeRemovedCallback = function (idx) {
            this.removedCallbacks[idx] = function () { };
        }
        // Add a 'hide' tool to this product, to signify that it should be hidden.
        Product.prototype.addHideTool = function (onerror) {
            this.toolsModel.addHideTool(this.productId, onerror);
        }
        // Returns true if the product has a hide tool registered to it
        Product.prototype.isHidden = function () {
            // If there are any hideTools registered, we are hidden.
            return objectHasKeysSet(this.hideTools);
        }

        // Private ToolsModel method-- updates the
        // relevant Product model, adding a new tool to it,
        // updating counts, and firing the newTool callback.
        var notifyProductOfNewTool = function (product, tool) {
            // Store this value to check for a change in hidden-status.
            var wasHidden = product.isHidden();

            // Index this tool on the product.
            product.toolsById[tool.toolId] = tool;

            // Update tool counts
            product.toolCount++;

            // These toolTypes are documented on the ToolData structure
            switch (tool.getToolType()) {
                case 'Comment':
                    product.commentCount++;
                    break;
                case 'Emoticon':
                    product.stickerCount++;
                    break;
                case 'Hide':
                    // Only accept hideTools from the local participant
                    if(tool.getOwner().getIsLocal()){
                        product.hideTools[tool.toolId] = tool;
                    }
                    break;
            }

            // If we weren't hidden before, and we're hidden now...
            if (!wasHidden && product.isHidden()) {
                // This product has just become hidden!
                // Update non-hidden product count.
                this.nonHiddenProductCount--;
            }

            // Fire "new tool on this product" event.
            product.newToolCallbacks.forEach(function (cb) {
                cb.call(product, tool);
            });
        }

        // Private ToolsModel method-- updates the relevant
        // Product model when a tool is removed.
        var notifyProductOfRemovedTool = function (product, tool) {
            // Store this value to check for a change in hidden-status.
            var wasHidden = product.isHidden();

            // Remove the entry in the index
            delete product.toolsById[tool.toolId];

            // Update counts of tools/tool types 
            // on this product
            product.toolCount--;

            switch (tool.getToolType()) {
                case 'Comment':
                    product.commentCount--;
                    break;
                case 'Emoticon':
                    product.stickerCount--;
                    break;
                case 'Hide':
                    if(tool.getOwner().getIsLocal()){
                        delete product.hideTools[tool.toolId];
                    }
                    break;
            }

            // If we were hidden before and we're not hidden now...
            if (wasHidden && !product.isHidden()) {
                // This product has just become non-hidden!
                this.nonHiddenProductCount++;
            }

            // Fire "tool on this product was removed" event.
            product.toolRemovedCallbacks.forEach(function (cb) {
                cb.call(product, tool);
            });
        }

        // Creates a new Product model and store it 
        // in our products index.
        function createAndStoreProduct(productId, productData) {
            var product = new Product(productId, productData, this);
            this.products[productId] = product;
            return product;
        }

        return {
            constructor: ToolsModel,

            // Generic lookup by productId
            getProduct: function (productId) {
                return this.products[productId];
            },
            // Add a new tool to be tracked by the ToolsModel
            // Call this when you hear BevyUp's new tool event.
            notifyNewTool: function (tool) {
                // Deserialize ProductData for this tool.
                var productDetails = JSON.parse(tool.getProductDetails());
                var productId = productDetails.bup_id;

                // See if we are already tracking the relevant product for this tool
                var product = this.getProduct(productId);
                if (!product) {
                    // If not, create a new Product model to track it.
                    product = createAndStoreProduct.call(this, productId, productDetails);
                    this.productCount++;

                    // Increment this count for now. If the new tool ends up
                    // hiding the product, it will decrement the count.
                    this.nonHiddenProductCount++;

                    // Add this tool to our Product model
                    notifyProductOfNewTool.call(this, product, tool);

                    // Once our internal state is finalized, fire
                    // our "new product" event.
                    this.newProductCallbacks.forEach(function (cb) {
                        cb.call(this, product);
                    });
                } else {
                    // Product model already exists,

                    // Add this tool to the relevant Product model
                    notifyProductOfNewTool.call(this, product, tool);
                }

                // Fire "tool added" event
                this.newToolCallbacks.forEach(function (cb) {
                    cb.call(this, tool);
                });
            },
            // Remove a tool that was tracked by the ToolsModel
            // Call this when you hear BevyUp's tool removed event.
            notifyRemovedTool: function (tool) {
                // Desearialize ProductData so we can get the productId.
                var productDetails = JSON.prase(tool.getProductDetails());
                var productId = productDetails.bup_id;

                // Get the relevant ProductModel
                var product = getProduct(productId);
                if (!product) {
                    // Simple sanity check/assertion. We should
                    // already have a product model for this productId.
                    throw new Exception("Product not found for dying tool.");
                }

                // Remove the tool from the Product model.
                notifyProductOfRemovedTool.call(this, product, tool);

                if (product.toolCount == 0) {
                    // If the product is out of tools,
                    // we consider it removed/removed.

                    delete this.products[product.productId];
                    this.productCount--;

                    // Fire the "I'm removed/removed" event on the Product model
                    product.removedCallbacks.forEach(function (cb) {
                        cb.call(product);
                    });

                    // Fire the "Product removed/removed" event on ToolsModel.
                    this.productRemovedCallbacks.forEach(function (cb) {
                        cb.call(this, product);
                    });
                }

                // Fire "tool removed" event
                this.toolRemovedCallbacks.forEach(function (cb) {
                    cb.call(this, tool);
                });
            },
            addHideTool: function (productId, onError) {
                BevyUpApi.addHideTool(productId, onError);
            }
        };
    })();

    // Utility function to log to console with a prefix
    function log(s) {
        if (window.console) {
            console.log("BevyUp Sample> " + s);
        }
    }

    // Returns true if the object has any
    // keys set (simulates Dictionary.IsEmpty())
    // (Helper method)
    function objectHasKeysSet(obj) {
        for (var x in obj) {
            if (obj.hasOwnProperty(x)) {
                return true;
            }
        }
        return false;
    }
})(jQuery);