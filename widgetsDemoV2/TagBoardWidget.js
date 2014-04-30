(function ($) {

    // Register the callback to the init script
    window.initCallbackHooks = window.initCallbackHooks || [];
    window.initCallbackHooks.push(initCallback);
    
    function initCallback(isInSession) {
        if (!isInSession && window.bevyupAgentMode) {
            return;
        }
        
        // Create the basic tagBoard view
        var tagBoard = (function() {        
            // This allows the sample pages to control where this widget will be appended
            var parent = document.body.querySelector(".tagboardParent") || document.body;
            return new TagBoard(parent);
        })();
        
        // Get the ProductListsModel for the local session.
        BevyUpApi.getProductListsModel()
        .then(function (productListsModel) {
            // Get the product list we want to use for the TagBoard, if it exists.
            var defaultList = productListsModel.getProductList("TagBoard");
            
            if(defaultList == null) {
                // The list hasn't been created yet, we'll wire
                // up a listener to wait for it to be created.
                
                // Creating another deferred here so we can chain this operation.
                var def = $.Deferred();
                productListsModel.onListAdded(function(list) {
                    if(list.getName() == 'TagBoard') {
                        // The TagBoard list exists now, resolve the promise.
                        def.resolve(list);
                    }
                });
                // Chain this promise
                return def.promise();
            } else {
                // The list exists, we're done here.
                return defaultList;
            }
        })
        .done(function(tagBoardList) {
            // Now that we have the TagBoard list, 
            // send it to the tagBoard view so it can monitor it for Products
            tagBoard.hookUpToList(tagBoardList);
        })
        .fail(function(err) {
            // Something went wrong in one of our async operations!
            log(err);
        });
    }

    // The UI side of our TagBoard widget.
    // toolsModel: a ToolsModel instance to build the TagBoard from.
    // parent: An optional parent Element to append the TagBoard to.
    function TagBoard(parent) {
        // Create our main TagBoard elements.
        var container = setupContainer();
        
        // Hold references to various elements we will
        // need to update with product changes.
        this.productCountHeader = container.querySelector('.counter');
        this.productsList = container.querySelector('ul');
        this.list = null;
        this.productViews = {};
        
        // Initialize our "N Items" header
        this.updateProductCount();

        // Attach ourselves to our parent.
        parent.appendChild(container);

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
    }

    // Process existing products on the list 
    // and subscribe to the events we need
    TagBoard.prototype.hookUpToList = function TagBoard_hookUpToList(list) {
        this.list = list;
        var self = this;
        list.getProducts().forEach(function(product) {
            // Create the Product list item 'view' for each product.
            self.spawnProductView(product);
        });
        
        // Hook up to the 'New product added' event
        list.onProductAdded(function (product) {
            // Create a list item for the new product
            self.spawnProductView(product);
            self.updateProductCount();
        });
        
        list.onProductRemoved(function (product) {
            self.removeProductView(product);
            self.updateProductCount();
        });
    }
    
    // Updates the "N Items" header based on the current ToolsModel product count
    TagBoard.prototype.updateProductCount = function TagBoard_updateProductCount() {
        // If the backing list doesn't exist yet, just say we have 0 items.
        var count = this.list ? this.list.getProductCount() : 0;
        this.productCountHeader.textContent = 'Tagboard (' + count + ' items)';
    }
    
    // Create a ProductView and add it to our ul (products list)
    TagBoard.prototype.spawnProductView = function TagBoard_spawnProductView(product) {
        var productView = new ProductView(this, product);
        this.productViews[product.getData().bup_id] = productView;
        this.productsList.appendChild(productView.element);
    }
    
    // Create a ProductView and add it to our ul (products list)
    TagBoard.prototype.removeProductView = function TagBoard_spawnProductView(product) {
        var productView = this.productViews[product.getData().bup_id];
        this.productsList.removeChild(productView.element);
    }
    
    // Remove a product from the TagBoard list and view
    TagBoard.prototype.removeProduct = function TagBoard_removeProduct(product) {
        var self = this;
        
        // First remove the product from the backing ProductList
        var promise = this.list.removeProduct(product);
        
        // Add the product to another special list, so it can be un-hidden later if we want.
        AddProductToHiddenList(product)
        .fail(function(err) {
            log("Failed to add product " + product.getData().bup_id + " to hidden products list: " + err);
        });
        
        // Return the remove operation promise so our view UI can respond to it.
        return promise;
    }
    
    // Add a product to the "Hidden" product list
    function AddProductToHiddenList(product) {
        return BevyUpApi.getProductListsModel()
        .then(function (productListsModel) {
            return productListsModel.getOrCreateProductList("Hidden");
        })
        .then(function (hiddenList) {
            return hiddenList.addProduct(product);
        });
    }
    
    // Represents the elements/UI for a given product in our TagBoard
    // product: A Product model (sub-model of ToolsModel)
    function ProductView(tagBoard, product) {
        var self = this;
        this.product = product;
        this.tagBoard = tagBoard;

        // Create our basic HTML structure
        // and insert some static pieces of
        // info from the productData
        var container = setupMainContainer();
        
        function setupMainContainer() {
            var productData = product.getData();
            var container = document.createElement('li');
            container.className = "tbw_productView";
            container.innerHTML = "\
<div class='tbw_prodImg'></div>\
<div class='tbw_prodInfo'>\
    <div class='tbw_prodName'>" + productData.bup_name + "</div>\
    <div class='tbw_prodPrice'>" + productData.bup_price + "</div>\
    <button class='tbw_removeButton'>Hide</button>\
    <div class='tbw_prodCommentCount'></div>\
</div>";
            // Set up the productImage using background-image
            container.querySelector('.tbw_prodImg').style.backgroundImage = 'url("' + productData.bup_imageUrl + '")';
            container.querySelector(".tbw_removeButton").addEventListener("click", function (e) {
                // disable the "Hide" button while the async operation runs.
                var button = this;
                button.disabled = true;
                self.hide()
                .fail(function(err) {
                    // Re-enable the button so the user can try again.
                    button.disabled = false;
                    log("Failed to hide product: " + err);
                });
            });
            return container;
        }

        // Store a reference to the "comment count" element so we can update if a new comment tool is placed.
        var commentCount = container.querySelector('.tbw_prodCommentCount');

        this.element = container;

        // Updates .tbw_prodCommentcount with the current comment count
        function updateCommentCount() {
            commentCount.textContent = this.product.getCommentCount().toString();
        }

        // Initialize our comment count element.
        updateCommentCount.call(this);

        // Registering product event handlers.
        product.onCommentAdded(function (comment) {
            // New comment was added to the product,
            // update the comment count
            updateCommentCount.call(self);
        });
    }
    
    // Try to remove this product from the TagBoard list (and put it on the "Hidden Products" list)
    ProductView.prototype.hide = function ProductView_hide() {
        return this.tagBoard.removeProduct(this.product);
    }

    // Utility function to log to console with a prefix
    function log(s) {
        if (window.console) {
            console.log("BevyUp Sample> " + s);
        }
    }
})(jQuery);