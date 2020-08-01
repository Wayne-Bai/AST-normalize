// In a full development environment this template would be expressed
// in a file containing only HTML and be compiled to the following as part
// of the server/build functionality.
//
// Due to the limitations of a simple example that does not require
// any special server environment to try, the manually compiled version is
// included here.
//
scrollit.ProductsTemplate =
    '<div class="Products">' +
        '<h1>Products</h1>' +
        '<p>Scroll down the list to watch more items load.</p>' +
        '<div class="productsListWrapper">' +
            '<ul class="productsList"></ul>' +
            '<p class="loading"><img src="img/throbber.gif" alt=""> loading more products</p>' +
        '</div>' +
    '</div>';
