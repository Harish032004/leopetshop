(function redirectRemovedWishlistPage() {
    if (document.body?.dataset.page === "wishlist") {
        window.location.replace("shop.html");
    }
})();
