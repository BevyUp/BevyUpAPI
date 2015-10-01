//(function ($) {

//    var productData = {
//        4073252: {
//            bup_id: "4073252",
//            bup_name: "Floral Embroidered Mesh Sheath Dress ",
//            bup_url: "http://shop.nordstrom.com/s/adrianna-papellfloral-embroidered-mesh-sheath-dress-regular-petite/4073252?origin=category-personalizedsort&contextualcategoryid=0&fashionColor=&resultback=700",
//            bup_imageUrl: "http://g.nordstromimage.com/imagegallery/store/product/Medium/12/_11004372.jpg",
//            bup_price: "USD 178"
//        },
//        4110293: {
//            bup_id: "4110293",
//            bup_name: "Embellished Georgette Fit & Flare Dress",
//            bup_url: "http://shop.nordstrom.com/s/lace-motif-panlled/4110293?origin=category",
//            bup_imageUrl: "http://g.nordstromimage.com/imagegallery/store/product/Medium/8/_10982468.jpg",
//            bup_price: "USD 649"
//        },
//        4104104: {
//            bup_id: "4104104",
//            bup_name: "Floral Print Faille Fit & Flare Dress",
//            bup_url: "http://shop.nordstrom.com/s/eliza-jfloral-print-faille-fit-flare-dress-regular-petite/4104104?origin=category",
//            bup_imageUrl: "http://g.nordstromimage.com/imagegallery/store/product/Medium/4/_11022584.jpg",
//            bup_price: "USD 178"
//        }
//    };
//    console.log("hEre");
//    var productsContainerList = $('#productsList');
//    $.each(productData, function (index, element) {
//        var productHtml = '<li class="product">' +
//            '<a href="' + element.bup_url + '">' +
//            '<img src="' + element.bup_imageUrl + '"></img></a>' +
//            '<div class="productInfo">' +
//            '<span>' + element.bup_name + '</span>' +
//            '<span class="price">' + element.bup_price + '</span>' +
//            '<button class="addToTagBoard" data-product-id="' + element.bup_id + '">Add to Favorites</button>' +
//            '</div>' +
//            '</li>';
//        productsContainerList.append(productHtml)
//        console.log(productHtml);
//    });
//})(jQuery);
////(function($) {
////    //// Inlining the product data structure here for use by the AddProduct Widget.
////    //// We could encode these in data- attributes if we want, or write some inline click handlers.
////    //// This is just one possible way to make this data accessible to the widget.
////    //var productData = {
////    //    4073252: {
////    //        bup_id: "4073252",
////    //        bup_name: "Floral Embroidered Mesh Sheath Dress ",
////    //        bup_url: "http://shop.nordstrom.com/s/adrianna-papellfloral-embroidered-mesh-sheath-dress-regular-petite/4073252?origin=category-personalizedsort&contextualcategoryid=0&fashionColor=&resultback=700",
////    //        bup_imageUrl: "http://g.nordstromimage.com/imagegallery/store/product/Medium/12/_11004372.jpg",
////    //        bup_price: "USD 178"
////    //    },
////    //    4110293: {
////    //        bup_id: "4110293",
////    //        bup_name: "Embellished Georgette Fit & Flare Dress",
////    //        bup_url: "http://shop.nordstrom.com/s/lace-motif-panlled/4110293?origin=category",
////    //        bup_imageUrl: "http://g.nordstromimage.com/imagegallery/store/product/Medium/8/_10982468.jpg",
////    //        bup_price: "USD 649"
////    //    },
////    //    4104104: {
////    //        bup_id: "4104104",
////    //        bup_name: "Floral Print Faille Fit & Flare Dress",
////    //        bup_url: "http://shop.nordstrom.com/s/eliza-jfloral-print-faille-fit-flare-dress-regular-petite/4104104?origin=category",
////    //        bup_imageUrl: "http://g.nordstromimage.com/imagegallery/store/product/Medium/4/_11022584.jpg",
////    //        bup_price: "USD 178"
////    //    }
////    //};
////    //var productsContainerList = $('#productsList');
////    //console.log(productsContainerList);
////    //$.each(productData, function (index, element) {
////    //    var productHtml = '<li class="product">' +
////    //        '<a href="' + element.bup_url + '">' +
////    //        '<img src="' + element.bup_imageUrl + '"></img></a>' +
////    //        '<div class="productInfo">' +
////    //        '<span>' + element.bup_name + '</span>' +
////    //        '<span class="price">' + element.bup_price + '</span>' +
////    //        '<button class="addToTagBoard" data-product-id="' + element.bup_id + '">Add to Favorites</button>' +
////    //        '</div>' +
////    //        '</li>';
////    //    productsContainerList.append(productHtml)
////    //    console.log(productHtml);
////    //});
////})(jQuery);