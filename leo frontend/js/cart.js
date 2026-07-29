function fallbackCartData() {
    return {
        items: [
            {
                id: 1,
                productId: 1,
                productName: "Pedigree Adult Dog Food",
                productSku: "LEO-DOG-001",
                categoryName: "Dogs",
                quantity: 1,
                availableStock: 14,
                price: 1499,
                discountPrice: 1299,
                lineTotal: 1299,
                selectedVariantLabel: "1.5kg",
                imageUrl: fallbackData.products[0].imageUrl
            },
            {
                id: 2,
                productId: 6,
                productName: "Pet Grooming Shampoo",
                productSku: "LEO-GROOM-001",
                categoryName: "Grooming",
                quantity: 1,
                availableStock: 5,
                price: 420,
                discountPrice: 369,
                lineTotal: 369,
                selectedVariantLabel: "Default",
                imageUrl: fallbackData.products[5].imageUrl
            }
        ],
        subtotal: 1919,
        discount: 251,
        deliveryCharge: 0,
        finalTotal: 1668
    };
}

function normalizeCartPayload(response) {
    return response?.data || response || fallbackCartData();
}

function removeProductFromStoredState(storageKey, productId) {
    try {
        const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const next = Array.isArray(existing)
            ? existing.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value !== Number(productId))
            : [];
        localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (error) {
        console.warn("Unable to clear product state cache:", error.message);
    }
}

function clearStoredProductState(storageKey) {
    try {
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.warn("Unable to clear product state cache:", error.message);
    }
}

function renderCart(data) {
    document.getElementById("cart-items-root").innerHTML = `
        <div class="section-header">
            <div>
                <span class="eyebrow">Cart items</span>
                <h2>Your selected essentials</h2>
            </div>
        </div>
        <div class="table-list">
            ${data.items.length ? data.items.map((item) => `
                <article class="cart-line">
                    <div class="mini-product">
                        <img src="${resolveMediaUrl(item.imageUrl)}" alt="${item.productName}">
                        <div>
                            <strong>${item.productName}</strong>
                            <p class="muted">${item.categoryName} · ${item.productSku}</p>
                            ${item.selectedVariantLabel ? `<p class="muted">Pack: ${item.selectedVariantLabel}</p>` : ""}
                        </div>
                    </div>
                    <div class="quantity-pill">
                        <button type="button" data-cart-decrease="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-cart-increase="${item.id}" data-max-stock="${item.availableStock}">+</button>
                    </div>
                    <div>
                        <strong>${formatCurrency(item.lineTotal)}</strong>
                        <p><button type="button" class="pill-button" data-cart-remove="${item.id}" data-product-id="${item.productId}">Remove</button></p>
                    </div>
                </article>
            `).join("") : `<div class="empty-state">Your cart is empty. Add some pawsome products to get started.</div>`}
        </div>
    `;

    document.getElementById("cart-summary-root").innerHTML = `
        <span class="eyebrow">Order summary</span>
        <h2>Cart total</h2>
        <div class="summary-stack">
            <div class="table-item"><span>Subtotal</span><strong>${formatCurrency(data.subtotal)}</strong></div>
            <div class="table-item"><span>Discount</span><strong>${formatCurrency(data.discount)}</strong></div>
            <div class="table-item"><span>Delivery</span><strong>${formatCurrency(data.deliveryCharge)}</strong></div>
            <div class="table-item"><span>Final total</span><strong>${formatCurrency(data.finalTotal)}</strong></div>
        </div>
        <div class="hero-actions" style="margin-top:1.5rem;">
            <a class="cta-button" href="checkout.html">Proceed to Checkout</a>
            <button class="ghost-button" type="button" id="clear-cart-button">Clear Cart</button>
        </div>
    `;
}

async function fetchCartData() {
    const response = await fetchWithFallback(() => apiGet("/cart"), { data: fallbackCartData() });
    return normalizeCartPayload(response);
}

async function refreshCartPage() {
    const data = await fetchCartData();
    renderCart(data);
    await updateNavbarCounts();
}

async function updateCartQuantity(cartItemId, currentQuantity, nextQuantity, maxStock) {
    if (nextQuantity < 1) {
        return;
    }

    if (Number(maxStock) && nextQuantity > Number(maxStock)) {
        showFlashMessage("Quantity cannot exceed available stock.", "error");
        return;
    }

    try {
        await apiPut("/cart/update", {
            cartItemId: Number(cartItemId),
            quantity: nextQuantity
        });
        showFlashMessage("Cart updated successfully.", "success");
        await refreshCartPage();
    } catch (error) {
        showFlashMessage(error.message || "Unable to update cart.", "error");
    }
}

function bindCartActions() {
    document.addEventListener("click", async (event) => {
        const decreaseBtn = event.target.closest("[data-cart-decrease]");
        const increaseBtn = event.target.closest("[data-cart-increase]");
        const removeBtn = event.target.closest("[data-cart-remove]");
        const clearBtn = event.target.closest("#clear-cart-button");

        if (decreaseBtn || increaseBtn) {
            const cartLine = event.target.closest(".cart-line");
            const itemId = Number((decreaseBtn || increaseBtn).dataset.cartDecrease || (increaseBtn || decreaseBtn).dataset.cartIncrease);
            const quantityText = cartLine?.querySelector(".quantity-pill span")?.textContent || "1";
            const currentQuantity = Number(quantityText);
            const nextQuantity = decreaseBtn ? currentQuantity - 1 : currentQuantity + 1;
            const maxStock = increaseBtn?.dataset.maxStock;
            await updateCartQuantity(itemId, currentQuantity, nextQuantity, maxStock);
            return;
        }

        if (removeBtn) {
            try {
                const productId = Number(removeBtn.dataset.productId);
                await apiDelete(`/cart/remove/${removeBtn.dataset.cartRemove}`);
                if (!Number.isNaN(productId)) {
                    removeProductFromStoredState("leo_cart_product_ids", productId);
                }
                showFlashMessage("Item removed from cart.", "success");
                await refreshCartPage();
            } catch (error) {
                showFlashMessage(error.message || "Unable to remove cart item.", "error");
            }
            return;
        }

        if (clearBtn) {
            try {
                await apiDelete("/cart/clear");
                clearStoredProductState("leo_cart_product_ids");
                showFlashMessage("Cart cleared successfully.", "success");
                await refreshCartPage();
            } catch (error) {
                showFlashMessage(error.message || "Unable to clear cart.", "error");
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    if (document.body.dataset.page !== "cart") {
        return;
    }

    bindCartActions();
    await refreshCartPage();
});
