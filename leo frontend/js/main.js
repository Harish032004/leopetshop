const fallbackData = {
    categories: [
        { id: 1, name: "Dogs", icon: "D", imageUrl: "https://i.pinimg.com/736x/d3/d8/1e/d3d81efcaf7ddeb14d509b73ec7ae741.jpg", description: "Food, toys, grooming, and walking essentials." },
        { id: 2, name: "Cats", icon: "C", imageUrl: "https://i.pinimg.com/1200x/45/ed/74/45ed747662d2099865bb8ba18f607d0e.jpg", description: "Healthy meals, litter solutions, and playful finds." },
        { id: 3, name: "Birds", icon: "B", imageUrl: "https://i.pinimg.com/control1/1200x/79/fb/64/79fb646c3b761784f481a1f00f4c89f5.jpg", description: "Seed blends, cages, and feather-friendly care." },
        { id: 4, name: "Fish", icon: "F", imageUrl: "https://i.pinimg.com/1200x/69/88/33/698833f265d7ae22c458c8ff568c0f19.jpg", description: "Aquarium foods, pellets, and habitat basics." },
        { id: 5, name: "Grooming", icon: "G", imageUrl: "https://i.pinimg.com/1200x/3f/0e/31/3f0e31cde54e812d7fd12e97d2d82fc5.jpg", description: "Coat care, shampoos, brushes, and spa moments." },
        { id: 6, name: "Pet Care", icon: "P", imageUrl: "https://i.pinimg.com/736x/30/c5/b8/30c5b8ea2f721f15c314f6dd818e9d51.jpg", description: "Daily wellness and care essentials for every pet." }
    ],
    products: [
        {
            id: 1,
            name: "Pedigree Adult Dog Food",
            brand: "Pedigree",
            category: { id: 1, name: "Dogs" },
            price: 1499,
            discountPrice: 1299,
            stockQuantity: 14,
            petType: "Dog",
            featured: true,
            active: true,
            imageUrl: "https://i.pinimg.com/736x/b8/54/ab/b854abca5757b6c2283043ddd9d402a4.jpg",
            description: "Nutritious dry dog food for healthy muscles, bones, and daily energy.",
            highlights: "High protein, crunchy kibble, balanced nutrition"
        },
        {
            id: 2,
            name: "Premium Dog Collar",
            brand: "Leo Essentials",
            category: { id: 1, name: "Dogs" },
            price: 499,
            discountPrice: 399,
            stockQuantity: 24,
            petType: "Dog",
            featured: true,
            active: true,
            imageUrl: "https://i.pinimg.com/1200x/6f/d3/c2/6fd3c22da58be5e8b310391e02dcefa3.jpg",
            description: "Soft padded collar with premium buckle and everyday comfort.",
            highlights: "Adjustable fit, soft lining, stylish finish"
        },
        {
            id: 3,
            name: "Dog Chew Toy",
            brand: "PlayPaws",
            category: { id: 7, name: "Toys" },
            price: 299,
            discountPrice: 249,
            stockQuantity: 42,
            petType: "Dog",
            featured: false,
            active: true,
            imageUrl: "https://i.pinimg.com/1200x/c5/07/ad/c507ad84572a012db351bfad1942f060.jpg",
            description: "Durable chew toy made to keep energetic pups happily occupied.",
            highlights: "Bite resistant, lightweight, easy to clean"
        },
        {
            id: 4,
            name: "Cat Food Tuna Flavour",
            brand: "Whisker Feast",
            category: { id: 2, name: "Cats" },
            price: 899,
            discountPrice: 799,
            stockQuantity: 10,
            petType: "Cat",
            featured: true,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
            description: "Rich tuna-flavoured cat food for balanced daily nutrition.",
            highlights: "Omega-rich recipe, delicious taste, easy digestion"
        },
        {
            id: 5,
            name: "Cat Litter",
            brand: "CleanPaws",
            category: { id: 2, name: "Cats" },
            price: 650,
            discountPrice: 599,
            stockQuantity: 7,
            petType: "Cat",
            featured: false,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
            description: "Low-dust litter with excellent odour control and clumping.",
            highlights: "Low dust, odour lock, easy scooping"
        },
        {
            id: 6,
            name: "Pet Grooming Shampoo",
            brand: "FreshCoat",
            category: { id: 5, name: "Grooming" },
            price: 420,
            discountPrice: 369,
            stockQuantity: 5,
            petType: "Dog & Cat",
            featured: true,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80",
            description: "Gentle shampoo for a shiny coat and refreshing bath time.",
            highlights: "Mild formula, skin-friendly, fresh aloe scent"
        },
        {
            id: 7,
            name: "Cat Scratch Toy",
            brand: "Whisker Play",
            category: { id: 7, name: "Toys" },
            price: 299,
            discountPrice: 249,
            stockQuantity: 80,
            petType: "Cat",
            featured: true,
            active: true,
            imageUrl: "https://i.pinimg.com/1200x/55/31/69/5531695a815b431c054e5cdac4da7ab0.jpg",
            description: "Soft and safe scratch toy for active cats.",
            highlights: "Interactive, durable, cat-friendly"
        },
        {
            id: 8,
            name: "Cat Treats Salmon Bites",
            brand: "Whisker Feast",
            category: { id: 2, name: "Cats" },
            price: 349,
            discountPrice: 299,
            stockQuantity: 65,
            petType: "Cat",
            featured: false,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80",
            description: "Tasty salmon treats for rewarding your cat.",
            highlights: "High protein, irresistible taste, small bites"
        },
        {
            id: 9,
            name: "Bird Cage",
            brand: "SkyHome",
            category: { id: 3, name: "Birds" },
            price: 2499,
            discountPrice: 2199,
            stockQuantity: 20,
            petType: "Bird",
            featured: false,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=900&q=80",
            description: "Comfortable cage designed for small and medium birds.",
            highlights: "Spacious, durable, easy to maintain"
        },
        {
            id: 10,
            name: "Bird Cage Clean Spray",
            brand: "SkyClean",
            category: { id: 6, name: "Pet Care" },
            price: 280,
            discountPrice: 249,
            stockQuantity: 55,
            petType: "Bird",
            featured: false,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=900&q=80",
            description: "Safe cleaning spray for bird cages and accessories.",
            highlights: "Easy cleaning, safe formula, fresh finish"
        },
        {
            id: 11,
            name: "Fish Tank Water Conditioner",
            brand: "AquaLife",
            category: { id: 4, name: "Fish" },
            price: 320,
            discountPrice: 279,
            stockQuantity: 75,
            petType: "Fish",
            featured: false,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1520301255226-bf1f48f5b0b1?auto=format&fit=crop&w=900&q=80",
            description: "Conditioner for a cleaner and healthier aquarium environment.",
            highlights: "Water safe, easy dosing, aquarium friendly"
        },
        {
            id: 12,
            name: "Fish Aquarium LED Light",
            brand: "AquaGlow",
            category: { id: 6, name: "Pet Care" },
            price: 1499,
            discountPrice: 1299,
            stockQuantity: 30,
            petType: "Fish",
            featured: true,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1527294111763-72b5f3d4c23d?auto=format&fit=crop&w=900&q=80",
            description: "Soft LED light for aquarium viewing and ambience.",
            highlights: "Energy saving, vibrant glow, easy install"
        },
        {
            id: 13,
            name: "Dog Harness",
            brand: "Leo Essentials",
            category: { id: 1, name: "Dogs" },
            price: 799,
            discountPrice: 699,
            stockQuantity: 45,
            petType: "Dog",
            featured: true,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
            description: "Adjustable harness for safe and comfortable walks.",
            highlights: "Padded straps, secure fit, durable clips"
        },
        {
            id: 14,
            name: "Dog Dental Chews",
            brand: "HealthyBite",
            category: { id: 6, name: "Pet Care" },
            price: 399,
            discountPrice: 349,
            stockQuantity: 70,
            petType: "Dog",
            featured: false,
            active: true,
            imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80",
            description: "Dental chews to support oral hygiene and fresh breath.",
            highlights: "Dental care, tasty chew, daily support"
        }
    ],
    reviews: [
        {
            id: 1,
            user: { name: "Don Bosco Kakacherry" },
            rating: 5,
            timeAgo: "a month ago",
            reviewText: "Excellent experience with Leo's Pet Barkery! The staff are friendly, knowledgeable, and genuinely care about pets. Great selection, quality products, and prompt, professional service. Highly recommended for all pet parents!",
            reply: "Thanks a lot sir.. 👍",
            avatarInitial: "D",
            avatarTone: "brown"
        },
        {
            id: 2,
            user: { name: "Krishna Kumar" },
            rating: 5,
            timeAgo: "a month ago",
            reviewText: "Humble, patient, and extremely responsive. They offer a great range of products and take the time to understand customer needs without any pressure. Smooth, professional, and pleasant service from start to finish. Highly recommended!",
            reply: "Thanks a lot sir.. 👍",
            avatarInitial: "K",
            avatarTone: "blue"
        },
        {
            id: 3,
            user: { name: "Edmund Motha" },
            rating: 4,
            timeAgo: "7 months ago",
            reviewText: "Incredibly knowledgeable and genuinely care about finding the right, high-quality products for my dog's specific needs. This pet store is fantastic!",
            reply: "Thank you !",
            avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
            avatarTone: "gold"
        }
    ],
    banners: [
        {
            desktopImageUrl: "assets/images/desktopimage.png",
            mobileImageUrl: "assets/images/versionimage.png",
            imageUrl: "assets/images/versionimage.png"
        }
    ],
    orders: [
        { id: 1, orderNumber: "LEO-20260701-001", totalAmount: 1698, orderStatus: "SHIPPED", createdAt: "2026-07-01" },
        { id: 2, orderNumber: "LEO-20260626-002", totalAmount: 799, orderStatus: "DELIVERED", createdAt: "2026-06-26" }
    ]
};

const userStateCacheTtlMs = 15000;
let userStateCache = {
    timestamp: 0,
    data: null,
    promise: null
};

const protectedCustomerPages = new Set([
    "cart",
    "checkout",
    "my-account",
    "my-orders"
]);

const socialFloatLinks = {
    instagram: "https://www.instagram.com/leos_pet_barkery?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    whatsapp: "https://wa.me/919876543210?text=Hi%20Leo%27s%20Pet%20Barkery"
};

const searchState = {
    loaded: false,
    categories: [],
    products: []
};
const cartStateKey = "leo_cart_product_ids";

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(value || 0));
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

function getProductCardAttributeChips(product = {}, options = {}) {
    const compact = Boolean(options.compact);
    const values = [
        product.color,
        product.size,
        product.material,
        product.packSize || product.weightSize,
        product.weightRange,
        product.ageType
    ]
        .map((value) => String(value || "").trim())
        .filter(Boolean);

    const uniqueValues = [...new Set(values)];
    const maxItems = compact ? 2 : 4;

    return uniqueValues.slice(0, maxItems).map((value) => `<span>${escapeHtml(value)}</span>`).join("");
}

function normalizeSearchItems(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.content)) {
        return data.content;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
}

function normalizeListedProduct(product = {}) {
    const categoryName = String(product.category?.name || product.categoryName || "").trim();
    const mainImageUrl = String(product.mainImageUrl || product.imageUrl || product.images?.[0]?.imageUrl || "").trim();

    return {
        ...product,
        categoryName,
        imageUrl: product.imageUrl || mainImageUrl,
        mainImageUrl,
        category: product.category || (categoryName ? { name: categoryName } : product.category || null)
    };
}

function normalizeListedProducts(data) {
    return normalizeSearchItems(data).map(normalizeListedProduct);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function loadSearchIndex() {
    if (searchState.loaded) {
        return searchState;
    }

    try {
        const [categoriesResponse, productsResponse] = await Promise.all([
            fetchWithFallback(() => apiGet("/categories"), fallbackData.categories),
            fetchWithFallback(() => apiGet("/products?page=0&size=50"), fallbackData.products)
        ]);

        searchState.categories = normalizeSearchItems(categoriesResponse);
        searchState.products = normalizeListedProducts(productsResponse);
        searchState.loaded = true;
    } catch (error) {
        searchState.categories = fallbackData.categories;
        searchState.products = fallbackData.products;
        searchState.loaded = true;
    }

    return searchState;
}

function buildSearchSuggestions(keyword) {
    const term = keyword.trim().toLowerCase();
    if (!term) {
        return [];
    }

    const categoryMatches = searchState.categories
        .filter((category) =>
            String(category.name || "").toLowerCase().includes(term) ||
            String(category.description || "").toLowerCase().includes(term)
        )
        .slice(0, 3)
        .map((category) => ({
            type: "category",
            title: category.name,
            subtitle: category.description || "Browse category",
            href: `shop.html?category=${encodeURIComponent(category.name)}`
        }));

    const productMatches = searchState.products
        .filter((product) => {
            const productName = String(product.name || "").toLowerCase();
            const brandName = String(product.brand || "").toLowerCase();
            const categoryName = String(product.category?.name || "").toLowerCase();
            const petType = String(product.petType || "").toLowerCase();
            const productType = String(product.productType || "").toLowerCase();
            const color = String(product.color || "").toLowerCase();
            const ageType = String(product.ageType || "").toLowerCase();
            return productName.includes(term) ||
                brandName.includes(term) ||
                categoryName.includes(term) ||
                petType.includes(term) ||
                productType.includes(term) ||
                color.includes(term) ||
                ageType.includes(term);
        })
        .slice(0, 6)
        .map((product) => ({
            type: "product",
            title: product.name,
            subtitle: `${product.category?.name || "Pet Care"} • ${product.productType || "Item"} • ${formatCurrency(product.discountPrice || product.price)}`,
            href: `shop.html?search=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category?.name || "")}`
        }));

    return [...productMatches, ...categoryMatches].slice(0, 6);
}

function renderSearchSuggestions(items, keyword) {
    const panel = document.getElementById("nav-search-suggestions");
    if (!panel) {
        return;
    }

    if (!keyword.trim() || !items.length) {
        panel.hidden = true;
        panel.innerHTML = "";
        return;
    }

    panel.hidden = false;
    panel.innerHTML = `
        <div class="search-suggestion-head">
            <span>Suggestions</span>
            <a href="shop.html?search=${encodeURIComponent(keyword.trim())}">View all</a>
        </div>
        <div class="search-suggestion-list">
            ${items.map((item) => `
                <a class="search-suggestion-item ${item.type}" href="${item.href}" data-suggestion-link>
                    <span class="search-suggestion-type">${item.type}</span>
                    <span class="search-suggestion-text">
                        <strong>${item.title}</strong>
                        <span>${item.subtitle}</span>
                    </span>
                </a>
            `).join("")}
        </div>
    `;
}

function hideSearchSuggestions() {
    const panel = document.getElementById("nav-search-suggestions");
    if (!panel) {
        return;
    }

    panel.hidden = true;
    panel.innerHTML = "";
}

function renderNavbar() {
    const activePage = document.body.dataset.page || "";
    const header = document.getElementById("site-header");
    if (!header) {
        return;
    }

    const navItems = [
        ["index.html", "Home", "home"],
        ["shop.html", "Shop", "shop"],
        ["category.html", "Categories", "categories"],
        ["track-order.html", "Track Order", "track-order"],
        ["my-account.html", "Account", "my-account", "account"],
        ["cart.html", "Cart", "cart", "cart"]
    ];
    const user = getStoredUser();
    const isLoggedIn = Boolean(getToken());

    header.innerHTML = `
        <div class="container nav-shell">
            <a class="brand" href="index.html" aria-label="Leo's Pet Barkery home">
                <img class="brand-logo" src="assets/logo/leologo-cropped.png" alt="Leo's Pet Barkery logo">
            </a>
            <div class="nav-search-shell">
                <form class="nav-search" id="nav-search-form">
                    <input type="search" id="nav-search-input" placeholder="Search food, toys, collars..." aria-label="Search products" autocomplete="off">
                    <button type="submit">Search</button>
                </form>
                <div class="nav-search-suggestions" id="nav-search-suggestions" hidden></div>
            </div>
            <nav class="nav-links" aria-label="Primary">
                ${navItems.map(([href, label, key, badgeKey]) => `
                    <a href="${href}" class="${activePage === key ? "is-active" : ""}">
                        ${badgeKey === "cart" ? `
                            <span class="nav-link-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                                    <path d="M3 4h2l2.2 9.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L20.6 8H7.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <circle cx="10" cy="19" r="1.6" fill="currentColor"></circle>
                                    <circle cx="17" cy="19" r="1.6" fill="currentColor"></circle>
                                </svg>
                            </span>
                        ` : ""}
                        ${label}
                        ${badgeKey === "cart" ? '<span class="nav-link-badge" id="cart-count">0</span>' : ""}
                    </a>
                `).join("")}
                ${isLoggedIn ? `<a href="#" id="logout-link">Logout</a>` : `<a href="login.html">Login</a>`}
            </nav>
            <button class="hamburger" id="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
        <div class="mobile-menu" id="mobile-menu">
            <div class="mobile-menu-header">
                <a class="brand mobile-brand" href="index.html" aria-label="Leo's Pet Barkery home">
                    <img class="brand-logo" src="assets/logo/leologo-cropped.png" alt="Leo's Pet Barkery logo">
                </a>
                <button type="button" class="mobile-menu-close" id="mobile-menu-close" aria-label="Close menu">&times;</button>
            </div>
            ${isLoggedIn ? `<div class="mobile-user">Signed in as ${user?.name || "Customer"}</div>` : ""}
            <nav aria-label="Mobile primary">
                ${navItems.map(([href, label, key, badgeKey]) => {
                    if (badgeKey === "cart") {
                        return `<a href="${href}">
                            <span class="nav-link-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                                    <path d="M3 4h2l2.2 9.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L20.6 8H7.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <circle cx="10" cy="19" r="1.6" fill="currentColor"></circle>
                                    <circle cx="17" cy="19" r="1.6" fill="currentColor"></circle>
                                </svg>
                            </span>
                            ${label} <span class="nav-link-badge" id="mobile-cart-count">0</span>
                        </a>`;
                    }

                    return `<a href="${href}">${label}</a>`;
                }).join("")}
                ${isLoggedIn ? `<a href="#" id="mobile-logout-link">Logout</a>` : `<a href="login.html">Login</a>`}
            </nav>
        </div>
    `;
}

function renderFooter() {
    const footer = document.getElementById("site-footer");
    if (!footer) {
        return;
    }

    footer.innerHTML = `
        <div class="container footer-grid">
            <div>
                <a class="brand" href="index.html">
                    <img class="brand-logo" src="assets/logo/leologo1.png" alt="Leo's Pet Barkery logo">
                    <span class="brand-copy">
                        <strong>Leo's Pet Barkery</strong>
                        <span>Made for happy paws</span>
                    </span>
                </a>
                <p>Premium pet food, toys, grooming, and accessories for dogs, cats, birds, and more.</p>
            </div>
            <div>
                <h4>Shop</h4>
                <ul>
                    <li><a href="shop.html">All Products</a></li>
                    <li><a href="cart.html">Cart</a></li>
                </ul>
            </div>
            <div>
                <h4>Help</h4>
                <ul>
                    <li><a href="track-order.html">Track Order</a></li>
                    <li><a href="my-orders.html">My Orders</a></li>
                    <li><a href="contact.html">Contact Us</a></li>
                    <li><a href="privacy-policy.html">Privacy Policy</a></li>
                    <li><a href="terms.html">Terms &amp; Conditions</a></li>
                </ul>
            </div>
            <div>
                <h4>About</h4>
                <ul>
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="login.html">Customer Login</a></li>
                    <li><a href="register.html">Create Account</a></li>
                </ul>
            </div>
        </div>
        <div class="container footer-note">
            <p>Copyright 2026 Leo's Pet Barkery. Crafted with care for pet families.</p>
        </div>
    `;
}

function renderFloatingSocialLinks() {
    if (document.getElementById("floating-social-links")) {
        return;
    }

    const floatWrap = document.createElement("div");
    floatWrap.id = "floating-social-links";
    floatWrap.className = "floating-social-links";
    floatWrap.innerHTML = `
        <a class="floating-social-link instagram" href="${socialFloatLinks.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Open Instagram">
            <span class="floating-social-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"></rect>
                    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"></circle>
                    <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"></circle>
                </svg>
            </span>
        </a>
        <a class="floating-social-link whatsapp" href="${socialFloatLinks.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
            <span class="floating-social-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path d="M12 3.3c-4.9 0-8.8 3.7-8.8 8.2 0 1.6.5 3.1 1.4 4.4L4.1 20.7l4.7-1.3c1 .3 2.1.4 3.2.4 4.9 0 8.8-3.7 8.8-8.2S16.9 3.3 12 3.3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
                    <path d="M9.1 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.6.5l.9 2c.1.2.1.4 0 .6l-.5.6c-.1.2-.2.4 0 .6.2.4.8 1.2 1.7 1.9.9.7 1.8 1 2.2 1 .3.1.5 0 .7-.1l.8-.5c.2-.1.4-.1.6 0l1.5.7c.3.1.4.4.4.7 0 1-1 1.8-2.1 1.8-1.4 0-3.8-1-5.9-3-2.2-2-3.3-3.9-3.4-5 0-.6.2-1 .4-1.3l.8-.9Z" fill="currentColor"></path>
                </svg>
            </span>
        </a>
    `;

    document.body.appendChild(floatWrap);
}

function bindNavbarInteractions() {
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const searchForm = document.getElementById("nav-search-form");
    const searchInput = document.getElementById("nav-search-input");
    const searchPanel = document.getElementById("nav-search-suggestions");
    let searchTimer = null;

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener("click", () => {
                const isOpen = mobileMenu.classList.toggle("is-open");
                document.body.classList.toggle("menu-open", isOpen);
                document.documentElement.classList.toggle("menu-open", isOpen);
                menuToggle.classList.toggle("is-open", isOpen);
                menuToggle.setAttribute("aria-expanded", String(isOpen));
            });
        }

        const mobileMenuClose = document.getElementById("mobile-menu-close");
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener("click", () => {
                mobileMenu.classList.remove("is-open");
                document.body.classList.remove("menu-open");
                document.documentElement.classList.remove("menu-open");
                menuToggle?.classList.remove("is-open");
                menuToggle?.setAttribute("aria-expanded", "false");
            });
        }

        if (searchForm && searchInput) {
            searchForm.addEventListener("submit", (event) => {
                event.preventDefault();
            const keyword = searchInput.value.trim();
            hideSearchSuggestions();
            if (!keyword) {
                window.location.href = "shop.html";
                return;
            }

            window.location.href = `shop.html?search=${encodeURIComponent(keyword)}`;
        });

        searchInput.addEventListener("input", async () => {
            const keyword = searchInput.value.trim();
            window.clearTimeout(searchTimer);

            if (!keyword) {
                hideSearchSuggestions();
                return;
            }

            searchTimer = window.setTimeout(async () => {
                await loadSearchIndex();
                renderSearchSuggestions(buildSearchSuggestions(keyword), keyword);
            }, 180);
        });

        searchInput.addEventListener("focus", async () => {
            const keyword = searchInput.value.trim();
            if (!keyword) {
                return;
            }

            await loadSearchIndex();
            renderSearchSuggestions(buildSearchSuggestions(keyword), keyword);
        });
    }

    document.addEventListener("click", (event) => {
        if (!searchPanel) {
            return;
        }

        const clickedInsideSearch = event.target.closest(".nav-search-shell");
        if (!clickedInsideSearch) {
            hideSearchSuggestions();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideSearchSuggestions();
        }
    });

    const logoutLinks = document.querySelectorAll("#logout-link, #mobile-logout-link");
    logoutLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            removeToken();
            removeStoredUser();
            showFlashMessage("Logged out successfully.", "success");
            window.location.href = "login.html";
        });
    });

    searchPanel?.addEventListener("click", (event) => {
        const suggestionLink = event.target.closest("[data-suggestion-link]");
        if (suggestionLink) {
            hideSearchSuggestions();
        }
    });
}

function normalizeProductVariants(product = {}) {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (variants.length) {
        const normalizedVariants = variants.map((variant, index) => ({
            color: String(variant.color || product.color || "").trim(),
            label: variant.label || variant.packSize || variant.weightSize || `Pack ${index + 1}`,
            price: Number(variant.price ?? product.price ?? 0),
            discountPrice: variant.discountPrice !== null && variant.discountPrice !== undefined
                ? Number(variant.discountPrice)
                : null,
            stockQuantity: Number(variant.stockQuantity ?? product.stockQuantity ?? 0),
            defaultSelected: Boolean(variant.defaultSelected),
            displayOrder: Number(variant.displayOrder ?? index + 1),
            imageUrls: Array.isArray(variant.imageUrls)
                ? variant.imageUrls.map((url) => String(url || "").trim()).filter(Boolean)
                : typeof variant.imageUrlsJson === "string" && variant.imageUrlsJson.trim().startsWith("[")
                    ? (() => {
                        try {
                            const parsed = JSON.parse(variant.imageUrlsJson);
                            return Array.isArray(parsed) ? parsed.map((url) => String(url || "").trim()).filter(Boolean) : [];
                        } catch (error) {
                            return [];
                        }
                    })()
                    : []
        }));

        const uniqueVariants = new Map();
        normalizedVariants.forEach((variant) => {
            const key = `${String(variant.color || "").trim().toLowerCase()}::${String(variant.label || "").trim().toLowerCase()}`;
            if (!key) {
                return;
            }

            const existing = uniqueVariants.get(key);
            if (!existing || variant.defaultSelected) {
                uniqueVariants.set(key, variant);
            }
        });

        return [...uniqueVariants.values()].sort((left, right) => left.displayOrder - right.displayOrder);
    }

    const productType = String(product.productType || "").toLowerCase();
    if (productType === "food" || productType === "treat") {
        const basePrice = Number(product.price || 0);
        const baseDiscount = product.discountPrice != null ? Number(product.discountPrice) : null;
        const defaultColor = String(product.color || "").trim();

        return [
            { color: defaultColor, label: "1kg", price: basePrice, discountPrice: baseDiscount, stockQuantity: Number(product.stockQuantity || 0), defaultSelected: true, displayOrder: 1 },
            { color: defaultColor, label: "2kg", price: basePrice + 350, discountPrice: baseDiscount != null ? baseDiscount + 250 : null, stockQuantity: Number(product.stockQuantity || 0), defaultSelected: false, displayOrder: 2 },
            { color: defaultColor, label: "5kg", price: basePrice + 900, discountPrice: baseDiscount != null ? baseDiscount + 700 : null, stockQuantity: Number(product.stockQuantity || 0), defaultSelected: false, displayOrder: 3 },
            { color: defaultColor, label: "10kg", price: basePrice + 1600, discountPrice: baseDiscount != null ? baseDiscount + 1300 : null, stockQuantity: Number(product.stockQuantity || 0), defaultSelected: false, displayOrder: 4 }
        ];
    }

    return [{
        color: String(product.color || "").trim(),
        label: product.packSize || product.weightSize || "Default",
        price: Number(product.price || 0),
        discountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,
        stockQuantity: Number(product.stockQuantity || 0),
        defaultSelected: true,
        displayOrder: 1
    }];
}

function getSelectedProductVariant(product = {}) {
    const variants = normalizeProductVariants(product);
    return variants.find((variant) => variant.defaultSelected && Number(variant.stockQuantity || 0) > 0)
        || variants.find((variant) => Number(variant.stockQuantity || 0) > 0)
        || variants.find((variant) => variant.defaultSelected)
        || variants[0];
}

function getProductCardImageSource(product = {}, variant = null) {
    const variantImage = Array.isArray(variant?.imageUrls)
        ? variant.imageUrls.map((url) => String(url || "").trim()).find(Boolean)
        : "";
    const productImage = String(product.mainImageUrl || product.imageUrl || product.images?.[0]?.imageUrl || "").trim();
    const rawImageUrl = variantImage || productImage;

    return {
        rawImageUrl,
        imageUrl: rawImageUrl ? resolveMediaUrl(rawImageUrl) : ""
    };
}

function parseVariantImageUrls(value) {
    const raw = String(value || "").trim();
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map((url) => String(url || "").trim()).filter(Boolean) : [];
    } catch (error) {
        return raw.split("\n").map((url) => url.trim()).filter(Boolean);
    }
}

function getVariantColor(variant = {}, product = {}) {
    return String(variant.color || product.color || "").trim();
}

function getProductVariantColors(product = {}) {
    return [...new Set(
        normalizeProductVariants(product)
            .map((variant) => getVariantColor(variant, product))
            .filter(Boolean)
    )];
}

function getVariantsForSelectedColor(product = {}, selectedColor = "") {
    const variants = normalizeProductVariants(product);
    const normalizedColor = String(selectedColor || "").trim().toLowerCase();
    if (!normalizedColor) {
        return variants;
    }

    const filteredVariants = variants.filter((variant) => String(getVariantColor(variant, product)).toLowerCase() === normalizedColor);
    return filteredVariants.length ? filteredVariants : variants;
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

function isStockAvailable(stockQuantity) {
    return Number(stockQuantity || 0) > 0;
}

function formatStockStatus(stockQuantity) {
    const parsedStock = Number(stockQuantity || 0);
    return parsedStock > 0 ? `${parsedStock} available` : "Out of stock";
}

function getProductCardSummary(product = {}) {
    const description = String(product.description || "").trim();
    if (description) {
        return description;
    }

    const summaryParts = [
        product.productType,
        product.color,
        product.size,
        product.material,
        product.packSize || product.weightSize,
        product.flavour,
        product.weightRange,
        product.ageType
    ]
        .map((value) => String(value || "").trim())
        .filter(Boolean);

    if (summaryParts.length) {
        return summaryParts.slice(0, 3).join(" • ");
    }

    return "Explore product details";
}

function applyCartAvailabilityState(root) {
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

        if (isStockAvailable(selectedStock)) {
            button.textContent = "Add to Cart";
            button.classList.remove("is-disabled");
            button.removeAttribute("aria-disabled");
            button.removeAttribute("tabindex");
            return;
        }

        button.textContent = "Out of Stock";
        button.classList.add("is-disabled");
        button.setAttribute("aria-disabled", "true");
        button.setAttribute("tabindex", "-1");
    });
}

function renderVariantChipButtons(product = {}) {
    const variants = normalizeProductVariants(product);
    const selectedVariant = getSelectedProductVariant(product);
    const displayVariants = variants
        .map((variant) => ({
            ...variant,
            displayLabel: getVariantDisplayLabel(variant, product)
        }))
        .filter((variant) => variant.displayLabel);

    if (displayVariants.length <= 1) {
        return "";
    }

    return `
        <div class="variant-chip-row" data-variant-row>
            ${displayVariants.map((variant, index) => `
                <button
                    type="button"
                    class="variant-chip ${variant.label === selectedVariant?.label ? "is-active" : ""} ${!isStockAvailable(variant.stockQuantity) ? "is-disabled" : ""}"
                    data-action="variant"
                    data-variant-index="${index}"
                    data-variant-label="${variant.displayLabel}"
                    data-variant-price="${variant.price}"
                    data-variant-discount-price="${variant.discountPrice ?? ""}"
                    data-variant-stock="${variant.stockQuantity}"
                    data-variant-image-urls="${escapeHtml(JSON.stringify(variant.imageUrls || []))}"
                    ${!isStockAvailable(variant.stockQuantity) ? "disabled" : ""}
                >${variant.displayLabel}${!isStockAvailable(variant.stockQuantity) ? " · Out of stock" : ""}</button>
            `).join("")}
        </div>
    `;
}

function updateVariantSelection(triggerElement) {
    if (!triggerElement || triggerElement.disabled || !isStockAvailable(triggerElement.dataset.variantStock)) {
        return;
    }

    const root = triggerElement.closest(".product-card, .detail-summary");
    if (!root) {
        return;
    }

    const currentPrice = root.querySelector("[data-current-price]");
    const oldPrice = root.querySelector("[data-old-price]");
    const buttons = root.querySelectorAll('[data-action="variant"]');
    const selectedLabel = triggerElement.dataset.variantLabel || "";
    const selectedPrice = Number(triggerElement.dataset.variantDiscountPrice || triggerElement.dataset.variantPrice || 0);
    const originalPrice = Number(triggerElement.dataset.variantPrice || 0);
    const hasOffer = triggerElement.dataset.variantDiscountPrice !== "";

    root.dataset.selectedVariantLabel = selectedLabel;
    root.dataset.selectedVariantPrice = String(triggerElement.dataset.variantPrice || "");
    root.dataset.selectedVariantDiscountPrice = String(triggerElement.dataset.variantDiscountPrice || "");
    root.dataset.selectedVariantStock = String(triggerElement.dataset.variantStock || "");

    buttons.forEach((button) => {
        button.classList.toggle("is-active", button === triggerElement);
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

    root.querySelectorAll("[data-current-pack]").forEach((element) => {
        element.textContent = selectedLabel;
    });

    root.querySelectorAll("[data-current-stock]").forEach((element) => {
        element.textContent = formatStockStatus(triggerElement.dataset.variantStock);
    });

    const variantImages = parseVariantImageUrls(triggerElement.dataset.variantImageUrls);
    const nextImageUrl = variantImages[0] ? resolveMediaUrl(variantImages[0]) : "";
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

    applyCartAvailabilityState(root);
}

function renderSelectableVariantControls(product = {}) {
    const variants = normalizeProductVariants(product).map((variant) => ({
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
                    class="variant-chip ${variant.color === selectedColor && variant.label === selectedVariant?.label ? "is-active" : ""} ${!isStockAvailable(variant.stockQuantity) ? "is-disabled" : ""}"
                    data-action="variant"
                    data-variant-index="${index}"
                    data-variant-label="${variant.displayLabel}"
                    data-variant-color="${escapeHtml(variant.color || "")}"
                    data-variant-price="${variant.price}"
                    data-variant-discount-price="${variant.discountPrice ?? ""}"
                    data-variant-stock="${variant.stockQuantity}"
                    data-variant-image-urls="${escapeHtml(JSON.stringify(variant.imageUrls || []))}"
                    data-variant-default="${variant.defaultSelected ? "true" : "false"}"
                    ${!isStockAvailable(variant.stockQuantity) ? "disabled" : ""}
                >${variant.displayLabel}${!isStockAvailable(variant.stockQuantity) ? " Â· Out of stock" : ""}</button>
            `).join("")}
        </div>
    ` : "";

    return `${colorMarkup}${variantMarkup}`;
}

function applySelectableVariantSelection(root, selectedButton) {
    if (!root || !selectedButton) {
        return;
    }

    const currentPrice = root.querySelector("[data-current-price]");
    const oldPrice = root.querySelector("[data-old-price]");
    const variantButtons = root.querySelectorAll('[data-action="variant"]');
    const colorButtons = root.querySelectorAll('[data-action="variant-color"]');
    const selectedLabel = selectedButton.dataset.variantLabel || "";
    const selectedColor = String(selectedButton.dataset.variantColor || "").trim();
    const selectedPrice = Number(selectedButton.dataset.variantDiscountPrice || selectedButton.dataset.variantPrice || 0);
    const originalPrice = Number(selectedButton.dataset.variantPrice || 0);
    const hasOffer = selectedButton.dataset.variantDiscountPrice !== "";

    root.dataset.selectedVariantLabel = selectedLabel;
    root.dataset.selectedVariantColor = selectedColor;
    root.dataset.selectedVariantPrice = String(selectedButton.dataset.variantPrice || "");
    root.dataset.selectedVariantDiscountPrice = String(selectedButton.dataset.variantDiscountPrice || "");
    root.dataset.selectedVariantStock = String(selectedButton.dataset.variantStock || "");

    variantButtons.forEach((button) => {
        button.classList.toggle("is-active", button === selectedButton);
    });

    colorButtons.forEach((button) => {
        const isActive = String(button.dataset.variantColor || "").trim().toLowerCase() === selectedColor.toLowerCase();
        button.classList.toggle("is-active", isActive || (!selectedColor && button === colorButtons[0]));
        button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
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

    root.querySelectorAll("[data-current-pack]").forEach((element) => {
        element.textContent = selectedLabel;
    });

    root.querySelectorAll("[data-current-stock]").forEach((element) => {
        element.textContent = formatStockStatus(selectedButton.dataset.variantStock);
    });

    applyCartAvailabilityState(root);
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

function bindVariantInteractions(container) {
    if (!container || container.dataset.variantInteractionsBound === "true") {
        return;
    }

    container.dataset.variantInteractionsBound = "true";

    container.addEventListener("click", (event) => {
        const variantButton = event.target.closest('[data-action="variant"]');
        if (!variantButton || !container.contains(variantButton)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        updateVariantSelection(variantButton);
    });
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

function bindHomepageProductCardNavigation(container) {
    if (!container || container.dataset.homeProductNavBound === "true") {
        return;
    }

    container.dataset.homeProductNavBound = "true";

    container.addEventListener("click", (event) => {
        const card = event.target.closest("[data-product-link]");
        if (!card || event.target.closest("a, button, input, select, textarea")) {
            return;
        }

        event.preventDefault();
        window.location.href = card.dataset.productLink;
    });

    container.addEventListener("keydown", (event) => {
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

async function handleHomepageProductAction(action, productId, triggerElement) {
    if (!productId) {
        return;
    }

    if (!requireCustomerAuth()) {
        return;
    }

    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId) || numericProductId <= 0) {
        return;
    }

    if (action === "cart" || action === "view-cart") {
        if (action === "view-cart") {
            window.location.href = "cart.html";
            return;
        }

        const root = triggerElement.closest(".product-card, .detail-summary");
        const selectedStock = Number(root?.dataset.selectedVariantStock || triggerElement.dataset.selectedVariantStock || 0);
        if (!isStockAvailable(selectedStock)) {
            showFlashMessage("This item is out of stock.", "error");
            return;
        }

        const selectedVariantLabel = root?.dataset.selectedVariantLabel || triggerElement.dataset.selectedVariantLabel || "Default";
        const selectedVariantColor = root?.dataset.selectedVariantColor || triggerElement.dataset.selectedVariantColor || "";
        const selectedVariantPrice = Number(root?.dataset.selectedVariantPrice || triggerElement.dataset.selectedVariantPrice || 0);
        const selectedVariantDiscountPrice = root?.dataset.selectedVariantDiscountPrice
            ? Number(root.dataset.selectedVariantDiscountPrice)
            : (triggerElement.dataset.selectedVariantDiscountPrice ? Number(triggerElement.dataset.selectedVariantDiscountPrice) : null);

        try {
            await apiPost("/cart/add", {
                productId: numericProductId,
                quantity: 1,
                selectedVariantLabel,
                selectedVariantColor,
                selectedVariantPrice: selectedVariantPrice || null,
                selectedVariantDiscountPrice
            });

            const cartButtons = document.querySelectorAll(
                `[data-action="cart"][data-product-id="${numericProductId}"], [data-action="view-cart"][data-product-id="${numericProductId}"]`
            );
            cartButtons.forEach((button) => {
                button.textContent = "View Cart";
                button.dataset.action = "view-cart";
                if (button.tagName === "A") {
                    button.href = "cart.html";
                }
                button.classList.add("is-added");
                button.setAttribute("aria-pressed", "true");
            });

            if (typeof window.syncSavedActionStates === "function") {
                await window.syncSavedActionStates();
            }

            await updateNavbarCounts();
            showFlashMessage("Product added to cart.", "success");
        } catch (error) {
            showFlashMessage(error.message || "Unable to add to cart.", "error");
        }
    }
}

function bindHomepageProductActions(container) {
    if (!container || container.dataset.homeProductActionsBound === "true") {
        return;
    }

    container.dataset.homeProductActionsBound = "true";

    container.addEventListener("click", async (event) => {
        const actionButton = event.target.closest("[data-action]");
        if (!actionButton || !container.contains(actionButton)) {
            return;
        }

        const action = actionButton.dataset.action;
        const productId = actionButton.dataset.productId;
        if (!action || !productId) {
            return;
        }

        if (action === "variant" || action === "variant-color") {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        await handleHomepageProductAction(action, productId, actionButton);
    });
}

function createProductCard(product, options = {}) {
    const specs = getProductDisplayDefaults(product);
    const selectedVariant = getSelectedProductVariant(product);
    const selectedStock = Number(selectedVariant.stockQuantity ?? product.stockQuantity ?? 0);
    const currentPriceValue = selectedVariant.discountPrice ?? selectedVariant.price ?? product.discountPrice ?? product.price;
    const oldPriceValue = selectedVariant.discountPrice != null ? selectedVariant.price : product.discountPrice ? product.price : null;
    const price = formatCurrency(currentPriceValue);
    const oldPrice = oldPriceValue ? `<span class="price-old" data-old-price>${formatCurrency(oldPriceValue)}</span>` : `<span class="price-old" data-old-price hidden></span>`;
    const productLink = `product-details.html?id=${product.id}`;
    const { rawImageUrl, imageUrl } = getProductCardImageSource(product, selectedVariant);
    const hasImage = Boolean(rawImageUrl);

    return `
        <article
            class="product-card product-card--premium ${options.compact ? "is-compact" : ""}"
            data-product-link="${productLink}"
            data-selected-variant-label="${getVariantDisplayLabel(selectedVariant, product)}"
            data-selected-variant-color="${escapeHtml(selectedVariant.color || product.color || "")}"
            data-selected-variant-price="${selectedVariant.price ?? ""}"
            data-selected-variant-discount-price="${selectedVariant.discountPrice ?? ""}"
            data-selected-variant-stock="${selectedVariant.stockQuantity ?? product.stockQuantity ?? 0}"
            tabindex="0"
            role="link"
            aria-label="View ${product.name}"
        >
            <div class="product-media ${hasImage ? "" : "is-empty"}">
                ${hasImage
                    ? `<img src="${imageUrl}" alt="${product.name}" loading="lazy" decoding="async" data-product-card-image>`
                    : `
                        <div class="product-media-placeholder" aria-hidden="true">
                            <span>No image</span>
                            <strong>${escapeHtml(product.name || "Product")}</strong>
                            <em>${escapeHtml(product.category?.name || product.productType || "Pet Care")}</em>
                        </div>
                    `}
                <div class="badge-row">
                    ${product.featured ? '<span class="badge hot">Featured</span>' : ""}
                    ${selectedStock <= 0
                        ? '<span class="badge">Out of Stock</span>'
                        : (selectedStock <= 5 ? '<span class="badge">Low Stock</span>' : "")}
                </div>
            </div>
            <div class="product-body">
                ${options.compact ? `
                    <div class="detail-spec-chips compact">
                        <span>${product.category?.name || "Pet Care"}</span>
                        ${product.brand ? `<span>${product.brand}</span>` : ""}
                    </div>
                    ${options.showVariants ? renderVariantChipButtons(product) : ""}
                    <h3>${product.name}</h3>
                    <p class="product-summary">${getProductCardSummary(product)}</p>
                    <div class="detail-spec-chips compact">
                        ${getProductCardAttributeChips(product, { compact: true })}
                    </div>
                ` : `
                    <div class="product-meta">
                        <span>${product.category?.name || "Pet Care"}</span>
                        <span>${product.productType || "Product"}</span>
                        <span>${product.brand || "Leo's Pet Barkery"}</span>
                    </div>
                    <div class="detail-spec-chips compact">
                        ${getProductCardAttributeChips(product)}
                    </div>
                    ${renderSelectableVariantControls(product)}
                    <div>
                        <h3>${product.name}</h3>
                        <p>${getProductCardSummary(product)}</p>
                    </div>
                `}
                <div class="price-row">
                    <span class="price" data-current-price>${price}</span>
                    ${oldPrice}
                </div>
                <div class="product-actions">
                    ${options.compact
                        ? `<button class="cta-small ${!isStockAvailable(selectedStock) ? "is-disabled" : ""}" type="button" data-action="cart" data-product-id="${product.id}" ${!isStockAvailable(selectedStock) ? 'aria-disabled="true" tabindex="-1"' : ""}>${isStockAvailable(selectedStock) ? "Add to Cart" : "Out of Stock"}</button>`
                        : `<button class="cta-small ${!isStockAvailable(selectedStock) ? "is-disabled" : ""}" type="button" data-action="cart" data-product-id="${product.id}" ${!isStockAvailable(selectedStock) ? 'aria-disabled="true" tabindex="-1"' : ""}>${isStockAvailable(selectedStock) ? "Add to Cart" : "Out of Stock"}</button>`}
                </div>
            </div>
        </article>
    `;
}

async function fetchWithFallback(loader, fallback) {
    try {
        const response = await loader();
        if (response && response.data) {
            return response.data;
        }
        return fallback;
    } catch (error) {
        console.warn("Using fallback data:", error.message);
        return fallback;
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
    }, 3200);
}

function bindContactForm() {
    if (document.body.dataset.page !== "contact") {
        return;
    }

    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-form-status");
    if (!form || !status || form.dataset.bound === "true") {
        return;
    }

    form.dataset.bound = "true";
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        status.textContent = "Thank you! We'll contact you shortly.";
        status.className = "contact-form-status is-success";
        form.reset();
        showFlashMessage("Thank you! We'll contact you shortly.", "success");
    });
}

function requireCustomerAuth(redirectPath = "login.html") {
    if (getToken()) {
        return true;
    }

    sessionStorage.setItem("leo_redirect_after_login", window.location.href);
    showFlashMessage("Please login to continue.", "error");
    window.location.href = redirectPath;
    return false;
}

function protectCustomerPage() {
    const currentPage = document.body.dataset.page || "";
    if (!protectedCustomerPages.has(currentPage)) {
        return;
    }

    requireCustomerAuth();
}

function setNavbarCountElements(elements, count) {
    elements.forEach((element) => {
        if (element) {
            element.textContent = String(count);
        }
    });
}

function resetUserStateCache() {
    userStateCache = {
        timestamp: 0,
        data: null,
        promise: null
    };
}

function buildUserStateSnapshot(cartResponse) {
    const cartItems = getCartItemsFromResponse(cartResponse);

    return {
        cartItems,
        cartCount: cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
        cartProductIds: new Set(
            cartItems
                .map((item) => Number(item.productId || item.product?.id || item.product?.productId))
                .filter(Boolean)
        )
    };
}

async function fetchUserSavedState(options = {}) {
    const { force = false } = options;

    if (!getToken()) {
        resetUserStateCache();
        return buildUserStateSnapshot({ data: { items: [] } });
    }

    const cacheAge = Date.now() - userStateCache.timestamp;
    if (!force && userStateCache.data && cacheAge < userStateCacheTtlMs) {
        return userStateCache.data;
    }

    if (userStateCache.promise) {
        return userStateCache.promise;
    }

    userStateCache.promise = apiGet("/cart")
        .then((cartResponse) => {
            const snapshot = buildUserStateSnapshot(cartResponse);
            userStateCache.data = snapshot;
            userStateCache.timestamp = Date.now();
            return snapshot;
        })
        .finally(() => {
            userStateCache.promise = null;
        });

    return userStateCache.promise;
}

function applyNavbarCountsFromState(state) {
    const cartCountEls = document.querySelectorAll("#cart-count, #mobile-cart-count");

    if (!state) {
        setNavbarCountElements(cartCountEls, 0);
        return;
    }

    setNavbarCountElements(cartCountEls, state.cartCount || 0);
}

async function updateNavbarCounts(force = false) {
    if (!getToken()) {
        applyNavbarCountsFromState(null);
        return;
    }

    try {
        const state = await fetchUserSavedState({ force });
        applyNavbarCountsFromState(state);
    } catch (error) {
        applyNavbarCountsFromState(null);
    }
}

function getCartItemsFromResponse(response) {
    return response?.data?.items || response?.items || [];
}

function resetActionButtonState(button) {
    const action = button.dataset.action;
    if (action === "view-cart") {
        button.textContent = "Add to Cart";
        button.dataset.action = "cart";
        if (button.tagName === "A") {
            button.href = "cart.html";
        }
        button.classList.remove("is-added");
        button.removeAttribute("aria-pressed");
    }
}

function readStoredProductIdSet(storageKey) {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
            return new Set();
        }

        const parsed = JSON.parse(raw);
        return new Set(Array.isArray(parsed) ? parsed.map((value) => Number(value)).filter(Boolean) : []);
    } catch (error) {
        return new Set();
    }
}

function writeStoredProductIdSet(storageKey, ids) {
    try {
        localStorage.setItem(storageKey, JSON.stringify([...ids]));
    } catch (error) {
        console.warn("Unable to store product state cache:", error.message);
    }
}

function clearStoredProductIdSet(storageKey) {
    try {
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.warn("Unable to clear product state cache:", error.message);
    }
}

function applySavedActionButtonState(button, savedState) {
    if (savedState === "cart") {
        if (button.dataset.action !== "cart" && button.dataset.action !== "view-cart") {
            return;
        }
        button.textContent = "View Cart";
        button.dataset.action = "view-cart";
        if (button.tagName === "A") {
            button.href = "cart.html";
        }
        button.classList.add("is-added");
        button.setAttribute("aria-pressed", "true");
    }
}

function applyStoredProductActionStates() {
    const cartProductIds = readStoredProductIdSet(cartStateKey);

    document.querySelectorAll('[data-action="cart"][data-product-id], [data-action="view-cart"][data-product-id]').forEach((button) => {
        const productId = Number(button.dataset.productId);
        if (Number.isNaN(productId)) {
            return;
        }

        resetActionButtonState(button);

        if (cartProductIds.has(productId)) {
            applySavedActionButtonState(button, "cart");
        }
    });

    document.querySelectorAll(".product-card, .detail-summary").forEach((root) => {
        applyCartAvailabilityState(root);
    });
}

async function syncSavedActionStates(force = true) {
    applyStoredProductActionStates();

    if (!getToken()) {
        resetUserStateCache();
        clearStoredProductIdSet(cartStateKey);
        applyNavbarCountsFromState(null);
        applyStoredProductActionStates();
        return;
    }

    try {
        const state = await fetchUserSavedState({ force });
        writeStoredProductIdSet(cartStateKey, state.cartProductIds);
        applyNavbarCountsFromState(state);
        applyStoredProductActionStates();
    } catch (error) {
        console.warn("Unable to sync saved action states:", error.message);
    }
}

window.applyStoredProductActionStates = applyStoredProductActionStates;
window.syncSavedActionStates = syncSavedActionStates;

function syncPostLoginRedirect() {
    const redirectUrl = sessionStorage.getItem("leo_redirect_after_login");
    if (!redirectUrl) {
        return null;
    }

    sessionStorage.removeItem("leo_redirect_after_login");
    return redirectUrl;
}

function injectToysSectionStyles() {
    if (document.getElementById("leo-toys-section-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "leo-toys-section-styles";
    style.textContent = `
        .toys-section {
            position: relative;
            overflow: hidden;
            padding: 1.35rem;
            border: 1px solid rgba(240, 0, 0, 0.1);
            border-radius: 34px;
            background:
                radial-gradient(circle at top left, rgba(240, 0, 0, 0.14), transparent 24%),
                radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.92), transparent 18%),
                linear-gradient(135deg, rgba(255, 240, 242, 0.98), rgba(255, 250, 250, 0.98));
            box-shadow: 0 26px 52px rgba(17, 17, 17, 0.08);
        }

        .toys-section::before,
        .toys-section::after {
            content: "";
            position: absolute;
            pointer-events: none;
            opacity: 0.16;
            background-repeat: no-repeat;
            background-size: contain;
        }

        .toys-section::before {
            top: -12px;
            right: 3%;
            width: 160px;
            height: 160px;
            background-image:
                radial-gradient(ellipse at 50% 72%, rgba(240, 0, 0, 0.32) 0 22%, transparent 24%),
                radial-gradient(circle at 22% 28%, rgba(240, 0, 0, 0.26) 0 10%, transparent 11%),
                radial-gradient(circle at 41% 12%, rgba(240, 0, 0, 0.26) 0 10%, transparent 11%),
                radial-gradient(circle at 59% 12%, rgba(240, 0, 0, 0.26) 0 10%, transparent 11%),
                radial-gradient(circle at 78% 28%, rgba(240, 0, 0, 0.26) 0 10%, transparent 11%);
            background-position: center;
        }

        .toys-section::after {
            left: -20px;
            bottom: -24px;
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(240, 0, 0, 0.18), transparent 62%);
            filter: blur(2px);
        }

        .toys-hero {
            position: relative;
            z-index: 1;
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(300px, 0.92fr);
            gap: 1.1rem;
            align-items: stretch;
        }

        .toys-copy {
            display: grid;
            align-content: center;
            gap: 0.85rem;
            padding: 1.25rem 1rem 1.25rem 0.35rem;
        }

        .toys-copy h2 {
            margin: 0;
            font-family: var(--font-heading);
            font-size: clamp(2rem, 4vw, 3.4rem);
            line-height: 1.02;
            color: var(--color-black);
        }

        .toys-copy p {
            max-width: 56ch;
            margin: 0;
            color: var(--color-text-soft);
            font-size: 1rem;
            line-height: 1.75;
        }

        .toys-badge {
            display: inline-flex;
            width: fit-content;
            align-items: center;
            gap: 0.8rem;
            padding: 0.85rem 1rem;
            border-radius: 999px;
            border: 1px solid rgba(240, 0, 0, 0.14);
            background: rgba(255, 255, 255, 0.94);
            box-shadow: 0 16px 30px rgba(17, 17, 17, 0.08);
        }

        .toys-badge-mark {
            position: relative;
            width: 2.2rem;
            height: 2.2rem;
            flex: 0 0 2.2rem;
            border-radius: 50%;
            background:
                radial-gradient(ellipse at 50% 74%, var(--color-primary) 0 26%, transparent 27%),
                radial-gradient(circle at 22% 28%, var(--color-primary) 0 9%, transparent 10%),
                radial-gradient(circle at 42% 10%, var(--color-primary) 0 9%, transparent 10%),
                radial-gradient(circle at 58% 10%, var(--color-primary) 0 9%, transparent 10%),
                radial-gradient(circle at 78% 28%, var(--color-primary) 0 9%, transparent 10%);
            filter: drop-shadow(0 6px 10px rgba(240, 0, 0, 0.2));
            transform: rotate(-12deg);
        }

        .toys-badge strong,
        .toys-badge span {
            display: block;
        }

        .toys-badge strong {
            color: var(--color-primary-dark);
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
        }

        .toys-badge span {
            font-family: var(--font-heading);
            font-size: 1.25rem;
            color: var(--color-black);
        }

        .toys-cta {
            width: fit-content;
            padding-inline: 1.5rem;
            box-shadow: 0 14px 24px rgba(240, 0, 0, 0.22);
        }

        .toys-visual {
            position: relative;
            min-height: 360px;
            padding: 1rem;
            border-radius: 30px;
            overflow: hidden;
            background:
                linear-gradient(155deg, rgba(17, 17, 17, 0.95), rgba(240, 0, 0, 0.88)),
                var(--color-black);
            box-shadow: 0 26px 44px rgba(17, 17, 17, 0.14);
        }

        .toys-visual img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            mix-blend-mode: screen;
            opacity: 0.9;
        }

        .toys-visual-overlay {
            position: absolute;
            inset: 0;
            z-index: 2;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        .toys-visual-card {
            position: absolute;
            width: fit-content;
            max-width: min(64%, 220px);
            padding: 0.72rem 0.9rem;
            border: 1px solid rgba(240, 0, 0, 0.18);
            border-radius: 20px;
            background: rgba(255, 248, 248, 0.94);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            color: var(--color-black);
            box-shadow: 0 18px 34px rgba(17, 17, 17, 0.22);
        }

        .toys-visual-card-top {
            top: 0.95rem;
            left: 0.95rem;
        }

        .toys-visual-card-bottom {
            right: 0.95rem;
            bottom: 0.95rem;
        }

        .toys-visual-card strong,
        .toys-visual-card span {
            display: block;
        }

        .toys-visual-card strong {
            color: var(--color-primary-dark);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .toys-visual-card span {
            margin-top: 0.18rem;
            font-family: var(--font-heading);
            font-size: 1.24rem;
            line-height: 1.18;
            color: var(--color-black);
            text-shadow: none;
        }

        .toys-grid {
            position: relative;
            z-index: 1;
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 0.85rem;
            margin-top: 1rem;
        }

        .toy-card {
            display: grid;
            gap: 0.8rem;
            padding: 0.8rem;
            border: 1px solid rgba(17, 17, 17, 0.06);
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.96);
            box-shadow: 0 14px 28px rgba(17, 17, 17, 0.06);
            transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
        }

        .toy-card:hover {
            transform: translateY(-6px);
            border-color: rgba(240, 0, 0, 0.16);
            box-shadow: 0 24px 40px rgba(17, 17, 17, 0.1);
        }

        .toy-card-media {
            position: relative;
            aspect-ratio: 1 / 0.92;
            overflow: hidden;
            border-radius: 20px;
            background: linear-gradient(180deg, #fff, #fff3f3);
        }

        .toy-card-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 220ms ease;
        }

        .toy-card:hover .toy-card-media img {
            transform: scale(1.05);
        }

        .toy-card-badge {
            position: absolute;
            top: 0.7rem;
            left: 0.7rem;
            padding: 0.38rem 0.6rem;
            border-radius: 999px;
            background: rgba(17, 17, 17, 0.84);
            color: var(--color-white);
            font-size: 0.67rem;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }

        .toy-card-body {
            display: grid;
            gap: 0.3rem;
        }

        .toy-card-body strong {
            font-size: 1rem;
            color: var(--color-black);
        }

        .toy-card-body p {
            margin: 0;
            color: var(--color-text-soft);
            font-size: 0.87rem;
            line-height: 1.5;
        }

        .toy-card-link {
            margin-top: 0.15rem;
            color: var(--color-primary-dark);
            font-size: 0.8rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        @media (max-width: 1180px) {
            .toys-grid {
                grid-template-columns: repeat(3, minmax(0, 1fr));
            }
        }

        @media (max-width: 920px) {
            .toys-hero {
                grid-template-columns: 1fr;
            }

            .toys-copy {
                padding-right: 0;
            }

            .toys-visual {
                min-height: 300px;
            }

            .toys-visual-card-top {
                top: 0.75rem;
                left: 0.75rem;
            }

            .toys-visual-card-bottom {
                right: 0.75rem;
                bottom: 0.75rem;
            }
        }

        @media (max-width: 700px) {
            .toys-section {
                padding: 1rem;
                border-radius: 28px;
            }

            .toys-copy {
                justify-items: center;
                text-align: center;
            }

            .toys-copy p {
                max-width: 100%;
            }

            .toys-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 480px) {
            .toys-visual {
                min-height: 230px;
            }

            .toys-visual-card {
                max-width: min(58%, 160px);
                padding: 0.5rem 0.65rem;
                border-radius: 16px;
            }

            .toys-visual-card span {
                font-size: 0.9rem;
            }

            .toys-visual-card strong {
                font-size: 0.68rem;
                letter-spacing: 0.08em;
            }

            .toys-grid {
                gap: 0.7rem;
            }

            .toy-card {
                padding: 0.7rem;
                border-radius: 20px;
            }

            .toy-card-body strong {
                font-size: 0.94rem;
            }

            .toy-card-body p,
            .toy-card-link {
                font-size: 0.78rem;
            }

            .toy-card-badge {
                top: 0.48rem;
                left: 0.48rem;
                padding: 0.28rem 0.45rem;
                font-size: 0.58rem;
            }
        }
    `;

    document.head.appendChild(style);
}

function injectHeroBannerStyles() {
    if (document.getElementById("leo-hero-banner-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "leo-hero-banner-styles";
    style.textContent = `
        .hero-banner-slider {
            position: relative;
            width: 100vw;
            height: auto;
            aspect-ratio: auto;
            min-height: 0;
            max-height: none;
            max-width: none;
            margin: 0 calc(50% - 50vw);
            padding: 0;
            overflow: hidden;
            background: #fff7f7;
        }

        .hero-banner-track {
            position: relative;
            width: 100%;
            height: auto;
            border-radius: 0;
            overflow: visible;
            box-shadow: none;
            background: #fff7f7;
        }

        .hero-banner-slide {
            display: none;
            width: 100%;
            height: auto;
        }

        .hero-banner-slide.is-active {
            display: block;
        }

        .hero-banner-frame {
            display: block;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
        }

        .hero-banner-frame img {
            width: 100%;
            height: auto;
            max-width: 100%;
            object-fit: contain;
            object-position: center;
            display: block;
            background: #fff7f7;
        }

        .hero-banner-dots {
            position: absolute;
            left: 50%;
            bottom: 1rem;
            z-index: 3;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 0.6rem;
            border-radius: 999px;
            background: rgba(17, 17, 17, 0.24);
            transform: translateX(-50%);
            backdrop-filter: blur(10px);
        }

        .hero-banner-dot {
            width: 0.7rem;
            height: 0.7rem;
            padding: 0;
            border: 0;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.48);
            transition: transform 180ms ease, background 180ms ease, width 180ms ease;
        }

        .hero-banner-dot.is-active {
            width: 1.8rem;
            background: rgba(255, 255, 255, 0.98);
        }

        .hero-banner-controls {
            display: none;
        }

        @media (min-width: 992px) {
            body[data-page="home"] #page-content.container {
                width: 100%;
                max-width: none;
            }

            body[data-page="home"] .hero-banner {
                position: relative;
                left: 50%;
                width: 100dvw;
                max-width: 100dvw;
                margin-left: 0;
                margin-right: 0;
                padding: 0;
                transform: translateX(-50%);
                overflow: hidden;
            }

            body[data-page="home"] .hero-banner-slider,
            body[data-page="home"] .hero-banner-track,
            body[data-page="home"] .hero-banner-slide,
            body[data-page="home"] .hero-banner-frame {
                width: 100%;
                max-width: 100%;
                aspect-ratio: 1920 / 650;
                height: auto;
                min-height: 0;
                max-height: none;
                overflow: hidden;
            }

            body[data-page="home"] .hero-banner-track {
                display: flex;
            }

            body[data-page="home"] .hero-banner-slide {
                flex: 0 0 100%;
            }

            body[data-page="home"] .hero-banner img,
            body[data-page="home"] .hero-banner-slide img,
            body[data-page="home"] .hero-banner-frame img,
            body[data-page="home"] .home-banner-slide img,
            body[data-page="home"] .hero-banner picture,
            body[data-page="home"] .hero-banner-slide picture,
            body[data-page="home"] .home-banner-slide picture {
                width: 100%;
                height: 100%;
                max-width: 100%;
                display: block;
            }

            body[data-page="home"] .hero-banner img,
            body[data-page="home"] .hero-banner-slide img,
            body[data-page="home"] .hero-banner-frame img,
            body[data-page="home"] .home-banner-slide img {
                object-fit: cover;
                object-position: center center;
            }

            body[data-page="home"] .hero-banner + .section-block,
            body[data-page="home"] .section-block {
                width: min(100% - 2rem, var(--container-width));
                margin-left: auto;
                margin-right: auto;
            }
        }

        @media (max-width: 640px) {
            .hero-banner-slider {
                height: auto;
                aspect-ratio: auto;
                min-height: 0;
                max-height: none;
            }

            .hero-banner-track {
                height: auto;
            }

            .hero-banner-slide {
                height: auto;
            }

            .hero-banner-frame {
                height: auto;
            }

            .hero-banner-frame img {
                height: auto;
                object-fit: unset;
            }

            .hero-banner-dots {
                bottom: 0.8rem;
                gap: 0.4rem;
            }
        }
    `;

    document.head.appendChild(style);
}

function getFallbackHeroSlides() {
    return [
        {
            desktopImageUrl: "assets/images/version2.png",
            mobileImageUrl: "assets/images/mobileimage.png",
            alt: "Pet care essentials for happy homes"
        }
    ];
}

function renderCategoryMarqueeCards(categories = []) {
    return categories.map((category) => `
        <a class="category-circle-card" href="shop.html?category=${encodeURIComponent(category.name)}">
            <span class="category-circle-media">
                ${category.imageUrl
                    ? `<img src="${resolveMediaUrl(category.imageUrl)}" alt="${category.name}" loading="lazy" decoding="async">`
                    : `<span>${category.icon || "PAW"}</span>`}
            </span>
            <span class="category-circle-name">${category.name}</span>
        </a>
    `).join("");
}

function syncCategoryMarqueeDistances() {
    document.querySelectorAll(".category-marquee-track").forEach((track) => {
        const group = track.querySelector(".category-marquee-group");
        if (!group) {
            return;
        }

        track.style.setProperty("--marquee-distance", `${group.scrollWidth}px`);
    });
}

function createMarqueeGroup(categories = []) {
    return `
        <div class="category-marquee-group">
            ${renderCategoryMarqueeCards(categories)}
        </div>
    `;
}

function getHeroSlides(banners = []) {
    const activeSlides = normalizeSearchItems(banners)
        .map((banner, index) => {
            const desktopImageUrl = String(banner?.desktopImageUrl || banner?.imageUrl || "").trim();
            const mobileImageUrl = String(banner?.mobileImageUrl || banner?.desktopImageUrl || banner?.imageUrl || "").trim();

            if (!desktopImageUrl && !mobileImageUrl) {
                return null;
            }

            return {
                desktopImageUrl: resolveMediaUrl(desktopImageUrl || mobileImageUrl),
                mobileImageUrl: resolveMediaUrl(mobileImageUrl || desktopImageUrl),
                alt: String(banner?.title || `Homepage banner ${index + 1}`)
            };
        })
        .filter(Boolean);

    return activeSlides.length ? activeSlides : getFallbackHeroSlides();
}

function renderHeroBannerSlidesMarkup(banners = []) {
    const slides = getHeroSlides(banners);
    const fallbackDesktopFallback = "assets/images/version2.png";
    const fallbackMobileFallback = "assets/images/mobileimage.png";

    return `
        <div class="hero-banner-track" data-hero-track>
            ${slides.map((slide, index) => `
                <div class="hero-banner-slide ${index === 0 ? "is-active" : ""}" data-hero-slide aria-hidden="${index === 0 ? "false" : "true"}">
                    <picture class="hero-banner-frame">
                        <source media="(max-width: 991px)" srcset="${escapeHtml(slide.mobileImageUrl)}">
                        <img
                            src="${escapeHtml(slide.desktopImageUrl)}"
                            alt="${escapeHtml(slide.alt)}"
                            loading="${index === 0 ? "eager" : "lazy"}"
                            decoding="async"
                            onerror="this.onerror=null;this.src=(window.matchMedia && window.matchMedia('(max-width: 991px)').matches ? '${fallbackMobileFallback}' : '${fallbackDesktopFallback}');"
                        >
                    </picture>
                </div>
            `).join("")}
            ${slides.length > 1 ? `
                <div class="hero-banner-dots" aria-label="Hero banner pagination">
                    ${slides.map((_, index) => `
                        <button
                            type="button"
                            class="hero-banner-dot ${index === 0 ? "is-active" : ""}"
                            data-hero-dot
                            aria-label="Show banner ${index + 1}"
                            aria-pressed="${index === 0 ? "true" : "false"}"
                        ></button>
                    `).join("")}
                </div>
            ` : ""}
        </div>
    `;
}

function renderHeroBannerSlider(banners = []) {
    return `
        <section class="hero-banner hero-banner-slider" data-home-hero-banner aria-label="Homepage banners">
            ${renderHeroBannerSlidesMarkup(banners)}
        </section>
    `;
}

function resetHeroBannerSlider(root) {
    if (!root) {
        return;
    }

    if (root._heroBannerSliderTimer) {
        window.clearInterval(root._heroBannerSliderTimer);
        root._heroBannerSliderTimer = null;
    }

    delete root.dataset.heroSliderBound;
}

function bindHeroBannerSlider(root) {
    if (!root || root.dataset.heroSliderBound === "true") {
        return;
    }

    const track = root.querySelector("[data-hero-track]");
    if (!track) {
        return;
    }

    const slides = Array.from(track.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(track.querySelectorAll("[data-hero-dot]"));
    const prevButton = track.querySelector("[data-hero-prev]");
    const nextButton = track.querySelector("[data-hero-next]");
    if (!slides.length) {
        return;
    }

    if (slides.length <= 1) {
        return;
    }

    if (root._heroBannerSliderTimer) {
        window.clearInterval(root._heroBannerSliderTimer);
        root._heroBannerSliderTimer = null;
    }

    root.dataset.heroSliderBound = "true";
    let currentIndex = 0;
    let timer = null;

    const showSlide = (index) => {
        currentIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            const active = slideIndex === currentIndex;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", String(!active));
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === currentIndex);
            dot.setAttribute("aria-pressed", String(dotIndex === currentIndex));
        });
    };

    const stopTimer = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }

        root._heroBannerSliderTimer = null;
    };

    const startTimer = () => {
        stopTimer();
        timer = window.setInterval(() => showSlide(currentIndex + 1), 4000);
        root._heroBannerSliderTimer = timer;
    };

    prevButton?.addEventListener("click", () => {
        showSlide(currentIndex - 1);
        startTimer();
    });

    nextButton?.addEventListener("click", () => {
        showSlide(currentIndex + 1);
        startTimer();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            startTimer();
        });
    });
    showSlide(0);
    startTimer();
}

function getToyProductsData(allProducts = []) {
    const products = Array.isArray(allProducts) ? allProducts : [];
    return products.filter((product) => {
        const categoryName = String(product.category?.name || "").toLowerCase();
        const productType = String(product.productType || "").toLowerCase();
        const productName = String(product.name || "").toLowerCase();
        return categoryName.includes("toy") || productType.includes("toy") || productName.includes("toy");
    });
}

function getToyFallbackItems() {
    return [
        {
            name: "Chew Toy Classic",
            brand: "Leo's Pet Barkery",
            description: "Durable chew toy for playful pets and everyday fun.",
            imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
        },
        {
            name: "Plush Toy Buddy",
            brand: "Leo's Pet Barkery",
            description: "Soft toy made for cozy play sessions and happy paws.",
            imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80"
        },
        {
            name: "Rope Tug Toy",
            brand: "Leo's Pet Barkery",
            description: "Tug-ready rope toy built for active play.",
            imageUrl: "https://images.unsplash.com/photo-1537151672256-6caf2e9f8c95?auto=format&fit=crop&w=900&q=80"
        },
        {
            name: "Fetch Ball Toy",
            brand: "Leo's Pet Barkery",
            description: "Bounce, chase, and fetch for energetic routines.",
            imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80"
        },
        {
            name: "Cat Teaser Toy",
            brand: "Leo's Pet Barkery",
            description: "Interactive toy for curious cats and quick paws.",
            imageUrl: "https://i.pinimg.com/736x/c2/f9/7e/c2f97ecd17963179cf8e317ff6acbf74.jpg"
        },
        {
            name: "Training Puzzle Toy",
            brand: "Leo's Pet Barkery",
            description: "Smart enrichment toy for focused, playful training.",
            imageUrl: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=900&q=80"
        }
    ];
}

function getToyCardSummary(product = {}) {
    const summaryParts = [
        product.productType,
        product.material,
        product.petType,
        product.brand
    ]
        .map((value) => String(value || "").trim())
        .filter(Boolean);

    if (summaryParts.length) {
        return summaryParts.slice(0, 2).join(" • ");
    }

    const description = String(product.description || "").trim();
    if (!description) {
        return "Playful essentials for happy pets.";
    }

    return description.length > 52
        ? `${description.slice(0, 52).trim()}...`
        : description;
}

function getToyCategoryCards(toyProducts = []) {
    const offerBadges = [
        "Up to 60% OFF",
        "New Picks",
        "Best Seller",
        "Hot Deal",
        "Trending",
        "Premium"
    ];

    const fallbackItems = getToyFallbackItems();
    const products = toyProducts.slice(0, 6);

    while (products.length < 6) {
        products.push(fallbackItems[products.length % fallbackItems.length]);
    }

    return products.map((product, index) => ({
        title: product?.name || `Toy Pick ${index + 1}`,
        text: getToyCardSummary(product),
        offer: offerBadges[index % offerBadges.length],
        href: product?.id ? `product-details.html?id=${product.id}` : "shop.html?category=Toys",
        image: resolveMediaUrl(product?.imageUrl || product?.images?.[0]?.imageUrl || fallbackItems[index % fallbackItems.length]?.imageUrl),
        productName: product?.brand || product?.category?.name || "Leo's Pet Barkery"
    }));
}

function getToysSection(allProducts = []) {
    const toyProducts = getToyProductsData(allProducts);
    const toyCards = getToyCategoryCards(toyProducts);
    const toyFallbackItems = getToyFallbackItems();
    const featuredToy = toyProducts[0] || toyFallbackItems[0];
    const featuredToyImage = resolveMediaUrl(featuredToy?.imageUrl || featuredToy?.images?.[0]?.imageUrl || toyFallbackItems[0]?.imageUrl);
    const featuredToyName = featuredToy?.name || "Playful toy essentials";
    const featuredToyStock = Number(featuredToy?.stockQuantity || 0);
    const featuredToyCount = toyProducts.length || 6;

    return `
        <section class="section-block toys-section" aria-labelledby="toys-section-title">
            <div class="toys-hero">
                <div class="toys-copy">
                    <span class="eyebrow">Playful essentials</span>
                    <h2 id="toys-section-title">Playtime Picks for Happy Pets</h2>
                    <p>Fun, safe, and durable toys made for chewing, chasing, tugging, and endless tail-wagging moments.</p>
                    <div class="toys-badge">
                        <span class="toys-badge-mark" aria-hidden="true"></span>
                        <div>
                            <strong>Toy Fest</strong>
                            <span>Up to 60% OFF</span>
                        </div>
                    </div>
                    <a class="cta-button toys-cta" href="shop.html?category=Toys">Explore Toys</a>
                </div>
                <div class="toys-visual">
                    <img src="${featuredToyImage}" alt="${featuredToyName}">
                    <div class="toys-visual-overlay" aria-hidden="true">
                        <div class="toys-visual-card toys-visual-card-top">
                            <strong>Curated toys</strong>
                            <span>${featuredToyName}</span>
                        </div>
                        <div class="toys-visual-card toys-visual-card-bottom">
                            <strong>${featuredToyCount || 0} toy picks</strong>
                            <span>${featuredToyStock > 0 ? `${featuredToyStock} in stock` : "Fresh toy finds"}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="toys-grid">
                ${toyCards.map((item) => `
                    <a class="toy-card" href="${item.href}">
                        <span class="toy-card-media">
                            <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
                            <span class="toy-card-badge">${item.offer}</span>
                        </span>
                        <span class="toy-card-body">
                            <strong>${item.title}</strong>
                            <p>${item.text}</p>
                            <span class="toy-card-link">${item.productName}</span>
                        </span>
                    </a>
                `).join("")}
            </div>
        </section>
    `;
}

function getBannerSortValue(banner = {}) {
    const timestamp = new Date(banner.updatedAt || banner.createdAt || "").getTime();
    if (!Number.isNaN(timestamp)) {
        return timestamp;
    }

    return Number(banner.id || 0);
}

function getHomepageBanners(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.data?.content)) {
        return payload.data.content;
    }

    if (Array.isArray(payload?.content)) {
        return payload.content;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    return [];
}

function getHomepageBannerSlides(payload) {
    return getHomepageBanners(payload)
        .filter((banner) => {
            const desktopImage = String(banner?.desktopImageUrl || banner?.imageUrl || "").trim();
            const mobileImage = String(banner?.mobileImageUrl || banner?.desktopImageUrl || banner?.imageUrl || "").trim();
            return banner?.active !== false && (desktopImage || mobileImage);
        })
        .sort((first, second) => getBannerSortValue(second) - getBannerSortValue(first))
        .map((banner, index) => {
            const desktopImageUrl = String(banner.desktopImageUrl || banner.imageUrl || banner.mobileImageUrl || "").trim();
            const mobileImageUrl = String(banner.mobileImageUrl || banner.desktopImageUrl || banner.imageUrl || "").trim();

            return {
                desktopImageUrl: resolveMediaUrl(desktopImageUrl || mobileImageUrl),
                mobileImageUrl: resolveMediaUrl(mobileImageUrl || desktopImageUrl),
                imageUrl: resolveMediaUrl(desktopImageUrl || mobileImageUrl),
                title: banner.title || `Homepage banner ${index + 1}`,
                active: true
            };
        });
}

async function loadHomepageBanners() {
    const fallbackSlides = [
        {
            desktopImageUrl: resolveMediaUrl("assets/images/version2.png"),
            mobileImageUrl: resolveMediaUrl("assets/images/mobileimage.png"),
            imageUrl: resolveMediaUrl("assets/images/version2.png"),
            title: "Leo's Pet Barkery banner",
            active: true
        }
    ];

    try {
        const response = await apiGet("/banners");
        const banners = getHomepageBanners(response);
        const activeSlides = getHomepageBannerSlides(banners);
        return activeSlides.length ? activeSlides : fallbackSlides;
    } catch (error) {
        console.warn("Using static homepage banner:", error.message);
        return fallbackSlides;
    }
}


async function loadHomepage() {
    if (document.body.dataset.page !== "home") {
        return;
    }

    injectHeroBannerStyles();
    injectToysSectionStyles();

    const [categories, featuredProducts, newArrivals, allProductsResponse, homepageBannerSlides] = await Promise.all([
        fetchWithFallback(() => apiGet("/categories"), fallbackData.categories),
        fetchWithFallback(() => apiGet("/products/featured?page=0&size=8"), fallbackData.products),
        fetchWithFallback(() => apiGet("/products/new-arrivals?page=0&size=8"), fallbackData.products.slice(1)),
        fetchWithFallback(() => apiGet("/products?page=0&size=16"), fallbackData.products),
        loadHomepageBanners()
    ]);
    const reviews = fallbackData.reviews;
    const featuredList = normalizeListedProducts(featuredProducts.content || featuredProducts);
    const newArrivalList = normalizeListedProducts(newArrivals.content || newArrivals);
    const allProducts = normalizeListedProducts(allProductsResponse.content || allProductsResponse);
    const root = document.getElementById("page-content");
    if (!root) {
        return;
    }

    root.innerHTML = `
        ${renderHeroBannerSlider(homepageBannerSlides)}

        <section class="section-block" id="categories">
            <div class="section-header">
                <div>
                    <span class="eyebrow">Shop by pet category</span>
                    <h2>Everything your companion needs</h2>
                </div>
                <div class="section-header-badge">${categories.length} collections</div>
            </div>
            <div class="category-marquee">
                <div class="category-marquee-row">
                    <div class="category-marquee-track scroll-left">
                        ${createMarqueeGroup(categories)}
                        ${createMarqueeGroup(categories)}
                        <div class="category-marquee-group" aria-hidden="true">
                            ${renderCategoryMarqueeCards(categories)}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section-block spotlight-section">
            <div class="spotlight-shell">
                <div class="spotlight-copy">
                    <span class="eyebrow">Paw picks</span>
                    <h2>Quick picks for everyday pet shopping</h2>
                    <p>Browse a compact selection of food, treats, toys, and grooming essentials.</p>
                    <div class="spotlight-actions">
                        <a class="cta-button" href="shop.html">Explore the shop</a>
                        <a class="ghost-button" href="shop.html?filter=offers">See offers</a>
                    </div>
                </div>
                <div class="spotlight-art">
                    <img src="https://i.pinimg.com/736x/e2/df/8e/e2df8e5bc4bf8407f8af39913e92784f.jpg" alt="Happy pets with premium pet products">
                </div>
            </div>
            <div class="spotlight-grid">
                ${[
                    { title: "Food", subtitle: "Daily nutrition", href: "shop.html?category=Dogs", image: fallbackData.products[0].imageUrl },
                    { title: "Treats", subtitle: "Reward moments", href: "shop.html?filter=offers", image: fallbackData.products[7]?.imageUrl || fallbackData.products[0].imageUrl },
                    { title: "Toys", subtitle: "Play longer", href: "shop.html?category=Toys", image: fallbackData.products[2]?.imageUrl || fallbackData.products[0].imageUrl },
                    { title: "Grooming", subtitle: "Fresh coat care", href: "shop.html?category=Grooming", image: fallbackData.products[5]?.imageUrl || fallbackData.products[0].imageUrl }
                ].map((item) => `
                    <a class="spotlight-card" href="${item.href}">
                        <span class="spotlight-card-image">
                            <img src="${resolveMediaUrl(item.image)}" alt="${item.title}" loading="lazy" decoding="async">
                        </span>
                        <span class="spotlight-card-copy">
                            <strong>${item.title}</strong>
                            <span>${item.subtitle}</span>
                        </span>
                    </a>
                `).join("")}
            </div>
        </section>

        ${getToysSection(allProducts)}
                
        <section class="section-block">
            <div class="section-header featured-section-header">
                <div class="featured-section-copy">
                    <span class="eyebrow">Featured products</span>
                    <h2 class="featured-section-title">Popular picks loved by pet parents</h2>
                </div>
                <a class="ghost-button featured-section-action" href="shop.html">See all products</a>
            </div>
            <div class="product-grid featured-product-grid">
                ${featuredList.slice(0, 4).map(product => createProductCard(product, { compact: true, showVariants: true })).join("")}
            </div>
        </section>

        <section class="section-block">
            <div class="section-header">
                <div>
                    <span class="eyebrow">New arrivals</span>
                    <h2>Fresh finds for happy routines</h2>
                </div>
                <a class="ghost-button featured-section-action" href="shop.html?filter=new">See all new arrivals</a>
            </div>
            <div class="product-grid">
                ${newArrivalList.slice(0, 4).map(product => createProductCard(product, { compact: true, showVariants: true })).join("")}
            </div>
        </section>


        <section class="section-block feature-grid">
            <article class="offer-card featured-offer">
                <span class="eyebrow">Pawsome offers</span>
                <h3>Save on everyday care and mealtime favorites</h3>
                <p>Unlock handpicked bundles across food, collars, grooming, and accessories for all pet moods.</p>
                <a class="ghost-button" href="shop.html?filter=offers">View offers</a>
            </article>
            <div class="offer-card">
                <span class="eyebrow">Best sellers</span>
                <h3>Trusted staples from Leo's community</h3>
                <p>Shop the toys, food, and wellness products pet families reorder again and again.</p>
                <a class="cta-button" href="shop.html">Shop best sellers</a>
            </div>
        </section>

        <section class="section-block google-reviews-section">
            <div class="google-reviews-shell">
                <div class="google-reviews-top">
                    <div class="google-reviews-heading">
                        <span class="eyebrow google-reviews-eyebrow">
                            <span class="google-reviews-paw" aria-hidden="true"></span>
                            Google Reviews
                        </span>
                        <h2>Why pet parents keep coming back</h2>
                        <p>Real feedback from happy customers of Leo's Pet Barkery.</p>
                    </div>
                    <div class="google-reviews-score">
                        <span class="google-reviews-g" aria-hidden="true">G</span>
                        <span class="google-reviews-stars" aria-hidden="true">★★★★★</span>
                        <span class="google-reviews-score-text"><strong>4.9/5</strong> from pet parents</span>
                    </div>
                </div>
                <div class="google-reviews-grid">
                    ${reviews.map(review => `
                        <article class="google-review-card">
                            <div class="google-review-head">
                                ${review.avatarImage ? `
                                    <img class="google-review-avatar google-review-avatar--photo" src="${review.avatarImage}" alt="${review.user.name}" loading="lazy" decoding="async">
                                ` : `
                                    <div class="google-review-avatar google-review-avatar--${review.avatarTone || "neutral"}">${review.avatarInitial || review.user.name.charAt(0)}</div>
                                `}
                                <div class="google-review-meta">
                                    <strong>${review.user.name}</strong>
                                    <span>${review.timeAgo || ""}</span>
                                </div>
                            </div>
                            <div class="google-review-divider"></div>
                            <div class="google-review-stars-line" aria-label="${review.rating} out of 5 stars">
                                ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
                            </div>
                            <p class="google-review-text">${review.reviewText}</p>
                            <div class="google-review-reply">
                                <span class="google-review-reply-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                                        <path d="M4 4h16v10H9l-5 5V4z"></path>
                                    </svg>
                                </span>
                                <div>
                                    <strong>Reply from Leo's Pet Barkery</strong>
                                    <span>${review.reply}</span>
                                </div>
                            </div>
                        </article>
                    `).join("")}
                </div>
                <div class="google-reviews-footer">
                    <a class="google-reviews-cta" href="https://www.google.com/search?q=Leo%27s+Pet+Barkery+reviews" target="_blank" rel="noopener noreferrer">
                        <span>See more reviews on Google</span>
                        <span class="google-reviews-cta-icon" aria-hidden="true">↗</span>
                    </a>
                </div>
            </div>
        </section>
    `; 

    requestAnimationFrame(syncCategoryMarqueeDistances);
    window.addEventListener("resize", syncCategoryMarqueeDistances, { passive: true });
    bindVariantInteractions(root);
    bindHomepageProductCardNavigation(root);
    bindHomepageProductActions(root);
    bindHeroBannerSlider(root.querySelector("[data-home-hero-banner]"));
    if (typeof window.applyStoredProductActionStates === "function") {
        window.applyStoredProductActionStates();
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    protectCustomerPage();
    renderNavbar();
    renderFooter();
    renderFloatingSocialLinks();
    bindNavbarInteractions();
    bindContactForm();
    document.body.classList.add("is-ready");

    const homepagePromise = loadHomepage();
    void syncSavedActionStates().catch((error) => {
        console.warn("Unable to finish saved action sync:", error.message);
    });

    await homepagePromise;
});
