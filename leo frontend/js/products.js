function getQueryParams() {
    return new URLSearchParams(window.location.search);
}

const SHOP_PAGE_SIZE = 12;
const SHOP_DATA_PAGE_SIZE = 50;
let currentProductDetail = null;
let currentSelectedDetailVariant = null;
let currentDetailSelection = {};

function normalizeProductsData(data) {
    const source = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.data)
                ? data.data
                : fallbackData.products;

    return source.map((product) => {
        const categoryName = String(product?.category?.name || product?.categoryName || "").trim();
        const mainImageUrl = String(product?.mainImageUrl || product?.imageUrl || product?.images?.[0]?.imageUrl || "").trim();

        return {
            ...product,
            categoryName,
            imageUrl: product?.imageUrl || mainImageUrl,
            mainImageUrl,
            category: product?.category || (categoryName ? { name: categoryName } : product?.category || null)
        };
    });
}

function normalizeCategoriesData(data) {
    const source = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.data)
                ? data.data
                : [];

    if (!source.length) {
        return fallbackData.categories;
    }

    return source.map((category, index) => {
        const name = String(category?.name || category?.categoryName || category?.title || `Category ${index + 1}`).trim();
        const imageUrl = String(
            category?.imageUrl ||
            category?.desktopImageUrl ||
            category?.mobileImageUrl ||
            category?.image ||
            category?.categoryImage ||
            category?.bannerImageUrl ||
            ""
        ).trim();

        return {
            ...category,
            id: category?.id ?? index + 1,
            name,
            description: String(category?.description || category?.subtitle || "").trim(),
            icon: String(category?.icon || "").trim(),
            imageUrl,
            active: category?.active !== false,
            productCount: Number(category?.productCount ?? category?.count ?? 0) || 0
        };
    }).filter((category) => category.name);
}

function normalizeCategoryMatchValue(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function categoryNamesMatch(left, right) {
    const normalizedLeft = normalizeCategoryMatchValue(left);
    const normalizedRight = normalizeCategoryMatchValue(right);

    if (!normalizedLeft || !normalizedRight) {
        return false;
    }

    if (normalizedLeft === normalizedRight) {
        return true;
    }

    const singularLeft = normalizedLeft.replace(/s\b/g, "");
    const singularRight = normalizedRight.replace(/s\b/g, "");

    if (singularLeft === singularRight) {
        return true;
    }

    return normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft);
}

function getProductDisplayDefaults(product = {}) {
    const productType = String(product.productType || "").toLowerCase();
    const defaults = {
        food: { size: product.packSize || product.weightSize || "Standard", material: "Food grade", packSize: product.packSize || product.weightSize || "Standard pack", weightRange: "All sizes", ageType: product.ageType || "Adult" },
        leash: { size: product.size || "Adjustable", material: "Nylon", packSize: "1 piece", weightRange: product.weightRange || "5-30 kg" },
        toy: { size: product.size || "Small/Medium", material: "Rubber/Fabric", packSize: "1 piece", weightRange: product.weightRange || "All breeds" },
        treat: { size: product.size || "Small bites", material: "Food grade", packSize: product.packSize || "100g-500g", weightRange: "All breeds" },
        "litter box": { size: product.size || "Medium", material: "Plastic", packSize: "1 piece", weightRange: "Cats only" },
        "grooming accessories": { size: product.size || "Standard", material: product.material || "Mixed", packSize: product.packSize || "1 set", weightRange: "All pets" },
        cage: { size: product.size || "Medium", material: product.material || "Metal", packSize: "1 piece", weightRange: "Birds / small pets" },
        "pet care": { size: product.size || "Standard", material: product.material || "Mixed", packSize: product.packSize || "1 piece", weightRange: "All pets" }
    };

    const fallback = defaults[productType] || {};
    return {
        color: product.color || "",
        size: product.size || fallback.size || "Any size",
        material: product.material || fallback.material || "Any material",
        packSize: product.packSize || fallback.packSize || product.weightSize || "Any pack",
        weightRange: product.weightRange || fallback.weightRange || "Any weight range",
        ageType: product.ageType || fallback.ageType || "All Ages"
    };
}

function getProductDetailFields(product = {}) {
    return {
        color: String(product.color || "").trim(),
        size: String(product.size || "").trim(),
        material: String(product.material || "").trim(),
        packSize: String(product.packSize || product.weightSize || "").trim(),
        weightRange: String(product.weightRange || "").trim(),
        ageType: String(product.ageType || "").trim()
    };
}

function hasValue(value) {
    if (value === null || value === undefined) {
        return false;
    }

    if (Array.isArray(value) && value.length === 0) {
        return false;
    }

    const text = String(value).trim();
    if (!text) {
        return false;
    }

    const lowered = text.toLowerCase();
    return !["null", "undefined", "nan", "-", "n/a", "na"].includes(lowered);
}

function getSpecValue(variantValue, productValue) {
    if (hasValue(variantValue)) {
        return variantValue;
    }

    if (hasValue(productValue)) {
        return productValue;
    }

    return null;
}

function getDetailVariantSelection(variant = {}, product = {}) {
    return {
        label: String(variant.label || variant.displayLabel || "").trim(),
        color: String(variant.color || "").trim(),
        material: String(variant.material || "").trim(),
        size: String(variant.size || "").trim(),
        weight: String(variant.weight || variant.weightRange || variant.weightSize || "").trim(),
        pack: String(variant.pack || variant.selectedPack || variant.packSize || getVariantDisplayLabel(variant, product) || "").trim()
    };
}

function getVariantSelectionMatchScore(variant = {}, selection = {}, product = {}) {
    if (!variant) {
        return -1;
    }

    const checks = [
        ["label", getVariantDisplayLabel(variant, product)],
        ["color", variant.color],
        ["material", variant.material],
        ["size", variant.size],
        ["weight", variant.weight || variant.weightRange || variant.weightSize],
        ["pack", variant.pack || variant.selectedPack || variant.packSize || getVariantDisplayLabel(variant, product)]
    ];

    let score = 0;

    for (const [key, value] of checks) {
        const expected = String(selection?.[key] || "").trim().toLowerCase();
        if (!expected) {
            continue;
        }

        const actual = String(value || "").trim().toLowerCase();
        if (!actual || actual !== expected) {
            return -1;
        }

        score += 1;
    }

    return score;
}

function findMatchingDetailVariant(product = {}, selection = {}) {
    const variants = typeof normalizeProductVariants === "function" ? normalizeProductVariants(product) : [];
    if (!Array.isArray(variants) || !variants.length) {
        return null;
    }

    const normalizedSelection = {
        label: String(selection.label || selection.selectedVariantLabel || "").trim(),
        color: String(selection.color || selection.selectedVariantColor || "").trim(),
        material: String(selection.material || selection.selectedVariantMaterial || "").trim(),
        size: String(selection.size || "").trim(),
        weight: String(selection.weight || "").trim(),
        pack: String(selection.pack || selection.selectedPack || "").trim()
    };

    let bestMatch = null;
    let bestScore = -1;

    variants.forEach((variant) => {
        const score = getVariantSelectionMatchScore(variant, normalizedSelection, product);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = variant;
        }
    });

    return bestScore >= 0 ? bestMatch : null;
}

function setCurrentDetailVariant(product = {}, selection = {}, fallbackVariant = null) {
    const matchedVariant = findMatchingDetailVariant(product, selection) || fallbackVariant || null;
    currentDetailSelection = {
        ...getDetailVariantSelection(matchedVariant || selection, product),
        ...selection
    };
    currentSelectedDetailVariant = matchedVariant
        ? { ...matchedVariant }
        : {
            ...selection,
            label: String(selection.label || selection.selectedVariantLabel || "").trim(),
            color: String(selection.color || selection.selectedVariantColor || "").trim(),
            material: String(selection.material || selection.selectedVariantMaterial || "").trim(),
            stockQuantity: selection.stockQuantity,
            price: selection.price,
            discountPrice: selection.discountPrice
        };

    console.log("Selected options:", currentDetailSelection);
    console.log("Matched variant:", currentSelectedDetailVariant);

    return currentSelectedDetailVariant;
}

function getShopEffectivePrice(product = {}) {
    const discountPrice = Number(product.discountPrice);
    if (Number.isFinite(discountPrice) && discountPrice > 0) {
        return discountPrice;
    }

    const price = Number(product.price);
    return Number.isFinite(price) ? price : 0;
}

function getShopProductSortScore(product = {}) {
    const timestamp = Date.parse(product.createdAt || product.updatedAt || "");
    if (!Number.isNaN(timestamp)) {
        return timestamp;
    }

    return Number(product.id || 0);
}

function normalizeShopPriceValue(value) {
    const raw = String(value ?? "").trim();
    if (!raw) {
        return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeShopPriceRange(minPrice, maxPrice) {
    if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
        return { minPrice: maxPrice, maxPrice: minPrice };
    }

    return { minPrice, maxPrice };
}

async function fetchProductsForShop(params) {
    const search = params.get("search");
    const filter = params.get("filter");
    const pageQuery = `page=0&size=${SHOP_DATA_PAGE_SIZE}`;

    if (search) {
        return fetchWithFallback(
            () => apiGet(`/products/search?keyword=${encodeURIComponent(search)}&${pageQuery}`),
            fallbackData.products
        );
    }

    if (filter === "new") {
        return fetchWithFallback(() => apiGet(`/products/new-arrivals?${pageQuery}`), fallbackData.products.slice(0, 4));
    }

    return fetchWithFallback(() => apiGet(`/products?${pageQuery}`), fallbackData.products);
}

function getUniqueValues(products, field) {
    return [...new Set(
        products
            .map((product) => String(product?.[field] || "").trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
}

function valuesMatch(left, right) {
    return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

function productMatchesPetType(product = {}, petType = "") {
    if (!petType) {
        return true;
    }

    return valuesMatch(product.petType, petType) ||
        categoryNamesMatch(product.category?.name || product.categoryName || "", petType);
}

function buildShopFilterLink(params, key, value) {
    const nextParams = new URLSearchParams(params);
    if (value) {
        nextParams.set(key, value);
    } else {
        nextParams.delete(key);
    }
    nextParams.delete("page");
    return `shop.html?${nextParams.toString()}`;
}

function buildShopFilterStateLink(params, updates = {}) {
    const nextParams = new URLSearchParams(params);

    Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
            nextParams.delete(key);
            return;
        }

        nextParams.set(key, String(value));
    });

    nextParams.delete("page");
    const query = nextParams.toString();
    return query ? `shop.html?${query}` : "shop.html";
}

function buildShopPageLink(params, pageNumber) {
    const nextParams = new URLSearchParams(params);
    if (pageNumber <= 1) {
        nextParams.delete("page");
    } else {
        nextParams.set("page", String(pageNumber));
    }

    const query = nextParams.toString();
    return query ? `shop.html?${query}` : "shop.html";
}

function bindShopMobileFilterToggle() {
    const filterPanel = document.getElementById("shop-filter-panel");
    const toggle = document.querySelector("[data-shop-filter-toggle]");
    if (!filterPanel || !toggle || toggle.dataset.bound === "true") {
        return;
    }

    toggle.dataset.bound = "true";
    toggle.addEventListener("click", () => {
        const isOpen = filterPanel.classList.toggle("is-mobile-filter-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });
}

function updateShopHistory(params, { replace = false } = {}) {
    const query = params.toString();
    const nextUrl = query ? `shop.html?${query}` : "shop.html";
    if (replace) {
        window.history.replaceState({}, "", nextUrl);
    } else {
        window.history.pushState({}, "", nextUrl);
    }
}

async function navigateShop(params, { replace = false } = {}) {
    updateShopHistory(params, { replace });
    await loadShopPage();
}

function scrollShopResultsIntoView() {
    const target = document.getElementById("shop-product-grid") || document.getElementById("shop-results-meta");
    if (!target) {
        return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderShopPagination(params, totalItems, currentPage, pageSize) {
    const paginationRoot = document.getElementById("shop-pagination");
    if (!paginationRoot) {
        return;
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (totalItems <= pageSize) {
        paginationRoot.innerHTML = "";
        return;
    }

    const visiblePages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let page = startPage; page <= endPage; page += 1) {
        visiblePages.push(page);
    }

    paginationRoot.innerHTML = `
        <a class="shop-pagination-button ${currentPage === 1 ? "is-disabled" : ""}" href="${currentPage === 1 ? "#" : buildShopPageLink(params, currentPage - 1)}" ${currentPage === 1 ? 'aria-disabled="true"' : ""}>Previous</a>
        <div class="shop-pagination-pages">
            ${startPage > 1 ? `<a class="shop-pagination-number" href="${buildShopPageLink(params, 1)}">1</a>${startPage > 2 ? '<span class="shop-pagination-ellipsis">...</span>' : ""}` : ""}
            ${visiblePages.map((page) => `
                <a class="shop-pagination-number ${page === currentPage ? "is-active" : ""}" href="${buildShopPageLink(params, page)}">${page}</a>
            `).join("")}
            ${endPage < totalPages ? `${endPage < totalPages - 1 ? '<span class="shop-pagination-ellipsis">...</span>' : ""}<a class="shop-pagination-number" href="${buildShopPageLink(params, totalPages)}">${totalPages}</a>` : ""}
        </div>
        <a class="shop-pagination-button ${currentPage === totalPages ? "is-disabled" : ""}" href="${currentPage === totalPages ? "#" : buildShopPageLink(params, currentPage + 1)}" ${currentPage === totalPages ? 'aria-disabled="true"' : ""}>Next</a>
    `;
}

function buildCategoryCardStyle(index) {
    const palettes = [
        { bg: "linear-gradient(135deg, rgba(240,0,0,0.12), rgba(255,255,255,0.96))", accent: "#F00000", glow: "rgba(240,0,0,0.18)" },
        { bg: "linear-gradient(135deg, rgba(17,17,17,0.08), rgba(255,255,255,0.96))", accent: "#111111", glow: "rgba(17,17,17,0.12)" },
        { bg: "linear-gradient(135deg, rgba(255,180,180,0.22), rgba(255,255,255,0.96))", accent: "#c81d25", glow: "rgba(240,0,0,0.14)" },
        { bg: "linear-gradient(135deg, rgba(255,90,90,0.14), rgba(255,250,250,0.97))", accent: "#E11D48", glow: "rgba(225,29,72,0.14)" },
        { bg: "linear-gradient(135deg, rgba(255,220,220,0.38), rgba(255,255,255,0.98))", accent: "#9A3412", glow: "rgba(154,52,18,0.12)" },
        { bg: "linear-gradient(135deg, rgba(255,245,245,0.98), rgba(255,232,232,0.88))", accent: "#B91C1C", glow: "rgba(185,28,28,0.14)" }
    ];

    return palettes[index % palettes.length];
}

function markCartButtonsAsViewCart(productId) {
    document.querySelectorAll(`[data-action="cart"][data-product-id="${productId}"], [data-action="view-cart"][data-product-id="${productId}"]`).forEach((button) => {
        button.textContent = "View Cart";
        button.dataset.action = "view-cart";
        if (button.tagName === "A") {
            button.href = "cart.html";
        }
        button.classList.add("is-added");
        button.setAttribute("aria-pressed", "true");
    });

    try {
        const existing = JSON.parse(localStorage.getItem("leo_cart_product_ids") || "[]");
        const next = new Set(Array.isArray(existing) ? existing.map((value) => Number(value)).filter(Boolean) : []);
        next.add(Number(productId));
        localStorage.setItem("leo_cart_product_ids", JSON.stringify([...next]));
    } catch (error) {
        console.warn("Unable to cache cart state:", error.message);
    }
}

async function handleProtectedProductAction(action, productId, triggerElement) {
    if (!requireCustomerAuth()) {
        return;
    }

    const numericProductId = Number(productId);

    if (action === "view-cart") {
        window.location.href = "cart.html";
        return;
    }

    try {
        if (action === "cart") {
            const root = triggerElement.closest(".product-card, .detail-summary");
            const selectedVariantStock = Number(root?.dataset.selectedVariantStock || triggerElement.dataset.variantStock || 0);
            if (!isVariantStockAvailable(selectedVariantStock)) {
                showFlashMessage("This item is out of stock.", "error");
                return;
            }

            const quantityInput = root?.querySelector("[data-detail-quantity]");
            const quantity = Math.min(
                Math.max(1, Number(quantityInput?.value || triggerElement.dataset.quantity || 1)),
                Math.max(1, selectedVariantStock || 1)
            );
            const selectedVariantLabel = root?.dataset.selectedVariantLabel || triggerElement.dataset.variantLabel || "";
            const selectedVariantColor = root?.dataset.selectedVariantColor || triggerElement.dataset.variantColor || "";
            const selectedVariantPrice = Number(root?.dataset.selectedVariantPrice || triggerElement.dataset.variantPrice || 0);
            const selectedVariantDiscountPrice = root?.dataset.selectedVariantDiscountPrice
                ? Number(root.dataset.selectedVariantDiscountPrice)
                : (triggerElement.dataset.variantDiscountPrice ? Number(triggerElement.dataset.variantDiscountPrice) : null);

            await apiPost("/cart/add", {
                productId: numericProductId,
                quantity,
                selectedVariantLabel,
                selectedVariantColor,
                selectedVariantPrice: selectedVariantPrice || null,
                selectedVariantDiscountPrice
            });
            markCartButtonsAsViewCart(numericProductId);
            if (typeof window.syncSavedActionStates === "function") {
                await window.syncSavedActionStates();
            }
            showFlashMessage("Product added to cart.", "success");
        }

        await updateNavbarCounts();
    } catch (error) {
        showFlashMessage(error.message || "Unable to complete this action.", "error");
    }
}

function getVariantDisplayLabel(variant = {}, product = {}) {
    const label = String(variant.label || "").trim();
    if (label && label.toLowerCase() !== "default") {
        return label;
    }

    const fallbackLabel = String(product.packSize || product.weightSize || "").trim();
    if (fallbackLabel && fallbackLabel.toLowerCase() !== "default") {
        return fallbackLabel;
    }

    return "";
}

function isVariantStockAvailable(stockQuantity) {
    return Number(stockQuantity || 0) > 0;
}

function getStockStatusLabel(stockQuantity) {
    const parsedStock = Number(stockQuantity || 0);
    return parsedStock > 0 ? `${parsedStock} available` : "Out of stock";
}

function normalizeProductVariantLookupValue(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizeProductImageUrls(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || "").trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        const raw = value.trim();
        if (!raw) {
            return [];
        }

        if (raw.startsWith("[")) {
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed.map((item) => String(item || "").trim()).filter(Boolean) : [];
            } catch (error) {
                return [];
            }
        }

        return raw.split("\n").map((item) => item.trim()).filter(Boolean);
    }

    return [];
}

function getVariantGalleryImages(variant = {}, product = {}) {
    const variantImages = normalizeProductImageUrls(variant.imageUrls)
        .concat(normalizeProductImageUrls(variant.imageUrlsJson))
        .map(resolveMediaUrl);

    if (variantImages.length) {
        return [...new Set(variantImages)].slice(0, 4);
    }

    return getProductGalleryImages(product);
}

function getProductGalleryImages(product = {}) {
    return [product.imageUrl]
        .concat((product.images || []).map((image) => image.imageUrl).filter(Boolean))
        .filter(Boolean)
        .map(resolveMediaUrl)
        .slice(0, 4);
}

function resolveProductVariantFromParams(product = {}, selectedVariantLabel = "", selectedVariantColor = "") {
    const variants = normalizeProductVariants(product);
    if (!variants.length) {
        return null;
    }

    const label = normalizeProductVariantLookupValue(selectedVariantLabel);
    const color = normalizeProductVariantLookupValue(selectedVariantColor);

    if (label || color) {
        const exactMatch = variants.find((variant) => {
            const variantLabel = normalizeProductVariantLookupValue(getVariantDisplayLabel(variant, product));
            const variantColor = normalizeProductVariantLookupValue(variant.color || product.color || "");
            return (!label || variantLabel === label) && (!color || variantColor === color);
        });

        if (exactMatch) {
            return exactMatch;
        }

        if (label) {
            const labelMatch = variants.find((variant) => normalizeProductVariantLookupValue(getVariantDisplayLabel(variant, product)) === label);
            if (labelMatch) {
                return labelMatch;
            }
        }

        if (color) {
            const colorMatch = variants.find((variant) => normalizeProductVariantLookupValue(variant.color || product.color || "") === color);
            if (colorMatch) {
                return colorMatch;
            }
        }
    }

    return getSelectedProductVariant(product);
}

function syncCartAvailabilityState(root) {
    if (!root) {
        return;
    }

    const selectedStock = Number(root.dataset.selectedVariantStock || 0);
    const cartButtons = root.querySelectorAll('[data-action="cart"][data-product-id], [data-action="view-cart"][data-product-id]');

    cartButtons.forEach((button) => {
        if (button.dataset.action === "view-cart") {
            button.classList.remove("is-disabled");
            button.removeAttribute("aria-disabled");
            button.removeAttribute("tabindex");
            return;
        }

        if (isVariantStockAvailable(selectedStock)) {
            button.textContent = "Add to Cart";
            button.classList.remove("is-disabled");
            button.removeAttribute("aria-disabled");
            button.removeAttribute("tabindex");
            if (button.tagName === "A") {
                button.href = "cart.html";
            }
            return;
        }

        button.textContent = "Out of Stock";
        button.classList.add("is-disabled");
        button.setAttribute("aria-disabled", "true");
        button.setAttribute("tabindex", "-1");
    });
}

function normalizeVariantButtonsData(product = {}) {
    const uniqueVariants = new Map();

    normalizeProductVariants(product)
        .map((variant) => ({
            ...variant,
            displayLabel: getVariantDisplayLabel(variant, product)
        }))
        .filter((variant) => variant.displayLabel)
        .forEach((variant) => {
            const key = `${String(variant.color || "").trim().toLowerCase()}::${String(variant.displayLabel || "").trim().toLowerCase()}`;
            const existing = uniqueVariants.get(key);

            if (!existing || variant.defaultSelected) {
                uniqueVariants.set(key, variant);
            }
        });

    return [...uniqueVariants.values()].sort((left, right) => left.displayOrder - right.displayOrder);
}

function renderVariantChipButtons(product = {}) {
    const variants = normalizeVariantButtonsData(product);
    const selectedVariant = getSelectedProductVariant(product);
    if (variants.length <= 1) {
        return "";
    }

    return `
        <div class="variant-chip-row" data-variant-row>
            ${variants.map((variant, index) => `
                <button
                    type="button"
                    class="variant-chip ${variant.label === selectedVariant?.label ? "is-active" : ""} ${!isVariantStockAvailable(variant.stockQuantity) ? "is-disabled" : ""}"
                    data-action="variant"
                    data-variant-index="${index}"
                    data-variant-label="${variant.displayLabel}"
                    data-variant-color="${escapeHtml(variant.color || "")}"
                    data-variant-price="${variant.price}"
                    data-variant-discount-price="${variant.discountPrice ?? ""}"
                    data-variant-stock="${variant.stockQuantity}"
                    data-variant-material="${escapeHtml(variant.material || "")}"
                    data-variant-image-urls="${escapeHtml(JSON.stringify(variant.imageUrls || []))}"
                    data-variant-default="${variant.defaultSelected ? "true" : "false"}"
                    ${!isVariantStockAvailable(variant.stockQuantity) ? "disabled" : ""}
                >${variant.displayLabel}${!isVariantStockAvailable(variant.stockQuantity) ? " · Out of stock" : ""}</button>
            `).join("")}
        </div>
    `;
}

function renderSelectableVariantControls(product = {}) {
    const variants = normalizeVariantButtonsData(product).map((variant) => ({
        ...variant,
        displayLabel: getVariantDisplayLabel(variant, product)
    }));
    const selectedVariant = getSelectedProductVariant(product);
    const selectedColor = String(selectedVariant?.color || product.color || "").trim();
    const colors = [...new Set(variants.map((variant) => String(variant.color || "").trim()).filter(Boolean))];

    const colorMarkup = colors.length > 1 ? `
        <div class="variant-chip-row variant-chip-row--color" data-variant-color-row>
            ${colors.map((color) => `
                <button
                    type="button"
                    class="variant-chip ${String(color).toLowerCase() === selectedColor.toLowerCase() ? "is-active" : ""}"
                    data-action="variant-color"
                    data-variant-color="${escapeHtml(color)}"
                >${escapeHtml(color)}</button>
            `).join("")}
        </div>
    ` : "";

    const variantMarkup = variants.length > 1 ? `
        <div class="variant-chip-row" data-variant-row>
            ${variants.map((variant, index) => `
                <button
                    type="button"
                    class="variant-chip ${variant.color === selectedColor && variant.label === selectedVariant?.label ? "is-active" : ""} ${!isVariantStockAvailable(variant.stockQuantity) ? "is-disabled" : ""}"
                    data-action="variant"
                    data-variant-index="${index}"
                    data-variant-label="${variant.displayLabel}"
                    data-variant-color="${escapeHtml(variant.color || "")}"
                    data-variant-price="${variant.price}"
                    data-variant-discount-price="${variant.discountPrice ?? ""}"
                    data-variant-stock="${variant.stockQuantity}"
                    data-variant-material="${escapeHtml(variant.material || "")}"
                    data-variant-image-urls="${escapeHtml(JSON.stringify(variant.imageUrls || []))}"
                    data-variant-default="${variant.defaultSelected ? "true" : "false"}"
                    ${!isVariantStockAvailable(variant.stockQuantity) ? "disabled" : ""}
                >${variant.displayLabel}${!isVariantStockAvailable(variant.stockQuantity) ? " Â· Out of stock" : ""}</button>
            `).join("")}
        </div>
    ` : "";

    return `${colorMarkup}${variantMarkup}`;
}

function applySelectableVariantSelection(root, selectedButton) {
    if (!root || !selectedButton) {
        return;
    }

    const variantButtons = root.querySelectorAll('[data-action="variant"]');
    const colorButtons = root.querySelectorAll('[data-action="variant-color"]');
    const selectedLabel = selectedButton.dataset.variantLabel || "";
    const selectedColor = String(selectedButton.dataset.variantColor || "").trim();

    root.dataset.selectedVariantLabel = selectedLabel;
    root.dataset.selectedVariantColor = selectedColor;
    root.dataset.selectedVariantPrice = String(selectedButton.dataset.variantPrice || "");
    root.dataset.selectedVariantDiscountPrice = String(selectedButton.dataset.variantDiscountPrice || "");
    root.dataset.selectedVariantStock = String(selectedButton.dataset.variantStock || "");
    root.dataset.selectedVariantMaterial = String(selectedButton.dataset.variantMaterial || "");

    const selectedVariantState = setCurrentDetailVariant(currentProductDetail || {}, {
        label: selectedLabel,
        color: selectedColor,
        material: String(selectedButton.dataset.variantMaterial || "").trim(),
        stockQuantity: selectedButton.dataset.variantStock,
        price: selectedButton.dataset.variantPrice,
        discountPrice: selectedButton.dataset.variantDiscountPrice,
        pack: selectedLabel
    });

    variantButtons.forEach((button) => {
        button.classList.toggle("is-active", button === selectedButton);
    });

    colorButtons.forEach((button) => {
        const isActive = String(button.dataset.variantColor || "").trim().toLowerCase() === selectedColor.toLowerCase();
        button.classList.toggle("is-active", isActive || (!selectedColor && button === colorButtons[0]));
        button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    });

    updateDetailSummaryPricing(root, currentProductDetail || {}, selectedVariantState || currentSelectedDetailVariant);

    root.querySelectorAll("[data-current-pack]").forEach((element) => {
        element.textContent = selectedLabel;
    });

    renderProductSpecifications(selectedVariantState || currentSelectedDetailVariant, root);

    root.querySelectorAll("[data-current-stock]").forEach((element) => {
        element.textContent = getStockStatusLabel(selectedButton.dataset.variantStock);
    });

    const selectedStockValue = Number(selectedButton.dataset.variantStock || 0);
    root.querySelectorAll("[data-benefit-key]").forEach((element) => {
        const key = element.dataset.benefitKey;
        const titleNode = element.querySelector("strong");
        const textNode = element.querySelector("span");

        if (key === "highlight") {
            if (titleNode) {
                titleNode.textContent = "Comfort first";
            }
            return;
        }

        if (key === "material") {
            const nextMaterial = String(selectedButton.dataset.variantMaterial || root.dataset.selectedVariantMaterial || "").trim();
            if (titleNode && nextMaterial) {
                titleNode.textContent = "Quality made";
            }
            if (textNode && nextMaterial) {
                textNode.textContent = `${nextMaterial} with a clean, reliable finish.`;
            }
            return;
        }

        if (key === "stock") {
            if (titleNode) {
                titleNode.textContent = selectedStockValue > 0 ? `${selectedStockValue} in stock` : "Out of stock";
            }
            if (textNode) {
                textNode.textContent = selectedStockValue > 0
                    ? "Ready to ship from our current stock."
                    : "This variant is currently unavailable.";
            }
        }
    });

    syncCartAvailabilityState(root);
    syncDetailQuantityControl(root);

    const galleryImages = normalizeProductImageUrls(selectedButton.dataset.variantImageUrls);
    refreshProductGallery(galleryImages, root.querySelector("h1")?.textContent || "Product");
}

function syncSelectableVariantState(root) {
    if (!root) {
        return;
    }

    const selectedColor = String(root.dataset.selectedVariantColor || "").trim().toLowerCase();
    const colorButtons = root.querySelectorAll('[data-action="variant-color"]');
    const variantButtons = Array.from(root.querySelectorAll('[data-action="variant"]'));

    colorButtons.forEach((button, index) => {
        const isActive = String(button.dataset.variantColor || "").trim().toLowerCase() === selectedColor;
        button.classList.toggle("is-active", isActive || (!selectedColor && index === 0));
        button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    });

    const visibleVariants = [];
    variantButtons.forEach((button) => {
        const variantColor = String(button.dataset.variantColor || "").trim().toLowerCase();
        const isVisible = !selectedColor || !variantColor || variantColor === selectedColor;
        button.hidden = !isVisible;
        button.classList.toggle("is-hidden", !isVisible);
        button.setAttribute("aria-hidden", String(!isVisible));

        if (isVisible) {
            visibleVariants.push(button);
        }
    });

    const activeVariant = visibleVariants.find((button) => button.classList.contains("is-active"))
        || visibleVariants.find((button) => button.dataset.variantDefault === "true")
        || visibleVariants[0];

    if (activeVariant) {
        applySelectableVariantSelection(root, activeVariant);
    }
}

function bindSelectableVariantInteractions(container) {
    if (!container || container.dataset.selectableVariantBound === "true") {
        return;
    }

    container.dataset.selectableVariantBound = "true";

    container.addEventListener("click", (event) => {
        const button = event.target.closest('[data-action="variant"], [data-action="variant-color"]');
        if (!button || !container.contains(button)) {
            return;
        }

        const root = button.closest(".detail-summary");
        if (!root) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (button.dataset.action === "variant-color") {
            root.dataset.selectedVariantColor = String(button.dataset.variantColor || "").trim();
            syncSelectableVariantState(root);
            return;
        }

        applySelectableVariantSelection(root, button);
    });

    container.querySelectorAll(".detail-summary").forEach((root) => {
        if (!root.dataset.selectedVariantColor) {
            const selectedVariant = getSelectedProductVariant({
                variants: Array.from(root.querySelectorAll('[data-action="variant"]')).map((button) => ({
                    color: button.dataset.variantColor || "",
                    label: button.dataset.variantLabel || "",
                    price: button.dataset.variantPrice,
                    discountPrice: button.dataset.variantDiscountPrice,
                    stockQuantity: button.dataset.variantStock,
                    defaultSelected: button.dataset.variantDefault === "true"
                }))
            });
            root.dataset.selectedVariantColor = String(selectedVariant?.color || "").trim();
        }

        syncSelectableVariantState(root);
    });
}

function updateVariantSelection(triggerElement) {
    if (!triggerElement || triggerElement.disabled || !isVariantStockAvailable(triggerElement.dataset.variantStock)) {
        return;
    }

    const root = triggerElement.closest(".product-card, .detail-summary");
    if (!root) {
        return;
    }

    const buttons = root.querySelectorAll('[data-action="variant"]');
    const selectedLabel = triggerElement.dataset.variantLabel || "";
    const selectedColor = String(triggerElement.dataset.variantColor || "").trim();

    root.dataset.selectedVariantLabel = selectedLabel;
    root.dataset.selectedVariantColor = selectedColor;
    root.dataset.selectedVariantPrice = String(triggerElement.dataset.variantPrice || "");
    root.dataset.selectedVariantDiscountPrice = String(triggerElement.dataset.variantDiscountPrice || "");
    root.dataset.selectedVariantStock = String(triggerElement.dataset.variantStock || "");
    root.dataset.selectedVariantMaterial = String(triggerElement.dataset.variantMaterial || "");

    const selectedVariantState = setCurrentDetailVariant(currentProductDetail || {}, {
        label: selectedLabel,
        color: selectedColor,
        material: String(triggerElement.dataset.variantMaterial || "").trim(),
        stockQuantity: triggerElement.dataset.variantStock,
        price: triggerElement.dataset.variantPrice,
        discountPrice: triggerElement.dataset.variantDiscountPrice,
        pack: selectedLabel
    });

    buttons.forEach((button) => {
        button.classList.toggle("is-active", button === triggerElement);
    });

    updateDetailSummaryPricing(root, currentProductDetail || {}, selectedVariantState || currentSelectedDetailVariant);

    root.querySelectorAll("[data-current-pack]").forEach((element) => {
        element.textContent = selectedLabel;
    });

    renderProductSpecifications(selectedVariantState || currentSelectedDetailVariant, root);

    root.querySelectorAll("[data-current-stock]").forEach((element) => {
        element.textContent = getStockStatusLabel(triggerElement.dataset.variantStock);
    });

    const selectedStockValue = Number(triggerElement.dataset.variantStock || 0);
    root.querySelectorAll("[data-benefit-key]").forEach((element) => {
        const key = element.dataset.benefitKey;
        const titleNode = element.querySelector("strong");
        const textNode = element.querySelector("span");

        if (key === "highlight") {
            if (titleNode) {
                titleNode.textContent = "Comfort first";
            }
            return;
        }

        if (key === "material") {
            const nextMaterial = String(triggerElement.dataset.variantMaterial || root.dataset.selectedVariantMaterial || "").trim();
            if (titleNode && nextMaterial) {
                titleNode.textContent = "Quality made";
            }
            if (textNode && nextMaterial) {
                textNode.textContent = `${nextMaterial} with a clean, reliable finish.`;
            }
            return;
        }

        if (key === "stock") {
            if (titleNode) {
                titleNode.textContent = selectedStockValue > 0 ? `${selectedStockValue} in stock` : "Out of stock";
            }
            if (textNode) {
                textNode.textContent = selectedStockValue > 0
                    ? "Ready to ship from our current stock."
                    : "This variant is currently unavailable.";
            }
        }
    });

    syncCartAvailabilityState(root);
    syncDetailQuantityControl(root);

    const galleryImages = normalizeProductImageUrls(triggerElement.dataset.variantImageUrls);
    if (root.classList.contains("detail-summary")) {
        refreshProductGallery(galleryImages, root.querySelector("h1")?.textContent || "Product");
        return;
    }

    const nextImageUrl = galleryImages[0] ? resolveMediaUrl(galleryImages[0]) : "";
    const media = root.querySelector(".product-media");
    let mediaImage = media?.querySelector("[data-product-card-image]");

    if (media && !mediaImage && nextImageUrl) {
        media.querySelector(".product-media-placeholder")?.remove();
        mediaImage = document.createElement("img");
        mediaImage.loading = "lazy";
        mediaImage.decoding = "async";
        mediaImage.alt = root.querySelector("h3")?.textContent?.trim() || "Product";
        mediaImage.dataset.productCardImage = "";
        media.prepend(mediaImage);
    }

    if (media && mediaImage && nextImageUrl) {
        mediaImage.src = nextImageUrl;
        media.classList.remove("is-empty");
    }
}

function setupProductGallery(gallery) {
    if (!Array.isArray(gallery) || !gallery.length) {
        return;
    }

    const root = document.querySelector('[data-page="product-details"] .detail-gallery');
    if (!root) {
        return;
    }

    const mainImage = root.querySelector("[data-gallery-main]");
    const thumbButtons = Array.from(root.querySelectorAll("[data-gallery-thumb]"));
    let activeIndex = 0;

    const setActiveImage = (nextIndex) => {
        if (!mainImage || !gallery.length) {
            return;
        }

        activeIndex = (nextIndex + gallery.length) % gallery.length;
        mainImage.src = gallery[activeIndex];

        thumbButtons.forEach((button, index) => {
            button.classList.toggle("is-active", index === activeIndex);
            button.setAttribute("aria-pressed", String(index === activeIndex));
        });
    };

    thumbButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const nextIndex = Number(button.dataset.galleryThumb || 0);
            setActiveImage(nextIndex);
        });
    });

    setActiveImage(0);

    if (window.__leoProductGalleryTimer) {
        window.clearInterval(window.__leoProductGalleryTimer);
    }

    window.__leoProductGalleryTimer = window.setInterval(() => {
        setActiveImage(activeIndex + 1);
    }, 3000);
}

function renderProductGalleryMarkup(gallery, productName, product = {}) {
    const safeGallery = [...new Set((Array.isArray(gallery) ? gallery : []).filter(Boolean))]
        .map(resolveMediaUrl)
        .slice(0, 4);

    if (!safeGallery.length) {
        return `
            <div class="detail-gallery-stage">
                <div class="detail-gallery-orb detail-gallery-orb-one" aria-hidden="true"></div>
                <div class="detail-gallery-orb detail-gallery-orb-two" aria-hidden="true"></div>
                <div class="detail-gallery-badges" aria-hidden="true">
                    ${product.featured ? '<span class="detail-gallery-badge">Best Seller</span>' : ""}
                    ${hasValue(product.category?.name) ? `<span class="detail-gallery-badge is-secondary">${escapeHtml(product.category.name)}</span>` : ""}
                </div>
                <div class="detail-main-image is-empty">
                    <div class="detail-main-image-placeholder" aria-hidden="true">
                        <span>No image</span>
                        <strong>Image not available</strong>
                        <em>This product has no uploaded image yet.</em>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="detail-gallery-stage">
            <div class="detail-gallery-orb detail-gallery-orb-one" aria-hidden="true"></div>
            <div class="detail-gallery-orb detail-gallery-orb-two" aria-hidden="true"></div>
            <div class="detail-gallery-badges" aria-hidden="true">
                ${product.featured ? '<span class="detail-gallery-badge">Best Seller</span>' : ""}
                ${hasValue(product.category?.name) ? `<span class="detail-gallery-badge is-secondary">${escapeHtml(product.category.name)}</span>` : ""}
            </div>
            <div class="detail-main-image">
                <img data-gallery-main src="${safeGallery[0]}" alt="${escapeHtml(productName)}">
            </div>
        </div>
        <div class="detail-thumbs">
            ${safeGallery.map((image, index) => `
                <button type="button" class="detail-thumb ${index === 0 ? "is-active" : ""}" data-gallery-thumb="${index}" aria-pressed="${index === 0}">
                    <img src="${image}" alt="${escapeHtml(productName)} image ${index + 1}">
                </button>
            `).join("")}
        </div>
    `;
}

function refreshProductGallery(gallery, productName) {
    const galleryRoot = document.querySelector('[data-page="product-details"] .detail-gallery');
    if (!galleryRoot) {
        return;
    }

    const fallbackGallery = normalizeProductImageUrls(galleryRoot.dataset.defaultGallery).map(resolveMediaUrl);
    const normalizedGallery = [...new Set((Array.isArray(gallery) ? gallery : []).filter(Boolean))]
        .map(resolveMediaUrl)
        .slice(0, 4);
    const nextGallery = normalizedGallery.length ? normalizedGallery : fallbackGallery;
    galleryRoot.innerHTML = renderProductGalleryMarkup(nextGallery, productName);

    if (nextGallery.length) {
        setupProductGallery(nextGallery);
    }
}

function getDetailRatingValue(product = {}) {
    const rating = Number(product.rating || product.averageRating || product.reviewRating || 4.8);
    if (Number.isFinite(rating) && rating > 0) {
        return Math.min(5, Math.max(0, rating));
    }

    return 4.8;
}

function getDetailReviewCount(product = {}) {
    const count = Number(product.reviewCount || product.totalReviews || product.reviewsCount || 124);
    return Number.isFinite(count) && count >= 0 ? count : 124;
}

function getDetailTrustStripItems() {
    return [
        ["Safe Checkout", "Secure payments"],
        ["Fresh Products", "Quality checked"],
        ["Fast Delivery", "Carefully packed"],
        ["Trusted Store", "Loved by pet parents"]
    ];
}

function getDetailBenefitCards(product = {}, selectedVariant = {}) {
    const highlights = String(product.highlights || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    const stockValue = Number(selectedVariant.stockQuantity ?? product.stockQuantity ?? 0);
    const cards = [];

    if (highlights[0]) {
        cards.push({
            key: "highlight",
            title: "Comfort first",
            text: highlights[0]
        });
    }

    const materialValue = String(selectedVariant.material || product.material || "").trim();

    if (materialValue) {
        cards.push({
            key: "material",
            title: "Quality made",
            text: `${materialValue} with a clean, reliable finish.`
        });
    }

    if (Number.isFinite(stockValue) && stockValue > 0) {
        cards.push({
            key: "stock",
            title: `${stockValue} in stock`,
            text: "Ready to ship from our current stock."
        });
    }

    return cards.slice(0, 3);
}

function getDetailSpecRows(product = {}, selectedVariant = {}) {
    const rows = [];
    const detailFields = getProductDetailFields(product);

    const pushRow = (label, value, options = {}) => {
        const text = String(value || "").trim();
        if (text || options.allowEmpty) {
            rows.push({
                key: label.toLowerCase().replace(/[^a-z]+/g, "-"),
                label,
                value: text,
                hidden: !text && options.hideWhenEmpty !== false
            });
        }
    };

    pushRow("Product type", product.productType);
    pushRow("Pet type", product.petType);
    pushRow("Category", product.category?.name);
    pushRow("Material", detailFields.material);
    pushRow("Weight range", detailFields.weightRange);
    pushRow("Age type", detailFields.ageType);
    pushRow("Brand", product.brand);

    return rows;
}

function syncDetailSpecRow(root, key, value) {
    if (!root) {
        return;
    }

    const row = root.querySelector(`[data-spec-key="${key}"]`);
    if (!row) {
        return;
    }

    const valueNode = row.querySelector("[data-spec-value]");
    const text = String(value || "").trim();

    if (valueNode) {
        valueNode.textContent = text;
    }

    row.hidden = !text;
}

function updateDetailSummaryPricing(root, product = {}, selectedVariant = {}) {
    if (!root) {
        return;
    }

    const currentPrice = root.querySelector("[data-current-price]");
    const oldPrice = root.querySelector("[data-old-price]");
    const currentPriceValue = selectedVariant.discountPrice ?? selectedVariant.price ?? product.discountPrice ?? product.price;
    const oldPriceValue = selectedVariant.discountPrice != null
        ? selectedVariant.price
        : (product.discountPrice ? product.price : null);

    if (currentPrice && hasValue(currentPriceValue)) {
        currentPrice.textContent = formatCurrency(currentPriceValue);
    }

    if (oldPrice) {
        if (hasValue(oldPriceValue) && hasValue(currentPriceValue) && Number(currentPriceValue) < Number(oldPriceValue)) {
            oldPrice.hidden = false;
            oldPrice.textContent = formatCurrency(oldPriceValue);
        } else {
            oldPrice.hidden = true;
        }
    }
}

function renderProductSpecifications(selectedVariant = {}, root = document.querySelector('[data-page="product-details"]')) {
    if (!root || !currentProductDetail) {
        return;
    }

    const product = currentProductDetail;
    const specsContainer = root.querySelector("#productSpecsGrid");
    if (!specsContainer) {
        return;
    }

    const specs = [
        { label: "Product Type", value: getSpecValue(product.productType, null) },
        { label: "Pet Type", value: getSpecValue(product.petType, null) },
        { label: "Category", value: getSpecValue(product.category?.name || product.category, null) },
        { label: "Material", value: getSpecValue(product.material, null) },
        { label: "Weight Range", value: getSpecValue(product.weightRange, null) },
        { label: "Age Type", value: getSpecValue(product.ageType, null) },
        { label: "Brand", value: getSpecValue(product.brand, null) }
    ].filter((item) => hasValue(item.value));

    specsContainer.innerHTML = specs.map((item) => `
        <div class="detail-spec-row">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
        </div>
    `).join("");
}

function renderRelatedProductCard(product = {}) {
    const selectedVariant = getSelectedProductVariant(product);
    const rawImageUrl = String(product.mainImageUrl || product.imageUrl || product.images?.[0]?.imageUrl || "").trim();
    const hasImage = Boolean(rawImageUrl);
    const productImage = hasImage ? resolveMediaUrl(rawImageUrl) : "";
    const currentPrice = selectedVariant.discountPrice ?? selectedVariant.price ?? product.discountPrice ?? product.price;
    const originalPrice = selectedVariant.discountPrice != null
        ? selectedVariant.price
        : (product.discountPrice ? product.price : null);
    const category = product.category?.name || product.categoryName || "Pet Care";
    const description = String(getProductCardSummary(product) || "").trim();
    const currentPack = getVariantDisplayLabel(selectedVariant, product) || product.packSize || selectedVariant.label || "";
    const extraChips = [
        product.color,
        product.size,
        product.material,
        product.packSize || product.weightSize
    ]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .slice(0, 3);

    return `
        <article class="detail-related-card" data-product-link="product-details.html?id=${product.id}" tabindex="0" role="link" aria-label="View ${escapeHtml(product.name || "Related product")}">
            <div class="detail-related-media ${hasImage ? "" : "is-empty"}">
                ${hasImage
                    ? `<img src="${productImage}" alt="${escapeHtml(product.name || "Related product")}" loading="lazy" decoding="async">`
                    : `
                        <div class="detail-related-media-placeholder" aria-hidden="true">
                            <span>No image</span>
                            <strong>${escapeHtml(product.name || "Product")}</strong>
                        </div>
                    `}
                ${product.featured ? '<span class="detail-related-badge">Featured</span>' : ""}
            </div>
            <div class="detail-related-body">
                <div class="detail-related-chips">
                    ${hasValue(category) ? `<span>${escapeHtml(category)}</span>` : ""}
                    ${hasValue(currentPack) ? `<span>${escapeHtml(currentPack)}</span>` : ""}
                    ${extraChips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}
                </div>
                <h3>${escapeHtml(product.name || "Product")}</h3>
                <p>${escapeHtml(description)}</p>
                <div class="detail-related-price-row">
                    <strong>${formatCurrency(currentPrice)}</strong>
                    ${originalPrice ? `<span>${formatCurrency(originalPrice)}</span>` : ""}
                </div>
                <a class="detail-related-view" href="product-details.html?id=${product.id}">View Product</a>
            </div>
        </article>
    `;
}

function getDetailQuantityInput(root) {
    return root?.querySelector("[data-detail-quantity]");
}

function syncDetailQuantityControl(root) {
    if (!root) {
        return;
    }

    const input = getDetailQuantityInput(root);
    if (!input) {
        return;
    }

    const stock = Math.max(1, Number(root.dataset.selectedVariantStock || 0) || 1);
    const currentValue = Number(input.value || 1);
    input.min = "1";
    input.max = String(stock);
    input.value = String(Math.min(Math.max(1, currentValue), stock));
}

function bindDetailQuantityControls(root) {
    if (!root || root.dataset.detailQuantityBound === "true") {
        return;
    }

    root.dataset.detailQuantityBound = "true";

    root.addEventListener("click", (event) => {
        const control = event.target.closest("[data-detail-quantity-step]");
        if (!control || !root.contains(control)) {
            return;
        }

        const input = getDetailQuantityInput(root);
        if (!input) {
            return;
        }

        event.preventDefault();
        const stock = Math.max(1, Number(root.dataset.selectedVariantStock || input.max || 1) || 1);
        const currentValue = Number(input.value || 1);
        const nextValue = control.dataset.detailQuantityStep === "decrease"
            ? currentValue - 1
            : currentValue + 1;

        input.value = String(Math.min(Math.max(1, nextValue), stock));
    });

    root.addEventListener("input", (event) => {
        const input = event.target.closest("[data-detail-quantity]");
        if (!input || !root.contains(input)) {
            return;
        }

        const stock = Math.max(1, Number(root.dataset.selectedVariantStock || input.max || 1) || 1);
        const value = Number(input.value || 1);
        input.value = String(Math.min(Math.max(1, value), stock));
    });

    syncDetailQuantityControl(root);
}

function bindProductActions() {
    if (document.body.dataset.productActionsBound === "true") {
        return;
    }

    document.body.dataset.productActionsBound = "true";

    function syncProductCardVariantPrice(root, selectedButton) {
        if (!root || !selectedButton) {
            return;
        }

        const currentPrice = root.querySelector("[data-current-price]");
        const oldPrice = root.querySelector("[data-old-price]");
        const buttons = root.querySelectorAll('[data-action="variant"]');
        const selectedPrice = Number(selectedButton.dataset.variantDiscountPrice || selectedButton.dataset.variantPrice || 0);
        const originalPrice = Number(selectedButton.dataset.variantPrice || 0);
        const hasOffer = selectedButton.dataset.variantDiscountPrice !== "";

        root.dataset.selectedVariantLabel = selectedButton.dataset.variantLabel || "";
        root.dataset.selectedVariantPrice = String(selectedButton.dataset.variantPrice || "");
        root.dataset.selectedVariantDiscountPrice = String(selectedButton.dataset.variantDiscountPrice || "");
        root.dataset.selectedVariantStock = String(selectedButton.dataset.variantStock || "");

        buttons.forEach((button) => {
            button.classList.toggle("is-active", button === selectedButton);
        });

        if (currentPrice) {
            currentPrice.textContent = formatCurrency(selectedPrice);
        }

        if (oldPrice) {
            if (hasOffer && originalPrice > selectedPrice) {
                oldPrice.hidden = false;
                oldPrice.textContent = formatCurrency(originalPrice);
            } else {
                oldPrice.hidden = true;
            }
        }
    }

    document.addEventListener("click", async (event) => {
        const actionButton = event.target.closest("[data-action]");
        if (actionButton) {
            const action = actionButton.dataset.action;
            const productId = actionButton.dataset.productId;
            if (!action) {
                return;
            }

            if (action === "variant") {
                event.preventDefault();
                event.stopPropagation();
                const root = actionButton.closest(".product-card, .detail-summary");
                syncProductCardVariantPrice(root, actionButton);
                if (typeof updateVariantSelection === "function") {
                    updateVariantSelection(actionButton);
                }
                return;
            }

            if (action === "variant-color") {
                event.preventDefault();
                event.stopPropagation();
                const root = actionButton.closest(".product-card, .detail-summary");
                if (root) {
                    root.dataset.selectedVariantColor = String(actionButton.dataset.variantColor || "").trim();
                    syncSelectableVariantState(root);
                }
                return;
            }

            if (!productId) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            await handleProtectedProductAction(action, productId, actionButton);
            return;
        }

        const card = event.target.closest("[data-product-link]");
        if (!card || event.target.closest("a, button, input, select, textarea")) {
            return;
        }

        event.preventDefault();
        window.location.href = card.dataset.productLink;
      });

      document.addEventListener("keydown", (event) => {
        const card = event.target.closest("[data-product-link]");
        if (!card) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            window.location.href = card.dataset.productLink;
        }
    });
}

async function renderShopPageState(params, categories, products) {
    const selectedCategory = params.get("category");
    const search = params.get("search");
    const filter = params.get("filter");
    const selectedPetType = params.get("petType");
    const selectedProductType = params.get("productType");
    const selectedColor = params.get("color");
    const selectedAge = params.get("age");
    const selectedMinPrice = normalizeShopPriceValue(params.get("minPrice"));
    const selectedMaxPrice = normalizeShopPriceValue(params.get("maxPrice"));
    const selectedSort = String(params.get("sort") || "").trim();
    const currentPage = Math.max(1, Number(params.get("page") || 1));
    const normalizedPriceRange = normalizeShopPriceRange(selectedMinPrice, selectedMaxPrice);
    const normalizedProducts = normalizeProductsData(products).map((product) => ({
        ...product,
        ...getProductDisplayDefaults(product)
    }));

    let filteredProducts = normalizedProducts;
    const petTypeProducts = selectedPetType
        ? normalizedProducts.filter((product) => productMatchesPetType(product, selectedPetType))
        : normalizedProducts;

    if (selectedCategory) {
        filteredProducts = filteredProducts.filter(product => (product.category?.name || "").toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedPetType) {
        filteredProducts = filteredProducts.filter((product) => productMatchesPetType(product, selectedPetType));
    }

    if (selectedProductType) {
        filteredProducts = filteredProducts.filter((product) => valuesMatch(product.productType, selectedProductType));
    }

    if (search) {
        const term = search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => {
            const values = [
                product.name,
                product.brand,
                product.category?.name,
                product.petType,
                product.productType,
                product.breedCompatibility,
                product.color,
                product.ageType,
                product.size,
                product.material,
                product.packSize,
                product.weightRange
            ].map(value => String(value || "").toLowerCase());

            return values.some(value => value.includes(term));
        });
    }

    if (filter === "featured") {
        filteredProducts = filteredProducts.filter(product => product.featured);
    } else if (filter === "new") {
        filteredProducts = filteredProducts.filter((product) => getShopProductSortScore(product) > 0)
            .sort((left, right) => getShopProductSortScore(right) - getShopProductSortScore(left));
    } else if (filter === "low-stock") {
        filteredProducts = filteredProducts.filter(product => product.stockQuantity <= 5);
    } else if (filter === "offers") {
        filteredProducts = filteredProducts.filter(product => Number(product.discountPrice || 0) > 0);
    }

    if (selectedColor) {
        filteredProducts = filteredProducts.filter(product => String(product.color || "").toLowerCase() === selectedColor.toLowerCase());
    }

    if (selectedAge) {
        filteredProducts = filteredProducts.filter(product => String(product.ageType || "").toLowerCase() === selectedAge.toLowerCase());
    }

    if (normalizedPriceRange.minPrice != null || normalizedPriceRange.maxPrice != null) {
        filteredProducts = filteredProducts.filter((product) => {
            const price = getShopEffectivePrice(product);
            if (normalizedPriceRange.minPrice != null && price < normalizedPriceRange.minPrice) {
                return false;
            }

            if (normalizedPriceRange.maxPrice != null && price > normalizedPriceRange.maxPrice) {
                return false;
            }

            return true;
        });
    }

    if (selectedSort === "price-asc") {
        filteredProducts = [...filteredProducts].sort((left, right) => getShopEffectivePrice(left) - getShopEffectivePrice(right));
    } else if (selectedSort === "price-desc") {
        filteredProducts = [...filteredProducts].sort((left, right) => getShopEffectivePrice(right) - getShopEffectivePrice(left));
    } else if (selectedSort === "newest") {
        filteredProducts = [...filteredProducts].sort((left, right) => getShopProductSortScore(right) - getShopProductSortScore(left));
    }

    const selectedFilterSummary = document.getElementById("shop-selected-filters");
    if (selectedFilterSummary) {
        const chips = [];
        if (selectedCategory) {
            chips.push(`<a class="filter-chip is-active" href="${buildShopFilterLink(params, "category", "")}">Category: ${selectedCategory}</a>`);
        }
        if (filter) {
            const filterLabel = {
                featured: "Featured",
                new: "New arrivals",
                offers: "Offers",
                "low-stock": "Low stock"
            }[filter] || filter.replace(/-/g, " ");
            chips.push(`<a class="filter-chip is-active" href="${buildShopFilterLink(params, "filter", "")}">Filter: ${filterLabel}</a>`);
        }
        if (selectedPetType) {
            chips.push(`<a class="filter-chip is-active" href="${buildShopFilterStateLink(params, { petType: "", productType: "" })}">Pet: ${selectedPetType}</a>`);
        }
        if (selectedProductType) {
            chips.push(`<a class="filter-chip is-active" href="${buildShopFilterLink(params, "productType", "")}">Type: ${selectedProductType}</a>`);
        }
        if (selectedColor) {
            chips.push(`<a class="filter-chip is-active" href="${buildShopFilterLink(params, "color", "")}">Color: ${selectedColor}</a>`);
        }
        if (selectedAge) {
            chips.push(`<a class="filter-chip is-active" href="${buildShopFilterLink(params, "age", "")}">Age: ${selectedAge}</a>`);
        }
        if (normalizedPriceRange.minPrice != null || normalizedPriceRange.maxPrice != null) {
            const minLabel = normalizedPriceRange.minPrice != null ? formatCurrency(normalizedPriceRange.minPrice) : "Any";
            const maxLabel = normalizedPriceRange.maxPrice != null ? formatCurrency(normalizedPriceRange.maxPrice) : "Any";
            chips.push(`<a class="filter-chip is-active" href="${buildShopFilterStateLink(params, { minPrice: "", maxPrice: "" })}">Price: ${minLabel} - ${maxLabel}</a>`);
        }
        if (selectedSort) {
            const sortLabel = {
                "price-asc": "Price: Low to High",
                "price-desc": "Price: High to Low",
                newest: "Newest First"
            }[selectedSort] || selectedSort;
            chips.push(`<a class="filter-chip is-active" href="${buildShopFilterStateLink(params, { sort: "" })}">Sort: ${sortLabel}</a>`);
        }
        if (search) {
            chips.push(`<a class="filter-chip is-active" href="${buildShopFilterLink(params, "search", "")}">Search: ${search}</a>`);
        }

        selectedFilterSummary.innerHTML = chips.length
            ? chips.join("")
            : `<span class="filter-chip filter-chip-muted">No filters selected</span>`;
    }

    const categoryChipRoot = document.getElementById("shop-category-chips");
    if (categoryChipRoot) {
        categoryChipRoot.innerHTML = categories.map(category => `
            <a class="filter-chip ${selectedCategory && selectedCategory.toLowerCase() === category.name.toLowerCase() ? "is-active" : ""}" href="${buildShopFilterLink(params, "category", category.name)}">${category.name}</a>
        `).join("");
    }

    const quickFilterRoot = document.getElementById("shop-quick-filter-chips");
    if (quickFilterRoot) {
        quickFilterRoot.innerHTML = [
            `<a class="filter-chip ${filter === "featured" ? "is-active" : ""}" href="${buildShopFilterLink(params, "filter", "featured")}">Featured</a>`,
            `<a class="filter-chip ${filter === "new" ? "is-active" : ""}" href="${buildShopFilterLink(params, "filter", "new")}">New Arrivals</a>`,
            `<a class="filter-chip ${filter === "offers" ? "is-active" : ""}" href="${buildShopFilterLink(params, "filter", "offers")}">Offers</a>`,
            `<a class="filter-chip ${filter === "low-stock" ? "is-active" : ""}" href="${buildShopFilterLink(params, "filter", "low-stock")}">Low Stock</a>`
        ].join("");
    }

    const petTypeSelect = document.getElementById("shop-pet-type");
    const productTypeSelect = document.getElementById("shop-product-type");
    const petTypeForm = document.getElementById("shop-pet-type-form");
    const petTypeOptions = getUniqueValues(normalizedProducts, "petType");
    const productTypeOptions = getUniqueValues(petTypeProducts, "productType");

    if (petTypeSelect) {
        petTypeSelect.innerHTML = [
            '<option value="">All pets</option>',
            ...petTypeOptions.map((petType) => `
                <option value="${escapeHtml(petType)}" ${selectedPetType && valuesMatch(selectedPetType, petType) ? "selected" : ""}>${escapeHtml(petType)}</option>
            `)
        ].join("");
    }

    if (productTypeSelect) {
        productTypeSelect.innerHTML = [
            '<option value="">All product types</option>',
            ...productTypeOptions.map((productType) => `
                <option value="${escapeHtml(productType)}" ${selectedProductType && valuesMatch(selectedProductType, productType) ? "selected" : ""}>${escapeHtml(productType)}</option>
            `)
        ].join("");
        productTypeSelect.disabled = !productTypeOptions.length;
    }

    const colorChips = getUniqueValues(filteredProducts, "color");
    const ageChips = getUniqueValues(filteredProducts, "ageType");
    const colorChipRoot = document.getElementById("shop-color-chips");
    const ageChipRoot = document.getElementById("shop-age-chips");

    if (colorChipRoot) {
        colorChipRoot.innerHTML = [
            `<a class="filter-chip ${selectedColor ? "" : "is-active"}" href="${buildShopFilterLink(params, "color", "")}">All</a>`,
            ...colorChips.map((color) => `
                <a class="filter-chip ${selectedColor && selectedColor.toLowerCase() === color.toLowerCase() ? "is-active" : ""}" href="${buildShopFilterLink(params, "color", color)}">${color}</a>
            `)
        ].join("");
    }

    if (ageChipRoot) {
        ageChipRoot.innerHTML = [
            `<a class="filter-chip ${selectedAge ? "" : "is-active"}" href="${buildShopFilterLink(params, "age", "")}">All</a>`,
            ...ageChips.map((age) => `
                <a class="filter-chip ${selectedAge && selectedAge.toLowerCase() === age.toLowerCase() ? "is-active" : ""}" href="${buildShopFilterLink(params, "age", age)}">${age}</a>
            `)
        ].join("");
    }

    const minPriceInput = document.getElementById("shop-min-price");
    const maxPriceInput = document.getElementById("shop-max-price");
    const sortSelect = document.getElementById("shop-sort-by");
    const filterForm = document.getElementById("shop-price-sort-form");

    if (minPriceInput) {
        minPriceInput.value = selectedMinPrice ?? "";
    }

    if (maxPriceInput) {
        maxPriceInput.value = selectedMaxPrice ?? "";
    }

    if (sortSelect) {
        sortSelect.value = selectedSort;
    }

    const title = selectedCategory
        ? `${selectedCategory} essentials`
        : selectedColor
            ? `${selectedColor} products`
            : selectedAge
                ? `${selectedAge} products`
                : selectedProductType
                    ? `${selectedProductType} for ${selectedPetType || "pets"}`
                : selectedPetType
                    ? `${selectedPetType} products`
                : search
            ? `Search results for "${search}"`
            : filter === "new"
                ? "New arrivals"
            : filter === "offers"
                ? "Pawsome offers"
                : "All products";
    const titleNode = document.getElementById("shop-title");
    if (titleNode) {
        titleNode.textContent = title;
    }

    const safeCurrentPage = Math.min(currentPage, Math.max(1, Math.ceil(filteredProducts.length / SHOP_PAGE_SIZE)));
    const startIndex = (safeCurrentPage - 1) * SHOP_PAGE_SIZE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + SHOP_PAGE_SIZE);
    const resultsMeta = document.getElementById("shop-results-meta");
    if (resultsMeta) {
        if (!filteredProducts.length) {
            resultsMeta.textContent = "0 products found";
        } else {
            resultsMeta.textContent = `Showing ${startIndex + 1}-${Math.min(startIndex + paginatedProducts.length, filteredProducts.length)} of ${filteredProducts.length} products`;
        }
    }

    const productGrid = document.getElementById("shop-product-grid");
    if (productGrid) {
        productGrid.innerHTML = filteredProducts.length
            ? paginatedProducts.map(product => createProductCard(product, { compact: true, showVariants: true })).join("")
            : `<div class="empty-state">No matching products found right now. Try another search or browse all categories.</div>`;
    }
    renderShopPagination(params, filteredProducts.length, safeCurrentPage, SHOP_PAGE_SIZE);

    if (typeof window.applyStoredProductActionStates === "function") {
        window.applyStoredProductActionStates();
    }
    if (typeof window.syncSavedActionStates === "function") {
        await window.syncSavedActionStates();
    }

    if (currentPage > 1) {
        requestAnimationFrame(scrollShopResultsIntoView);
    }

    if (filterForm && !filterForm.dataset.bound) {
        filterForm.dataset.bound = "true";

        const applyShopFilters = async () => {
            const nextParams = new URLSearchParams(getQueryParams());
            const nextMin = normalizeShopPriceValue(minPriceInput?.value);
            const nextMax = normalizeShopPriceValue(maxPriceInput?.value);
            const nextRange = normalizeShopPriceRange(nextMin, nextMax);
            const nextSort = String(sortSelect?.value || "").trim();

            if (nextRange.minPrice == null) {
                nextParams.delete("minPrice");
            } else {
                nextParams.set("minPrice", String(nextRange.minPrice));
            }

            if (nextRange.maxPrice == null) {
                nextParams.delete("maxPrice");
            } else {
                nextParams.set("maxPrice", String(nextRange.maxPrice));
            }

            if (nextSort) {
                nextParams.set("sort", nextSort);
            } else {
                nextParams.delete("sort");
            }

            nextParams.delete("page");
            await navigateShop(nextParams);
        };

        filterForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await applyShopFilters();
        });

        [minPriceInput, maxPriceInput, sortSelect].forEach((control) => {
            control?.addEventListener("change", () => {
                filterForm.requestSubmit();
            });
            control?.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    filterForm.requestSubmit();
                }
            });
        });
    }

    if (petTypeForm && !petTypeForm.dataset.bound) {
        petTypeForm.dataset.bound = "true";

        petTypeSelect?.addEventListener("change", async () => {
            const nextParams = new URLSearchParams(getQueryParams());
            const nextPetType = String(petTypeSelect.value || "").trim();
            if (nextPetType) {
                nextParams.set("petType", nextPetType);
            } else {
                nextParams.delete("petType");
            }
            nextParams.delete("productType");
            nextParams.delete("page");
            await navigateShop(nextParams);
        });

        productTypeSelect?.addEventListener("change", async () => {
            const nextParams = new URLSearchParams(getQueryParams());
            const nextProductType = String(productTypeSelect.value || "").trim();
            if (nextProductType) {
                nextParams.set("productType", nextProductType);
            } else {
                nextParams.delete("productType");
            }
            nextParams.delete("page");
            await navigateShop(nextParams);
        });
    }
}

async function loadShopPage() {
    if (document.body.dataset.page !== "shop") {
        return;
    }

    const params = getQueryParams();
    const fallbackCategories = normalizeCategoriesData(fallbackData.categories);
    const fallbackProducts = normalizeProductsData(fallbackData.products);

    renderShopPageState(params, fallbackCategories, fallbackProducts);

    void (async () => {
        try {
            const [categoriesResponse, rawProducts] = await Promise.all([
                apiGet("/categories"),
                fetchProductsForShop(params)
            ]);
            const categories = normalizeCategoriesData(categoriesResponse);
            const products = normalizeProductsData(rawProducts);
            renderShopPageState(params, categories, products);
        } catch (error) {
            console.warn("Using fallback shop data:", error.message);
        }
    })();
}

function bindShopNavigation() {
    if (document.body.dataset.page !== "shop") {
        return;
    }

    bindShopMobileFilterToggle();

    const selectors = [
        "#shop-selected-filters a.filter-chip",
        "#shop-category-chips a.filter-chip",
        "#shop-quick-filter-chips a.filter-chip",
        "#shop-color-chips a.filter-chip",
        "#shop-age-chips a.filter-chip",
        "#shop-pagination a"
    ].join(", ");

    document.addEventListener("click", async (event) => {
        const link = event.target.closest(selectors);
        if (!link) {
            return;
        }

        const href = link.getAttribute("href") || "";
        if (!href || href === "#") {
            return;
        }

        if (link.getAttribute("aria-disabled") === "true") {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        const nextUrl = new URL(href, window.location.href);
        const nextParams = new URLSearchParams(nextUrl.search);
        const isPaginationLink = Boolean(link.closest("#shop-pagination"));
        await navigateShop(nextParams);
        if (isPaginationLink) {
            requestAnimationFrame(scrollShopResultsIntoView);
        }
    });

    window.addEventListener("popstate", () => {
        loadShopPage().then(() => {
            if (Number(getQueryParams().get("page") || 1) > 1) {
                requestAnimationFrame(scrollShopResultsIntoView);
            }
        });
    });
}

function renderCategoryPageState(selectedCategory, categories, products) {
    const normalizedCategories = normalizeCategoriesData(categories);
    const normalizedProducts = normalizeProductsData(products).map((product) => ({
        ...product,
        ...getProductDisplayDefaults(product)
    }));

    const selectedCategoryKey = String(selectedCategory || "").trim().toLowerCase();
    const selectedCategoryData = normalizedCategories.find((category) => categoryNamesMatch(category.name, selectedCategoryKey));
    const categoryCards = normalizedCategories.map((category, index) => {
        const categoryKey = category.name.trim().toLowerCase();
        const categoryProducts = normalizedProducts.filter((product) => categoryNamesMatch(product.category?.name || product.categoryName || "", categoryKey));
        const palette = buildCategoryCardStyle(index);
        const heroImage = resolveMediaUrl(category.imageUrl || categoryProducts[0]?.imageUrl || fallbackData.products[index % fallbackData.products.length]?.imageUrl);
        const categoryCount = Number.isFinite(Number(category.productCount)) && Number(category.productCount) > 0
            ? Number(category.productCount)
            : categoryProducts.length;
        const countLabel = `${categoryCount} item${categoryCount === 1 ? "" : "s"}`;

        return `
            <a class="category-feature-card" href="shop.html?category=${encodeURIComponent(category.name)}" style="--category-accent:${palette.accent};--category-bg:${palette.bg};--category-glow:${palette.glow};">
                <span class="category-feature-media">
                    <img src="${heroImage}" alt="${category.name}" loading="lazy" decoding="async">
                </span>
                <span class="category-feature-copy">
                    <span class="category-feature-kicker">Leo's category</span>
                    <strong>${category.name}</strong>
                    <span>${category.description || "Curated essentials for happy paws."}</span>
                </span>
                <span class="category-feature-meta">
                    <em>${countLabel}</em>
                    <strong>Explore</strong>
                </span>
            </a>
        `;
    }).join("");

    const root = document.getElementById("category-page-root");
    if (!root) {
        return;
    }

    const highlightedProducts = selectedCategoryData
        ? normalizedProducts.filter((product) => categoryNamesMatch(product.category?.name || product.categoryName || "", selectedCategoryData.name))
        : normalizedProducts.slice(0, 4);

    root.innerHTML = `
        <section class="page-hero category-hero">
            <span class="eyebrow">Shop by category</span>
            <h1>${selectedCategoryData ? selectedCategoryData.name : "Explore every pet category"}</h1>
            <p>${selectedCategoryData?.description || "Tap into a premium collection of food, treats, toys, grooming, and accessories. Every category is styled to stand out."}</p>
        </section>

        <section class="category-showcase">
            ${selectedCategoryData ? `
                <article class="category-highlight-panel">
                    <div>
                        <span class="eyebrow">Featured collection</span>
                        <h2>${selectedCategoryData.name}</h2>
                        <p>${selectedCategoryData.description || "Curated products for this collection."}</p>
                    </div>
                    <a class="cta-button" href="shop.html?category=${encodeURIComponent(selectedCategoryData.name)}">Shop ${selectedCategoryData.name}</a>
                </article>
            ` : ""}
            <div class="category-feature-grid">
                ${categoryCards}
            </div>
        </section>

        <section class="section-block">
            <div class="section-header">
                <div>
                    <span class="eyebrow">${selectedCategoryData ? selectedCategoryData.name : "Popular picks"}</span>
                    <h2>${selectedCategoryData ? "Products in this category" : "Featured category products"}</h2>
                </div>
            </div>
            <div class="product-grid category-product-grid">
                ${highlightedProducts.length
                    ? highlightedProducts.slice(0, 4).map((product) => createProductCard(product, { compact: true, showVariants: true })).join("")
                    : `<div class="empty-state">No products found for this category yet.</div>`}
            </div>
        </section>
    `;

    bindProductActions();
}

async function loadCategoryPage() {
    if (document.body.dataset.page !== "category") {
        return;
    }

    const params = getQueryParams();
    const selectedCategory = (params.get("category") || "").trim();

    try {
        const [categoriesResponse, rawProducts] = await Promise.all([
            apiGet("/categories"),
            apiGet(`/products?page=0&size=${SHOP_DATA_PAGE_SIZE}`)
        ]);

        const categories = normalizeCategoriesData(categoriesResponse);
        const products = normalizeProductsData(rawProducts);

        if (categories.some((category) => category.active !== false) || products.length) {
            renderCategoryPageState(selectedCategory, categories, products);
            return;
        }
    } catch (error) {
        console.warn("Using fallback category data:", error.message);
    }

    renderCategoryPageState(selectedCategory, fallbackData.categories, fallbackData.products);
}

async function renderProductDetailsPage(product, relatedProducts = [], params = getQueryParams()) {
    const selectedVariantLabelParam = params.get("variantLabel") || params.get("pack") || params.get("variant") || "";
    const selectedVariantColorParam = params.get("variantColor") || params.get("color") || "";
    const selectedVariant = resolveProductVariantFromParams(product, selectedVariantLabelParam, selectedVariantColorParam)
        || getSelectedProductVariant(product);

    currentProductDetail = product;
    setCurrentDetailVariant(product, {
        label: getVariantDisplayLabel(selectedVariant, product),
        color: selectedVariant.color || product.color || "",
        material: selectedVariant.material || product.material || "",
        stockQuantity: selectedVariant.stockQuantity ?? product.stockQuantity ?? "",
        price: selectedVariant.price,
        discountPrice: selectedVariant.discountPrice,
        pack: getVariantDisplayLabel(selectedVariant, product)
    }, selectedVariant);

    const currentPriceValue = selectedVariant.discountPrice ?? selectedVariant.price ?? product.discountPrice ?? product.price;
    const oldPriceValue = selectedVariant.discountPrice != null ? selectedVariant.price : product.discountPrice ? product.price : null;
    const selectedVariantLabel = getVariantDisplayLabel(selectedVariant, product);
    const productCategoryName = String(product.category?.name || "").trim();
    const normalizedRelatedProducts = (Array.isArray(relatedProducts) && relatedProducts.length
        ? relatedProducts
        : fallbackData.products.filter(item => item.id !== product.id).slice(0, 4));
    const commonGallery = getProductGalleryImages(product);
    const gallery = getVariantGalleryImages(selectedVariant, product);
    const benefitCards = getDetailBenefitCards(product, selectedVariant);
    const selectedPackLabel = String(selectedVariantLabel || selectedVariant.label || product.packSize || product.weightSize || "").trim();

    document.getElementById("product-detail-root").innerHTML = `
        <section class="detail-layout detail-layout--premium">
            <div class="detail-gallery detail-gallery--premium" data-default-gallery="${escapeHtml(JSON.stringify(commonGallery))}">
                ${renderProductGalleryMarkup(gallery, product.name, product)}
            </div>
            <article
                class="detail-panel detail-summary detail-summary--premium"
                data-selected-variant-label="${selectedVariantLabel || selectedVariant.label || ""}"
                data-selected-variant-color="${escapeHtml(selectedVariant.color || product.color || "")}"
                data-selected-variant-price="${selectedVariant.price ?? ""}"
                data-selected-variant-discount-price="${selectedVariant.discountPrice ?? ""}"
                data-selected-variant-stock="${selectedVariant.stockQuantity ?? product.stockQuantity ?? 0}"
            >
                <div class="detail-brand-row">
                    <span class="detail-brand-dot" aria-hidden="true">&#128062;</span>
                    <span class="eyebrow">${product.brand || "Leo's Pet Barkery"}</span>
                </div>
                <h1>${product.name}</h1>
                <div class="detail-price-stack">
                    <span class="price" data-current-price>${formatCurrency(currentPriceValue)}</span>
                    ${oldPriceValue ? `<span class="price-old" data-old-price>${formatCurrency(oldPriceValue)}</span>` : `<span class="price-old" data-old-price hidden></span>`}
                    ${oldPriceValue && currentPriceValue < oldPriceValue ? `<span class="detail-offer-badge">${Math.max(1, Math.round(((oldPriceValue - currentPriceValue) / oldPriceValue) * 100))}% OFF</span>` : ""}
                </div>
                <p class="detail-summary-copy">${product.description || "A premium choice for pet parents who want dependable quality and practical comfort."}</p>
                ${selectedPackLabel ? `
                <div class="detail-pack-header">
                    <span>Selected pack</span>
                    <strong data-current-pack>${selectedPackLabel}</strong>
                </div>
                ` : ""}
                ${renderSelectableVariantControls(product)}
                ${benefitCards.length ? `
                    <div class="detail-benefit-grid">
                        ${benefitCards.map((item) => `
                            <div class="detail-benefit-card" data-benefit-key="${escapeHtml(item.key || "")}">
                                <strong>${escapeHtml(item.title)}</strong>
                                <span>${escapeHtml(item.text)}</span>
                            </div>
                        `).join("")}
                    </div>
                ` : ""}
                <div class="detail-cta-row">
                    <div class="detail-quantity">
                        <button type="button" class="detail-quantity-btn" data-detail-quantity-step="decrease" aria-label="Decrease quantity">−</button>
                        <input type="number" min="1" value="1" aria-label="Quantity" data-detail-quantity>
                        <button type="button" class="detail-quantity-btn" data-detail-quantity-step="increase" aria-label="Increase quantity">+</button>
                    </div>
                    <a class="detail-cart-button ${selectedVariant.stockQuantity > 0 ? "" : "is-disabled"}" href="cart.html" data-action="cart" data-product-id="${product.id}" ${selectedVariant.stockQuantity > 0 ? "" : 'aria-disabled="true" tabindex="-1"'}>${selectedVariant.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}</a>
                </div>
                <div class="detail-trust-icons">
                    ${[
                        ["Safe", "Checkout"],
                        ["Fresh", "Products"],
                        ["Fast", "Delivery"],
                        ["Quality", "Checked"]
                    ].map(([title, subtitle]) => `
                        <div class="detail-trust-icon-card">
                            <span class="detail-trust-icon-circle" aria-hidden="true"><span class="detail-trust-icon-mark">&#10003;</span></span>
                            <div>
                                <strong>${title}</strong>
                                <span>${subtitle}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </article>
        </section>
        <section class="section-block detail-spec-section">
            <div class="section-header">
                <div>
                    <span class="eyebrow">Product details</span>
                    <h2>Specifications and care notes</h2>
                </div>
            </div>
            <div class="detail-spec-grid" id="productSpecsGrid">
            </div>
        </section>
        <section class="section-block">
            <div class="section-header">
                <div>
                    <span class="eyebrow">Related products</span>
                    <h2>More from ${productCategoryName || "this category"}</h2>
                </div>
            </div>
            <div class="detail-related-grid">
                ${normalizedRelatedProducts.map((item) => renderRelatedProductCard(item)).join("")}
            </div>
        </section>
    `;

    bindSelectableVariantInteractions(document.querySelector('[data-page="product-details"]'));
    const detailSummary = document.querySelector('[data-page="product-details"] .detail-summary');
    bindDetailQuantityControls(detailSummary);
    setupProductGallery(gallery);
    renderProductSpecifications(currentSelectedDetailVariant || selectedVariant, document.querySelector('[data-page="product-details"]'));
    if (typeof window.applyStoredProductActionStates === "function") {
        window.applyStoredProductActionStates();
    }
    if (detailSummary) {
        syncCartAvailabilityState(detailSummary);
    }
    if (typeof window.syncSavedActionStates === "function") {
        await window.syncSavedActionStates();
    }
}

async function loadProductDetailsPage() {
    if (document.body.dataset.page !== "product-details") {
        return;
    }

    const params = getQueryParams();
    const productId = Number(params.get("id")) || fallbackData.products[0].id;
    const fallbackProduct = fallbackData.products.find(item => item.id === productId) || fallbackData.products[0];
    const fallbackRelatedProducts = fallbackData.products
        .filter((item) => item.id !== fallbackProduct.id)
        .slice(0, 4);

    renderProductDetailsPage(fallbackProduct, fallbackRelatedProducts, params);

    void (async () => {
        try {
            const [productResponse, relatedResponse] = await Promise.all([
                apiGet(`/products/${productId}`),
                apiGet(`/products?page=0&size=${SHOP_DATA_PAGE_SIZE}`)
            ]);

            const backendProduct = productResponse?.data || fallbackProduct;
            const allProducts = Array.isArray(relatedResponse?.data?.content)
                ? relatedResponse.data.content
                : (Array.isArray(relatedResponse?.data) ? relatedResponse.data : []);
            const productCategoryName = String(backendProduct.category?.name || "").trim();
            const backendRelatedProducts = allProducts.filter((item) =>
                item.id !== backendProduct.id &&
                (
                    String(item.category?.name || "").trim().toLowerCase() === productCategoryName.toLowerCase() ||
                    String(item.productType || "").toLowerCase() === String(backendProduct.productType || "").toLowerCase()
                )
            ).slice(0, 4);

            renderProductDetailsPage(backendProduct, backendRelatedProducts.length ? backendRelatedProducts : fallbackRelatedProducts, params);
        } catch (error) {
            console.warn("Using fallback product details:", error.message);
        }
    })();
}



document.addEventListener("DOMContentLoaded", async () => {
    const currentPage = document.body.dataset.page || "";

    if (!["shop", "category", "product-details"].includes(currentPage)) {
        return;
    }

    bindProductActions();
    bindShopNavigation();

    if (currentPage === "category") {
        await loadCategoryPage();
        return;
    }

    if (currentPage === "shop") {
        await loadShopPage();
        return;
    }

    await loadProductDetailsPage();
});

