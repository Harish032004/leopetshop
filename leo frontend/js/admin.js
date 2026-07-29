(function adminModule() {
    const PAGE_META = {
        "admin-dashboard": {
            title: "Dashboard Overview",
            subtitle: "Monitor sales, stock, orders, and store activity from one place.",
            actionLabel: "Refresh Dashboard"
        },
        "admin-products": {
            title: "Products",
            subtitle: "Manage listings, pricing, stock levels, and storefront visibility.",
            actionLabel: "Add Product"
        },
        "admin-add-product": {
            title: "Add Product",
            subtitle: "Create a new product entry with category, pricing, media, and stock details.",
            actionLabel: "View Products"
        },
        "admin-categories": {
            title: "Categories",
            subtitle: "Organize your catalog with clean category management.",
            actionLabel: "New Category"
        },
        "admin-orders": {
            title: "Orders",
            subtitle: "Track fulfillment, payment updates, and customer order details.",
            actionLabel: "Refresh Orders"
        },
        "admin-users": {
            title: "Users",
            subtitle: "Review customer ordering activity and account details.",
            actionLabel: "Refresh Users"
        },
        "admin-banners": {
            title: "Banners",
            subtitle: "Create and manage the promotional visuals shown on the storefront.",
            actionLabel: "New Banner"
        },
        "admin-coupons": {
            title: "Coupons",
            subtitle: "Manage campaign codes, thresholds, values, and expiry dates.",
            actionLabel: "New Coupon"
        },
        "admin-reviews": {
            title: "Reviews",
            subtitle: "Moderate product reviews so the storefront stays helpful and trusted.",
            actionLabel: "Refresh Reviews"
        },
        "admin-reports": {
            title: "Reports",
            subtitle: "Review daily and monthly sales, products, stock, and customer performance.",
            actionLabel: "Refresh Reports"
        }
    };

    const ADMIN_NAV_ITEMS = [
        ["admin-dashboard.html", "Dashboard", "admin-dashboard", "DB"],
        ["admin-products.html", "Products", "admin-products", "PR"],
        ["admin-add-product.html", "Add Product", "admin-add-product", "AP"],
        ["admin-categories.html", "Categories", "admin-categories", "CT"],
        ["admin-orders.html", "Orders", "admin-orders", "OR"],
        ["admin-users.html", "Users", "admin-users", "US"],
        ["admin-banners.html", "Banners", "admin-banners", "BN"],
        ["admin-coupons.html", "Coupons", "admin-coupons", "CP"],
        ["admin-reviews.html", "Reviews", "admin-reviews", "RV"],
        ["admin-reports.html", "Reports", "admin-reports", "RP"]
    ];

    const ORDER_STATUSES = [
        "PENDING",
        "CONFIRMED",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED"
    ];

    const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "COD"];
    const DISCOUNT_TYPES = ["PERCENTAGE", "FIXED"];
    const ADMIN_PRODUCTS_PAGE_SIZE = 10;
    const ADMIN_CATEGORIES_PAGE_SIZE = 8;
    const ADMIN_ORDERS_PAGE_SIZE = 10;
    const ADMIN_USERS_PAGE_SIZE = 10;
    const ADMIN_COUPONS_PAGE_SIZE = 10;
    const ADMIN_REPORT_STOCK_PAGE_SIZE = 8;
    const ADMIN_DASHBOARD_RECENT_ORDER_PAGE_SIZE = 5;
    const ADMIN_REPORT_PRODUCT_PAGE_SIZE = 6;
    const ADMIN_REPORT_MOST_PURCHASED_PAGE_SIZE = 4;
    const ADMIN_REPORT_CUSTOMER_PAGE_SIZE = 8;
    let adminProductSearchTimer = null;
    let adminOrderSearchTimer = null;
    let adminUserSearchTimer = null;
    let adminCouponSearchTimer = null;

    const state = {
        categories: [],
        products: [],
        orders: [],
        banners: [],
        coupons: [],
        reviews: [],
        users: [],
        reports: null,
        customerDetail: {
            userId: null,
            page: 1
        },
        filters: {
            products: { keyword: "", category: "", page: 1 },
            categories: { keyword: "", page: 1 },
            orders: { keyword: "", status: "", page: 1 },
            dashboardRecentOrders: { page: 1 },
            dashboardAnalytics: { range: "month", from: "", to: "" },
            users: { keyword: "", page: 1 },
            banners: { keyword: "" },
            coupons: { keyword: "", page: 1 },
            reportDailySales: { keyword: "", from: "", to: "", page: 1 },
            reportMonthlySales: { keyword: "", from: "", to: "", page: 1 },
            reportStock: { keyword: "", status: "", page: 1 },
            reportProductPerformance: { keyword: "", category: "", page: 1 },
            reportMostPurchased: { keyword: "", category: "", page: 1 },
            reportCustomer: { keyword: "", page: 1 },
            reviews: { keyword: "" }
        }
    };

    function getPageKey() {
        return document.body.dataset.page || "admin-dashboard";
    }

    function getAdminUser() {
        return getStoredUser();
    }

    function isAdminLoggedIn() {
        return Boolean(getToken()) && getUserRole() === "ADMIN";
    }

    function clearAdminAuth() {
        clearStoredAuth();
    }

    function adminLogout(redirect = true) {
        clearAdminAuth();
        if (redirect) {
            window.location.href = "admin-login.html";
        }
    }

    function showFlashMessage(message, type = "info") {
        let stack = document.getElementById("flash-stack");
        if (!stack) {
            stack = document.createElement("div");
            stack.id = "flash-stack";
            stack.className = "flash-stack";
            document.body.appendChild(stack);
        }

        const flash = document.createElement("div");
        flash.className = `flash-message ${type}`;
        flash.textContent = message;
        stack.appendChild(flash);

        window.setTimeout(() => {
            flash.remove();
        }, 3400);
    }

    function rememberAdminDebugLog(label, details = {}) {
        const entry = {
            at: new Date().toISOString(),
            label,
            details
        };

        try {
            const existing = JSON.parse(sessionStorage.getItem("leo_admin_debug_log") || "[]");
            existing.push(entry);
            sessionStorage.setItem("leo_admin_debug_log", JSON.stringify(existing.slice(-30)));
        } catch (error) {
            console.warn("Unable to persist admin debug log.", error);
        }

        console.log(label, details);
    }

    function handleAdminRequestError(error, fallbackMessage, options = {}) {
        const message = error?.message || fallbackMessage;
        const lower = String(message).toLowerCase();
        const allowRedirect = options.allowRedirect !== false;
        console.error("ADMIN REQUEST ERROR", {
            fallbackMessage,
            message,
            allowRedirect,
            error
        });

        if (
            lower.includes("401") ||
            lower.includes("403") ||
            lower.includes("unauthorized") ||
            lower.includes("forbidden")
        ) {
            showFlashMessage("Admin session expired. Please login again.", "error");
            if (allowRedirect) {
                window.setTimeout(() => adminLogout(), 1200);
            }
            return true;
        }

        showFlashMessage(message || fallbackMessage, "error");
        return false;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(Number(value || 0));
    }

    function formatDateTime(value) {
        if (!value) {
            return "N/A";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return escapeHtml(value);
        }

        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    }

    function formatDateOnly(value) {
        if (!value) {
            return "N/A";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return escapeHtml(value);
        }

        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    function toSentenceCase(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    function normalizeList(payload) {
        if (Array.isArray(payload)) {
            return payload;
        }

        if (Array.isArray(payload?.content)) {
            return payload.content;
        }

        if (Array.isArray(payload?.items)) {
            return payload.items;
        }

        return [];
    }

    function getFilteredProducts() {
        const keyword = state.filters.products.keyword.toLowerCase();
        const categoryName = state.filters.products.category;

        return state.products.filter((product) => {
            const matchesKeyword = !keyword ||
                String(product.name || "").toLowerCase().includes(keyword) ||
                String(product.sku || "").toLowerCase().includes(keyword) ||
                String(product.brand || "").toLowerCase().includes(keyword) ||
                String(product.productType || "").toLowerCase().includes(keyword) ||
                String(product.breedCompatibility || "").toLowerCase().includes(keyword);
            const matchesCategory = !categoryName || product.category?.name === categoryName;
            return matchesKeyword && matchesCategory;
        });
    }

    function syncAdminProductsUrl(keyword = "") {
        if (getPageKey() !== "admin-products" || typeof window === "undefined") {
            return;
        }

        const url = new URL(window.location.href);
        if (keyword) {
            url.searchParams.set("search", keyword);
        } else {
            url.searchParams.delete("search");
        }
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    function paginateList(items, page, pageSize) {
        const totalItems = items.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const currentPage = Math.min(Math.max(1, page), totalPages);
        const startIndex = (currentPage - 1) * pageSize;

        return {
            totalItems,
            totalPages,
            currentPage,
            startIndex,
            items: items.slice(startIndex, startIndex + pageSize)
        };
    }

    function renderAdminPagination(totalPages, currentPage, actionName) {
        if (totalPages <= 1) {
            return "";
        }

        const visiblePages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let page = startPage; page <= endPage; page += 1) {
            visiblePages.push(page);
        }

        return `
            <div class="admin-pagination">
                <button class="admin-pagination-btn" type="button" data-action="${actionName}" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
                <div class="admin-pagination-pages">
                    ${startPage > 1 ? `<button class="admin-pagination-number" type="button" data-action="${actionName}" data-page="1">1</button>${startPage > 2 ? '<span class="admin-pagination-ellipsis">...</span>' : ""}` : ""}
                    ${visiblePages.map((page) => `
                        <button class="admin-pagination-number ${page === currentPage ? "is-active" : ""}" type="button" data-action="${actionName}" data-page="${page}">${page}</button>
                    `).join("")}
                    ${endPage < totalPages ? `${endPage < totalPages - 1 ? '<span class="admin-pagination-ellipsis">...</span>' : ""}<button class="admin-pagination-number" type="button" data-action="${actionName}" data-page="${totalPages}">${totalPages}</button>` : ""}
                </div>
                <button class="admin-pagination-btn" type="button" data-action="${actionName}" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
            </div>
        `;
    }

    function getFilteredCategories() {
        const keyword = state.filters.categories.keyword.toLowerCase();
        return state.categories.filter((category) =>
            String(category.name || "").toLowerCase().includes(keyword) ||
            String(category.description || "").toLowerCase().includes(keyword)
        );
    }

    function getFilteredOrders() {
        const keyword = state.filters.orders.keyword.toLowerCase();
        const status = state.filters.orders.status;

        return state.orders.filter((order) => {
            const customerName = order.user?.name || order.address?.fullName || "";
            const matchesKeyword = !keyword ||
                String(order.orderNumber || "").toLowerCase().includes(keyword) ||
                customerName.toLowerCase().includes(keyword);
            const matchesStatus = !status || order.orderStatus === status;
            return matchesKeyword && matchesStatus;
        });
    }

    function getFilteredUsers() {
        const keyword = state.filters.users.keyword.toLowerCase();
        return state.users.filter((user) =>
            String(user.name || "").toLowerCase().includes(keyword) ||
            String(user.email || "").toLowerCase().includes(keyword) ||
            String(user.phone || "").toLowerCase().includes(keyword)
        );
    }

    function getFilteredBanners() {
        const keyword = state.filters.banners.keyword.toLowerCase();
        return state.banners.filter((banner) =>
            String(banner.title || "").toLowerCase().includes(keyword) ||
            String(banner.subtitle || "").toLowerCase().includes(keyword)
        );
    }

    function getFilteredCoupons() {
        const keyword = state.filters.coupons.keyword.toLowerCase();
        return state.coupons.filter((coupon) =>
            String(coupon.code || "").toLowerCase().includes(keyword)
        );
    }

    function getStockReportStatus(item = {}) {
        const stockQuantity = Number(item.stockQuantity || 0);
        if (stockQuantity <= 0) {
            return "OUT_OF_STOCK";
        }

        if (item.lowStock) {
            return "LOW_STOCK";
        }

        return "IN_STOCK";
    }

    function getFilteredStockReport(items = []) {
        const filter = state.filters.reportStock;
        const keyword = String(filter.keyword || "").trim().toLowerCase();
        const status = filter.status;

        return items.filter((item) => {
            const matchesKeyword = !keyword || [
                item.productName,
                item.sku,
                item.categoryName,
                getStockReportStatus(item),
                item.active ? "active" : "inactive"
            ].some((value) => String(value || "").toLowerCase().includes(keyword));
            const matchesStatus = !status || getStockReportStatus(item) === status;
            return matchesKeyword && matchesStatus;
        });
    }

    function getReportCategories(items = []) {
        return Array.from(new Set(items
            .map((item) => String(item.categoryName || "").trim())
            .filter(Boolean)
        )).sort((first, second) => first.localeCompare(second));
    }

    function getFilteredSalesReport(items = [], filterKey) {
        const filter = state.filters[filterKey] || {};
        const keyword = String(filter.keyword || "").trim().toLowerCase();
        const from = String(filter.from || "");
        const to = String(filter.to || "");

        return items.filter((item) => {
            const period = String(item.period || "");
            const comparablePeriod = filterKey === "reportMonthlySales" ? period.slice(0, 7) : period.slice(0, 10);
            const matchesKeyword = !keyword || [
                item.period,
                item.totalOrders,
                item.totalSales
            ].some((value) => String(value || "").toLowerCase().includes(keyword));
            const matchesFrom = !from || comparablePeriod >= from;
            const matchesTo = !to || comparablePeriod <= to;
            return matchesKeyword && matchesFrom && matchesTo;
        });
    }

    function getFilteredProductReport(items = [], filterKey = "reportProductPerformance") {
        const filter = state.filters[filterKey] || {};
        const keyword = String(filter.keyword || "").trim().toLowerCase();
        const category = String(filter.category || "");

        return items.filter((item) => {
            const matchesKeyword = !keyword || [
                item.productName,
                item.sku,
                item.categoryName,
                item.totalQuantitySold,
                item.totalSales
            ].some((value) => String(value || "").toLowerCase().includes(keyword));
            const matchesCategory = !category || item.categoryName === category;
            return matchesKeyword && matchesCategory;
        });
    }

    function getFilteredMostPurchasedReport(items = []) {
        return getFilteredProductReport(items, "reportMostPurchased")
            .slice()
            .sort((first, second) =>
                Number(second.totalQuantitySold || 0) - Number(first.totalQuantitySold || 0)
                || Number(second.totalSales || 0) - Number(first.totalSales || 0)
            );
    }

    function getFilteredCustomerReport(items = []) {
        const keyword = String(state.filters.reportCustomer.keyword || "").trim().toLowerCase();

        return items.filter((item) => !keyword || [
            item.name,
            item.email,
            item.phone,
            item.totalOrders,
            item.totalSpent,
            item.joinedAt
        ].some((value) => String(value || "").toLowerCase().includes(keyword)));
    }

    function syncReportFilterFromToolbar(sectionKey) {
        const toolbar = getAdminContentRoot()?.querySelector(`[data-report-toolbar="${sectionKey}"]`);
        const filter = state.filters[sectionKey];
        if (!toolbar || !filter) {
            return;
        }

        toolbar.querySelectorAll("[data-report-filter-field]").forEach((field) => {
            filter[field.dataset.reportFilterField] = field.value;
        });
        filter.page = 1;
    }

    function resetReportFilter(sectionKey) {
        const filter = state.filters[sectionKey];
        if (!filter) {
            return;
        }

        Object.keys(filter).forEach((key) => {
            filter[key] = key === "page" ? 1 : "";
        });
    }

    function getReportDownloadConfig(sectionKey) {
        const reports = state.reports || {};
        const configs = {
            reportDailySales: {
                filename: "leo-daily-sales-report",
                rows: getFilteredSalesReport(reports.dailySales || [], "reportDailySales"),
                columns: [
                    ["Period", (item) => item.period],
                    ["Total Orders", (item) => item.totalOrders],
                    ["Total Sales", (item) => item.totalSales]
                ]
            },
            reportMonthlySales: {
                filename: "leo-monthly-sales-report",
                rows: getFilteredSalesReport(reports.monthlySales || [], "reportMonthlySales"),
                columns: [
                    ["Period", (item) => item.period],
                    ["Total Orders", (item) => item.totalOrders],
                    ["Total Sales", (item) => item.totalSales]
                ]
            },
            reportProductPerformance: {
                filename: "leo-product-performance-report",
                rows: getFilteredProductReport(reports.productReport || [], "reportProductPerformance"),
                columns: [
                    ["Product", (item) => item.productName],
                    ["SKU", (item) => item.sku],
                    ["Category", (item) => item.categoryName],
                    ["Units Sold", (item) => item.totalQuantitySold],
                    ["Total Sales", (item) => item.totalSales]
                ]
            },
            reportMostPurchased: {
                filename: "leo-most-purchased-products-report",
                rows: getFilteredMostPurchasedReport(reports.productReport || []),
                columns: [
                    ["Rank", (_item, index) => index + 1],
                    ["Product", (item) => item.productName],
                    ["SKU", (item) => item.sku],
                    ["Category", (item) => item.categoryName],
                    ["Units Sold", (item) => item.totalQuantitySold],
                    ["Total Sales", (item) => item.totalSales]
                ]
            },
            reportStock: {
                filename: "leo-stock-report",
                rows: getFilteredStockReport(reports.stockReport || []),
                columns: [
                    ["Product", (item) => item.productName],
                    ["SKU", (item) => item.sku],
                    ["Category", (item) => item.categoryName],
                    ["Stock", (item) => item.stockQuantity],
                    ["Stock Status", (item) => getStockReportStatus(item)],
                    ["Active", (item) => item.active ? "Active" : "Inactive"]
                ]
            },
            reportCustomer: {
                filename: "leo-customer-report",
                rows: getFilteredCustomerReport(reports.customerReport || []),
                columns: [
                    ["Name", (item) => item.name],
                    ["Email", (item) => item.email],
                    ["Phone", (item) => item.phone],
                    ["Total Orders", (item) => item.totalOrders],
                    ["Total Spent", (item) => item.totalSpent],
                    ["Joined At", (item) => item.joinedAt]
                ]
            }
        };

        return configs[sectionKey];
    }

    function downloadReportExcel(sectionKey) {
        const config = getReportDownloadConfig(sectionKey);
        if (!config) {
            return;
        }

        if (!config.rows.length) {
            showFlashMessage("No filtered records available to download.", "info");
            return;
        }

        const tableRows = [
            `<tr>${config.columns.map(([label]) => `<th>${escapeHtml(label)}</th>`).join("")}</tr>`,
            ...config.rows.map((row, rowIndex) => `
                <tr>
                    ${config.columns.map(([, getter]) => `<td>${escapeHtml(getter(row, rowIndex) ?? "")}</td>`).join("")}
                </tr>
            `)
        ].join("");
        const html = `
            <html>
                <head><meta charset="UTF-8"></head>
                <body><table>${tableRows}</table></body>
            </html>
        `;
        const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${config.filename}-${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
        showFlashMessage("Filtered report downloaded.", "success");
    }

    function getFilteredReviews() {
        const keyword = state.filters.reviews.keyword.toLowerCase();
        return state.reviews.filter((review) =>
            String(review.user?.name || "").toLowerCase().includes(keyword) ||
            String(review.product?.name || "").toLowerCase().includes(keyword) ||
            String(review.reviewText || "").toLowerCase().includes(keyword)
        );
    }

    function statusBadge(value) {
        const normalized = String(value || "UNKNOWN").toUpperCase();
        let className = "disabled";

        if (["ACTIVE", "APPROVED", "PAID", "DELIVERED", "CONFIRMED", "SHIPPED", "TRUE", "LIVE"].includes(normalized)) {
            className = "live";
        } else if (["PENDING", "PACKED", "COD", "FEATURED", "DRAFT", "LOW_STOCK"].includes(normalized)) {
            className = "pending";
        }

        return `<span class="admin-status ${className}">${escapeHtml(toSentenceCase(normalized))}</span>`;
    }

    function renderLoading(message = "Loading admin data...") {
        return `
            <section class="admin-loading">
                <div class="admin-inline-loader">
                    <span class="admin-spinner" aria-hidden="true"></span>
                    <span>${escapeHtml(message)}</span>
                </div>
            </section>
        `;
    }

    function renderEmptyState(message) {
        return `<section class="admin-empty-state">${escapeHtml(message)}</section>`;
    }

    function createTableCard(title, subtitle, toolbarHtml, tableHtml, extraAttrs = "") {
        const idMatch = String(extraAttrs || "").match(/data-report-card="([^"]+)"/);
        const idAttribute = idMatch ? ` id="${escapeHtml(idMatch[1])}"` : "";

        return `
            <section class="admin-table-card"${idAttribute} ${extraAttrs}>
                <div class="admin-panel-header">
                    <div>
                        <h3>${escapeHtml(title)}</h3>
                        <p class="muted">${escapeHtml(subtitle)}</p>
                    </div>
                    <div class="admin-toolbar">${toolbarHtml}</div>
                </div>
                ${tableHtml}
            </section>
        `;
    }

    function showInlinePageNotice(message, type = "success") {
        const root = getAdminContentRoot();
        if (!root) {
            return;
        }

        const existing = root.querySelector(".admin-page-notice");
        if (existing) {
            existing.remove();
        }

        const notice = document.createElement("div");
        notice.className = `admin-page-notice ${type}`;
        notice.textContent = message;
        root.prepend(notice);

        window.setTimeout(() => {
            notice.remove();
        }, 1800);
    }

    function setPageContent(html) {
        const content = document.getElementById("admin-page-content");
        if (content) {
            content.innerHTML = html;
        }
    }

    function getAdminContentRoot() {
        return document.getElementById("admin-page-content");
    }

    function getModalRoot() {
        return document.getElementById("admin-modal-root");
    }

    function openAdminModal(title, bodyHtml) {
        const modalRoot = getModalRoot();
        if (!modalRoot) {
            return;
        }

        modalRoot.innerHTML = `
            <div class="admin-modal is-open" id="admin-modal">
                <div class="admin-modal-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
                    <div class="admin-modal-header">
                        <div>
                            <h3>${escapeHtml(title)}</h3>
                        </div>
                        <button class="admin-modal-close" type="button" id="admin-modal-close" aria-label="Close">×</button>
                    </div>
                    <div class="admin-modal-body">${bodyHtml}</div>
                </div>
            </div>
        `;

        const closeTargets = [
            document.getElementById("admin-modal-close"),
            document.getElementById("admin-modal")
        ];

        closeTargets.forEach((target) => {
            if (!target) {
                return;
            }

            target.addEventListener("click", (event) => {
                if (event.target === target || target.id === "admin-modal-close") {
                    closeAdminModal();
                }
            });
        });
    }

    function closeAdminModal() {
        const modalRoot = getModalRoot();
        if (modalRoot) {
            modalRoot.innerHTML = "";
        }
    }

    async function fetchAdminData(endpoint) {
        const response = await apiGet(endpoint);
        return response?.data ?? response;
    }

    async function submitAdminData(endpoint, method, payload = null) {
        if (method === "POST") {
            return apiPost(endpoint, payload);
        }

        if (method === "PUT") {
            return apiPut(endpoint, payload);
        }

        if (method === "DELETE") {
            return apiDelete(endpoint);
        }

        return apiGet(endpoint);
    }

    function getAdminApiBaseUrl() {
        try {
            const configuredUrl = new URL(API_BASE_URL);
            const pageHost = window.location.hostname;
            const localHosts = ["localhost", "127.0.0.1"];

            if (localHosts.includes(configuredUrl.hostname) && localHosts.includes(pageHost)) {
                configuredUrl.hostname = pageHost;
                return configuredUrl.toString().replace(/\/$/, "");
            }
        } catch (error) {
            console.warn("Unable to normalize admin API base URL.", error);
        }

        return API_BASE_URL;
    }

    async function submitAdminFormData(endpoint, method, formData) {
        const requestUrl = `${getAdminApiBaseUrl()}${endpoint}`;
        console.log("ADMIN REQUEST START", {
            endpoint,
            method,
            url: requestUrl,
            tokenExists: Boolean(getToken())
        });

        const response = await fetch(requestUrl, {
            method,
            headers: {
                Authorization: `Bearer ${getToken()}`
            },
            body: formData
        });
        const payload = await parseResponse(response);

        console.log("ADMIN REQUEST RESPONSE", {
            endpoint,
            method,
            status: response.status,
            ok: response.ok,
            body: payload
        });

        if (!response.ok) {
            throw new Error(extractErrorMessage(payload, `Request failed with status ${response.status}`));
        }

        return payload;
    }

    async function uploadAdminImage(file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadUrl = `${getAdminApiBaseUrl()}/admin/uploads/images`;
        const uploadDebug = {
            uploadUrl,
            frontendOrigin: window.location.origin,
            fileName: file?.name || "",
            fileType: file?.type || "",
            fileSize: file?.size || 0,
            tokenExists: Boolean(getToken())
        };
        rememberAdminDebugLog("ADMIN IMAGE UPLOAD DEBUG", uploadDebug);
        console.log("ADMIN UPLOAD REQUEST", {
            url: uploadUrl,
            tokenExists: Boolean(getToken()),
            fileName: file?.name || "",
            fileType: file?.type || "",
            fileSize: file?.size || 0
        });

        try {
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
                body: formData
            });

            const responseBodyText = await response.text();
            let payload = null;

            if (responseBodyText) {
                try {
                    payload = JSON.parse(responseBodyText);
                } catch (parseError) {
                    payload = { message: responseBodyText };
                }
            }

            const responseDebug = {
                url: uploadUrl,
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                responseBodyText,
                parsedJson: payload
            };
            rememberAdminDebugLog("ADMIN IMAGE UPLOAD RESPONSE", responseDebug);
            if (!response.ok) {
                const fileName = file?.name || "selected file";
                const fileType = file?.type || "unknown";
                const fileSizeKb = Number.isFinite(file?.size) ? Math.round(file.size / 1024) : 0;
                throw new Error(
                    `Image upload failed for ${fileName} (${fileType}, ${fileSizeKb} KB): ${extractErrorMessage(payload, `Image upload failed with status ${response.status}`)}`
                );
            }

            return payload?.data || payload;
        } catch (error) {
            rememberAdminDebugLog("ADMIN IMAGE UPLOAD ERROR", {
                uploadUrl,
                message: error?.message || "Unknown image upload error",
                stack: error?.stack || ""
            });

            if (error instanceof TypeError && String(error.message || "").toLowerCase().includes("failed to fetch")) {
                throw new Error(
                    `Image upload failed. Check backend is running, API URL, and CORS for localhost/127.0.0.1. Upload URL: ${uploadUrl}`
                );
            }

            throw error;
        }
    }

    window.testAdminUploadEndpoint = async function () {
        const url = "http://localhost:8080/api/admin/uploads/images";
        console.log("Testing upload endpoint", url);
        rememberAdminDebugLog("ADMIN IMAGE UPLOAD ENDPOINT TEST", {
            url,
            frontendOrigin: window.location.origin,
            tokenExists: Boolean(getToken())
        });
    };

    async function uploadAdminImages(fileList) {
        const files = Array.from(fileList || []).filter(Boolean);
        const uploadedUrls = [];

        for (const file of files) {
            uploadedUrls.push(await uploadAdminImage(file));
        }

        return uploadedUrls;
    }

    function renderAdminLogin() {
        const root = document.getElementById("admin-auth-root");
        if (!root) {
            return;
        }

        root.innerHTML = `
            <section class="admin-login-shell">
                <article class="admin-login-brand">
                    <a class="brand" href="index.html">
                        <img class="brand-logo" src="assets/logo/leologo1.png" alt="Leo's Pet Barkery logo">
                        <span class="brand-copy">
                            <strong>Leo's Pet Barkery</strong>
                            <span>Admin control center</span>
                        </span>
                    </a>
                    <div style="margin-top:2rem;">
                        <span class="eyebrow" style="color:rgba(255,255,255,0.9);">Professional admin panel</span>
                        <h1 style="margin:0; font-family:var(--font-heading); font-size:clamp(2.3rem,4vw,3.8rem);">Manage the store with a secure admin workspace</h1>
                        <p style="line-height:1.8;">Access dashboard insights, products, categories, orders, banners, coupons, reviews, and reports with one protected login.</p>
                    </div>
                    <div class="admin-login-points">
                        <div class="admin-login-point">JWT-based admin authentication connected to the backend</div>
                        <div class="admin-login-point">Protected admin pages with role-based redirects</div>
                        <div class="admin-login-point">Responsive layout for desktop and mobile review</div>
                    </div>
                </article>
                <article class="admin-login-panel">
                    <span class="eyebrow">Administrator Access</span>
                    <h1 style="margin:0 0 0.75rem;">Sign in</h1>
                    <p class="muted">Only ADMIN users are allowed into the management panel.</p>
                    <form class="form-grid" id="admin-login-form" style="margin-top:1.5rem;">
                        <div class="field">
                            <label for="admin-email">Email</label>
                            <input id="admin-email" type="email" placeholder="admin@leopetbarkery.com" value="admin@leopetbarkery.com" required>
                        </div>
                        <div class="field">
                            <label for="admin-password">Password</label>
                            <input id="admin-password" type="password" placeholder="Enter password" value="Admin@123" required>
                        </div>
                        <button class="cta-button" type="submit" id="admin-login-submit">Login to Admin Panel</button>
                    </form>
                </article>
            </section>
        `;

        const form = document.getElementById("admin-login-form");
        const submitButton = document.getElementById("admin-login-submit");

        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            submitButton.disabled = true;
            submitButton.textContent = "Signing in...";

            try {
                const payload = {
                    email: document.getElementById("admin-email")?.value.trim(),
                    password: document.getElementById("admin-password")?.value.trim()
                };
                const response = await apiPost("/auth/login", payload);
                const loginData = response?.data || {};

                if (!loginData.token) {
                    throw new Error("Login token was not returned.");
                }

                if (loginData.role !== "ADMIN") {
                    clearAdminAuth();
                    throw new Error("This account does not have admin access.");
                }

                setToken(loginData.token);
                setStoredUser({
                    name: loginData.name || "Admin User",
                    email: loginData.email || payload.email,
                    role: loginData.role
                });

                showFlashMessage("Admin login successful.", "success");
                window.location.href = "admin-dashboard.html";
            } catch (error) {
                clearAdminAuth();
                showFlashMessage(error.message || "Unable to login.", "error");
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Login to Admin Panel";
            }
        });
    }

    function renderAdminShell() {
        const root = document.getElementById("admin-root");
        if (!root) {
            return;
        }

        const pageKey = getPageKey();
        const page = PAGE_META[pageKey] || PAGE_META["admin-dashboard"];
        const user = getAdminUser();
        const adminDisplayName = user?.name || user?.email || "Admin";
        const initials = (user?.name || "Admin User")
            .split(" ")
            .map((part) => part[0] || "")
            .join("")
            .slice(0, 2)
            .toUpperCase();

        root.innerHTML = `
            <div class="admin-sidebar-overlay" id="admin-sidebar-overlay"></div>
            <div class="admin-shell">
                <aside class="admin-sidebar" id="admin-sidebar">
                    <div class="admin-sidebar-header">
                        <a class="brand" href="admin-dashboard.html">
                            <img class="brand-logo" src="assets/logo/leo-pet-barkery-logo.svg" alt="Leo's Pet Barkery logo">
                            <span class="brand-copy">
                                <strong>Leo's Pet Barkery</strong>
                                <span>Admin Panel</span>
                            </span>
                        </a>
                        <button type="button" class="admin-sidebar-close" id="admin-sidebar-close" aria-label="Close admin menu">&times;</button>
                    </div>
                    <div class="admin-mobile-user">Signed in as ${escapeHtml(adminDisplayName)}</div>
                    <nav class="admin-sidebar-nav" aria-label="Admin sidebar">
                        ${ADMIN_NAV_ITEMS.map(([href, label, key, icon]) => `
                            <a class="admin-sidebar-link ${pageKey === key ? "is-active" : ""}" href="${href}">
                                <span class="admin-sidebar-icon">${icon}</span>
                                <span>${label}</span>
                            </a>
                        `).join("")}
                        <a class="admin-sidebar-link" href="#" id="admin-logout-link">
                            <span class="admin-sidebar-icon">LO</span>
                            <span>Logout</span>
                        </a>
                    </nav>
                    <div class="admin-sidebar-footer">
                        <strong>Live admin mode</strong>
                        <p class="muted" style="margin-bottom:0;">Connected to your Leo's Pet Barkery backend with JWT-protected requests.</p>
                    </div>
                </aside>
                <main class="admin-content">
                    <header class="admin-topbar">
                        <a class="brand admin-topbar-brand" href="admin-dashboard.html" aria-label="Leo's Pet Barkery admin home">
                            <img class="brand-logo" src="assets/logo/leologo1.png" alt="Leo's Pet Barkery logo">
                            <span class="brand-copy">
                                <strong>Leo's Pet Barkery</strong>
                            </span>
                        </a>
                        <div class="admin-topbar-actions">
                            <button class="admin-menu-toggle" id="admin-menu-toggle" aria-label="Toggle sidebar">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                        <form class="admin-nav-search" id="admin-nav-search-form">
                            <input type="search" id="admin-nav-search-input" placeholder="Search products, orders, users..." aria-label="Search admin records">
                            <button type="submit">Search</button>
                        </form>
                        <div class="admin-profile">
                            <div class="admin-avatar">${escapeHtml(initials || "AD")}</div>
                            <div>
                                <strong>${escapeHtml(user?.name || "Admin User")}</strong>
                                <div class="muted">${escapeHtml(user?.email || "admin@leopetbarkery.com")}</div>
                            </div>
                        </div>
                    </header>
                    <section class="admin-page-hero">
                        <div>
                            <span class="eyebrow" style="color:rgba(255,255,255,0.9);">Admin workspace</span>
                            <h1 style="margin:0; font-family:var(--font-heading); font-size:clamp(2rem,4vw,3rem);">${escapeHtml(page.title)}</h1>
                            <p style="margin:0.75rem 0 0;">${escapeHtml(page.subtitle)}</p>
                        </div>
                        <button class="admin-btn" type="button" id="admin-hero-action">${escapeHtml(page.actionLabel)}</button>
                    </section>
                    <section class="admin-content-area" id="admin-page-content">
                        ${renderLoading("Loading page...")}
                    </section>
                </main>
            </div>
            <div id="admin-modal-root"></div>
        `;
    }

    function bindAdminSidebar() {
        const toggle = document.getElementById("admin-menu-toggle");
        const overlay = document.getElementById("admin-sidebar-overlay");
        const closeButton = document.getElementById("admin-sidebar-close");

        const closeSidebar = () => {
            document.body.classList.remove("sidebar-open");
            toggle?.setAttribute("aria-expanded", "false");
        };

        toggle?.addEventListener("click", () => {
            const isOpen = !document.body.classList.contains("sidebar-open");
            document.body.classList.toggle("sidebar-open", isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        overlay?.addEventListener("click", closeSidebar);
        closeButton?.addEventListener("click", closeSidebar);

        document.querySelectorAll(".admin-sidebar-link").forEach((link) => {
            link.addEventListener("click", () => {
                if (window.matchMedia("(max-width: 1100px)").matches) {
                    closeSidebar();
                }
            });
        });
    }

    function bindAdminTopbarSearch() {
        const form = document.getElementById("admin-nav-search-form");
        const input = document.getElementById("admin-nav-search-input");
        if (!form || !input) {
            return;
        }

        input.addEventListener("input", () => {
            const keyword = input.value.trim();
            if (keyword || getPageKey() !== "admin-products") {
                return;
            }

            state.filters.products.keyword = "";
            state.filters.products.page = 1;
            syncAdminProductsUrl("");
            const productSearch = document.getElementById("admin-product-search");
            if (productSearch) {
                productSearch.value = "";
            }
            renderProductsPage(getFilteredProducts());
        });

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const keyword = input.value.trim();
            const pageKey = getPageKey();
            if (!keyword && pageKey === "admin-products") {
                state.filters.products.keyword = "";
                state.filters.products.page = 1;
                syncAdminProductsUrl("");
                renderProductsPage(getFilteredProducts());
                return;
            }

            if (!keyword) {
                return;
            }

            if (pageKey === "admin-products") {
                state.filters.products.keyword = keyword;
                state.filters.products.page = 1;
                syncAdminProductsUrl(keyword);
                renderProductsPage(getFilteredProducts(), { focusSearch: true });
                const productSearch = document.getElementById("admin-product-search");
                if (productSearch) {
                    productSearch.value = keyword;
                }
                return;
            }

            window.location.href = `admin-products.html?search=${encodeURIComponent(keyword)}`;
        });
    }

    function bindAdminLogout() {
        const logoutLink = document.getElementById("admin-logout-link");
        logoutLink?.addEventListener("click", (event) => {
            event.preventDefault();
            adminLogout();
        });
    }

    function protectAdminRoute() {
        const pageKey = getPageKey();
        if (pageKey === "admin-login") {
            if (isAdminLoggedIn()) {
                window.location.href = "admin-dashboard.html";
                return false;
            }

            return true;
        }

        if (!isAdminLoggedIn()) {
            clearAdminAuth();
            window.location.href = "admin-login.html";
            return false;
        }

        return true;
    }

    function getCategoryOptions(selectedValue = "") {
        return state.categories.map((category) => `
            <option value="${category.id}" ${String(category.id) === String(selectedValue) ? "selected" : ""}>
                ${escapeHtml(category.name)}
            </option>
        `).join("");
    }

    function createVariantRowMarkup(variant = {}, index = 0, isDefault = false) {
        const imageUrls = Array.isArray(variant.imageUrls) ? variant.imageUrls.slice(0, 4) : [];
        return `
            <div class="admin-variant-row" data-variant-row data-variant-index="${index}">
                <input type="text" data-variant-color placeholder="Color" value="${escapeHtml(variant.color || "")}">
                <input type="text" data-variant-label placeholder="1kg, 2kg, 5x100g" value="${escapeHtml(variant.label || "")}">
                <input type="number" step="0.01" min="0" data-variant-price placeholder="Price" value="${escapeHtml(variant.price || "")}">
                <input type="number" step="0.01" min="0" data-variant-discount placeholder="Discount" value="${escapeHtml(variant.discountPrice || "")}">
                <input type="number" min="0" data-variant-stock placeholder="Stock" value="${escapeHtml(variant.stockQuantity ?? "")}">
                <label class="admin-variant-default">
                    <input type="radio" name="defaultVariant" value="${index}" ${isDefault ? "checked" : ""}>
                    Default
                </label>
                <button class="admin-btn-outline admin-variant-remove" type="button" data-action="remove-variant-row" aria-label="Remove variant row">Remove</button>
                <div class="admin-image-slot-grid admin-variant-image-grid" data-variant-image-grid>
                    ${Array.from({ length: 4 }, (_, slotIndex) => {
                        const imageUrl = imageUrls[slotIndex] || "";
                        return `
                            <div class="admin-image-slot" data-variant-image-slot data-existing-image-url="${escapeHtml(imageUrl)}">
                                <label for="variant-image-file-${index + 1}-${slotIndex + 1}">Image ${slotIndex + 1}</label>
                                <input
                                    id="variant-image-file-${index + 1}-${slotIndex + 1}"
                                    class="variant-image-file"
                                    type="file"
                                    accept="image/*"
                                >
                                <span class="admin-upload-note">Choose 3 to 4 images for this pack option.</span>
                                ${imageUrl ? `<div class="admin-upload-preview"><img src="${resolveMediaUrl(imageUrl)}" alt="Variant image ${slotIndex + 1}"></div>` : ""}
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }

    function renderVariantRows(variants = []) {
        const safeVariants = Array.isArray(variants) && variants.length ? variants : [{}];
        const hasDefault = safeVariants.some((item) => item.defaultSelected);

        return safeVariants.map((variant, index) => createVariantRowMarkup(
            variant,
            index,
            variant.defaultSelected || (!hasDefault && index === 0)
        )).join("");
    }

    function renumberVariantRows(form) {
        const rows = Array.from(form.querySelectorAll("[data-variant-row]"));

        rows.forEach((row, index) => {
            row.dataset.variantIndex = String(index);
            const defaultInput = row.querySelector('input[name="defaultVariant"]');
            if (defaultInput) {
                defaultInput.value = String(index);
            }
        });

        if (!rows.length) {
            return;
        }

        const checkedDefault = form.querySelector('input[name="defaultVariant"]:checked');
        if (!checkedDefault) {
            const firstDefault = rows[0].querySelector('input[name="defaultVariant"]');
            if (firstDefault) {
                firstDefault.checked = true;
            }
        }
    }

    function ensureVariantControlsState(form) {
        const rows = Array.from(form.querySelectorAll("[data-variant-row]"));
        rows.forEach((row) => {
            const removeButton = row.querySelector('[data-action="remove-variant-row"]');
            if (removeButton) {
                removeButton.disabled = rows.length === 1;
            }
        });
    }

    function renderVariantImagePreview(slot, sourceUrl, altText) {
        if (!slot) {
            return;
        }

        let preview = slot.querySelector(".admin-upload-preview");
        if (!preview) {
            preview = document.createElement("div");
            preview.className = "admin-upload-preview";
            slot.appendChild(preview);
        }

        preview.innerHTML = `<img src="${escapeHtml(sourceUrl)}" alt="${escapeHtml(altText)}">`;
    }

    function bindVariantImagePreviews(form) {
        if (!form || form.dataset.variantImagePreviewsBound === "true") {
            return;
        }

        form.dataset.variantImagePreviewsBound = "true";

        form.addEventListener("change", (event) => {
            const input = event.target.closest(".variant-image-file");
            if (!input || !form.contains(input)) {
                return;
            }

            const slot = input.closest("[data-variant-image-slot]");
            if (!slot) {
                return;
            }

            const currentObjectUrl = slot.dataset.previewObjectUrl;
            if (currentObjectUrl) {
                URL.revokeObjectURL(currentObjectUrl);
                delete slot.dataset.previewObjectUrl;
            }

            const file = input.files?.[0];
            if (!file) {
                const existingUrl = String(slot.dataset.existingImageUrl || "").trim();
                if (existingUrl) {
                    renderVariantImagePreview(slot, resolveMediaUrl(existingUrl), "Variant image");
                } else {
                    slot.querySelector(".admin-upload-preview")?.remove();
                }
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            slot.dataset.previewObjectUrl = objectUrl;
            renderVariantImagePreview(slot, objectUrl, file.name || "Variant image");
        });
    }

    function appendVariantRow(form, variant = {}) {
        const list = form.querySelector(".admin-variant-list");
        if (!list) {
            return;
        }

        const rows = Array.from(form.querySelectorAll("[data-variant-row]"));
        const template = document.createElement("template");
        template.innerHTML = createVariantRowMarkup(variant, rows.length, rows.length === 0);
        list.appendChild(template.content.firstElementChild);
        renumberVariantRows(form);
        ensureVariantControlsState(form);
        syncProductBaseFieldsWithVariant(form);
    }

    function clearVariantRow(row) {
        row.querySelectorAll("input").forEach((input) => {
            if (input.type === "radio") {
                input.checked = false;
                return;
            }

            input.value = "";
        });
    }

    function bindVariantRowControls(form) {
        if (!form || form.dataset.variantControlsBound === "true") {
            return;
        }

        form.dataset.variantControlsBound = "true";

        form.addEventListener("click", (event) => {
            const addButton = event.target.closest('[data-action="add-variant-row"]');
            if (addButton && form.contains(addButton)) {
                appendVariantRow(form);
                return;
            }

            const removeButton = event.target.closest('[data-action="remove-variant-row"]');
            if (!removeButton || !form.contains(removeButton)) {
                return;
            }

            const row = removeButton.closest("[data-variant-row]");
            const rows = Array.from(form.querySelectorAll("[data-variant-row]"));
            if (!row) {
                return;
            }

            if (rows.length <= 1) {
                clearVariantRow(row);
                const defaultInput = row.querySelector('input[name="defaultVariant"]');
                if (defaultInput) {
                    defaultInput.checked = true;
                }
                syncProductBaseFieldsWithVariant(form);
                return;
            }

            const wasDefault = Boolean(row.querySelector('input[name="defaultVariant"]')?.checked);
            row.remove();
            renumberVariantRows(form);
            ensureVariantControlsState(form);

            if (wasDefault) {
                const firstDefault = form.querySelector('input[name="defaultVariant"]');
                if (firstDefault) {
                    firstDefault.checked = true;
                }
            }

            syncProductBaseFieldsWithVariant(form);
        });

        ensureVariantControlsState(form);
    }

    function syncProductBaseFieldsWithVariant(form) {
        const defaultIndex = Number(form.querySelector('input[name="defaultVariant"]:checked')?.value ?? 0);
        const rows = Array.from(form.querySelectorAll("[data-variant-row]"));
        const selectedRow = rows[defaultIndex];
        if (!selectedRow) {
            return;
        }

        const color = String(selectedRow.querySelector("[data-variant-color]")?.value || "").trim();
        const label = String(selectedRow.querySelector("[data-variant-label]")?.value || "").trim();
        const price = String(selectedRow.querySelector("[data-variant-price]")?.value || "").trim();
        const discount = String(selectedRow.querySelector("[data-variant-discount]")?.value || "").trim();
        const stock = String(selectedRow.querySelector("[data-variant-stock]")?.value || "").trim();

        const packInput = form.querySelector("#product-pack-size");
        const colorInput = form.querySelector("#product-color");
        const priceInput = form.querySelector("#product-price");
        const discountInput = form.querySelector("#product-discount-price");
        const stockInput = form.querySelector("#product-stock");

        if (colorInput && color) {
            colorInput.value = color;
        }

        if (packInput && label) {
            packInput.value = label;
        }

        if (priceInput && price) {
            priceInput.value = price;
        }

        if (discountInput) {
            discountInput.value = discount;
        }

        if (stockInput && stock) {
            stockInput.value = stock;
        }
    }

    function productFormMarkup(product = {}) {
        const imageUrls = Array.isArray(product.images)
            ? product.images.map((image) => image.imageUrl).join("\n")
            : Array.isArray(product.imageUrls)
                ? product.imageUrls.join("\n")
                : "";
        const imageSlotValues = imageUrls.split("\n").map((value) => value.trim()).filter(Boolean);
        const imageSlots = Array.from({ length: 4 }, (_, index) => imageSlotValues[index] || "");

        return `
            <form class="admin-form-grid" id="admin-product-form">
                <div class="admin-field">
                    <label for="product-name">Product Name</label>
                    <input id="product-name" name="name" type="text" value="${escapeHtml(product.name || "")}" required>
                </div>
                <div class="admin-field">
                    <label for="product-sku">SKU</label>
                    <input id="product-sku" name="sku" type="text" value="${escapeHtml(product.sku || "")}" required>
                </div>
                <div class="admin-field">
                    <label for="product-category">Category</label>
                    <select id="product-category" name="categoryId" required>
                        <option value="">Select category</option>
                        ${getCategoryOptions(product.category?.id || product.categoryId)}
                    </select>
                </div>
                <div class="admin-field">
                    <label for="product-pet-type">Pet Type</label>
                    <input id="product-pet-type" name="petType" type="text" value="${escapeHtml(product.petType || "")}">
                </div>
                <div class="admin-field">
                    <label for="product-type">Product Type</label>
                    <input id="product-type" name="productType" type="text" list="product-type-options" value="${escapeHtml(product.productType || "")}" placeholder="Food, Leash, Toy, Treat, Dress, Accessories, Grooming Accessories">
                    <datalist id="product-type-options">
                        <option value="Food"></option>
                        <option value="Leash"></option>
                        <option value="Toy"></option>
                        <option value="Treat"></option>
                        <option value="Dress"></option>
                        <option value="Accessories"></option>
                        <option value="Litter Box"></option>
                        <option value="Grooming Accessories"></option>
                        <option value="Cage"></option>
                        <option value="Pet Care"></option>
                    </datalist>
                </div>
                <div class="admin-field">
                    <label for="product-brand">Brand</label>
                    <input id="product-brand" name="brand" type="text" value="${escapeHtml(product.brand || "")}">
                </div>
                <div class="admin-field">
                    <label for="product-age-type">Age Type</label>
                    <input id="product-age-type" name="ageType" type="text" value="${escapeHtml(product.ageType || "")}">
                </div>
                <div class="admin-field field-full">
                    <label for="product-breed-compatibility">Breed Compatibility</label>
                    <textarea id="product-breed-compatibility" name="breedCompatibility" placeholder="Example: Labrador, Golden Retriever, Indie">${escapeHtml(product.breedCompatibility || "")}</textarea>
                </div>
                <div class="admin-field">
                    <label for="product-color">Color</label>
                    <input id="product-color" name="color" type="text" value="${escapeHtml(product.color || "")}" placeholder="Red, Black, White">
                </div>
                <div class="admin-field">
                    <label for="product-size">Size</label>
                    <input id="product-size" name="size" type="text" value="${escapeHtml(product.size || "")}" placeholder="Small, Medium, Large">
                </div>
                <div class="admin-field">
                    <label for="product-material">Material</label>
                    <input id="product-material" name="material" type="text" value="${escapeHtml(product.material || "")}" placeholder="Nylon, Rubber, Leather">
                </div>
                <div class="admin-field">
                    <label for="product-pack-size">Pack Size</label>
                    <input id="product-pack-size" name="packSize" type="text" value="${escapeHtml(product.packSize || "")}" placeholder="500g, 10kg, 12 sticks">
                </div>
                <div class="admin-field">
                    <label for="product-weight-range">Weight Range</label>
                    <input id="product-weight-range" name="weightRange" type="text" value="${escapeHtml(product.weightRange || "")}" placeholder="5-15 kg, 2-20 kg">
                </div>
                <div class="admin-field">
                    <label for="product-price">Price</label>
                    <input id="product-price" name="price" type="number" step="0.01" min="0" value="${escapeHtml(product.price || "")}" required>
                </div>
                <div class="admin-field">
                    <label for="product-discount-price">Discount Price</label>
                    <input id="product-discount-price" name="discountPrice" type="number" step="0.01" min="0" value="${escapeHtml(product.discountPrice || "")}">
                </div>
                <div class="admin-field">
                    <label for="product-stock">Stock Quantity</label>
                    <input id="product-stock" name="stockQuantity" type="number" min="0" value="${escapeHtml(product.stockQuantity || 0)}" required>
                </div>
                <div class="admin-field">
                    <label for="product-weight-size">Weight / Size</label>
                    <input id="product-weight-size" name="weightSize" type="text" value="${escapeHtml(product.weightSize || "")}">
                </div>
                <div class="admin-field">
                    <label for="product-flavour">Flavour</label>
                    <input id="product-flavour" name="flavour" type="text" value="${escapeHtml(product.flavour || "")}">
                </div>
                <div class="admin-field field-full">
                    <label>Pack Options</label>
                    <div class="admin-variant-list">
                        <div class="admin-variant-head">
                            <span>Color</span>
                            <span>Pack</span>
                            <span>Price</span>
                            <span>Offer</span>
                            <span>Stock</span>
                            <span>Default</span>
                        </div>
                        ${renderVariantRows(product.variants)}
                    </div>
                    <div class="admin-action-row admin-variant-actions">
                        <button class="admin-btn-outline" type="button" data-action="add-variant-row">Add Pack Option</button>
                    </div>
                    <span class="admin-upload-note">Add pack options with their own color and 3 to 4 images. Leave unused rows blank.</span>
                </div>
                <div class="admin-field">
                    <label for="product-featured">Featured</label>
                    <select id="product-featured" name="featured">
                        <option value="true" ${product.featured ? "selected" : ""}>Yes</option>
                        <option value="false" ${product.featured ? "" : "selected"}>No</option>
                    </select>
                </div>
                <div class="admin-field">
                    <label for="product-active">Active</label>
                    <select id="product-active" name="active">
                        <option value="true" ${product.active !== false ? "selected" : ""}>Yes</option>
                        <option value="false" ${product.active === false ? "selected" : ""}>No</option>
                    </select>
                </div>
                <div class="admin-field field-full">
                    <label for="product-description">Description</label>
                    <textarea id="product-description" name="description">${escapeHtml(product.description || "")}</textarea>
                </div>
                <div class="admin-field field-full">
                    <label for="product-highlights">Highlights</label>
                    <textarea id="product-highlights" name="highlights">${escapeHtml(product.highlights || "")}</textarea>
                </div>
                <div class="admin-field field-full">
                    <label>Product Images</label>
                    <div class="admin-image-slot-grid">
                        ${imageSlots.map((value, index) => `
                            <div class="admin-image-slot" data-image-slot data-existing-image-url="${escapeHtml(value)}">
                                <label for="product-image-file-${index + 1}">Image ${index + 1}</label>
                                <input
                                    id="product-image-file-${index + 1}"
                                    class="product-image-file"
                                    name="imageFileSlot${index + 1}"
                                    type="file"
                                    accept="image/*"
                                >
                                <span class="admin-upload-note">Choose from desktop. ${value ? "Current image shown below." : "No image selected yet."}</span>
                                ${value ? `<div class="admin-upload-preview"><img src="${resolveMediaUrl(value)}" alt="Product image ${index + 1}"></div>` : ""}
                            </div>
                        `).join("")}
                    </div>
                    <span class="admin-upload-note">Pick 3 to 4 desktop images. Any empty slot stays empty.</span>
                </div>
                <div class="field-full admin-action-row">
                    <button class="admin-btn" type="submit">Save Product</button>
                </div>
            </form>
        `;
    }

    function renderBulkImportMarkup() {
        return `
            <article class="admin-workspace-card admin-bulk-import-card">
                <div class="admin-bulk-import-head">
                    <div>
                        <span class="eyebrow">Bulk Upload</span>
                        <h3>Upload up to 100 products</h3>
                        <p class="muted">Import Excel or CSV files. Each row becomes one product, and blank pack-option rows are treated as a single variant.</p>
                    </div>
                    <div class="admin-bulk-import-badges">
                        <span>Excel / CSV</span>
                        <span>100 rows max</span>
                    </div>
                </div>
                <form class="admin-bulk-import-form" id="admin-bulk-import-form">
                    <div class="admin-field">
                        <label for="admin-bulk-import-file">Bulk file</label>
                        <input id="admin-bulk-import-file" type="file" accept=".xlsx,.xls,.csv" required>
                        <span class="admin-upload-note">Use the template so headers match. Fill either Category ID or Category Name.</span>
                    </div>
                    <div class="admin-action-row admin-bulk-import-actions">
                        <button class="admin-btn-outline" type="button" id="admin-bulk-template-download">Download Template</button>
                        <button class="admin-btn" type="submit" id="admin-bulk-upload-submit">Upload Products</button>
                    </div>
                </form>
                <div class="admin-bulk-import-status is-idle" id="admin-bulk-import-status">
                    <p class="muted">No bulk file uploaded yet.</p>
                </div>
            </article>
        `;
    }

    function escapeCsvCell(value) {
        const text = String(value ?? "");
        if (text.includes('"') || text.includes(",") || text.includes("\n")) {
            return `"${text.replaceAll('"', '""')}"`;
        }

        return text;
    }

    function getBulkImportTemplateCsv() {
        const headers = [
            "name",
            "sku",
            "categoryId",
            "categoryName",
            "petType",
            "productType",
            "brand",
            "description",
            "highlights",
            "price",
            "discountPrice",
            "stockQuantity",
            "color",
            "size",
            "material",
            "packSize",
            "weightRange",
            "weightSize",
            "flavour",
            "ageType",
            "breedCompatibility",
            "featured",
            "active",
            "imageUrls"
        ];

        const sampleRow = [
            "Premium Chew Toy",
            "LEO-TOY-101",
            "",
            "Toys",
            "Dog",
            "Toy",
            "PlayPaws",
            "Durable chew toy for active dogs.",
            "Bite resistant|Easy to clean|Fun to play",
            "299",
            "249",
            "80",
            "Blue",
            "Small",
            "Rubber",
            "Standard",
            "2-20 kg",
            "",
            "",
            "All Ages",
            "All Dog Breeds",
            "true",
            "true",
            ""
        ];

        return `${headers.map(escapeCsvCell).join(",")}\n${sampleRow.map(escapeCsvCell).join(",")}\n`;
    }

    function downloadBulkImportTemplate() {
        const blob = new Blob([getBulkImportTemplateCsv()], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "leo-product-bulk-template.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
    }

    function renderBulkImportStatus(result = null) {
        const statusRoot = document.getElementById("admin-bulk-import-status");
        if (!statusRoot) {
            return;
        }

        if (!result) {
            statusRoot.className = "admin-bulk-import-status is-idle";
            statusRoot.innerHTML = `<p class="muted">No bulk file uploaded yet.</p>`;
            return;
        }

        const statusClass = result.failureCount > 0
            ? (result.successCount > 0 ? "is-warning" : "is-error")
            : "is-success";

        const rows = Array.isArray(result.rows) ? result.rows : [];
        const errorRows = rows.filter((row) => !row.success).slice(0, 8);
        const successLabel = `${result.successCount || 0} succeeded`;
        const failureLabel = `${result.failureCount || 0} failed`;

        statusRoot.className = `admin-bulk-import-status ${statusClass}`;
        statusRoot.innerHTML = `
            <div class="admin-bulk-import-summary">
                <strong>${successLabel}</strong>
                <span>${failureLabel}</span>
                <span>${result.totalRows || 0} total rows</span>
            </div>
            ${errorRows.length ? `
                <div class="admin-bulk-import-errors">
                    <h4>Rows to fix</h4>
                    <ul>
                        ${errorRows.map((row) => `
                            <li>
                                <strong>Row ${row.rowNumber}</strong>
                                <span>${escapeHtml(row.message || "Import failed")}</span>
                            </li>
                        `).join("")}
                    </ul>
                </div>
            ` : `<p class="muted">All rows imported successfully.</p>`}
        `;
    }

    async function uploadBulkProductFile(file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/admin/products/bulk-import`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`
            },
            body: formData
        });

        const payload = await parseResponse(response);
        if (!response.ok) {
            throw new Error(
                extractErrorMessage(payload, `Bulk upload failed with status ${response.status}`)
            );
        }

        return payload?.data || payload;
    }

    function bindBulkImportPanel() {
        const form = document.getElementById("admin-bulk-import-form");
        const fileInput = document.getElementById("admin-bulk-import-file");
        const submitButton = document.getElementById("admin-bulk-upload-submit");
        const templateButton = document.getElementById("admin-bulk-template-download");

        templateButton?.addEventListener("click", downloadBulkImportTemplate);

        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!fileInput?.files?.[0]) {
                showFlashMessage("Please choose a bulk upload file.", "error");
                return;
            }

            const file = fileInput.files[0];
            submitButton.disabled = true;
            submitButton.textContent = "Uploading...";
            renderBulkImportStatus({
                totalRows: 0,
                successCount: 0,
                failureCount: 0,
                rows: []
            });

            try {
                const result = await uploadBulkProductFile(file);
                renderBulkImportStatus(result);
                showFlashMessage(
                    `Bulk upload finished: ${result.successCount || 0} imported, ${result.failureCount || 0} failed.`,
                    result.failureCount ? "info" : "success"
                );
                if (fileInput) {
                    fileInput.value = "";
                }
            } catch (error) {
                renderBulkImportStatus(null);
                handleAdminRequestError(error, "Unable to upload bulk file.");
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Upload Products";
            }
        });
    }

    async function readProductForm(form) {
        const formData = new FormData(form);
        const slotInputs = Array.from(form.querySelectorAll(".product-image-file"));
        const imageUrls = [];

        for (const slotInput of slotInputs) {
            const existingUrl = String(slotInput.closest("[data-image-slot]")?.dataset.existingImageUrl || "").trim();
            const selectedFile = slotInput.files?.[0];

            if (selectedFile) {
                const uploadedUrl = await uploadAdminImage(selectedFile);
                if (uploadedUrl) {
                    imageUrls.push(uploadedUrl);
                }
                continue;
            }

            if (existingUrl) {
                imageUrls.push(existingUrl);
            }
        }

        imageUrls.length = Math.min(imageUrls.length, 4);
        const variantRows = Array.from(form.querySelectorAll("[data-variant-row]"));
        const defaultVariantIndex = Number(form.querySelector('input[name="defaultVariant"]:checked')?.value ?? 0);
        const categoryId = Number(formData.get("categoryId"));
        const price = Number(formData.get("price"));
        const stockQuantity = Number(formData.get("stockQuantity"));
        const baseStockQuantity = Number(formData.get("stockQuantity"));
        const basePackSize = String(formData.get("packSize") || "").trim();
        const baseWeightSize = String(formData.get("weightSize") || "").trim();
        const fallbackVariantLabel = basePackSize || baseWeightSize || "Default";

        const variants = [];
        const variantRowDebug = [];
        const readVariantValue = (row, selector, fallbackIndex) => {
            let field = row.querySelector(selector);

            if (!field) {
                const fields = Array.from(row.querySelectorAll('input:not([type="radio"]):not([type="file"])'));
                field = fields[fallbackIndex] || null;
            }

            return String(field?.value || "").trim();
        };

        for (const [index, row] of variantRows.entries()) {
            const colorValue = readVariantValue(row, "[data-variant-color]", 0);
            const label = readVariantValue(row, "[data-variant-label]", 1);
            const priceValue = readVariantValue(row, "[data-variant-price]", 2);
            const discountValue = readVariantValue(row, "[data-variant-discount]", 3);
            const stockValue = readVariantValue(row, "[data-variant-stock]", 4);
            const variantImageSlots = Array.from(row.querySelectorAll("[data-variant-image-slot]"));
            const defaultInput = row.querySelector('input[name="defaultVariant"]');

            const variantImageUrls = [];
            let hasVariantContent = Boolean(colorValue || label || priceValue || discountValue || stockValue);

            for (const imageSlot of variantImageSlots) {
                const existingUrl = String(imageSlot.dataset.existingImageUrl || "").trim();
                const selectedFile = imageSlot.querySelector(".variant-image-file")?.files?.[0];

                if (selectedFile) {
                    const uploadedUrl = await uploadAdminImage(selectedFile);
                    if (uploadedUrl) {
                        variantImageUrls.push(uploadedUrl);
                        hasVariantContent = true;
                    }
                    continue;
                }

                if (existingUrl) {
                    variantImageUrls.push(existingUrl);
                    hasVariantContent = true;
                }
            }

            variantRowDebug.push({
                index,
                color: colorValue,
                label,
                price: priceValue,
                discountPrice: discountValue,
                stockQuantity: stockValue,
                imageCount: variantImageUrls.length,
                defaultSelected: Boolean(defaultInput?.checked),
                hasVariantContent
            });

            if (!hasVariantContent) {
                continue;
            }

            const variantLabel = label || fallbackVariantLabel;

            variants.push({
                color: colorValue,
                label: variantLabel,
                price: priceValue ? Number(priceValue) : null,
                discountPrice: discountValue ? Number(discountValue) : null,
                stockQuantity: stockValue ? Number(stockValue) : 0,
                defaultSelected: Boolean(defaultInput?.checked) || index === defaultVariantIndex,
                displayOrder: index + 1,
                imageUrls: variantImageUrls.slice(0, 4)
            });
        }

        if (variants.length && !variants.some((variant) => variant.defaultSelected)) {
            variants[0].defaultSelected = true;
        }

        rememberAdminDebugLog("PRODUCT VARIANT ROWS READ", variantRowDebug);
        rememberAdminDebugLog("PRODUCT VARIANTS TO SAVE", variants);

        const selectedVariant = variants.find((variant) => variant.defaultSelected) || variants[0];

        if (!Number.isFinite(categoryId) || categoryId <= 0) {
            throw new Error("Please select a valid product category.");
        }

        if (!Number.isFinite(price) || price <= 0) {
            throw new Error("Please enter a valid product price.");
        }

        if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
            throw new Error("Please enter a valid stock quantity.");
        }

        const payload = {
            name: String(formData.get("name") || "").trim(),
            sku: String(formData.get("sku") || "").trim(),
            categoryId,
            petType: String(formData.get("petType") || "").trim(),
            productType: String(formData.get("productType") || "").trim(),
            brand: String(formData.get("brand") || "").trim(),
            description: String(formData.get("description") || "").trim(),
            highlights: String(formData.get("highlights") || "").trim(),
            price,
            stockQuantity,
            color: String(formData.get("color") || "").trim(),
            weightSize: String(formData.get("weightSize") || "").trim(),
            flavour: String(formData.get("flavour") || "").trim(),
            ageType: String(formData.get("ageType") || "").trim(),
            breedCompatibility: String(formData.get("breedCompatibility") || "").trim(),
            size: String(formData.get("size") || "").trim(),
            material: String(formData.get("material") || "").trim(),
            packSize: String(formData.get("packSize") || "").trim(),
            weightRange: String(formData.get("weightRange") || "").trim(),
            featured: String(formData.get("featured")) === "true",
            active: String(formData.get("active")) === "true",
            imageUrls,
            variants
        };

        const discountPrice = String(formData.get("discountPrice") || "").trim();
        payload.discountPrice = discountPrice ? Number(discountPrice) : null;

        if (selectedVariant) {
            if (selectedVariant.color) {
                payload.color = selectedVariant.color;
            }

            if (selectedVariant.price != null) {
                payload.price = selectedVariant.price;
            }

            if (selectedVariant.discountPrice != null) {
                payload.discountPrice = selectedVariant.discountPrice;
            }

            if (!Number.isNaN(baseStockQuantity)) {
                selectedVariant.stockQuantity = baseStockQuantity;
                payload.stockQuantity = baseStockQuantity;
            } else if (selectedVariant.stockQuantity != null) {
                payload.stockQuantity = selectedVariant.stockQuantity;
            }

            payload.packSize = selectedVariant.label;
        } else {
            payload.packSize = basePackSize;
        }

        return payload;
    }

    async function loadCategoriesCache() {
        state.categories = normalizeList(await fetchAdminData("/admin/categories"));
        return state.categories;
    }

    async function loadProductsPage() {
        const content = getAdminContentRoot();
        if (!content) {
            return;
        }

        setPageContent(renderLoading("Loading products..."));

        try {
            await loadCategoriesCache();
            const productData = await fetchAdminData("/admin/products?page=0&size=500");
            state.products = normalizeList(productData);
            const initialSearch = new URLSearchParams(window.location.search).get("search");
            if (initialSearch && !state.filters.products.keyword) {
                state.filters.products.keyword = initialSearch.trim();
                const topbarSearch = document.getElementById("admin-nav-search-input");
                if (topbarSearch) {
                    topbarSearch.value = state.filters.products.keyword;
                }
            }
            if (getPageKey() === "admin-products") {
                syncAdminProductsUrl(state.filters.products.keyword);
            }
            renderProductsPage(getFilteredProducts());
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to load products.")) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message || "Unable to load products.")}</section>`);
            }
        }
    }

    function renderProductsPage(products, options = {}) {
        const topbarSearch = document.getElementById("admin-nav-search-input");
        if (topbarSearch && topbarSearch.value !== state.filters.products.keyword) {
            topbarSearch.value = state.filters.products.keyword;
        }
        if (getPageKey() === "admin-products") {
            syncAdminProductsUrl(state.filters.products.keyword);
        }

        const pagination = paginateList(products, Number(state.filters.products.page || 1), ADMIN_PRODUCTS_PAGE_SIZE);
        state.filters.products.page = pagination.currentPage;
        const rows = pagination.items.map((product) => `
            <tr class="admin-product-row">
                <td data-label="Product">
                    <strong>${escapeHtml(product.name)}</strong>
                    <div class="muted">${escapeHtml(product.sku || "")}</div>
                </td>
                <td data-label="Category">${escapeHtml(product.category?.name || "Uncategorized")}</td>
                <td data-label="Type">${escapeHtml(product.productType || "General")}</td>
                <td data-label="Price">${formatCurrency(product.discountPrice || product.price)}</td>
                <td data-label="Stock">${escapeHtml(product.stockQuantity ?? 0)}</td>
                <td data-label="Status">${statusBadge(product.active ? "ACTIVE" : "INACTIVE")}</td>
                <td data-label="Featured">${statusBadge(product.featured ? "FEATURED" : "STANDARD")}</td>
                <td data-label="Actions">
                    <div class="admin-action-row admin-action-row-compact">
                        <button class="admin-btn-soft" type="button" data-action="edit-product" data-id="${product.id}" title="Edit product">Edit</button>
                        <button class="admin-btn-outline" type="button" data-action="stock-product" data-id="${product.id}" title="Update stock">Stock</button>
                        <button class="admin-btn-outline" type="button" data-action="toggle-product-status" data-id="${product.id}" title="${product.active ? "Disable product" : "Enable product"}">${product.active ? "Disable" : "Enable"}</button>
                        <button class="admin-btn-outline" type="button" data-action="toggle-product-featured" data-id="${product.id}" title="${product.featured ? "Remove featured" : "Mark featured"}">${product.featured ? "Unfeature" : "Feature"}</button>
                        <button class="admin-btn-outline is-danger" type="button" data-action="delete-product" data-id="${product.id}" title="Delete product">Delete</button>
                    </div>
                </td>
            </tr>
        `).join("");

        setPageContent(createTableCard(
            "Product Catalog",
            "Create products, update stock, and control active or featured visibility.",
            `
                <div class="admin-toolbar-actions">
                    <input class="admin-search" type="search" id="admin-product-search" placeholder="Search products" value="${escapeHtml(state.filters.products.keyword)}">
                    <select class="admin-filter" id="admin-product-category-filter">
                        <option value="">All Categories</option>
                        ${state.categories.map((category) => `<option value="${escapeHtml(category.name)}" ${state.filters.products.category === category.name ? "selected" : ""}>${escapeHtml(category.name)}</option>`).join("")}
                    </select>
                    <button class="admin-btn" type="button" id="admin-open-product-create">Add Product</button>
                </div>
            `,
            products.length ? `
                <div class="admin-results-meta">
                    Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} products
                </div>
                <table class="admin-table admin-products-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "product-page")}
            ` : renderEmptyState("No products found yet.")
        ));

        bindProductsPage();
        if (options.focusSearch) {
            const searchInput = document.getElementById("admin-product-search");
            if (searchInput) {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            }
        }
    }

    function bindProductsPage() {
        const searchInput = document.getElementById("admin-product-search");
        const categoryFilter = document.getElementById("admin-product-category-filter");
        const createButton = document.getElementById("admin-open-product-create");
        const content = getAdminContentRoot();

        const applyFilters = (options = {}) => {
            state.filters.products.keyword = (searchInput?.value || "").trim();
            state.filters.products.category = categoryFilter?.value || "";
            state.filters.products.page = 1;
            renderProductsPage(getFilteredProducts(), options);
        };

        searchInput?.addEventListener("input", () => {
            window.clearTimeout(adminProductSearchTimer);
            adminProductSearchTimer = window.setTimeout(() => {
                applyFilters({ focusSearch: true });
            }, 220);
        });
        categoryFilter?.addEventListener("change", () => applyFilters());
        createButton?.addEventListener("click", () => openProductModal());

        content?.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", async () => {
                const action = button.dataset.action;
                if (action === "product-page") {
                    state.filters.products.page = Number(button.dataset.page || 1);
                    renderProductsPage(getFilteredProducts());
                    return;
                }

                const id = Number(button.dataset.id);
                const product = state.products.find((item) => item.id === id);
                if (!product) {
                    return;
                }

                if (action === "edit-product") {
                    await openProductModal(product);
                    return;
                }

                if (action === "stock-product") {
                    openStockModal(product);
                    return;
                }

                if (action === "toggle-product-status") {
                    await updateProductFlag(product.id, "status", "active", !product.active);
                    return;
                }

                if (action === "toggle-product-featured") {
                    await updateProductFlag(product.id, "featured", "featured", !product.featured);
                    return;
                }

                if (action === "delete-product") {
                    const confirmed = window.confirm(`Delete "${product.name}"?`);
                    if (!confirmed) {
                        return;
                    }

                    try {
                        await submitAdminData(`/admin/products/${product.id}`, "DELETE");
                        showFlashMessage("Product deleted successfully.", "success");
                        await loadProductsPage();
                    } catch (error) {
                        handleAdminRequestError(error, "Unable to delete product.");
                    }
                }
            });
        });
    }

    async function openProductModal(product = null) {
        let productData = product || {};

        if (product?.id) {
            try {
                productData = await fetchAdminData(`/admin/products/${product.id}`);
            } catch (error) {
                console.warn(`Unable to load full product details for edit modal: ${error.message}`);
            }
        }

        const title = productData?.id ? "Edit Product" : "Add Product";
        openAdminModal(title, productFormMarkup(productData || {}));
        const form = document.getElementById("admin-product-form");
        bindVariantRowControls(form);
        bindVariantImagePreviews(form);

        form?.addEventListener("input", (event) => {
            if (event.target.closest("[data-variant-row]")) {
                syncProductBaseFieldsWithVariant(form);
            }
        });

        form?.addEventListener("change", (event) => {
            if (event.target.matches('input[name="defaultVariant"]')) {
                syncProductBaseFieldsWithVariant(form);
            }
        });

        syncProductBaseFieldsWithVariant(form);

        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            rememberAdminDebugLog("PRODUCT FORM SUBMIT STARTED", {
                mode: productData?.id ? "EDIT" : "CREATE",
                page: getPageKey()
            });
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = "Saving...";

            try {
                const payload = await readProductForm(form);
                rememberAdminDebugLog("PRODUCT SAVE PAYLOAD", payload);
                if (!payload) {
                    throw new Error("Please complete any filled pack option rows, or leave them blank for a single variant.");
                }
                if (!payload.categoryId) {
                    throw new Error("Please select a category.");
                }

                if (productData?.id) {
                    const response = await submitAdminData(`/admin/products/${productData.id}`, "PUT", payload);
                    rememberAdminDebugLog("PRODUCT SAVE RESPONSE", response);
                    showFlashMessage("Product updated successfully.", "success");
                } else {
                    const response = await submitAdminData("/admin/products", "POST", payload);
                    rememberAdminDebugLog("PRODUCT SAVE RESPONSE", response);
                    showFlashMessage("Product created successfully.", "success");
                }

                closeAdminModal();
                await loadProductsPage();
            } catch (error) {
                rememberAdminDebugLog("PRODUCT SAVE ERROR", {
                    message: error?.message || "Unknown product save error",
                    stack: error?.stack || ""
                });
                handleAdminRequestError(error, "Unable to save product.");
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Save Product";
            }
        });
    }

    function openStockModal(product) {
        openAdminModal("Update Stock", `
            <form class="admin-subsection" id="admin-stock-form">
                <p><strong>${escapeHtml(product.name)}</strong></p>
                <div class="admin-field">
                    <label for="admin-stock-quantity">Stock Quantity</label>
                    <input id="admin-stock-quantity" type="number" min="0" value="${escapeHtml(product.stockQuantity ?? 0)}" required>
                </div>
                <div class="admin-action-row">
                    <button class="admin-btn" type="submit">Update Stock</button>
                </div>
            </form>
        `);

        const form = document.getElementById("admin-stock-form");
        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const quantity = Number(document.getElementById("admin-stock-quantity")?.value);

            try {
                await submitAdminData(`/admin/products/${product.id}/stock?stockQuantity=${quantity}`, "PUT");
                showFlashMessage("Stock updated successfully.", "success");
                closeAdminModal();
                await loadProductsPage();
            } catch (error) {
                handleAdminRequestError(error, "Unable to update stock.");
            }
        });
    }

    async function updateProductFlag(productId, endpointSuffix, queryKey, value) {
        try {
            await submitAdminData(`/admin/products/${productId}/${endpointSuffix}?${queryKey}=${value}`, "PUT");
            showFlashMessage("Product updated successfully.", "success");
            await loadProductsPage();
        } catch (error) {
            handleAdminRequestError(error, "Unable to update product.");
        }
    }

    async function loadStandaloneAddProductPage() {
        setPageContent(renderLoading("Preparing product form..."));

        try {
            await loadCategoriesCache();
            setPageContent(`
                <section class="admin-panel">
                    <div class="admin-panel-header">
                        <div>
                            <h3>New Product</h3>
                            <p class="muted">Complete the product details below and publish when ready.</p>
                        </div>
                    </div>
                    <div class="admin-product-workspace">
                        <article class="admin-workspace-card">
                            ${productFormMarkup()}
                        </article>
                        ${renderBulkImportMarkup()}
                    </div>
                </section>
            `);

            const form = document.getElementById("admin-product-form");
            bindVariantRowControls(form);
            bindVariantImagePreviews(form);
            form?.addEventListener("input", (event) => {
                if (event.target.closest("[data-variant-row]")) {
                    syncProductBaseFieldsWithVariant(form);
                }
            });

            form?.addEventListener("change", (event) => {
                if (event.target.matches('input[name="defaultVariant"]')) {
                    syncProductBaseFieldsWithVariant(form);
                }
            });

            syncProductBaseFieldsWithVariant(form);

            form?.addEventListener("submit", async (event) => {
                event.preventDefault();
                event.stopPropagation();
                rememberAdminDebugLog("PRODUCT FORM SUBMIT STARTED", {
                    mode: "CREATE",
                    page: getPageKey()
                });
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = "Saving...";

                try {
                    const payload = await readProductForm(form);
                    rememberAdminDebugLog("PRODUCT SAVE PAYLOAD", payload);
                    if (!payload) {
                        throw new Error("Please complete any filled pack option rows, or leave them blank for a single variant.");
                    }
                    if (!payload.categoryId) {
                        throw new Error("Please select a category.");
                    }

                    const response = await submitAdminData("/admin/products", "POST", payload);
                    rememberAdminDebugLog("PRODUCT SAVE RESPONSE", response);
                    showFlashMessage("Product created successfully.", "success");
                    showInlinePageNotice("Product created successfully. You can add another product or open Products to view it.", "success");
                    form.reset();
                    syncProductBaseFieldsWithVariant(form);
                } catch (error) {
                    rememberAdminDebugLog("PRODUCT SAVE ERROR", {
                        message: error?.message || "Unknown product save error",
                        stack: error?.stack || ""
                    });
                    handleAdminRequestError(error, "Unable to create product.");
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = "Save Product";
                }
            });

            bindBulkImportPanel();
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to prepare product form.")) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message)}</section>`);
            }
        }
    }

    async function loadCategoriesPage() {
        setPageContent(renderLoading("Loading categories..."));

        try {
            state.categories = normalizeList(await fetchAdminData("/admin/categories"));
            renderCategoriesPage(getFilteredCategories());
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to load categories.")) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message)}</section>`);
            }
        }
    }

    function renderCategoriesPage(categories) {
        const pagination = paginateList(categories, Number(state.filters.categories.page || 1), ADMIN_CATEGORIES_PAGE_SIZE);
        state.filters.categories.page = pagination.currentPage;
        const rows = pagination.items.map((category) => `
            <tr class="admin-category-row">
                <td data-label="Name"><strong>${escapeHtml(category.name)}</strong></td>
                <td data-label="Description">${escapeHtml(category.description || "No description added.")}</td>
                <td data-label="Status">${statusBadge(category.active ? "ACTIVE" : "INACTIVE")}</td>
                <td data-label="Created">${formatDateOnly(category.createdAt)}</td>
                <td data-label="Actions">
                    <div class="admin-action-row admin-action-row-compact">
                        <button class="admin-btn-soft" type="button" data-action="edit-category" data-id="${category.id}">Edit</button>
                        <button class="admin-btn-outline" type="button" data-action="toggle-category-status" data-id="${category.id}">${category.active ? "Disable" : "Enable"}</button>
                        <button class="admin-btn-outline" type="button" data-action="delete-category" data-id="${category.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join("");

        setPageContent(createTableCard(
            "Category Management",
            "Add categories, update details, and control visibility.",
            `
                <div class="admin-toolbar-actions">
                    <input class="admin-search" type="search" id="admin-category-search" placeholder="Search categories" value="${escapeHtml(state.filters.categories.keyword)}">
                    <button class="admin-btn" type="button" id="admin-open-category-create">New Category</button>
                </div>
            `,
            categories.length ? `
                <div class="admin-results-meta">
                    Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} categories
                </div>
                <table class="admin-table admin-categories-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "category-page")}
            ` : renderEmptyState("No categories available.")
        ));

        bindCategoriesPage();
    }

    function bindCategoriesPage() {
        const searchInput = document.getElementById("admin-category-search");
        document.getElementById("admin-open-category-create")?.addEventListener("click", () => openCategoryModal());

        searchInput?.addEventListener("input", () => {
            const shouldRefocus = document.activeElement === searchInput;
            const cursorPosition = searchInput.selectionStart;
            state.filters.categories.keyword = searchInput.value.trim();
            state.filters.categories.page = 1;
            renderCategoriesPage(getFilteredCategories());
            if (shouldRefocus) {
                requestAnimationFrame(() => {
                    const nextSearchInput = document.getElementById("admin-category-search");
                    if (!nextSearchInput) {
                        return;
                    }

                    nextSearchInput.focus({ preventScroll: true });
                    if (cursorPosition != null) {
                        nextSearchInput.setSelectionRange(cursorPosition, cursorPosition);
                    }
                });
            }
        });

        getAdminContentRoot()?.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", async () => {
                const action = button.dataset.action;
                if (action === "category-page") {
                    state.filters.categories.page = Number(button.dataset.page || 1);
                    renderCategoriesPage(getFilteredCategories());
                    return;
                }

                const category = state.categories.find((item) => item.id === Number(button.dataset.id));
                if (!category) {
                    return;
                }

                if (action === "edit-category") {
                    openCategoryModal(category);
                    return;
                }

                if (action === "toggle-category-status") {
                    try {
                        await submitAdminData(`/admin/categories/${category.id}/status?active=${!category.active}`, "PUT");
                        showFlashMessage("Category status updated successfully.", "success");
                        await loadCategoriesPage();
                    } catch (error) {
                        handleAdminRequestError(error, "Unable to update category status.");
                    }
                    return;
                }

                if (action === "delete-category") {
                    const confirmed = window.confirm(`Delete "${category.name}"?`);
                    if (!confirmed) {
                        return;
                    }

                    try {
                        await submitAdminData(`/admin/categories/${category.id}`, "DELETE");
                        showFlashMessage("Category deleted successfully.", "success");
                        await loadCategoriesPage();
                    } catch (error) {
                        handleAdminRequestError(error, "Unable to delete category.");
                    }
                }
            });
        });
    }

    function openCategoryModal(category = null) {
        openAdminModal(category ? "Edit Category" : "Add Category", `
            <form class="admin-form-grid" id="admin-category-form">
                <div class="admin-field">
                    <label for="category-name">Name</label>
                    <input id="category-name" name="name" type="text" value="${escapeHtml(category?.name || "")}" required>
                </div>
                <div class="admin-field">
                    <label for="category-active">Active</label>
                    <select id="category-active" name="active">
                        <option value="true" ${category?.active !== false ? "selected" : ""}>Yes</option>
                        <option value="false" ${category?.active === false ? "selected" : ""}>No</option>
                    </select>
                </div>
                <div class="admin-field field-full">
                    <label for="category-description">Description</label>
                    <textarea id="category-description" name="description">${escapeHtml(category?.description || "")}</textarea>
                </div>
                <div class="admin-field field-full">
                    <label for="category-image-url">Image URL</label>
                    <input id="category-image-url" name="imageUrl" type="text" value="${escapeHtml(category?.imageUrl || "")}">
                </div>
                <div class="admin-field field-full">
                    <label for="category-image-file">Upload Image From Desktop</label>
                    <div class="admin-upload-grid">
                        <input id="category-image-file" name="imageFile" type="file" accept="image/*">
                        <span class="admin-upload-note">File choose pannina adhu upload aagi image URL-a replace pannum.</span>
                        ${category?.imageUrl ? `<div class="admin-upload-preview"><img src="${resolveMediaUrl(category.imageUrl)}" alt="${escapeHtml(category.name || "Category")}"></div>` : ""}
                    </div>
                </div>
                <div class="field-full admin-action-row">
                    <button class="admin-btn" type="submit">Save Category</button>
                </div>
            </form>
        `);

        const form = document.getElementById("admin-category-form");
        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            let imageUrl = String(formData.get("imageUrl") || "").trim();

            try {
                const imageFile = form.querySelector("#category-image-file")?.files?.[0];
                if (imageFile) {
                    imageUrl = await uploadAdminImage(imageFile);
                }
            } catch (error) {
                handleAdminRequestError(error, "Unable to upload category image.");
                return;
            }

            const payload = {
                name: String(formData.get("name") || "").trim(),
                description: String(formData.get("description") || "").trim(),
                imageUrl,
                active: String(formData.get("active")) === "true"
            };

            try {
                if (category?.id) {
                    await submitAdminData(`/admin/categories/${category.id}`, "PUT", payload);
                    showFlashMessage("Category updated successfully.", "success");
                } else {
                    await submitAdminData("/admin/categories", "POST", payload);
                    showFlashMessage("Category created successfully.", "success");
                }

                closeAdminModal();
                await loadCategoriesPage();
            } catch (error) {
                handleAdminRequestError(error, "Unable to save category.");
            }
        });
    }

    function formatDateInputValue(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getDashboardDateRange() {
        const filter = state.filters.dashboardAnalytics;
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        if (filter.range === "today") {
            return {
                label: "Today",
                from: formatDateInputValue(startOfToday),
                to: formatDateInputValue(endOfToday)
            };
        }

        if (filter.range === "7days") {
            const start = new Date(startOfToday);
            start.setDate(start.getDate() - 6);
            return {
                label: "Last 7 days",
                from: formatDateInputValue(start),
                to: formatDateInputValue(endOfToday)
            };
        }

        if (filter.range === "custom") {
            return {
                label: "Custom range",
                from: filter.from || "",
                to: filter.to || ""
            };
        }

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
            label: "This month",
            from: formatDateInputValue(monthStart),
            to: formatDateInputValue(endOfToday)
        };
    }

    function isDateInDashboardRange(value, range) {
        if (!value) {
            return false;
        }

        const comparable = String(value).slice(0, 10);
        return (!range.from || comparable >= range.from) && (!range.to || comparable <= range.to);
    }

    function countByField(items = [], fieldName) {
        return items.reduce((counts, item) => {
            const key = String(item?.[fieldName] || "UNKNOWN").toUpperCase();
            counts[key] = (counts[key] || 0) + 1;
            return counts;
        }, {});
    }

    function renderDashboardQuickFilters() {
        const filter = state.filters.dashboardAnalytics;
        const options = [
            ["today", "Today"],
            ["7days", "Last 7 days"],
            ["month", "This month"],
            ["custom", "Custom"]
        ];

        return `
            <section class="admin-dashboard-filter-card">
                <div>
                    <span class="eyebrow">Analytics window</span>
                    <h3>Business overview</h3>
                    <p class="muted">Filter charts and operational panels without changing store data.</p>
                </div>
                <div class="admin-dashboard-filter-actions">
                    ${options.map(([value, label]) => `
                        <button class="admin-pill ${filter.range === value ? "is-active" : ""}" type="button" data-action="dashboard-range" data-range="${value}">${label}</button>
                    `).join("")}
                    <input class="admin-filter" type="date" value="${escapeHtml(filter.from)}" data-dashboard-date="from" ${filter.range === "custom" ? "" : "disabled"}>
                    <input class="admin-filter" type="date" value="${escapeHtml(filter.to)}" data-dashboard-date="to" ${filter.range === "custom" ? "" : "disabled"}>
                    <button class="admin-btn-outline" type="button" id="admin-dashboard-refresh">Reload</button>
                </div>
            </section>
        `;
    }

    function renderDashboardKpiCards(cards) {
        return `
            <section class="admin-stats-grid admin-dashboard-kpi-grid">
                ${cards.map((card) => `
                    <article class="admin-stat-card admin-dashboard-kpi-card">
                        <span>${escapeHtml(card.label)}</span>
                        <strong>${escapeHtml(card.value)}</strong>
                        <em>${escapeHtml(card.note || "")}</em>
                    </article>
                `).join("")}
            </section>
        `;
    }

    function renderSalesTrendChart(items = []) {
        if (!items.length) {
            return renderEmptyState("No data available yet");
        }

        const trendItems = items.slice().sort((first, second) => String(first.period).localeCompare(String(second.period)));
        const maxSales = Math.max(...trendItems.map((item) => Number(item.totalSales || 0)), 1);

        return `
            <div class="admin-sales-chart">
                ${trendItems.map((item) => {
                    const height = Math.max(8, Math.round((Number(item.totalSales || 0) / maxSales) * 100));
                    return `
                        <div class="admin-sales-bar" title="${escapeHtml(item.period)} - ${escapeHtml(formatCurrency(item.totalSales))}">
                            <span style="height:${height}%"></span>
                            <strong>${escapeHtml(String(item.period || "").slice(5) || item.period)}</strong>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderDashboardSplitChart(title, subtitle, counts) {
        const entries = Object.entries(counts || {}).filter(([, value]) => Number(value) > 0);
        const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);

        if (!entries.length) {
            return `
                <article class="admin-panel">
                    <div class="admin-panel-header">
                        <div>
                            <h3>${escapeHtml(title)}</h3>
                            <p class="muted">${escapeHtml(subtitle)}</p>
                        </div>
                    </div>
                    ${renderEmptyState("No data available yet")}
                </article>
            `;
        }

        let cursor = 0;
        const colors = ["#f00000", "#111111", "#ff7b7b", "#f3b0b0", "#7a1f1f", "#d8d8d8"];
        const gradient = entries.map(([, value], index) => {
            const start = cursor;
            cursor += (Number(value) / total) * 100;
            return `${colors[index % colors.length]} ${start}% ${cursor}%`;
        }).join(", ");

        return `
            <article class="admin-panel admin-dashboard-split-card">
                <div class="admin-panel-header">
                    <div>
                        <h3>${escapeHtml(title)}</h3>
                        <p class="muted">${escapeHtml(subtitle)}</p>
                    </div>
                </div>
                <div class="admin-donut-shell">
                    <div class="admin-donut-chart" style="background: conic-gradient(${gradient});">
                        <strong>${escapeHtml(total)}</strong>
                    </div>
                    <div class="admin-donut-legend">
                        ${entries.map(([label, value], index) => `
                            <span><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(toSentenceCase(label))}: <strong>${escapeHtml(value)}</strong></span>
                        `).join("")}
                    </div>
                </div>
            </article>
        `;
    }

    function renderDashboardStockAlerts(items = []) {
        const alertItems = items
            .filter((item) => Number(item.stockQuantity || 0) <= 5)
            .slice()
            .sort((first, second) => Number(first.stockQuantity || 0) - Number(second.stockQuantity || 0))
            .slice(0, 6);

        if (!alertItems.length) {
            return renderEmptyState("No data available yet");
        }

        return `
            <div class="admin-dashboard-alert-list">
                ${alertItems.map((item) => `
                    <article>
                        <div>
                            <strong>${escapeHtml(item.productName)}</strong>
                            <span>${escapeHtml(item.sku || item.categoryName || "Inventory")}</span>
                        </div>
                        ${Number(item.stockQuantity || 0) <= 0 ? statusBadge("OUT_OF_STOCK") : `<b>${escapeHtml(item.stockQuantity)} left</b>`}
                    </article>
                `).join("")}
            </div>
        `;
    }

    function renderDashboardTopProducts(items = []) {
        const topItems = items
            .slice()
            .sort((first, second) => Number(second.totalSales || 0) - Number(first.totalSales || 0))
            .slice(0, 5);

        if (!topItems.length) {
            return renderEmptyState("No data available yet");
        }

        return `
            <div class="admin-dashboard-rank-list">
                ${topItems.map((item, index) => `
                    <article>
                        <span>#${index + 1}</span>
                        <div>
                            <strong>${escapeHtml(item.productName)}</strong>
                            <small>${escapeHtml(item.categoryName || "Uncategorized")} · ${escapeHtml(item.totalQuantitySold || 0)} sold</small>
                        </div>
                        <b>${formatCurrency(item.totalSales)}</b>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function renderDashboardReportShortcuts() {
        const shortcuts = [
            ["Daily Sales Report", "admin-reports.html#daily-sales"],
            ["Product Performance", "admin-reports.html#product-performance"],
            ["Stock Report", "admin-reports.html#stock-report"],
            ["Customer Report", "admin-reports.html#customer-report"],
            ["Download Reports", "admin-reports.html"]
        ];

        return `
            <section class="admin-dashboard-shortcuts">
                ${shortcuts.map(([label, href]) => `
                    <a class="admin-btn-outline" href="${escapeHtml(href)}">${escapeHtml(label)}</a>
                `).join("")}
            </section>
        `;
    }

    function bindDashboardAnalyticsControls() {
        document.getElementById("admin-dashboard-refresh")?.addEventListener("click", loadDashboardPage);

        getAdminContentRoot()?.querySelectorAll("[data-action='dashboard-range']").forEach((button) => {
            button.addEventListener("click", () => {
                state.filters.dashboardAnalytics.range = button.dataset.range || "month";
                loadDashboardPage();
            });
        });

        getAdminContentRoot()?.querySelectorAll("[data-dashboard-date]").forEach((field) => {
            field.addEventListener("change", () => {
                state.filters.dashboardAnalytics.range = "custom";
                state.filters.dashboardAnalytics[field.dataset.dashboardDate] = field.value;
                loadDashboardPage();
            });
        });
    }

    function renderDashboardRecentOrders(orders, pagination) {
        if (!orders.length) {
            return renderEmptyState("No recent orders available.");
        }

        return `
            <div class="admin-results-meta">
                Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} orders
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagination.items.map((order) => `
                        <tr>
                            <td>${escapeHtml(order.orderNumber)}</td>
                            <td>${escapeHtml(order.customerName || order.user?.name || order.address?.fullName || "Customer")}</td>
                            <td>${formatCurrency(order.totalAmount)}</td>
                            <td>${statusBadge(order.paymentStatus || order.payment?.paymentStatus)}</td>
                            <td>${statusBadge(order.orderStatus)}</td>
                            <td>${formatDateTime(order.createdAt)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "dashboard-recent-orders-page")}
        `;
    }

    async function loadDashboardPage() {
        setPageContent(renderLoading("Loading dashboard metrics..."));

        try {
            const [dashboard, dailySales, monthlySales, productReport, stockReport, ordersResponse] = await Promise.all([
                fetchAdminData("/admin/dashboard"),
                fetchAdminData("/admin/reports/sales/daily").catch(() => []),
                fetchAdminData("/admin/reports/sales/monthly").catch(() => []),
                fetchAdminData("/admin/reports/products").catch(() => []),
                fetchAdminData("/admin/reports/stock").catch(() => []),
                fetchAdminData("/admin/orders").catch(() => [])
            ]);
            const allOrders = normalizeList(ordersResponse);
            const recentOrders = allOrders.length ? allOrders.slice().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)) : (dashboard.recentOrders || []);
            const dateRange = getDashboardDateRange();
            const filteredDailySales = normalizeList(dailySales).filter((item) => isDateInDashboardRange(item.period, dateRange));
            const filteredOrders = allOrders.filter((order) => isDateInDashboardRange(order.createdAt, dateRange));
            const productItems = normalizeList(productReport);
            const stockItems = normalizeList(stockReport);
            const monthKey = formatDateInputValue(new Date()).slice(0, 7);
            const thisMonthSales = normalizeList(monthlySales).find((item) => item.period === monthKey)?.totalSales || 0;
            const cancelledOrders = allOrders.filter((order) => order.orderStatus === "CANCELLED").length;
            const outOfStockProducts = stockItems.filter((item) => Number(item.stockQuantity || 0) <= 0).length;
            const salesEligibleOrders = allOrders.filter((order) =>
                String(order.paymentStatus || order.payment?.paymentStatus || "").toUpperCase() === "PAID"
                || order.orderStatus === "DELIVERED"
            );
            const averageOrderValue = salesEligibleOrders.length
                ? Number(dashboard.totalSales || 0) / salesEligibleOrders.length
                : 0;
            const pagination = paginateList(
                recentOrders,
                Number(state.filters.dashboardRecentOrders.page || 1),
                ADMIN_DASHBOARD_RECENT_ORDER_PAGE_SIZE
            );
            state.filters.dashboardRecentOrders.page = pagination.currentPage;

            setPageContent(`
                ${renderDashboardQuickFilters()}
                ${renderDashboardKpiCards([
                    { label: "Total Sales", value: formatCurrency(dashboard.totalSales), note: "Paid + delivered revenue" },
                    { label: "Today Sales", value: formatCurrency(dashboard.todaySales), note: "Current day" },
                    { label: "This Month Sales", value: formatCurrency(thisMonthSales), note: monthKey },
                    { label: "Total Orders", value: dashboard.totalOrders, note: "All order statuses" },
                    { label: "Pending Orders", value: dashboard.pendingOrders, note: "Need attention" },
                    { label: "Delivered Orders", value: dashboard.deliveredOrders, note: "Completed" },
                    { label: "Cancelled Orders", value: cancelledOrders, note: "Cancelled count" },
                    { label: "Average Order Value", value: formatCurrency(averageOrderValue), note: "Revenue / paid orders" },
                    { label: "Low Stock Products", value: dashboard.lowStockProductsCount ?? stockItems.filter((item) => Number(item.stockQuantity || 0) <= 5).length, note: "At or below 5 units" },
                    { label: "Out of Stock Products", value: outOfStockProducts, note: "Needs restock" }
                ])}
                <section class="admin-dashboard-chart-grid">
                    <article class="admin-panel admin-dashboard-wide-card">
                        <div class="admin-panel-header">
                            <div>
                                <h3>Sales Trend</h3>
                                <p class="muted">${escapeHtml(dateRange.label)} sales movement from daily sales report.</p>
                            </div>
                        </div>
                        ${renderSalesTrendChart(filteredDailySales)}
                    </article>
                    ${renderDashboardSplitChart("Order Status", `${dateRange.label} order mix`, countByField(filteredOrders, "orderStatus"))}
                    ${renderDashboardSplitChart("Payment Method", `${dateRange.label} payment split`, countByField(filteredOrders, "paymentMethod"))}
                </section>
                <section class="admin-grid admin-dashboard-ops-grid">
                    ${createTableCard(
                        "Low Stock Alerts",
                        "Products that need quick inventory attention.",
                        `<a class="admin-btn-outline" href="admin-reports.html#stock-report">Open Stock Report</a>`,
                        renderDashboardStockAlerts(stockItems)
                    )}
                    ${createTableCard(
                        "Top Selling Products",
                        "Revenue leaders from the product performance report.",
                        `<a class="admin-btn-outline" href="admin-reports.html#product-performance">Open Product Report</a>`,
                        renderDashboardTopProducts(productItems)
                    )}
                </section>
                ${renderDashboardReportShortcuts()}
                <section class="admin-grid">
                    ${createTableCard(
                        "Recent Orders",
                        "Latest customer orders and fulfillment status.",
                        `<a class="admin-btn-outline" href="admin-orders.html">Manage Orders</a>`,
                        renderDashboardRecentOrders(recentOrders, pagination)
                    )}
                </section>
            `);

            bindDashboardAnalyticsControls();
            getAdminContentRoot()?.querySelectorAll("[data-action='dashboard-recent-orders-page']").forEach((button) => {
                button.addEventListener("click", () => {
                    state.filters.dashboardRecentOrders.page = Number(button.dataset.page || 1);
                    loadDashboardPage();
                });
            });
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to load dashboard.")) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message)}</section>`);
            }
        }
    }

    async function loadOrdersPage() {
        setPageContent(renderLoading("Loading orders..."));

        try {
            state.orders = normalizeList(await fetchAdminData("/admin/orders"));
            renderOrdersPage(getFilteredOrders());
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to load orders.")) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message)}</section>`);
            }
        }
    }

    function renderOrdersPage(orders, options = {}) {
        const pagination = paginateList(orders, Number(state.filters.orders.page || 1), ADMIN_ORDERS_PAGE_SIZE);
        state.filters.orders.page = pagination.currentPage;
        const rows = pagination.items.map((order) => `
            <tr>
                <td>
                    <strong>${escapeHtml(order.orderNumber || `Order #${order.id}`)}</strong>
                    <div class="muted">Order ID: ${escapeHtml(order.id ?? "N/A")}</div>
                    <div class="muted">${formatDateTime(order.createdAt)}</div>
                </td>
                <td>${escapeHtml(order.user?.name || order.address?.fullName || "Customer")}</td>
                <td>${formatCurrency(order.totalAmount)}</td>
                <td>${statusBadge(order.paymentStatus)}</td>
                <td>${statusBadge(order.orderStatus)}</td>
                <td>
                    <div class="admin-action-row">
                        <button class="admin-btn-soft" type="button" data-action="view-order" data-id="${order.id}">View</button>
                        ${hasDeliveryPin(order.address) ? `<a class="admin-btn-outline" href="${escapeHtml(getGoogleMapLink(order.address))}" target="_blank" rel="noopener noreferrer">Map</a>` : ""}
                        <button class="admin-btn-outline" type="button" data-action="update-order-status" data-id="${order.id}">Status</button>
                        <button class="admin-btn-outline" type="button" data-action="update-payment-status" data-id="${order.id}">Payment</button>
                    </div>
                </td>
            </tr>
        `).join("");

        setPageContent(createTableCard(
            "Order Queue",
            "Review orders, then update fulfillment and payment states.",
            `
                <div class="admin-toolbar-actions">
                    <input class="admin-search" type="search" id="admin-order-search" placeholder="Search order number or customer" value="${escapeHtml(state.filters.orders.keyword)}">
                    <select class="admin-filter" id="admin-order-status-filter">
                        <option value="">All Statuses</option>
                        ${ORDER_STATUSES.map((status) => `<option value="${status}" ${state.filters.orders.status === status ? "selected" : ""}>${toSentenceCase(status)}</option>`).join("")}
                    </select>
                </div>
            `,
            orders.length ? `
                <div class="admin-results-meta">
                    Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} orders
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "order-page")}
            ` : renderEmptyState("No orders found.")
        ));

        bindOrdersPage();
        if (options.focusSearch) {
            const searchInput = document.getElementById("admin-order-search");
            if (searchInput) {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            }
        }
    }

    function bindOrdersPage() {
        const searchInput = document.getElementById("admin-order-search");
        const statusFilter = document.getElementById("admin-order-status-filter");

        const applyFilters = () => {
            state.filters.orders.keyword = (searchInput?.value || "").trim();
            state.filters.orders.status = statusFilter?.value || "";
            state.filters.orders.page = 1;
            renderOrdersPage(getFilteredOrders(), { focusSearch: true });
        };

        searchInput?.addEventListener("input", () => {
            window.clearTimeout(adminOrderSearchTimer);
            adminOrderSearchTimer = window.setTimeout(() => {
                applyFilters();
            }, 220);
        });
        statusFilter?.addEventListener("change", applyFilters);

        getAdminContentRoot()?.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", async () => {
                const action = button.dataset.action;
                if (action === "order-page") {
                    state.filters.orders.page = Number(button.dataset.page || 1);
                    renderOrdersPage(getFilteredOrders());
                    return;
                }
                const order = state.orders.find((item) => item.id === Number(button.dataset.id));
                if (!order) {
                    return;
                }

                if (action === "view-order") {
                    openOrderDetailsModal(order.id);
                    return;
                }

                if (action === "update-order-status") {
                    openOrderStatusModal(order);
                    return;
                }

                if (action === "update-payment-status") {
                    openPaymentStatusModal(order);
                }
            });
        });
    }

    function hasDeliveryPin(address = {}) {
        const latitude = Number(address.latitude);
        const longitude = Number(address.longitude);
        return Number.isFinite(latitude)
            && Number.isFinite(longitude)
            && !(latitude === 0 && longitude === 0);
    }

    function getGoogleMapLink(address = {}) {
        if (address.googleMapLink) {
            return address.googleMapLink;
        }

        if (!hasDeliveryPin(address)) {
            return "";
        }

        const latitude = Number(address.latitude);
        const longitude = Number(address.longitude);
        return `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`;
    }

    function getGoogleDirectionLink(address = {}) {
        if (address.googleDirectionLink) {
            return address.googleDirectionLink;
        }

        if (!hasDeliveryPin(address)) {
            return "";
        }

        const latitude = Number(address.latitude);
        const longitude = Number(address.longitude);
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`;
    }

    function renderDeliveryLocationActions(address = {}) {
        if (!hasDeliveryPin(address)) {
            return `<p class="muted">Location pin not available for this order.</p>`;
        }

        const directionLink = getGoogleDirectionLink(address);
        const mapLink = getGoogleMapLink(address);

        return `
            <div class="admin-action-row" style="margin-top:0.85rem;">
                <a class="admin-btn-soft" href="${escapeHtml(directionLink)}" target="_blank" rel="noopener noreferrer">View Direction</a>
                <a class="admin-btn-outline" href="${escapeHtml(mapLink)}" target="_blank" rel="noopener noreferrer">View Map Pin</a>
            </div>
        `;
    }

    async function openOrderDetailsModal(orderId) {
        openAdminModal("Order Details", renderLoading("Loading order details..."));

        try {
            const order = await fetchAdminData(`/admin/orders/${orderId}`);
            const items = order.orderItems || [];
            const address = order.address || {};

            openAdminModal("Order Details", `
                <section class="admin-subsection">
                    <div class="admin-details-grid">
                        <div class="admin-detail-card">
                            <strong>${escapeHtml(order.orderNumber || `Order #${order.id}`)}</strong>
                            <span>${statusBadge(order.orderStatus)} ${statusBadge(order.paymentStatus)}</span>
                        </div>
                        <div class="admin-detail-card">
                            <strong>Total Amount</strong>
                            <span>${formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>
                    <div class="admin-detail-card">
                        <strong>Shipping Address</strong>
                        <p>${escapeHtml(address.fullName || "")}</p>
                        <p>${escapeHtml(address.phone || "")}</p>
                        <p>${[address.address, address.area, address.city, address.state].filter(Boolean).map(escapeHtml).join(", ")}${address.pincode ? ` - ${escapeHtml(address.pincode)}` : ""}</p>
                        ${address.landmark ? `<p class="muted">Landmark: ${escapeHtml(address.landmark)}</p>` : ""}
                        ${address.deliveryInstructions ? `<p class="muted">Instructions: ${escapeHtml(address.deliveryInstructions)}</p>` : ""}
                        ${renderDeliveryLocationActions(address)}
                    </div>
                    <div class="admin-detail-card">
                        <strong>Items</strong>
                        ${items.length ? `
                            <div class="summary-stack">
                                ${items.map((item) => `
                                    <div class="table-item">
                                        <span>${escapeHtml(item.productName)} x ${escapeHtml(item.quantity)}</span>
                                        <strong>${formatCurrency(item.totalPrice)}</strong>
                                    </div>
                                `).join("")}
                            </div>
                        ` : "<p>No order items returned.</p>"}
                    </div>
                </section>
            `);
        } catch (error) {
            handleAdminRequestError(error, "Unable to fetch order details.");
            closeAdminModal();
        }
    }

    function openOrderStatusModal(order) {
        openAdminModal("Update Order Status", `
            <form class="admin-subsection" id="admin-order-status-form">
                <p><strong>${escapeHtml(order.orderNumber || `Order #${order.id}`)}</strong></p>
                <div class="admin-field">
                    <label for="admin-order-status-value">Order Status</label>
                    <select id="admin-order-status-value">
                        ${ORDER_STATUSES.map((status) => `
                            <option value="${status}" ${order.orderStatus === status ? "selected" : ""}>${toSentenceCase(status)}</option>
                        `).join("")}
                    </select>
                </div>
                <div class="admin-action-row">
                    <button class="admin-btn" type="submit">Save Status</button>
                </div>
            </form>
        `);

        document.getElementById("admin-order-status-form")?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const orderStatus = document.getElementById("admin-order-status-value")?.value;

            try {
                const response = await submitAdminData(`/admin/orders/${order.id}/status`, "PUT", { orderStatus });
                const updatedOrder = response?.data || null;
                if (updatedOrder) {
                    state.orders = state.orders.map((item) => item.id === order.id ? updatedOrder : item);
                    renderOrdersPage(getFilteredOrders());
                }
                closeAdminModal();
                showFlashMessage("Order status updated successfully.", "success");
                showInlinePageNotice("Order status updated successfully.", "success");
            } catch (error) {
                handleAdminRequestError(error, "Unable to update order status.");
            }
        });
    }

    function openPaymentStatusModal(order) {
        openAdminModal("Update Payment Status", `
            <form class="admin-subsection" id="admin-payment-status-form">
                <p><strong>${escapeHtml(order.orderNumber || `Order #${order.id}`)}</strong></p>
                <div class="admin-field">
                    <label for="admin-payment-status-value">Payment Status</label>
                    <select id="admin-payment-status-value">
                        ${PAYMENT_STATUSES.map((status) => `
                            <option value="${status}" ${order.paymentStatus === status ? "selected" : ""}>${toSentenceCase(status)}</option>
                        `).join("")}
                    </select>
                </div>
                <div class="admin-field">
                    <label for="admin-payment-transaction">Transaction ID</label>
                    <input id="admin-payment-transaction" type="text" value="${escapeHtml(order.payment?.transactionId || "")}">
                </div>
                <div class="admin-action-row">
                    <button class="admin-btn" type="submit">Save Payment Status</button>
                </div>
            </form>
        `);

        document.getElementById("admin-payment-status-form")?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const paymentStatus = document.getElementById("admin-payment-status-value")?.value;
            const transactionId = document.getElementById("admin-payment-transaction")?.value.trim();

            try {
                const response = await submitAdminData(`/admin/orders/${order.id}/payment-status`, "PUT", { paymentStatus, transactionId });
                const updatedOrder = response?.data || null;
                if (updatedOrder) {
                    state.orders = state.orders.map((item) => item.id === order.id ? updatedOrder : item);
                    renderOrdersPage(getFilteredOrders());
                }
                showFlashMessage("Payment status updated successfully.", "success");
                closeAdminModal();
            } catch (error) {
                handleAdminRequestError(error, "Unable to update payment status.");
            }
        });
    }

    async function loadUsersPage() {
        setPageContent(renderLoading("Loading users..."));

        try {
            state.users = normalizeList(await fetchAdminData("/admin/reports/customers"));
            renderUsersPage(getFilteredUsers());
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to load users.")) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message)}</section>`);
            }
        }
    }

    function renderUsersPage(users, options = {}) {
        const pagination = paginateList(users, Number(state.filters.users.page || 1), ADMIN_USERS_PAGE_SIZE);
        state.filters.users.page = pagination.currentPage;
        const rows = pagination.items.map((user) => `
            <tr>
                <td>
                    <strong>${escapeHtml(user.name)}</strong>
                    <div class="muted">${formatDateTime(user.joinedAt)}</div>
                </td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.phone || "N/A")}</td>
                <td>${escapeHtml(user.totalOrders ?? 0)}</td>
                <td>${formatCurrency(user.totalSpent)}</td>
                <td>
                    <div class="admin-action-row admin-action-row-compact">
                        <button class="admin-btn-soft" type="button" data-action="view-customer-details" data-id="${user.userId}">View Details</button>
                    </div>
                </td>
            </tr>
        `).join("");

        setPageContent(createTableCard(
            "Customer List",
            "Customer data is sourced from the backend customer report API.",
            `
                <div class="admin-toolbar-actions">
                    <input class="admin-search" type="search" id="admin-user-search" placeholder="Search customers" value="${escapeHtml(state.filters.users.keyword)}">
                    <button class="admin-btn-outline" type="button" id="admin-users-refresh">Refresh</button>
                </div>
            `, 
            users.length ? `
                <div class="admin-results-meta">
                    Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} customers
                </div>
                <div class="admin-table-scroll">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Orders</th>
                                <th>Total Spent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
                ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "user-page")}
            ` : renderEmptyState("No customers found.")
        ));

        document.getElementById("admin-users-refresh")?.addEventListener("click", loadUsersPage);
        const searchInput = document.getElementById("admin-user-search");
        searchInput?.addEventListener("input", () => {
            window.clearTimeout(adminUserSearchTimer);
            adminUserSearchTimer = window.setTimeout(() => {
                state.filters.users.keyword = searchInput.value.trim();
                state.filters.users.page = 1;
                renderUsersPage(getFilteredUsers(), { focusSearch: true });
            }, 220);
        });

        getAdminContentRoot()?.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", () => {
                if (button.dataset.action === "user-page") {
                    state.filters.users.page = Number(button.dataset.page || 1);
                    renderUsersPage(getFilteredUsers());
                    return;
                }

                if (button.dataset.action === "view-customer-details") {
                    openCustomerDetailsModal(Number(button.dataset.id));
                }
            });
        });

        if (options.focusSearch && searchInput) {
            searchInput.focus();
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }
    }

    function renderCustomerOrders(orderDetail) {
        if (!orderDetail?.orders?.length) {
            return renderEmptyState("No orders found for this customer.");
        }

        return `
            <div class="admin-customer-orders">
                ${orderDetail.orders.map((order) => `
                    <article class="admin-customer-order-card">
                        <div class="admin-customer-order-top">
                            <div>
                                <strong>${escapeHtml(order.orderNumber)}</strong>
                                <p class="muted">${formatDateTime(order.createdAt)}</p>
                            </div>
                            <div class="admin-customer-order-meta">
                                ${statusBadge(order.orderStatus)}
                                ${statusBadge(order.paymentStatus)}
                            </div>
                        </div>
                        <div class="admin-customer-order-body">
                            <div class="admin-customer-order-pill">
                                <span>Items</span>
                                <strong>${escapeHtml(order.itemCount ?? 0)}</strong>
                            </div>
                            <div class="admin-customer-order-pill">
                                <span>Total</span>
                                <strong>${formatCurrency(order.totalAmount)}</strong>
                            </div>
                        </div>
                        <div class="admin-action-row admin-customer-order-actions">
                            <button class="admin-btn-soft" type="button" data-action="print-customer-receipt" data-id="${order.id}">Print Receipt</button>
                        </div>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function renderCustomerDetailsModal(detail) {
        const address = detail.deliveryAddress;
        const addressHtml = address ? `
            <div class="admin-detail-card admin-customer-address-card">
                <div class="admin-detail-card-head">
                    <strong>Delivery Address</strong>
                    ${address.defaultAddress ? '<span class="admin-badge">Default</span>' : ""}
                </div>
                <p>${escapeHtml(address.fullName || detail.name || "Customer")}</p>
                <p>${escapeHtml(address.phone || detail.phone || "")}</p>
                <p>${escapeHtml(address.email || detail.email || "")}</p>
                <p>${escapeHtml(address.address || "")}, ${escapeHtml(address.city || "")}, ${escapeHtml(address.state || "")} - ${escapeHtml(address.pincode || "")}</p>
                ${address.landmark ? `<p class="muted">${escapeHtml(address.landmark)}</p>` : ""}
            </div>
        ` : `
            <div class="admin-detail-card">
                <strong>Delivery Address</strong>
                <p class="muted">No saved delivery address found.</p>
            </div>
        `;

        const paginationHtml = detail.totalPages > 1 ? `
            <div class="admin-pagination admin-modal-pagination">
                <button class="admin-pagination-btn" type="button" data-action="customer-detail-page" data-page="${detail.currentPage - 1}" ${detail.currentPage === 1 ? "disabled" : ""}>Previous</button>
                <div class="admin-pagination-pages">
                    ${Array.from({ length: detail.totalPages }, (_, index) => index + 1)
                        .filter((page) => page === 1 || page === detail.totalPages || Math.abs(page - detail.currentPage) <= 1)
                        .map((page, index, pages) => `
                            ${index > 0 && page > pages[index - 1] + 1 ? '<span class="admin-pagination-ellipsis">...</span>' : ""}
                            <button class="admin-pagination-number ${page === detail.currentPage ? "is-active" : ""}" type="button" data-action="customer-detail-page" data-page="${page}">${page}</button>
                        `).join("")}
                </div>
                <button class="admin-pagination-btn" type="button" data-action="customer-detail-page" data-page="${detail.currentPage + 1}" ${detail.currentPage === detail.totalPages ? "disabled" : ""}>Next</button>
            </div>
        ` : "";

        return `
            <section class="admin-subsection admin-customer-detail-shell">
                <div class="admin-customer-detail-hero">
                    <div>
                        <span class="eyebrow">View customer details</span>
                        <h3>${escapeHtml(detail.name || "Customer")}</h3>
                        <p class="muted">Customer profile and recent order history.</p>
                    </div>
                    <div class="admin-customer-detail-stats">
                        <article class="admin-stat-mini">
                            <span>Orders</span>
                            <strong>${escapeHtml(detail.totalOrders ?? 0)}</strong>
                        </article>
                        <article class="admin-stat-mini">
                            <span>Joined</span>
                            <strong>${formatDateTime(detail.joinedAt || detail.createdAt)}</strong>
                        </article>
                    </div>
                </div>
                <section class="admin-details-grid admin-customer-contact-grid">
                    <div class="admin-detail-card">
                        <strong>Customer Name</strong>
                        <p>${escapeHtml(detail.name || "N/A")}</p>
                    </div>
                    <div class="admin-detail-card">
                        <strong>Phone Number</strong>
                        <p>${escapeHtml(detail.phone || "N/A")}</p>
                    </div>
                    <div class="admin-detail-card">
                        <strong>Email</strong>
                        <p>${escapeHtml(detail.email || "N/A")}</p>
                    </div>
                </section>
                ${addressHtml}
                <div class="admin-detail-card">
                    <div class="admin-detail-card-head">
                        <strong>Order History</strong>
                        <span class="muted">Page ${detail.currentPage} of ${detail.totalPages}</span>
                    </div>
                    ${renderCustomerOrders(detail)}
                    ${paginationHtml}
                </div>
            </section>
        `;
    }

    function buildReceiptHtml(order) {
        const customer = order.user || {};
        const address = order.address || {};
        const items = Array.isArray(order.orderItems) ? order.orderItems : [];
        const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Receipt ${escapeHtml(order.orderNumber || `Order #${order.id}`)}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #111; background: #fff; }
                    .receipt { max-width: 760px; margin: 0 auto; border: 1px solid #ddd; border-radius: 20px; padding: 24px; }
                    .receipt-head { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 16px; }
                    .receipt-title { margin: 0; font-size: 22px; }
                    .muted { color: #666; }
                    .summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
                    .box { border: 1px solid #eee; border-radius: 16px; padding: 12px 14px; }
                    .items { display: grid; gap: 10px; margin-top: 16px; }
                    .item { display: flex; justify-content: space-between; gap: 16px; border: 1px solid #eee; border-radius: 14px; padding: 12px 14px; }
                    .totals { margin-top: 18px; display: grid; gap: 8px; }
                    .total-line { display: flex; justify-content: space-between; gap: 16px; }
                    @media print { body { padding: 0; } .receipt { border: 0; border-radius: 0; } }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="receipt-head">
                        <div>
                            <h1 class="receipt-title">Leo's Pet Barkery</h1>
                            <div class="muted">Order receipt</div>
                        </div>
                        <div class="muted">${formatDateTime(order.createdAt)}</div>
                    </div>
                    <div class="summary">
                        <div class="box">
                            <strong>Order No</strong>
                            <div>${escapeHtml(order.orderNumber || `Order #${order.id}`)}</div>
                        </div>
                        <div class="box">
                            <strong>Status</strong>
                            <div>${escapeHtml(toSentenceCase(order.orderStatus || ""))}</div>
                        </div>
                        <div class="box">
                            <strong>Customer</strong>
                            <div>${escapeHtml(customer.name || address.fullName || "Customer")}</div>
                        </div>
                        <div class="box">
                            <strong>Phone</strong>
                            <div>${escapeHtml(customer.phone || address.phone || "N/A")}</div>
                        </div>
                        <div class="box">
                            <strong>Email</strong>
                            <div>${escapeHtml(customer.email || address.email || "N/A")}</div>
                        </div>
                        <div class="box">
                            <strong>Items</strong>
                            <div>${escapeHtml(totalItems)}</div>
                        </div>
                    </div>
                    <div class="box">
                        <strong>Delivery Address</strong>
                        <div>${escapeHtml(address.fullName || "")}</div>
                        <div>${escapeHtml(address.address || "")}, ${escapeHtml(address.city || "")}, ${escapeHtml(address.state || "")} - ${escapeHtml(address.pincode || "")}</div>
                    </div>
                    <div class="items">
                        ${items.map((item) => `
                            <div class="item">
                                <div>
                                    <strong>${escapeHtml(item.productName)}</strong>
                                    <div class="muted">Qty: ${escapeHtml(item.quantity)}</div>
                                </div>
                                <strong>${formatCurrency(item.totalPrice)}</strong>
                            </div>
                        `).join("")}
                    </div>
                    <div class="totals">
                        <div class="total-line"><span>Subtotal</span><strong>${formatCurrency(order.subtotal)}</strong></div>
                        <div class="total-line"><span>Discount</span><strong>${formatCurrency(order.discount)}</strong></div>
                        <div class="total-line"><span>Delivery</span><strong>${formatCurrency(order.deliveryCharge)}</strong></div>
                        <div class="total-line"><span>Total</span><strong>${formatCurrency(order.totalAmount)}</strong></div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    async function printCustomerReceipt(orderId) {
        if (!orderId) {
            return;
        }

        const orderResponse = await fetchAdminData(`/admin/orders/${orderId}`);
        const order = orderResponse?.data || orderResponse;
        if (!order) {
            throw new Error("Unable to load receipt data.");
        }

        const printWindow = window.open("", "_blank", "width=900,height=720");
        if (!printWindow) {
            throw new Error("Please allow pop-ups to print the receipt.");
        }

        printWindow.document.open();
        printWindow.document.write(buildReceiptHtml(order));
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
            printWindow.print();
        };
    }

    async function openCustomerDetailsModal(userId, page = 1) {
        if (!userId) {
            return;
        }

        state.customerDetail.userId = userId;
        state.customerDetail.page = page;
        openAdminModal("View Customer Details", renderLoading("Loading customer details..."));

        try {
            const response = await fetchAdminData(`/admin/reports/customers/${userId}?page=${page}&size=5`);
            const detail = response?.orders ? response : response?.data;
            if (!detail) {
                throw new Error("Customer details were not returned.");
            }

            const mergedDetail = {
                ...detail,
                joinedAt: detail.joinedAt || null
            };

            openAdminModal("View Customer Details", renderCustomerDetailsModal(mergedDetail));
            bindCustomerDetailsModal();
        } catch (error) {
            handleAdminRequestError(error, "Unable to load customer details.");
            closeAdminModal();
        }
    }

    function bindCustomerDetailsModal() {
        const modalRoot = getModalRoot();
        if (!modalRoot) {
            return;
        }

        modalRoot.querySelectorAll("[data-action='customer-detail-page']").forEach((button) => {
            button.addEventListener("click", () => {
                const nextPage = Number(button.dataset.page || 1);
                if (!state.customerDetail.userId || nextPage < 1) {
                    return;
                }

                openCustomerDetailsModal(state.customerDetail.userId, nextPage);
            });
        });

        modalRoot.querySelectorAll("[data-action='print-customer-receipt']").forEach((button) => {
            button.addEventListener("click", async () => {
                try {
                    await printCustomerReceipt(Number(button.dataset.id));
                } catch (error) {
                    handleAdminRequestError(error, "Unable to print receipt.");
                }
            });
        });
    }

    async function loadBannersPage() {
        setPageContent(renderLoading("Loading banners..."));

        try {
            state.banners = normalizeList(await fetchAdminData("/admin/banners"));
            renderBannersPage(getFilteredBanners());
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to load banners.", { allowRedirect: false })) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message)}</section>`);
            }
        }
    }

    function renderBannersPage(banners) {
        const rows = banners.map((banner) => `
            <tr>
                <td><strong>${escapeHtml(banner.title)}</strong></td>
                <td>${escapeHtml(banner.subtitle || "No subtitle")}</td>
                <td>${escapeHtml(banner.buttonText || "N/A")}</td>
                <td>${statusBadge(banner.active ? "ACTIVE" : "INACTIVE")}</td>
                <td>
                    <div class="admin-action-row">
                        <button class="admin-btn-soft" type="button" data-action="edit-banner" data-id="${banner.id}">Edit</button>
                        <button class="admin-btn-outline" type="button" data-action="toggle-banner-status" data-id="${banner.id}">${banner.active ? "Disable" : "Enable"}</button>
                        <button class="admin-btn-outline" type="button" data-action="delete-banner" data-id="${banner.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join("");

        setPageContent(createTableCard(
            "Banner Management",
            "Manage promotional hero banners connected to the storefront.",
            `
                <div class="admin-toolbar-actions">
                    <input class="admin-search" type="search" id="admin-banner-search" placeholder="Search banners" value="${escapeHtml(state.filters.banners.keyword)}">
                    <button class="admin-btn" type="button" id="admin-open-banner-create">New Banner</button>
                </div>
            `,
            banners.length ? `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Subtitle</th>
                            <th>Button</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            ` : renderEmptyState("No banners found.")
        ));

        bindBannersPage();
    }

    function bindBannersPage() {
        document.getElementById("admin-open-banner-create")?.addEventListener("click", () => openBannerModal());
        document.getElementById("admin-banner-search")?.addEventListener("input", (event) => {
            state.filters.banners.keyword = event.target.value.trim();
            renderBannersPage(getFilteredBanners());
        });

        getAdminContentRoot()?.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", async () => {
                const banner = state.banners.find((item) => item.id === Number(button.dataset.id));
                if (!banner) {
                    return;
                }

                if (button.dataset.action === "edit-banner") {
                    openBannerModal(banner);
                    return;
                }

                if (button.dataset.action === "toggle-banner-status") {
                    try {
                        await submitAdminData(`/admin/banners/${banner.id}/status?active=${!banner.active}`, "PUT");
                        showFlashMessage("Banner status updated successfully.", "success");
                        await loadBannersPage();
                    } catch (error) {
                        handleAdminRequestError(error, "Unable to update banner status.");
                    }
                    return;
                }

                if (button.dataset.action === "delete-banner") {
                    if (!window.confirm(`Delete banner "${banner.title}"?`)) {
                        return;
                    }

                    try {
                        await submitAdminData(`/admin/banners/${banner.id}`, "DELETE");
                        showFlashMessage("Banner deleted successfully.", "success");
                        await loadBannersPage();
                    } catch (error) {
                        handleAdminRequestError(error, "Unable to delete banner.");
                    }
                }
            });
        });
    }

    function openBannerModal(banner = null) {
        const titleValue = String(banner?.title || "").trim();
        const subtitleValue = String(banner?.subtitle || "").trim();
        const buttonTextValue = String(banner?.buttonText || "").trim();
        const buttonLinkValue = String(banner?.buttonLink || "").trim();
        const desktopImageValue = String(banner?.desktopImageUrl || banner?.imageUrl || "").trim();
        const mobileImageValue = String(banner?.mobileImageUrl || banner?.desktopImageUrl || banner?.imageUrl || "").trim();
        const isActive = banner?.active !== false;

        openAdminModal(banner ? "Edit Banner" : "Add Banner", `
            <form class="admin-form-grid" id="admin-banner-form" novalidate>
                <div class="field field-full">
                    <label for="banner-title">Banner Title</label>
                    <input id="banner-title" name="title" type="text" placeholder="Homepage Banner" value="${escapeHtml(titleValue)}">
                </div>
                <div class="field field-full">
                    <label for="banner-subtitle">Subtitle</label>
                    <textarea id="banner-subtitle" name="subtitle" placeholder="Optional subtitle for admin reference">${escapeHtml(subtitleValue)}</textarea>
                </div>
                <div class="field field-full">
                    <label for="banner-desktop-image-file">Desktop Image</label>
                    <input id="banner-desktop-image-file" name="desktopImageFile" type="file" accept="image/*" ${desktopImageValue ? "" : "required"}>
                    <input id="banner-desktop-image-url" name="desktopImageUrl" type="hidden" value="${escapeHtml(desktopImageValue)}">
                    ${desktopImageValue ? `<div class="admin-upload-preview"><img src="${resolveMediaUrl(desktopImageValue)}" alt="Desktop banner image"></div>` : ""}
                </div>
                <div class="field field-full">
                    <label for="banner-mobile-image-file">Mobile Image</label>
                    <input id="banner-mobile-image-file" name="mobileImageFile" type="file" accept="image/*" ${mobileImageValue ? "" : "required"}>
                    <input id="banner-mobile-image-url" name="mobileImageUrl" type="hidden" value="${escapeHtml(mobileImageValue)}">
                    ${mobileImageValue ? `<div class="admin-upload-preview"><img src="${resolveMediaUrl(mobileImageValue)}" alt="Mobile banner image"></div>` : ""}
                </div>
                <div class="field">
                    <label for="banner-button-text">Button Text</label>
                    <input id="banner-button-text" name="buttonText" type="text" placeholder="Shop now" value="${escapeHtml(buttonTextValue)}">
                </div>
                <div class="field">
                    <label for="banner-button-link">Button Link</label>
                    <input id="banner-button-link" name="buttonLink" type="text" placeholder="shop.html" value="${escapeHtml(buttonLinkValue)}">
                </div>
                <div class="field field-full">
                    <label class="admin-checkbox-row">
                        <input type="checkbox" name="active" value="true" ${isActive ? "checked" : ""}>
                        <span>Active banner</span>
                    </label>
                </div>
                <div class="field-full admin-action-row">
                    <button class="admin-btn" type="submit">Save Banner</button>
                </div>
            </form>
        `);

        const form = document.getElementById("admin-banner-form");
        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log("BANNER FORM SUBMIT STARTED");
            console.log("BANNER MODE", banner?.id ? "EDIT" : "CREATE");
            const submitButton = form.querySelector("button[type='submit']");
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Saving Banner...";
            }

            const sourceFormData = new FormData(form);
            let desktopImageUrl = String(sourceFormData.get("desktopImageUrl") || "").trim();
            let mobileImageUrl = String(sourceFormData.get("mobileImageUrl") || "").trim();
            const active = form.querySelector("input[name='active']")?.checked ?? true;
            const saveUrl = banner?.id ? `/admin/banners/${banner.id}` : "/admin/banners";
            const saveMethod = banner?.id ? "PUT" : "POST";
            const desktopImageFile = form.querySelector("#banner-desktop-image-file")?.files?.[0];
            const mobileImageFile = form.querySelector("#banner-mobile-image-file")?.files?.[0];

            try {
                if (!desktopImageUrl && !desktopImageFile) {
                    showFlashMessage("Please upload a desktop banner image.", "error");
                    return;
                }

                if (!mobileImageUrl && !mobileImageFile) {
                    mobileImageUrl = desktopImageUrl;
                }

                const payload = {
                    title: String(sourceFormData.get("title") || "").trim(),
                    subtitle: String(sourceFormData.get("subtitle") || "").trim(),
                    imageUrl: desktopImageUrl,
                    desktopImageUrl,
                    mobileImageUrl,
                    buttonText: String(sourceFormData.get("buttonText") || "").trim(),
                    buttonLink: String(sourceFormData.get("buttonLink") || "").trim(),
                    active
                };
                console.log("BANNER SAVE URL", saveUrl);
                console.log("BANNER SAVE METHOD", saveMethod);
                console.log("BANNER SAVE PAYLOAD", payload);

                const requestFormData = new FormData();
                requestFormData.append(
                    "banner",
                    new Blob([JSON.stringify(payload)], { type: "application/json" })
                );
                if (desktopImageFile) {
                    requestFormData.append("desktopImageFile", desktopImageFile);
                }
                if (mobileImageFile) {
                    requestFormData.append("mobileImageFile", mobileImageFile);
                }

                const response = await submitAdminFormData(saveUrl, saveMethod, requestFormData);
                const savedBanner = response?.data || {};
                console.log("DESKTOP IMAGE UPLOAD RESPONSE", savedBanner.desktopImageUrl || savedBanner.imageUrl || desktopImageUrl);
                console.log("MOBILE IMAGE UPLOAD RESPONSE", savedBanner.mobileImageUrl || mobileImageUrl || savedBanner.desktopImageUrl || savedBanner.imageUrl);
                console.log("BANNER SAVE RESPONSE", response);
                showFlashMessage(banner?.id ? "Banner updated successfully." : "Banner created successfully.", "success");
                closeAdminModal();
                await loadBannersPage();
                console.log("BANNER SAVE FLOW COMPLETED");
            } catch (error) {
                handleAdminRequestError(error, "Unable to save banner.", { allowRedirect: false });
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Save Banner";
                }
            }
        });
    }

    async function loadCouponsPage() {
        setPageContent(renderLoading("Loading coupons..."));

        try {
            state.coupons = normalizeList(await fetchAdminData("/admin/coupons"));
            renderCouponsPage(getFilteredCoupons());
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to load coupons.")) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message)}</section>`);
            }
        }
    }

    function renderCouponsPage(coupons, options = {}) {
        const pagination = paginateList(coupons, Number(state.filters.coupons.page || 1), ADMIN_COUPONS_PAGE_SIZE);
        state.filters.coupons.page = pagination.currentPage;
        const rows = pagination.items.map((coupon) => `
            <tr>
                <td><strong>${escapeHtml(coupon.code)}</strong></td>
                <td>${escapeHtml(toSentenceCase(coupon.discountType))}</td>
                <td>${formatCurrency(coupon.discountValue)}</td>
                <td>${formatCurrency(coupon.minimumOrderAmount)}</td>
                <td>${formatDateOnly(coupon.expiryDate)}</td>
                <td>${statusBadge(coupon.active ? "ACTIVE" : "INACTIVE")}</td>
                <td>
                    <div class="admin-action-row">
                        <button class="admin-btn-soft" type="button" data-action="edit-coupon" data-id="${coupon.id}">Edit</button>
                        <button class="admin-btn-outline" type="button" data-action="toggle-coupon-status" data-id="${coupon.id}">${coupon.active ? "Disable" : "Enable"}</button>
                        <button class="admin-btn-outline" type="button" data-action="delete-coupon" data-id="${coupon.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join("");

        setPageContent(createTableCard(
            "Coupon Management",
            "Control discount logic, expiry dates, and active campaign visibility.",
            `
                <div class="admin-toolbar-actions">
                    <input class="admin-search" type="search" id="admin-coupon-search" placeholder="Search coupon codes" value="${escapeHtml(state.filters.coupons.keyword)}">
                    <button class="admin-btn" type="button" id="admin-open-coupon-create">New Coupon</button>
                </div>
            `, 
            coupons.length ? `
                <div class="admin-results-meta">
                    Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} coupons
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Minimum Order</th>
                            <th>Expiry</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "coupon-page")}
            ` : renderEmptyState("No coupons found.")
        ));

        bindCouponsPage();
        if (options.focusSearch) {
            const searchInput = document.getElementById("admin-coupon-search");
            if (searchInput) {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            }
        }
    }

    function bindCouponsPage() {
        document.getElementById("admin-open-coupon-create")?.addEventListener("click", () => openCouponModal());
        const searchInput = document.getElementById("admin-coupon-search");
        searchInput?.addEventListener("input", () => {
            window.clearTimeout(adminCouponSearchTimer);
            adminCouponSearchTimer = window.setTimeout(() => {
                state.filters.coupons.keyword = searchInput.value.trim();
                state.filters.coupons.page = 1;
                renderCouponsPage(getFilteredCoupons(), { focusSearch: true });
            }, 220);
        });

        getAdminContentRoot()?.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", async () => {
                if (button.dataset.action === "coupon-page") {
                    state.filters.coupons.page = Number(button.dataset.page || 1);
                    renderCouponsPage(getFilteredCoupons());
                    return;
                }

                const coupon = state.coupons.find((item) => item.id === Number(button.dataset.id));
                if (!coupon) {
                    return;
                }

                if (button.dataset.action === "edit-coupon") {
                    openCouponModal(coupon);
                    return;
                }

                if (button.dataset.action === "toggle-coupon-status") {
                    try {
                        await submitAdminData(`/admin/coupons/${coupon.id}/status?active=${!coupon.active}`, "PUT");
                        showFlashMessage("Coupon status updated successfully.", "success");
                        await loadCouponsPage();
                    } catch (error) {
                        handleAdminRequestError(error, "Unable to update coupon status.");
                    }
                    return;
                }

                if (button.dataset.action === "delete-coupon") {
                    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) {
                        return;
                    }

                    try {
                        await submitAdminData(`/admin/coupons/${coupon.id}`, "DELETE");
                        showFlashMessage("Coupon deleted successfully.", "success");
                        await loadCouponsPage();
                    } catch (error) {
                        handleAdminRequestError(error, "Unable to delete coupon.");
                    }
                }
            });
        });
    }

    function openCouponModal(coupon = null) {
        openAdminModal(coupon ? "Edit Coupon" : "Add Coupon", `
            <form class="admin-form-grid" id="admin-coupon-form">
                <div class="admin-field">
                    <label for="coupon-code">Coupon Code</label>
                    <input id="coupon-code" name="code" type="text" value="${escapeHtml(coupon?.code || "")}" required>
                </div>
                <div class="admin-field">
                    <label for="coupon-discount-type">Discount Type</label>
                    <select id="coupon-discount-type" name="discountType">
                        ${DISCOUNT_TYPES.map((type) => `
                            <option value="${type}" ${coupon?.discountType === type ? "selected" : ""}>${toSentenceCase(type)}</option>
                        `).join("")}
                    </select>
                </div>
                <div class="admin-field">
                    <label for="coupon-discount-value">Discount Value</label>
                    <input id="coupon-discount-value" name="discountValue" type="number" step="0.01" min="0" value="${escapeHtml(coupon?.discountValue || "")}" required>
                </div>
                <div class="admin-field">
                    <label for="coupon-minimum-order">Minimum Order Amount</label>
                    <input id="coupon-minimum-order" name="minimumOrderAmount" type="number" step="0.01" min="0" value="${escapeHtml(coupon?.minimumOrderAmount || "")}" required>
                </div>
                <div class="admin-field">
                    <label for="coupon-expiry-date">Expiry Date</label>
                    <input id="coupon-expiry-date" name="expiryDate" type="date" value="${escapeHtml(coupon?.expiryDate || "")}" required>
                </div>
                <div class="admin-field">
                    <label for="coupon-active">Active</label>
                    <select id="coupon-active" name="active">
                        <option value="true" ${coupon?.active !== false ? "selected" : ""}>Yes</option>
                        <option value="false" ${coupon?.active === false ? "selected" : ""}>No</option>
                    </select>
                </div>
                <div class="field-full admin-action-row">
                    <button class="admin-btn" type="submit">Save Coupon</button>
                </div>
            </form>
        `);

        const form = document.getElementById("admin-coupon-form");
        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const payload = {
                code: String(formData.get("code") || "").trim(),
                discountType: String(formData.get("discountType") || "").trim(),
                discountValue: Number(formData.get("discountValue")),
                minimumOrderAmount: Number(formData.get("minimumOrderAmount")),
                expiryDate: String(formData.get("expiryDate") || "").trim(),
                active: String(formData.get("active")) === "true"
            };

            try {
                if (coupon?.id) {
                    await submitAdminData(`/admin/coupons/${coupon.id}`, "PUT", payload);
                    showFlashMessage("Coupon updated successfully.", "success");
                } else {
                    await submitAdminData("/admin/coupons", "POST", payload);
                    showFlashMessage("Coupon created successfully.", "success");
                }
                closeAdminModal();
                await loadCouponsPage();
            } catch (error) {
                handleAdminRequestError(error, "Unable to save coupon.");
            }
        });
    }

    async function loadReviewsPage() {
        setPageContent(renderLoading("Loading reviews..."));

        try {
            state.reviews = normalizeList(await fetchAdminData("/admin/reviews"));
            renderReviewsPage(getFilteredReviews());
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to load reviews.")) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message)}</section>`);
            }
        }
    }

    function renderReviewsPage(reviews) {
        const rows = reviews.map((review) => `
            <tr>
                <td>${escapeHtml(review.user?.name || "Customer")}</td>
                <td>${escapeHtml(review.product?.name || "Product")}</td>
                <td>${escapeHtml(review.rating || 0)}/5</td>
                <td>${escapeHtml(review.reviewText || "No review text")}</td>
                <td>${statusBadge(review.approved ? "APPROVED" : "PENDING")}</td>
                <td>
                    <div class="admin-action-row">
                        <button class="admin-btn-soft" type="button" data-action="approve-review" data-id="${review.id}">Approve</button>
                        <button class="admin-btn-outline" type="button" data-action="hide-review" data-id="${review.id}">Hide</button>
                        <button class="admin-btn-outline" type="button" data-action="delete-review" data-id="${review.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join("");

        setPageContent(createTableCard(
            "Review Moderation",
            "Approve, hide, or remove product reviews.",
            `<input class="admin-search" type="search" id="admin-review-search" placeholder="Search review text or customer" value="${escapeHtml(state.filters.reviews.keyword)}">`,
            reviews.length ? `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            ` : renderEmptyState("No reviews found.")
        ));

        bindReviewsPage();
    }

    function bindReviewsPage() {
        document.getElementById("admin-review-search")?.addEventListener("input", (event) => {
            state.filters.reviews.keyword = event.target.value.trim();
            renderReviewsPage(getFilteredReviews());
        });

        getAdminContentRoot()?.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", async () => {
                const reviewId = Number(button.dataset.id);
                const action = button.dataset.action;

                try {
                    if (action === "approve-review") {
                        await submitAdminData(`/admin/reviews/${reviewId}/approve`, "PUT");
                        showFlashMessage("Review approved successfully.", "success");
                    } else if (action === "hide-review") {
                        await submitAdminData(`/admin/reviews/${reviewId}/hide`, "PUT");
                        showFlashMessage("Review hidden successfully.", "success");
                    } else if (action === "delete-review") {
                        if (!window.confirm("Delete this review?")) {
                            return;
                        }
                        await submitAdminData(`/admin/reviews/${reviewId}`, "DELETE");
                        showFlashMessage("Review deleted successfully.", "success");
                    }

                    await loadReviewsPage();
                } catch (error) {
                    handleAdminRequestError(error, "Unable to update review.");
                }
            });
        });
    }

    async function loadReportsPage() {
        setPageContent(renderLoading("Loading reports..."));

        try {
            const [dailySales, monthlySales, productReport, stockReport, customerReport] = await Promise.all([
                fetchAdminData("/admin/reports/sales/daily"),
                fetchAdminData("/admin/reports/sales/monthly"),
                fetchAdminData("/admin/reports/products"),
                fetchAdminData("/admin/reports/stock"),
                fetchAdminData("/admin/reports/customers")
            ]);

            state.reports = {
                dailySales: normalizeList(dailySales),
                monthlySales: normalizeList(monthlySales),
                productReport: normalizeList(productReport),
                stockReport: normalizeList(stockReport),
                customerReport: normalizeList(customerReport)
            };

            renderReportsPage();
            scrollToReportHashSection();
        } catch (error) {
            if (!handleAdminRequestError(error, "Unable to load reports.")) {
                setPageContent(`<section class="admin-error-state">${escapeHtml(error.message)}</section>`);
            }
        }
    }

    function renderReportsPage() {
        if (!state.reports) {
            return;
        }

        const totalSalesValue = state.reports.dailySales.reduce(
            (sum, item) => sum + Number(item.totalSales || 0),
            0
        );

        setPageContent(`
            <section class="admin-stats-grid">
                <article class="admin-stat-card">
                    <span>Daily Periods</span>
                    <strong>${escapeHtml(state.reports.dailySales.length)}</strong>
                </article>
                <article class="admin-stat-card">
                    <span>Monthly Periods</span>
                    <strong>${escapeHtml(state.reports.monthlySales.length)}</strong>
                </article>
                <article class="admin-stat-card">
                    <span>Products in Report</span>
                    <strong>${escapeHtml(state.reports.productReport.length)}</strong>
                </article>
                <article class="admin-stat-card">
                    <span>Total Sales Snapshot</span>
                    <strong>${formatCurrency(totalSalesValue)}</strong>
                </article>
            </section>
            ${renderMostPurchasedSection(state.reports.productReport)}
            ${createTableCard(
                "Daily Sales",
                "Sales totals grouped by daily period.",
                renderReportToolbar("reportDailySales", {
                    searchPlaceholder: "Search daily sales",
                    dateType: "date",
                    showRefresh: true
                }),
                renderSalesTable(state.reports.dailySales, "reportDailySales", "daily-sales"),
                'data-report-card="daily-sales"'
            )}
            ${createTableCard(
                "Monthly Sales",
                "Sales totals grouped by monthly period.",
                renderReportToolbar("reportMonthlySales", {
                    searchPlaceholder: "Search monthly sales",
                    dateType: "month"
                }),
                renderSalesTable(state.reports.monthlySales, "reportMonthlySales", "monthly-sales"),
                'data-report-card="monthly-sales"'
            )}
            ${createTableCard(
                "Product Performance",
                "Top-selling product performance reported by the backend.",
                renderReportToolbar("reportProductPerformance", {
                    searchPlaceholder: "Search product, SKU, category",
                    categories: getReportCategories(state.reports.productReport)
                }),
                renderProductReportTable(state.reports.productReport),
                'data-report-card="product-performance"'
            )}
            ${createTableCard(
                "Stock Report",
                "Low-stock and active product inventory snapshots.",
                renderReportToolbar("reportStock", {
                    searchPlaceholder: "Search stock, SKU, category",
                    statusOptions: [
                        ["", "All Stock"],
                        ["IN_STOCK", "In Stock"],
                        ["LOW_STOCK", "Low Stock"],
                        ["OUT_OF_STOCK", "Out of Stock"]
                    ]
                }),
                renderStockReportTable(state.reports.stockReport),
                'data-report-card="stock-report"'
            )}
            ${createTableCard(
                "Customer Report",
                "Customer order frequency and spend from the backend report.",
                renderReportToolbar("reportCustomer", {
                    searchPlaceholder: "Search name, email, phone"
                }),
                renderCustomerReportTable(state.reports.customerReport),
                'data-report-card="customer-report"'
            )}
        `);

        document.getElementById("admin-reports-refresh")?.addEventListener("click", loadReportsPage);
        bindReportToolbarControls();
        bindDailySalesControls();
        bindMonthlySalesControls();
        bindStockReportControls();
        bindProductPerformanceControls();
        bindMostPurchasedControls();
        bindCustomerReportControls();
    }

    function renderReportToolbar(sectionKey, options = {}) {
        const filter = state.filters[sectionKey] || {};
        const {
            searchPlaceholder = "Search report",
            dateType = "",
            categories = [],
            statusOptions = [],
            showRefresh = false
        } = options;

        return `
            <div class="admin-report-toolbar" data-report-toolbar="${escapeHtml(sectionKey)}">
                <div class="admin-toolbar-actions">
                    <input class="admin-search" type="search" placeholder="${escapeHtml(searchPlaceholder)}" value="${escapeHtml(filter.keyword || "")}" data-report-filter-field="keyword">
                    ${dateType ? `
                        <input class="admin-filter" type="${escapeHtml(dateType)}" value="${escapeHtml(filter.from || "")}" aria-label="From" data-report-filter-field="from">
                        <input class="admin-filter" type="${escapeHtml(dateType)}" value="${escapeHtml(filter.to || "")}" aria-label="To" data-report-filter-field="to">
                    ` : ""}
                    ${categories.length ? `
                        <select class="admin-filter" data-report-filter-field="category">
                            <option value="">All Categories</option>
                            ${categories.map((category) => `<option value="${escapeHtml(category)}" ${filter.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
                        </select>
                    ` : ""}
                    ${statusOptions.length ? `
                        <select class="admin-filter" data-report-filter-field="status">
                            ${statusOptions.map(([value, label]) => `<option value="${escapeHtml(value)}" ${filter.status === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
                        </select>
                    ` : ""}
                    <button class="admin-btn-outline" type="button" data-action="report-filter-apply" data-report-section="${escapeHtml(sectionKey)}">Apply</button>
                    <button class="admin-btn-outline" type="button" data-action="report-filter-reset" data-report-section="${escapeHtml(sectionKey)}">Reset</button>
                    <button class="admin-btn-soft" type="button" data-action="report-download" data-report-section="${escapeHtml(sectionKey)}">Download Excel</button>
                    ${showRefresh ? `<button class="admin-btn-outline" type="button" id="admin-reports-refresh">Refresh</button>` : ""}
                </div>
            </div>
        `;
    }

    function bindReportToolbarControls() {
        getAdminContentRoot()?.querySelectorAll("[data-action='report-filter-apply'], [data-action='report-filter-reset'], [data-action='report-download']").forEach((button) => {
            button.addEventListener("click", () => {
                const sectionKey = button.dataset.reportSection;
                const action = button.dataset.action;

                if (!sectionKey) {
                    return;
                }

                if (action === "report-filter-reset") {
                    resetReportFilter(sectionKey);
                    renderReportsPage();
                    scrollAdminReportCardIntoView(getReportCardName(sectionKey));
                    return;
                }

                syncReportFilterFromToolbar(sectionKey);

                if (action === "report-download") {
                    downloadReportExcel(sectionKey);
                    return;
                }

                renderReportsPage();
                scrollAdminReportCardIntoView(getReportCardName(sectionKey));
            });
        });

        getAdminContentRoot()?.querySelectorAll("[data-report-toolbar]").forEach((toolbar) => {
            toolbar.addEventListener("keydown", (event) => {
                if (event.key !== "Enter") {
                    return;
                }

                event.preventDefault();
                const sectionKey = toolbar.dataset.reportToolbar;
                syncReportFilterFromToolbar(sectionKey);
                renderReportsPage();
                scrollAdminReportCardIntoView(getReportCardName(sectionKey));
            });
        });
    }

    function getReportCardName(sectionKey) {
        return {
            reportDailySales: "daily-sales",
            reportMonthlySales: "monthly-sales",
            reportMostPurchased: "most-purchased",
            reportProductPerformance: "product-performance",
            reportStock: "stock-report",
            reportCustomer: "customer-report"
        }[sectionKey] || sectionKey;
    }

    function scrollToReportHashSection() {
        if (getPageKey() !== "admin-reports" || !window.location.hash) {
            return;
        }

        const cardName = window.location.hash.replace("#", "");
        if (!cardName) {
            return;
        }

        scrollAdminReportCardIntoView(cardName);
    }

    function renderMostPurchasedSection(items) {
        const rankedItems = getFilteredMostPurchasedReport(Array.isArray(items) ? items : []);
        const pagination = paginateList(
            rankedItems,
            Number(state.filters.reportMostPurchased.page || 1),
            ADMIN_REPORT_MOST_PURCHASED_PAGE_SIZE
        );
        state.filters.reportMostPurchased.page = pagination.currentPage;

        return `
            <section class="admin-table-card" data-report-card="most-purchased">
                <div class="admin-panel-header">
                    <div>
                        <h3>Most Purchased Products</h3>
                        <p class="muted">Top products ranked by units sold from delivered and paid orders.</p>
                    </div>
                    <div class="admin-toolbar">
                        ${renderReportToolbar("reportMostPurchased", {
                            searchPlaceholder: "Search most purchased",
                            categories: getReportCategories(items)
                        })}
                    </div>
                </div>
                <div class="admin-results-meta">
                    Showing ${pagination.items.length ? pagination.startIndex + 1 : 0}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} ranked products
                </div>
                ${pagination.items.length ? `
                    <div class="admin-most-purchased-grid">
                        ${pagination.items.map((item, index) => `
                            <article class="admin-most-purchased-card">
                                <div class="admin-most-purchased-rank">#${pagination.startIndex + index + 1}</div>
                                <strong>${escapeHtml(item.productName)}</strong>
                                <span class="muted">${escapeHtml(item.categoryName || "Uncategorized")}</span>
                                <div class="admin-most-purchased-meta">
                                    <div>
                                        <span>Units Sold</span>
                                        <strong>${escapeHtml(item.totalQuantitySold ?? 0)}</strong>
                                    </div>
                                    <div>
                                        <span>Total Sales</span>
                                        <strong>${formatCurrency(item.totalSales)}</strong>
                                    </div>
                                </div>
                            </article>
                        `).join("")}
                    </div>
                    ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "most-purchased-page")}
                ` : renderEmptyState("No purchased products found yet.")}
            </section>
        `;
    }

    function bindMostPurchasedControls() {
        getAdminContentRoot()?.querySelectorAll("[data-action='most-purchased-page']").forEach((button) => {
            button.addEventListener("click", () => {
                state.filters.reportMostPurchased.page = Number(button.dataset.page || 1);
                renderReportsPage();
                scrollAdminReportCardIntoView("most-purchased");
            });
        });
    }

    function bindProductPerformanceControls() {
        getAdminContentRoot()?.querySelectorAll("[data-action='product-performance-page']").forEach((button) => {
            button.addEventListener("click", () => {
                state.filters.reportProductPerformance.page = Number(button.dataset.page || 1);
                renderReportsPage();
                scrollAdminReportCardIntoView("product-performance");
            });
        });
    }

    function bindDailySalesControls() {
        getAdminContentRoot()?.querySelectorAll("[data-action='daily-sales-page']").forEach((button) => {
            button.addEventListener("click", () => {
                state.filters.reportDailySales.page = Number(button.dataset.page || 1);
                renderReportsPage();
                scrollAdminReportCardIntoView("daily-sales");
            });
        });
    }

    function bindMonthlySalesControls() {
        getAdminContentRoot()?.querySelectorAll("[data-action='monthly-sales-page']").forEach((button) => {
            button.addEventListener("click", () => {
                state.filters.reportMonthlySales.page = Number(button.dataset.page || 1);
                renderReportsPage();
                scrollAdminReportCardIntoView("monthly-sales");
            });
        });
    }

    function bindStockReportControls() {
        getAdminContentRoot()?.querySelectorAll("[data-action='stock-report-page']").forEach((button) => {
            button.addEventListener("click", () => {
                state.filters.reportStock.page = Number(button.dataset.page || 1);
                renderReportsPage();
                scrollAdminReportCardIntoView("stock-report");
            });
        });
    }

    function scrollAdminReportCardIntoView(cardName) {
        window.requestAnimationFrame(() => {
            const target = getAdminContentRoot()?.querySelector(`[data-report-card="${cardName}"]`);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    function renderSalesTable(items, filterKey, cardName) {
        const filteredItems = getFilteredSalesReport(items, filterKey);
        const pagination = paginateList(filteredItems, Number(state.filters[filterKey].page || 1), ADMIN_REPORT_STOCK_PAGE_SIZE);
        state.filters[filterKey].page = pagination.currentPage;

        if (!filteredItems.length) {
            return renderEmptyState("No sales records returned.");
        }

        return `
            <div class="admin-results-meta">
                Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} sales records
            </div>
            <table class="admin-table admin-report-table admin-report-table--sales">
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>Total Orders</th>
                        <th>Total Sales</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagination.items.map((item) => `
                        <tr>
                            <td data-label="Period">${escapeHtml(item.period)}</td>
                            <td data-label="Total Orders">${escapeHtml(item.totalOrders)}</td>
                            <td data-label="Total Sales">${formatCurrency(item.totalSales)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            ${renderAdminPagination(pagination.totalPages, pagination.currentPage, `${cardName}-page`)}
        `;
    }

    function renderProductReportTable(items) {
        const filteredItems = getFilteredProductReport(items, "reportProductPerformance");
        const pagination = paginateList(filteredItems, Number(state.filters.reportProductPerformance.page || 1), ADMIN_REPORT_PRODUCT_PAGE_SIZE);
        state.filters.reportProductPerformance.page = pagination.currentPage;

        if (!filteredItems.length) {
            return renderEmptyState("No product report records returned.");
        }

        return `
            <div class="admin-results-meta">
                Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} products
            </div>
            <table class="admin-table admin-report-table admin-report-table--product-performance">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Units Sold</th>
                        <th>Total Sales</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagination.items.map((item) => `
                        <tr>
                            <td data-label="Product">${escapeHtml(item.productName)}</td>
                            <td data-label="SKU">${escapeHtml(item.sku)}</td>
                            <td data-label="Category">${escapeHtml(item.categoryName)}</td>
                            <td data-label="Units Sold">${escapeHtml(item.totalQuantitySold)}</td>
                            <td data-label="Total Sales">${formatCurrency(item.totalSales)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "product-performance-page")}
        `;
    }

    function renderStockReportTable(items) {
        const filteredItems = getFilteredStockReport(items);
        const pagination = paginateList(filteredItems, Number(state.filters.reportStock.page || 1), ADMIN_REPORT_STOCK_PAGE_SIZE);
        state.filters.reportStock.page = pagination.currentPage;

        if (!filteredItems.length) {
            return state.filters.reportStock.status
                ? renderEmptyState("No stock records match the selected filter.")
                : renderEmptyState("No stock report records returned.");
        }

        return `
            <div class="admin-results-meta">
                Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} stock records
            </div>
            <table class="admin-table admin-report-table admin-report-table--stock">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Low Stock</th>
                        <th>Active</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagination.items.map((item) => `
                        <tr>
                            <td data-label="Product">${escapeHtml(item.productName)}</td>
                            <td data-label="SKU">${escapeHtml(item.sku)}</td>
                            <td data-label="Category">${escapeHtml(item.categoryName)}</td>
                            <td data-label="Stock">${Number(item.stockQuantity || 0) > 0 ? escapeHtml(item.stockQuantity) : statusBadge("OUT_OF_STOCK")}</td>
                            <td data-label="Low Stock">${statusBadge(Number(item.stockQuantity || 0) <= 0 ? "OUT_OF_STOCK" : (item.lowStock ? "LOW_STOCK" : "IN_STOCK"))}</td>
                            <td data-label="Active">${statusBadge(item.active ? "ACTIVE" : "INACTIVE")}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "stock-report-page")}
        `;
    }

    function renderCustomerReportTable(items) {
        const filteredItems = getFilteredCustomerReport(items);
        const pagination = paginateList(filteredItems, Number(state.filters.reportCustomer.page || 1), ADMIN_REPORT_CUSTOMER_PAGE_SIZE);
        state.filters.reportCustomer.page = pagination.currentPage;

        if (!filteredItems.length) {
            return renderEmptyState("No customer report records returned.");
        }

        return `
            <div class="admin-results-meta">
                Showing ${pagination.startIndex + 1}-${Math.min(pagination.startIndex + pagination.items.length, pagination.totalItems)} of ${pagination.totalItems} customers
            </div>
            <table class="admin-table admin-report-table admin-report-table--customer">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Total Orders</th>
                        <th>Total Spent</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagination.items.map((item) => `
                        <tr>
                            <td data-label="Name">${escapeHtml(item.name)}</td>
                            <td data-label="Email">${escapeHtml(item.email)}</td>
                            <td data-label="Phone">${escapeHtml(item.phone || "N/A")}</td>
                            <td data-label="Total Orders">${escapeHtml(item.totalOrders)}</td>
                            <td data-label="Total Spent">${formatCurrency(item.totalSpent)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            ${renderAdminPagination(pagination.totalPages, pagination.currentPage, "customer-report-page")}
        `;
    }

    function bindCustomerReportControls() {
        getAdminContentRoot()?.querySelectorAll("[data-action='customer-report-page']").forEach((button) => {
            button.addEventListener("click", () => {
                state.filters.reportCustomer.page = Number(button.dataset.page || 1);
                renderReportsPage();
                scrollAdminReportCardIntoView("customer-report");
            });
        });
    }

    function bindHeroAction() {
        const button = document.getElementById("admin-hero-action");
        const pageKey = getPageKey();
        if (!button) {
            return;
        }

        button.addEventListener("click", () => {
            if (pageKey === "admin-products") {
                openProductModal();
            } else if (pageKey === "admin-add-product") {
                window.location.href = "admin-products.html";
            } else if (pageKey === "admin-categories") {
                openCategoryModal();
            } else if (pageKey === "admin-banners") {
                openBannerModal();
            } else if (pageKey === "admin-coupons") {
                openCouponModal();
            } else if (pageKey === "admin-dashboard") {
                loadDashboardPage();
            } else if (pageKey === "admin-orders") {
                loadOrdersPage();
            } else if (pageKey === "admin-users") {
                loadUsersPage();
            } else if (pageKey === "admin-reviews") {
                loadReviewsPage();
            } else if (pageKey === "admin-reports") {
                loadReportsPage();
            }
        });
    }

    function bindGlobalSearch() {
        const input = document.getElementById("admin-global-search");
        input?.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") {
                return;
            }

            event.preventDefault();
            const pageKey = getPageKey();
            if (pageKey === "admin-products") {
                document.getElementById("admin-product-search")?.focus();
            } else if (pageKey === "admin-categories") {
                document.getElementById("admin-category-search")?.focus();
            } else if (pageKey === "admin-orders") {
                document.getElementById("admin-order-search")?.focus();
            } else if (pageKey === "admin-users") {
                document.getElementById("admin-user-search")?.focus();
            } else if (pageKey === "admin-banners") {
                document.getElementById("admin-banner-search")?.focus();
            } else if (pageKey === "admin-coupons") {
                document.getElementById("admin-coupon-search")?.focus();
            } else if (pageKey === "admin-reviews") {
                document.getElementById("admin-review-search")?.focus();
            }
        });
    }

    async function routeAdminPage() {
        const pageKey = getPageKey();

        if (pageKey === "admin-dashboard") {
            await loadDashboardPage();
            return;
        }

        if (pageKey === "admin-products") {
            await loadProductsPage();
            return;
        }

        if (pageKey === "admin-add-product") {
            await loadStandaloneAddProductPage();
            return;
        }

        if (pageKey === "admin-categories") {
            await loadCategoriesPage();
            return;
        }

        if (pageKey === "admin-orders") {
            await loadOrdersPage();
            return;
        }

        if (pageKey === "admin-users") {
            await loadUsersPage();
            return;
        }

        if (pageKey === "admin-banners") {
            await loadBannersPage();
            return;
        }

        if (pageKey === "admin-coupons") {
            await loadCouponsPage();
            return;
        }

        if (pageKey === "admin-reviews") {
            await loadReviewsPage();
            return;
        }

        if (pageKey === "admin-reports") {
            await loadReportsPage();
        }
    }

    document.addEventListener("DOMContentLoaded", async () => {
        if (!protectAdminRoute()) {
            return;
        }

        if (getPageKey() === "admin-login") {
            renderAdminLogin();
            return;
        }

        renderAdminShell();
        bindAdminSidebar();
        bindAdminTopbarSearch();
        bindAdminLogout();
        bindHeroAction();
        bindGlobalSearch();
        await routeAdminPage();
    });
})();
