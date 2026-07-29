function getOrderStatusTone(status = "") {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "DELIVERED") {
        return "is-success";
    }

    if (["SHIPPED", "CONFIRMED", "PAID"].includes(normalized)) {
        return "is-progress";
    }

    if (["CANCELLED", "REFUNDED", "FAILED"].includes(normalized)) {
        return "is-danger";
    }

    return "is-neutral";
}

function renderOrderChip(label, value) {
    return `
        <div class="order-chip">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
        </div>
    `;
}

function ensureOrderDetailsModalRoot() {
    let root = document.getElementById("order-details-modal-root");
    if (!root) {
        root = document.createElement("div");
        root.id = "order-details-modal-root";
        document.body.appendChild(root);
    }

    return root;
}

function closeOrderDetailsModal() {
    const root = document.getElementById("order-details-modal-root");
    if (root) {
        root.innerHTML = "";
    }
}

function renderOrderItemCard(item) {
    return `
        <article class="order-item-card">
            <div class="order-item-main">
                <strong>${escapeHtml(item.productName || "Product")}</strong>
                <span>${escapeHtml(item.quantity || 0)} item(s)</span>
            </div>
            <div class="order-item-meta">
                <span>${formatCurrency(item.price)}</span>
                <strong>${formatCurrency(item.totalPrice)}</strong>
            </div>
        </article>
    `;
}

function openOrderDetailsModal(order) {
    const root = ensureOrderDetailsModalRoot();
    const items = Array.isArray(order?.orderItems) ? order.orderItems : [];

    root.innerHTML = `
        <div class="order-details-overlay" id="order-details-overlay">
            <div class="order-details-modal" role="dialog" aria-modal="true" aria-label="Order details">
                <div class="order-details-header">
                    <div>
                        <span class="eyebrow">Order details</span>
                        <h3>${escapeHtml(order.orderNumber || `Order #${order.id}`)}</h3>
                        <p class="muted">Order ID: ${escapeHtml(order.id ?? "N/A")} | Placed on ${escapeHtml(order.createdAt || "N/A")}</p>
                    </div>
                    <button class="order-details-close" type="button" id="order-details-close" aria-label="Close">&times;</button>
                </div>

                <div class="order-details-summary">
                    ${renderOrderChip("Order status", order.orderStatus || "N/A")}
                    ${renderOrderChip("Payment status", order.paymentStatus || "N/A")}
                    ${renderOrderChip("Total amount", formatCurrency(order.totalAmount))}
                    ${renderOrderChip("Items", String(items.length))}
                </div>

                <div class="order-details-items">
                    <div class="order-details-items-head">
                        <strong>What you ordered</strong>
                        <span class="muted">Small stacked cards for quick review</span>
                    </div>
                    <div class="order-item-stack">
                        ${items.length
                            ? items.map((item) => renderOrderItemCard(item)).join("")
                            : `<div class="empty-state order-empty-state">No item details available for this order.</div>`}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("order-details-close")?.addEventListener("click", closeOrderDetailsModal);
    document.getElementById("order-details-overlay")?.addEventListener("click", (event) => {
        if (event.target?.id === "order-details-overlay") {
            closeOrderDetailsModal();
        }
    });

    const handleEscape = (event) => {
        if (event.key === "Escape") {
            closeOrderDetailsModal();
            window.removeEventListener("keydown", handleEscape);
        }
    };

    window.addEventListener("keydown", handleEscape);
}

async function loadOrdersPage() {
    const page = document.body.dataset.page;

    if (page === "my-account") {
        const user = getStoredUser();
        document.getElementById("account-root").innerHTML = `
            <div class="stats-strip">
                <article class="stat-card">
                    <span>Total Orders</span>
                    <strong id="account-total-orders">0</strong>
                </article>
                <article class="stat-card">
                    <span>Saved Addresses</span>
                    <strong id="account-address-count">0</strong>
                </article>
            </div>
            <article class="account-card">
                <span class="eyebrow">Profile overview</span>
                <h3>${user?.name || "Leo Customer"}</h3>
                <p>Email: ${user?.email || "customer@example.com"}</p>
                <p>Role: ${user?.role || "CUSTOMER"}</p>
                <button class="ghost-button" type="button" id="account-logout-button">Logout</button>
            </article>
        `;

        try {
            const [ordersResponse, addressResponse] = await Promise.all([
                apiGet("/orders/my-orders"),
                apiGet("/addresses")
            ]);

            const orders = ordersResponse?.data || [];
            const addresses = addressResponse?.data || [];

            document.getElementById("account-total-orders").textContent = String(orders.length);
            document.getElementById("account-address-count").textContent = String(addresses.length);
        } catch (error) {
            console.warn("Account metrics fallback:", error.message);
        }

        document.getElementById("account-logout-button").addEventListener("click", () => {
            removeToken();
            removeStoredUser();
            showFlashMessage("Logged out successfully.", "success");
            window.location.href = "login.html";
        });
    }

    if (page === "my-orders") {
        const ordersRoot = document.getElementById("orders-root");

        try {
            const response = await apiGet("/orders/my-orders");
            const orders = Array.isArray(response?.data) ? response.data : [];
            const deliveredCount = orders.filter((order) => String(order.orderStatus || "").toUpperCase() === "DELIVERED").length;
            const activeCount = orders.filter((order) => !["CANCELLED", "REFUNDED"].includes(String(order.orderStatus || "").toUpperCase())).length;
            const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

            ordersRoot.innerHTML = `
                <section class="orders-hero-card">
                    <div class="orders-hero-copy">
                        <span class="eyebrow">Order history</span>
                        <h2>Your orders, styled like a premium dashboard</h2>
                        <p>Keep track of every pet purchase with clean status labels, order IDs, and a clear summary at a glance.</p>
                    </div>
                    <div class="orders-hero-stats">
                        ${renderOrderChip("Total orders", String(orders.length))}
                        ${renderOrderChip("Delivered", String(deliveredCount))}
                        ${renderOrderChip("Active", String(activeCount))}
                        ${renderOrderChip("Total spent", formatCurrency(totalSpent))}
                    </div>
                </section>
                <section class="orders-grid-shell">
                    ${orders.length
                        ? orders.map((order) => `
                            <article class="order-card-premium">
                                <div class="order-card-top">
                                    <div>
                                        <span class="order-card-label">Order</span>
                                        <strong>${escapeHtml(order.orderNumber || `Order #${order.id}`)}</strong>
                                        <p class="muted">Order ID: ${escapeHtml(order.id ?? "N/A")} | Placed on ${escapeHtml(order.createdAt || "N/A")}</p>
                                    </div>
                                    <span class="badge ${getOrderStatusTone(order.orderStatus)}">${escapeHtml(order.orderStatus || "PENDING")}</span>
                                </div>

                                <div class="order-card-meta">
                                    <div class="order-card-amount">
                                        <span>Total amount</span>
                                        <strong>${formatCurrency(order.totalAmount)}</strong>
                                    </div>
                                    <div class="order-card-stack">
                                        ${renderOrderChip("Payment", order.paymentStatus || "N/A")}
                                        ${renderOrderChip("Status", order.orderStatus || "N/A")}
                                    </div>
                                </div>

                                <div class="order-card-footer">
                                    <div class="order-card-actions">
                                        <a class="ghost-button order-track-link" href="track-order.html">Track order</a>
                                        <button class="pill-button order-view-link" type="button" data-order-view="${order.id}">View order</button>
                                    </div>
                                </div>
                            </article>
                        `).join("")
                        : `<div class="empty-state order-empty-state">No orders yet. Once you place an order, it will appear here.</div>`}
                </section>
            `;

            ordersRoot.querySelectorAll("[data-order-view]").forEach((button) => {
                button.addEventListener("click", () => {
                    const orderId = Number(button.dataset.orderView);
                    const selectedOrder = orders.find((item) => item.id === orderId);
                    if (selectedOrder) {
                        openOrderDetailsModal(selectedOrder);
                    }
                });
            });
        } catch (error) {
            ordersRoot.innerHTML = `<div class="empty-state order-empty-state">Unable to load orders right now.</div>`;
            showFlashMessage(error.message || "Unable to load your orders.", "error");
        }
    }

    if (page === "track-order") {
        const trackFormRoot = document.getElementById("track-form-root");
        const trackResultRoot = document.getElementById("track-result-root");
        trackFormRoot.innerHTML = `
            <section class="track-control-card">
                <div class="track-control-top">
                    <div>
                        <span class="eyebrow">Search orders</span>
                        <h2>Track without the clutter</h2>
                        <p>Use your order number or tap a recent order below. The page stays empty until live data arrives, so there is no fake default number.</p>
                    </div>
                    <div class="track-control-badges">
                        <span>Live backend</span>
                        <span>Fast lookup</span>
                        <span>Recent orders</span>
                    </div>
                </div>

                <form class="track-search-form" id="track-order-form">
                    <div class="field">
                        <label for="track-order-number">Order number</label>
                        <input id="track-order-number" type="text" value="" placeholder="LEO-20260701-001">
                    </div>
                    <button class="cta-button" type="submit">Track Order</button>
                </form>

                <div class="track-recent-orders">
                    <div class="track-recent-head">
                        <strong>Recent orders</strong>
                        <span class="muted">Tap to autofill</span>
                    </div>
                    <div class="track-recent-list" id="track-recent-list">
                        <div class="track-recent-skeleton">Loading your recent orders...</div>
                    </div>
                </div>
            </section>
        `;

        const renderEmptyTrackState = () => {
            trackResultRoot.innerHTML = `
                <div class="track-result-shell is-empty">
                    <span class="eyebrow">Live status</span>
                    <h2>Track your order here</h2>
                    <p>Enter your order number or use one of the recent orders shown beside this panel.</p>
                    <div class="track-result-note">Once you submit a valid order number, the latest tracking summary will appear here.</div>
                </div>
            `;
        };

        const renderTrackResult = (order) => {
            trackResultRoot.innerHTML = `
                <div class="track-result-shell">
                    <div class="track-result-top">
                        <div>
                            <span class="eyebrow">Live status</span>
                            <h2>${escapeHtml(order.orderNumber)}</h2>
                            <p class="muted">Order ID: ${escapeHtml(order.id ?? "N/A")} | Placed on ${escapeHtml(order.createdAt || "N/A")}</p>
                        </div>
                        <span class="badge ${getOrderStatusTone(order.orderStatus)}">${escapeHtml(order.orderStatus || "PENDING")}</span>
                    </div>
                    <div class="track-result-grid">
                        <div class="track-result-card">
                            <span>Status</span>
                            <strong>${escapeHtml(order.orderStatus || "N/A")}</strong>
                        </div>
                        <div class="track-result-card">
                            <span>Payment</span>
                            <strong>${escapeHtml(order.paymentStatus || "N/A")}</strong>
                        </div>
                        <div class="track-result-card">
                            <span>Total</span>
                            <strong>${formatCurrency(order.totalAmount)}</strong>
                        </div>
                        <div class="track-result-card">
                            <span>Placed on</span>
                            <strong>${escapeHtml(order.createdAt || "N/A")}</strong>
                        </div>
                    </div>
                </div>
            `;
        };

        renderEmptyTrackState();

        (async () => {
            try {
                const response = await apiGet("/orders/my-orders");
                const recentOrders = Array.isArray(response?.data) ? response.data : [];
                const recentList = document.getElementById("track-recent-list");
                if (recentList) {
                    recentList.innerHTML = recentOrders.length
                        ? recentOrders.slice(0, 5).map((order) => `
                            <button class="track-recent-item" type="button" data-recent-order="${escapeHtml(order.orderNumber)}">
                                <span>${escapeHtml(order.orderNumber)}</span>
                                <strong>${escapeHtml(order.orderStatus || "PENDING")}</strong>
                            </button>
                        `).join("")
                        : `<div class="track-recent-skeleton">No recent orders available right now.</div>`;
                }

                trackFormRoot.querySelectorAll("[data-recent-order]").forEach((button) => {
                    button.addEventListener("click", async () => {
                        const orderNumber = button.dataset.recentOrder || "";
                        const input = trackFormRoot.querySelector("#track-order-number");
                        if (input) {
                            input.value = orderNumber;
                            input.focus();
                        }

                        try {
                            const response = await apiGet(`/orders/track/${encodeURIComponent(orderNumber)}`);
                            renderTrackResult(response.data);
                        } catch (error) {
                            showFlashMessage(error.message || "Unable to track this order.", "error");
                        }
                    });
                });
            } catch (error) {
                const recentList = document.getElementById("track-recent-list");
                if (recentList) {
                    recentList.innerHTML = `<div class="track-recent-skeleton">Connect to backend to load your order list.</div>`;
                }
            }
        })();

        trackFormRoot.querySelector("#track-order-form").addEventListener("submit", async (event) => {
            event.preventDefault();
            const orderNumber = trackFormRoot.querySelector("#track-order-number").value.trim();

            if (!orderNumber) {
                showFlashMessage("Please enter an order number.", "error");
                return;
            }

            try {
                const response = await apiGet(`/orders/track/${encodeURIComponent(orderNumber)}`);
                renderTrackResult(response.data);
                showFlashMessage("Order status loaded successfully.", "success");
            } catch (error) {
                showFlashMessage(error.message || "Unable to track this order.", "error");
                renderEmptyTrackState();
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", loadOrdersPage);
