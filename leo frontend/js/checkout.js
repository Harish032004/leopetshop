const checkoutState = {
    cartData: getFallbackCheckoutCartData(),
    addresses: [],
    couponInput: "",
    coupon: {
        code: "",
        discountAmount: 0,
        originalAmount: 0,
        finalAmount: 0
    },
    couponMessage: "",
    couponMessageType: "info",
    couponLoading: false,
    pageLoading: true,
    location: {
        latitude: null,
        longitude: null,
        accuracy: null,
        detectedAddress: "",
        cleanAddress: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        lastAutofill: {
            address: "",
            area: "",
            city: "",
            state: "",
            pincode: ""
        },
        statusMessage: "",
        statusType: "info",
        loading: false,
        loadingAction: ""
    }
};

const GPS_WATCH_DURATION_MS = 12000;
const GPS_EXCELLENT_ACCURACY_METERS = 30;
const GPS_LOW_ACCURACY_METERS = 50;
let checkoutLocationMap = null;
let checkoutLocationMarker = null;

function rememberCheckoutDebugLog(label, details = {}) {
    const entry = {
        label,
        details,
        timestamp: new Date().toISOString()
    };

    try {
        const existing = JSON.parse(sessionStorage.getItem("leo_checkout_debug_log") || "[]");
        existing.push(entry);
        sessionStorage.setItem("leo_checkout_debug_log", JSON.stringify(existing.slice(-30)));
    } catch (error) {
        // Debug logging should never block checkout.
    }

    console.log(label, details);
}

function getFallbackAddresses() {
    return [
        {
            id: 1,
            fullName: "Leo Customer",
            phone: "+91 98765 43210",
            email: "customer@example.com",
            address: "12 Happy Tails Street",
            area: "Indiranagar",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560001",
            landmark: "Near Pet Park",
            deliveryInstructions: "Call before delivery.",
            latitude: null,
            longitude: null,
            defaultAddress: true
        }
    ];
}

function getFallbackCheckoutCartData() {
    return {
        items: [],
        subtotal: 0,
        discount: 0,
        deliveryCharge: 0,
        finalTotal: 0
    };
}

function getPaymentMethodValue() {
    return document.getElementById("payment-method")?.value || "COD";
}

function normalizePhoneForAddress(value) {
    return String(value || "").replace(/\D/g, "");
}

function getValidCheckoutLatitude() {
    const latitude = Number(checkoutState.location.latitude);
    const longitude = Number(checkoutState.location.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
        return null;
    }

    return latitude;
}

function getValidCheckoutLongitude() {
    const latitude = Number(checkoutState.location.latitude);
    const longitude = Number(checkoutState.location.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
        return null;
    }

    return longitude;
}

function getSelectedAddressId() {
    const selectedAddress = document.querySelector('input[name="selected-address"]:checked');
    return selectedAddress ? Number(selectedAddress.value) : null;
}

function setPlaceOrderButtonState(isLoading, label = "Place Order") {
    const button = document.getElementById("place-order-button");
    if (!button) {
        return;
    }

    button.disabled = isLoading;
    button.textContent = label;
}

function setCouponUiState(patch = {}) {
    Object.assign(checkoutState, patch);
}

function ensureRazorpayScript() {
    if (window.Razorpay) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-razorpay-checkout="true"]');
        if (existingScript) {
            existingScript.addEventListener("load", resolve, { once: true });
            existingScript.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout.")), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.dataset.razorpayCheckout = "true";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
        document.head.appendChild(script);
    });
}

function getCheckoutBaseAmount() {
    const subtotal = Number(checkoutState.cartData?.subtotal || 0);
    const discount = Number(checkoutState.cartData?.discount || 0);
    return Math.max(0, subtotal - discount);
}

function getCheckoutTotals() {
    const baseAmount = getCheckoutBaseAmount();
    const couponDiscount = Number(checkoutState.coupon.discountAmount || 0);
    const amountAfterCoupon = Math.max(0, baseAmount - couponDiscount);
    const deliveryCharge = amountAfterCoupon > 0 && amountAfterCoupon < 999 ? 50 : 0;
    const finalTotal = amountAfterCoupon + deliveryCharge;

    return {
        subtotal: Number(checkoutState.cartData?.subtotal || 0),
        itemDiscount: Number(checkoutState.cartData?.discount || 0),
        baseAmount,
        couponDiscount,
        amountAfterCoupon,
        deliveryCharge,
        finalTotal
    };
}

function getCouponInputValue() {
    return String(document.getElementById("checkout-coupon-code")?.value || checkoutState.couponInput || "").trim();
}

function renderCouponFeedback() {
    if (!checkoutState.couponMessage) {
        return "";
    }

    return `<p class="checkout-coupon-feedback ${escapeHtml(checkoutState.couponMessageType)}">${escapeHtml(checkoutState.couponMessage)}</p>`;
}

function clearCouponState(message = "", type = "info") {
    checkoutState.coupon = {
        code: "",
        discountAmount: 0,
        originalAmount: 0,
        finalAmount: 0
    };
    checkoutState.couponInput = "";
    checkoutState.couponMessage = message;
    checkoutState.couponMessageType = type;
}

async function applyCouponCode(rawCode, options = {}) {
    const code = String(rawCode || "").trim();
    if (!code) {
        clearCouponState("Please enter a coupon code.", "error");
        renderCheckoutPage();
        return null;
    }

    const normalizedCode = code.toUpperCase();
    const baseAmount = getCheckoutBaseAmount();
    if (!baseAmount || baseAmount <= 0) {
        clearCouponState("Cart total must be greater than zero before applying a coupon.", "error");
        renderCheckoutPage();
        return null;
    }

    if (checkoutState.coupon.code === normalizedCode && Number(checkoutState.coupon.discountAmount || 0) > 0) {
        checkoutState.couponInput = normalizedCode;
        checkoutState.couponMessage = `Coupon ${normalizedCode} is already applied.`;
        checkoutState.couponMessageType = "success";
        renderCheckoutPage();
        return checkoutState.coupon;
    }

    checkoutState.couponLoading = true;
    checkoutState.couponInput = normalizedCode;
    checkoutState.couponMessage = options.silent ? "" : "Applying coupon...";
    checkoutState.couponMessageType = "info";
    renderCheckoutPage();

    try {
        const response = await apiPost("/coupons/apply", {
            code: normalizedCode,
            orderAmount: baseAmount
        });
        const couponData = response?.data || response || {};

        checkoutState.coupon = {
            code: couponData.code || normalizedCode,
            discountAmount: Number(couponData.discountAmount || 0),
            originalAmount: Number(couponData.originalAmount || baseAmount),
            finalAmount: Number(couponData.finalAmount || Math.max(0, baseAmount - Number(couponData.discountAmount || 0)))
        };
        checkoutState.couponInput = checkoutState.coupon.code;
        checkoutState.couponMessage = `Coupon ${checkoutState.coupon.code} applied successfully.`;
        checkoutState.couponMessageType = "success";
        return checkoutState.coupon;
    } catch (error) {
        checkoutState.coupon = {
            code: "",
            discountAmount: 0,
            originalAmount: 0,
            finalAmount: 0
        };
        checkoutState.couponMessage = error.message || "Unable to apply coupon.";
        checkoutState.couponMessageType = "error";
        throw error;
    } finally {
        checkoutState.couponLoading = false;
        renderCheckoutPage();
    }
}

function removeCoupon() {
    clearCouponState("Coupon removed.", "info");
    renderCheckoutPage();
}

function setCheckoutLocationState(patch = {}) {
    checkoutState.location = {
        ...checkoutState.location,
        ...patch
    };
}

function resetCheckoutLocationState(message = "", type = "info") {
    resetCheckoutLocationMap();
    setCheckoutLocationState({
        latitude: null,
        longitude: null,
        accuracy: null,
        detectedAddress: "",
        cleanAddress: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        lastAutofill: {
            address: "",
            area: "",
            city: "",
            state: "",
            pincode: ""
        },
        statusMessage: message,
        statusType: type,
        loading: false,
        loadingAction: ""
    });
}

function renderLocationStatus() {
    const location = checkoutState.location;
    if (!location.statusMessage) {
        return "";
    }

    return `<p class="checkout-location-status ${escapeHtml(location.statusType)}">${escapeHtml(location.statusMessage)}</p>`;
}

function getDetectedLocationLabel(location = checkoutState.location) {
    const placeParts = [location.area, location.city, location.state].filter(Boolean);
    const placeLabel = placeParts.join(", ");

    if (placeLabel && location.pincode) {
        return `${placeLabel} - ${location.pincode}`;
    }

    return placeLabel || location.cleanAddress || location.detectedAddress || "";
}

function formatGpsAccuracy(accuracy) {
    if (!Number.isFinite(accuracy)) {
        return "";
    }

    return Math.round(accuracy).toLocaleString("en-IN");
}

function renderDetectedLocationSummary() {
    const location = checkoutState.location;
    const detectedLabel = getDetectedLocationLabel(location);
    const accuracyLabel = formatGpsAccuracy(location.accuracy);

    if (!location.latitude || !location.longitude) {
        return "";
    }

    if (detectedLabel) {
        return `
            <span>Location detected successfully</span>
            <strong>Detected Delivery Area:</strong>
            <span>${escapeHtml(location.cleanAddress || location.detectedAddress || detectedLabel)}</span>
            ${accuracyLabel ? `<span>GPS accuracy: within ${escapeHtml(accuracyLabel)} meters</span>` : ""}
            <span>Selected pin coordinates are saved for delivery accuracy</span>
            <span>Please enter house / flat / building details manually.</span>
        `;
    }

    return `
        <span>Location captured</span>
        ${accuracyLabel ? `<span>GPS accuracy: within ${escapeHtml(accuracyLabel)} meters</span>` : ""}
        <span>Move the pin to your exact delivery location.</span>
    `;
}

function updateCheckoutLocationUi() {
    const statusRoot = document.getElementById("checkout-location-status-root");
    const coordsRoot = document.getElementById("checkout-location-coordinates");
    const button = document.getElementById("detect-location-button");
    const useLocationButton = document.getElementById("use-location-button");

    if (statusRoot) {
        statusRoot.innerHTML = renderLocationStatus();
    }

    if (coordsRoot) {
        coordsRoot.innerHTML = renderDetectedLocationSummary();
    }

    if (button) {
        const isDetecting = checkoutState.location.loading && checkoutState.location.loadingAction === "detect";
        button.disabled = isDetecting;
        button.textContent = isDetecting ? "Detecting..." : "Detect My Location";
    }

    if (useLocationButton) {
        const isSelectingPin = checkoutState.location.loading && checkoutState.location.loadingAction === "pin-select";
        useLocationButton.disabled = isSelectingPin;
        useLocationButton.textContent = isSelectingPin ? "Updating..." : "Use This Pin Location";
    }
}

function setInputValueIfAutoEditable(inputId, value, autofillKey) {
    const input = document.getElementById(inputId);
    if (!input || !value) {
        return;
    }

    const currentValue = input.value.trim();
    const previousAutofill = checkoutState.location.lastAutofill?.[autofillKey] || "";
    if (currentValue && currentValue !== previousAutofill) {
        return;
    }

    input.value = value;
}

function autofillAddressFromLocation(data = {}) {
    const nextAutofill = {
        address: data.cleanAddress || data.displayAddress || "",
        area: data.area || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || ""
    };

    setInputValueIfAutoEditable("address-address", nextAutofill.address, "address");
    setInputValueIfAutoEditable("address-area", nextAutofill.area, "area");
    setInputValueIfAutoEditable("address-city", nextAutofill.city, "city");
    setInputValueIfAutoEditable("address-state", nextAutofill.state, "state");
    setInputValueIfAutoEditable("address-pincode", nextAutofill.pincode, "pincode");
    setCheckoutLocationState({ lastAutofill: nextAutofill });
}

async function reverseGeocodeCheckoutLocation(latitude, longitude, source = "gps") {
    const endpoint = `/location/reverse?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`;
    const url = `${API_BASE_URL}${endpoint}`;
    console.log("REVERSE GEOCODE REQUEST", { lat: latitude, lng: longitude, url });
    const isPinSelected = source === "pin-selected";
    rememberCheckoutDebugLog(
        isPinSelected ? "LOCATION REVERSE_REQUEST_AFTER_PIN_SELECTED" : "LOCATION REVERSE REQUEST",
        { lat: latitude, lng: longitude, url }
    );

    try {
        const response = await apiGet(endpoint);
        console.log("REVERSE GEOCODE RESPONSE", response);
        rememberCheckoutDebugLog(
            isPinSelected ? "LOCATION REVERSE_RESPONSE_AFTER_PIN_SELECTED" : "LOCATION REVERSE RESPONSE",
            response
        );
        const data = response?.data || {};
        const hasDetectedAddress = Boolean(data.area || data.city || data.state || data.pincode || data.displayAddress);

        if (!hasDetectedAddress) {
            throw new Error(response?.message || "Unable to detect address from location.");
        }

        autofillAddressFromLocation(data);
        rememberCheckoutDebugLog(isPinSelected ? "LOCATION ADDRESS_AUTOFILLED_AFTER_PIN_SELECTED" : "LOCATION ADDRESS AUTOFILLED", {
            cleanAddress: data.cleanAddress || "",
            displayAddress: data.displayAddress || "",
            area: data.area || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            accuracy: checkoutState.location.accuracy
        });
        const isLowAccuracy = Number.isFinite(checkoutState.location.accuracy)
            && checkoutState.location.accuracy > GPS_LOW_ACCURACY_METERS;
        setCheckoutLocationState({
            detectedAddress: data.displayAddress || "",
            cleanAddress: data.cleanAddress || "",
            area: data.area || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            statusMessage: isPinSelected
                ? "Delivery pin selected. Please verify your address details before placing order."
                : (isLowAccuracy
                    ? "Location accuracy is low. Please adjust the pin on the map."
                    : "Detected delivery area updated. Please verify your address details."),
            statusType: isPinSelected ? "success" : (isLowAccuracy ? "info" : "success"),
            loading: false,
            loadingAction: ""
        });
    } catch (error) {
        rememberCheckoutDebugLog("LOCATION REVERSE ERROR", {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

function moveCheckoutDeliveryPin(latitude, longitude, source) {
    const nextLatitude = Number(latitude.toFixed(7));
    const nextLongitude = Number(longitude.toFixed(7));

    if (checkoutLocationMarker) {
        checkoutLocationMarker.setLatLng([nextLatitude, nextLongitude]);
    }

    setCheckoutLocationState({
        latitude: nextLatitude,
        longitude: nextLongitude,
        statusMessage: "Pin moved. Click Use This Pin Location to update the detected delivery area.",
        statusType: "info",
        loading: false,
        loadingAction: ""
    });
    updateCheckoutLocationUi();

    rememberCheckoutDebugLog(source === "map-tap" ? "LOCATION MAP TAPPED" : "LOCATION PIN DRAGGED", {
        latitude: nextLatitude,
        longitude: nextLongitude
    });
    logLocationMapLinks(source === "map-tap" ? "LOCATION MAP TAPPED MAP LINKS" : "LOCATION PIN DRAGGED MAP LINKS", {
        latitude: nextLatitude,
        longitude: nextLongitude,
        accuracy: checkoutState.location.accuracy
    });
}

function getLeaflet() {
    return window.L || null;
}

function setCheckoutMapVisibility(visible) {
    const shell = document.getElementById("checkout-location-map-shell");
    if (!shell) {
        return;
    }

    shell.classList.toggle("is-visible", Boolean(visible));
}

function updateCheckoutMapPosition(latitude, longitude) {
    const leaflet = getLeaflet();
    const mapRoot = document.getElementById("checkout-location-map");

    if (!leaflet || !mapRoot || !latitude || !longitude) {
        return;
    }

    const latLng = [latitude, longitude];
    setCheckoutMapVisibility(true);

    if (!checkoutLocationMap) {
        checkoutLocationMap = leaflet.map(mapRoot, {
            scrollWheelZoom: false
        }).setView(latLng, 18);

        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19
        }).addTo(checkoutLocationMap);

        checkoutLocationMarker = leaflet.marker(latLng, {
            draggable: true
        }).addTo(checkoutLocationMap);

        checkoutLocationMarker.on("dragend", () => {
            const markerPosition = checkoutLocationMarker.getLatLng();
            moveCheckoutDeliveryPin(markerPosition.lat, markerPosition.lng, "pin-drag");
        });

        checkoutLocationMap.on("click", (event) => {
            moveCheckoutDeliveryPin(event.latlng.lat, event.latlng.lng, "map-tap");
        });

        rememberCheckoutDebugLog("LOCATION MAP INITIALIZED", {
            latitude,
            longitude
        });
    } else {
        checkoutLocationMap.setView(latLng, 18);
        checkoutLocationMarker.setLatLng(latLng);
    }

    window.setTimeout(() => checkoutLocationMap?.invalidateSize(), 80);
}

function resetCheckoutLocationMap() {
    if (checkoutLocationMarker) {
        checkoutLocationMarker.off();
        checkoutLocationMarker = null;
    }

    if (checkoutLocationMap) {
        checkoutLocationMap.remove();
        checkoutLocationMap = null;
    }

    setCheckoutMapVisibility(false);
}

function normalizeGpsPosition(position) {
    const latitude = Number(position.coords.latitude.toFixed(7));
    const longitude = Number(position.coords.longitude.toFixed(7));
    const accuracy = Number(position.coords.accuracy);

    return { latitude, longitude, accuracy };
}

function logLocationMapLinks(label, reading) {
    const { latitude, longitude } = reading;
    const links = {
        googleMaps: `https://www.google.com/maps?q=${latitude},${longitude}`,
        openStreetMap: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`
    };

    console.log(label, {
        latitude,
        longitude,
        accuracy: reading.accuracy,
        ...links
    });
    rememberCheckoutDebugLog(label, {
        latitude,
        longitude,
        accuracy: reading.accuracy,
        ...links
    });
}

function logGpsMapLinks(reading) {
    logLocationMapLinks("GPS DEBUG MAP LINKS", reading);
}

function collectBestGpsReading() {
    return new Promise((resolve, reject) => {
        const readings = [];
        let bestReading = null;
        let watchId = null;
        let settled = false;

        const stopWatching = (reason) => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }

            rememberCheckoutDebugLog("LOCATION GPS WATCH STOPPED", {
                reason,
                readingCount: readings.length,
                bestReading
            });
        };

        const finish = (reason) => {
            if (settled) {
                return;
            }

            settled = true;
            stopWatching(reason);

            if (!bestReading) {
                reject(new Error("Unable to detect location. Please enter address manually."));
                return;
            }

            rememberCheckoutDebugLog("LOCATION GPS BEST READING", {
                ...bestReading,
                readingCount: readings.length
            });
            logGpsMapLinks(bestReading);
            resolve({ ...bestReading, readingCount: readings.length });
        };

        const timeoutId = window.setTimeout(() => finish("timeout"), GPS_WATCH_DURATION_MS);
        rememberCheckoutDebugLog("LOCATION GPS WATCH STARTED", {
            durationMs: GPS_WATCH_DURATION_MS,
            excellentAccuracyMeters: GPS_EXCELLENT_ACCURACY_METERS
        });

        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const reading = normalizeGpsPosition(position);
                readings.push(reading);

                if (!bestReading || reading.accuracy < bestReading.accuracy) {
                    bestReading = reading;
                }

                rememberCheckoutDebugLog("LOCATION GPS READING", {
                    ...reading,
                    readingCount: readings.length,
                    bestAccuracy: bestReading?.accuracy
                });

                setCheckoutLocationState({
                    latitude: bestReading.latitude,
                    longitude: bestReading.longitude,
                    accuracy: bestReading.accuracy,
                    statusMessage: `Detecting your accurate location... Best accuracy: within ${formatGpsAccuracy(bestReading.accuracy)} meters`,
                    statusType: "info"
                });
                updateCheckoutLocationUi();

                if (reading.accuracy <= GPS_EXCELLENT_ACCURACY_METERS) {
                    window.clearTimeout(timeoutId);
                    finish("excellent-accuracy");
                }
            },
            (error) => {
                if (settled) {
                    return;
                }

                window.clearTimeout(timeoutId);
                settled = true;
                stopWatching("error");
                rememberCheckoutDebugLog("LOCATION GPS WATCH ERROR", {
                    code: error.code,
                    message: error.message
                });
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
}

async function detectCheckoutLocation() {
    if (!navigator.geolocation) {
        resetCheckoutLocationState("Unable to detect location. Please enter address manually.", "error");
        updateCheckoutLocationUi();
        return;
    }

    setCheckoutLocationState({
        loading: true,
        loadingAction: "detect",
        statusMessage: "Detecting your accurate location...",
        statusType: "info"
    });
    updateCheckoutLocationUi();

    try {
        const bestReading = await collectBestGpsReading();
        const lowAccuracy = Number.isFinite(bestReading.accuracy) && bestReading.accuracy > GPS_LOW_ACCURACY_METERS;

        setCheckoutLocationState({
            latitude: bestReading.latitude,
            longitude: bestReading.longitude,
            accuracy: bestReading.accuracy,
            statusMessage: lowAccuracy
                ? "Location accuracy is low. Please adjust the pin on the map."
                : "Location captured. Move the pin to your exact delivery location if needed.",
            statusType: "info",
            loading: false,
            loadingAction: ""
        });
        updateCheckoutLocationUi();
        updateCheckoutMapPosition(bestReading.latitude, bestReading.longitude);

        try {
            await reverseGeocodeCheckoutLocation(bestReading.latitude, bestReading.longitude, "gps-detect");
        } catch (error) {
            setCheckoutLocationState({
                statusMessage: lowAccuracy
                    ? "Location accuracy is low. Please adjust the pin on the map."
                    : "Location captured. Please complete your address manually.",
                statusType: "info",
                loading: false,
                loadingAction: ""
            });
        }
    } catch (error) {
        resetCheckoutLocationState("Unable to detect location. Please enter address manually.", "error");
    }

    updateCheckoutLocationUi();
}

async function handleCodOrder(addressId, couponCode = "") {
    const response = await apiPost("/orders/place", {
        addressId,
        paymentMethod: "COD",
        couponCode: couponCode || null
    });

    showFlashMessage("Order placed successfully.", "success");
    await updateNavbarCounts();
    const orderId = response?.data?.id;
    window.location.href = orderId ? `my-orders.html?highlight=${orderId}` : "my-orders.html";
}

async function handleRazorpayOrder(addressId, couponCode = "") {
    await ensureRazorpayScript();

    const orderResponse = await apiPost("/payments/razorpay/order", {
        addressId,
        couponCode: couponCode || null
    });

    const razorpayOrder = orderResponse?.data;
    if (!razorpayOrder?.razorpayOrderId || !razorpayOrder?.key) {
        throw new Error("Unable to start Razorpay checkout.");
    }

    const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "Leo's Pet Barkery",
        description: "Secure pet care checkout",
        order_id: razorpayOrder.razorpayOrderId,
        prefill: razorpayOrder.prefill || {},
        notes: razorpayOrder.notes || {},
        theme: {
            color: "#f00000"
        },
        handler: async function (response) {
            try {
                setPlaceOrderButtonState(true, "Verifying Payment...");
                const verifyResponse = await apiPost("/payments/razorpay/verify", {
                    addressId,
                    razorpayOrderId: razorpayOrder.razorpayOrderId,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    couponCode: couponCode || null
                });

                showFlashMessage("Payment successful. Order placed.", "success");
                await updateNavbarCounts();
                const orderId = verifyResponse?.data?.id;
                window.location.href = orderId ? `my-orders.html?highlight=${orderId}` : "my-orders.html";
            } catch (error) {
                showFlashMessage(error.message || "Payment verification failed.", "error");
                setPlaceOrderButtonState(false, "Place Order");
            }
        },
        modal: {
            ondismiss: function () {
                setPlaceOrderButtonState(false, "Place Order");
            }
        }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", function (response) {
        const message = response?.error?.description || "Payment failed. Please try again.";
        showFlashMessage(message, "error");
        setPlaceOrderButtonState(false, "Place Order");
    });
    razorpay.open();
}

function renderCheckoutPage() {
    if (document.body.dataset.page !== "checkout") {
        return;
    }

    const cartItems = Array.isArray(checkoutState.cartData?.items) ? checkoutState.cartData.items : [];
    const addresses = Array.isArray(checkoutState.addresses) ? checkoutState.addresses : [];
    const defaultAddress = addresses.find((address) => address.defaultAddress) || addresses[0];
    const totals = getCheckoutTotals();

    document.getElementById("checkout-form-root").innerHTML = `
        <span class="eyebrow">Delivery details</span>
        <h2>Choose address and payment</h2>
        <div class="summary-stack">
            ${addresses.length ? addresses.map((address) => `
                <article class="address-card">
                    <label style="display:flex; gap:1rem; width:100%; align-items:flex-start;">
                        <input type="radio" name="selected-address" value="${address.id}" ${defaultAddress?.id === address.id ? "checked" : ""}>
                        <div>
                            <strong>${escapeHtml(address.fullName)}</strong>
                            <p class="muted">${[address.address, address.area, address.city, address.state].filter(Boolean).map(escapeHtml).join(", ")} - ${escapeHtml(address.pincode)}</p>
                            <p class="muted">${escapeHtml(address.phone)} · ${escapeHtml(address.email)}</p>
                            ${address.deliveryInstructions ? `<p class="muted">Instructions: ${escapeHtml(address.deliveryInstructions)}</p>` : ""}
                        </div>
                    </label>
                    ${address.defaultAddress ? '<span class="badge hot">Default</span>' : ""}
                </article>
            `).join("") : `<div class="empty-state">No saved addresses yet. Add one below to continue.</div>`}
        </div>
        <div class="summary-stack" style="margin-top:1.4rem;">
            <h3>Add new address</h3>
            <form class="form-grid" id="address-form">
                <div class="checkout-location-card">
                    <div>
                        <strong>GPS delivery pin</strong>
                        <p class="muted">Move the pin to your exact delivery location.</p>
                        <p class="muted">Please enter house / flat / building details manually.</p>
                        <p class="muted">Auto detected area may not be exact. You can edit the address below.</p>
                        <p class="muted checkout-location-summary" id="checkout-location-coordinates">${renderDetectedLocationSummary()}</p>
                    </div>
                    <button class="ghost-button checkout-location-button" type="button" id="detect-location-button">
                        ${checkoutState.location.loading ? "Detecting..." : "Detect My Location"}
                    </button>
                </div>
                <div id="checkout-location-status-root">${renderLocationStatus()}</div>
                <div class="checkout-location-map-shell" id="checkout-location-map-shell">
                    <div class="checkout-location-map-head">
                        <div>
                            <strong>Adjust delivery pin</strong>
                            <p class="muted">Drag the pin or tap the map to move it, then click Use This Pin Location.</p>
                        </div>
                        <button class="cta-button checkout-location-use-button" type="button" id="use-location-button">
                            Use This Pin Location
                        </button>
                    </div>
                    <div class="checkout-location-map" id="checkout-location-map"></div>
                </div>
                <div class="form-grid two-column">
                    <div class="field">
                        <label for="address-fullName">Full name</label>
                        <input id="address-fullName" type="text" placeholder="Full name">
                    </div>
                    <div class="field">
                        <label for="address-phone">Phone</label>
                        <input id="address-phone" type="tel" placeholder="Phone">
                    </div>
                </div>
                <div class="form-grid two-column">
                    <div class="field">
                        <label for="address-email">Email</label>
                        <input id="address-email" type="email" placeholder="Email">
                    </div>
                    <div class="field">
                        <label for="address-pincode">Pincode</label>
                        <input id="address-pincode" type="text" placeholder="Pincode">
                    </div>
                </div>
                <div class="field">
                    <label for="address-address">House / Flat / Door No, Building, Street</label>
                    <textarea id="address-address" placeholder="House / flat / door no, building, street"></textarea>
                </div>
                <div class="field">
                    <label for="address-area">Area / Locality</label>
                    <input id="address-area" type="text" placeholder="Area or locality">
                </div>
                <div class="form-grid two-column">
                    <div class="field">
                        <label for="address-city">City</label>
                        <input id="address-city" type="text" placeholder="City">
                    </div>
                    <div class="field">
                        <label for="address-state">State</label>
                        <input id="address-state" type="text" placeholder="State">
                    </div>
                </div>
                <div class="field">
                    <label for="address-landmark">Landmark</label>
                    <input id="address-landmark" type="text" placeholder="Landmark">
                </div>
                <div class="field">
                    <label for="address-delivery-instructions">Delivery Instructions</label>
                    <textarea id="address-delivery-instructions" placeholder="Gate code, preferred time, call before delivery"></textarea>
                </div>
                <button class="ghost-button" type="submit">Save Address</button>
            </form>
            <div class="field">
                <label for="payment-method">Payment method</label>
                <select id="payment-method">
                    <option value="COD">Cash on Delivery</option>
                    <option value="RAZORPAY">Online Payment (Razorpay)</option>
                </select>
            </div>
            <button class="cta-button" type="button" id="place-order-button">Place Order</button>
        </div>
    `;

    document.getElementById("checkout-summary-root").innerHTML = `
        <span class="eyebrow">Checkout summary</span>
        <h2>You're almost done</h2>
        <div class="checkout-coupon-card">
            <div class="checkout-coupon-head">
                <div>
                    <h3>Coupon</h3>
                    <p class="muted">Apply a code before placing the order.</p>
                </div>
                ${checkoutState.coupon.code ? `<span class="badge hot">${escapeHtml(checkoutState.coupon.code)}</span>` : ""}
            </div>
            <div class="checkout-coupon-row">
                <input
                    type="text"
                    id="checkout-coupon-code"
                    placeholder="Enter coupon code"
                    value="${escapeHtml(checkoutState.couponInput || checkoutState.coupon.code || "")}"
                    autocomplete="off"
                >
                <button type="button" class="checkout-coupon-button" id="apply-coupon-button">
                    ${checkoutState.couponLoading ? "Applying..." : (checkoutState.coupon.code ? "Update" : "Apply")}
                </button>
            </div>
            <div class="checkout-coupon-actions">
                <button type="button" class="checkout-coupon-link" id="remove-coupon-button" ${checkoutState.coupon.code ? "" : "disabled"}>Remove coupon</button>
            </div>
            ${renderCouponFeedback()}
        </div>
        <div class="summary-stack">
            ${cartItems.length ? cartItems.map((item) => `
                <div class="table-item">
                    <span>${escapeHtml(item.productName)} x${escapeHtml(item.quantity)}</span>
                    <strong>${formatCurrency(item.lineTotal)}</strong>
                </div>
            `).join("") : `<div class="empty-state">Your cart is empty. Add products to continue checkout.</div>`}
            <div class="table-item"><span>Subtotal</span><strong>${formatCurrency(totals.subtotal)}</strong></div>
            <div class="table-item"><span>Item discount</span><strong>-${formatCurrency(totals.itemDiscount)}</strong></div>
            <div class="table-item"><span>Coupon discount</span><strong>-${formatCurrency(totals.couponDiscount)}</strong></div>
            <div class="table-item"><span>Delivery</span><strong>${formatCurrency(totals.deliveryCharge)}</strong></div>
            <div class="table-item checkout-total-row"><span>Total</span><strong>${formatCurrency(totals.finalTotal)}</strong></div>
        </div>
    `;
}

async function loadCheckoutData() {
    if (document.body.dataset.page !== "checkout") {
        return;
    }

    checkoutState.pageLoading = true;

    try {
        const cartResponse = await fetchWithFallback(() => apiGet("/cart"), { data: getFallbackCheckoutCartData() });
        const cartData = cartResponse?.data || cartResponse || getFallbackCheckoutCartData();

        const addressesResponse = await fetchWithFallback(() => apiGet("/addresses"), { data: getFallbackAddresses() });
        const addresses = Array.isArray(addressesResponse) ? addressesResponse : addressesResponse.data || getFallbackAddresses();

        checkoutState.cartData = cartData;
        checkoutState.addresses = addresses;

        if (!checkoutState.couponInput && checkoutState.coupon.code) {
            checkoutState.couponInput = checkoutState.coupon.code;
        }
    } finally {
        checkoutState.pageLoading = false;
        renderCheckoutPage();
    }
}

function bindCheckoutActions() {
    document.addEventListener("submit", async (event) => {
        if (event.target.id !== "address-form") {
            return;
        }

        event.preventDefault();

        try {
            const addressPayload = {
                fullName: document.getElementById("address-fullName").value.trim(),
                phone: normalizePhoneForAddress(document.getElementById("address-phone").value),
                email: document.getElementById("address-email").value.trim(),
                address: document.getElementById("address-address").value.trim(),
                area: document.getElementById("address-area").value.trim(),
                city: document.getElementById("address-city").value.trim(),
                state: document.getElementById("address-state").value.trim(),
                pincode: document.getElementById("address-pincode").value.trim(),
                landmark: document.getElementById("address-landmark").value.trim(),
                deliveryInstructions: document.getElementById("address-delivery-instructions").value.trim(),
                latitude: getValidCheckoutLatitude(),
                longitude: getValidCheckoutLongitude(),
                defaultAddress: false
            };
            rememberCheckoutDebugLog("CHECKOUT ADDRESS_SAVE_PAYLOAD", {
                ...addressPayload,
                email: addressPayload.email ? "[provided]" : "",
                phone: addressPayload.phone ? "[normalized]" : ""
            });
            rememberCheckoutDebugLog("LOCATION FINAL DELIVERY_LOCATION", {
                latitude: addressPayload.latitude,
                longitude: addressPayload.longitude,
                address: addressPayload.address,
                area: addressPayload.area,
                city: addressPayload.city,
                state: addressPayload.state,
                pincode: addressPayload.pincode
            });
            await apiPost("/addresses", addressPayload);
            showFlashMessage("Address saved successfully.", "success");
            resetCheckoutLocationState();
            await loadCheckoutData();
        } catch (error) {
            rememberCheckoutDebugLog("CHECKOUT ADDRESS_SAVE_ERROR", {
                message: error.message,
                stack: error.stack
            });
            showFlashMessage(error.message || "Unable to save address.", "error");
        }
    });

    document.addEventListener("click", async (event) => {
        const couponApplyButton = event.target.closest("#apply-coupon-button");
        if (couponApplyButton) {
            event.preventDefault();
            try {
                await applyCouponCode(getCouponInputValue());
            } catch (error) {
                showFlashMessage(error.message || "Unable to apply coupon.", "error");
            }
            return;
        }

        const couponRemoveButton = event.target.closest("#remove-coupon-button");
        if (couponRemoveButton) {
            event.preventDefault();
            removeCoupon();
            return;
        }

        const detectLocationButton = event.target.closest("#detect-location-button");
        if (detectLocationButton) {
            event.preventDefault();
            detectCheckoutLocation();
            return;
        }

        const useLocationButton = event.target.closest("#use-location-button");
        if (useLocationButton) {
            event.preventDefault();
            const markerPosition = checkoutLocationMarker?.getLatLng();
            const finalLatitude = markerPosition
                ? Number(markerPosition.lat.toFixed(7))
                : checkoutState.location.latitude;
            const finalLongitude = markerPosition
                ? Number(markerPosition.lng.toFixed(7))
                : checkoutState.location.longitude;

            if (!finalLatitude || !finalLongitude) {
                showFlashMessage("Please detect or adjust your delivery pin first.", "error");
                return;
            }

            setCheckoutLocationState({
                latitude: finalLatitude,
                longitude: finalLongitude,
                statusMessage: "Delivery pin selected. Updating detected delivery area...",
                statusType: "info",
                loading: true,
                loadingAction: "pin-select"
            });
            rememberCheckoutDebugLog("LOCATION PIN SELECTED", {
                latitude: finalLatitude,
                longitude: finalLongitude,
                accuracy: checkoutState.location.accuracy
            });
            rememberCheckoutDebugLog("LOCATION FINAL DELIVERY_LOCATION", {
                latitude: finalLatitude,
                longitude: finalLongitude,
                accuracy: checkoutState.location.accuracy,
                area: checkoutState.location.area,
                city: checkoutState.location.city,
                state: checkoutState.location.state,
                pincode: checkoutState.location.pincode
            });
            logLocationMapLinks("LOCATION FINAL DELIVERY_LOCATION MAP LINKS", {
                latitude: finalLatitude,
                longitude: finalLongitude,
                accuracy: checkoutState.location.accuracy
            });
            updateCheckoutLocationUi();

            try {
                await reverseGeocodeCheckoutLocation(
                    finalLatitude,
                    finalLongitude,
                    "pin-selected"
                );
                showFlashMessage("Delivery pin selected. Please verify address details.", "success");
            } catch (error) {
                rememberCheckoutDebugLog("LOCATION PIN_SELECT_ERROR", {
                    message: error.message,
                    stack: error.stack,
                    latitude: finalLatitude,
                    longitude: finalLongitude
                });
                setCheckoutLocationState({
                    latitude: finalLatitude,
                    longitude: finalLongitude,
                    statusMessage: "Delivery pin selected. Please verify your address manually.",
                    statusType: "success",
                    loading: false,
                    loadingAction: ""
                });
                updateCheckoutLocationUi();
                showFlashMessage("Delivery pin selected. Please verify address details.", "success");
            }
            return;
        }

        const placeOrderButton = event.target.closest("#place-order-button");
        if (!placeOrderButton) {
            return;
        }

        const selectedAddress = document.querySelector('input[name="selected-address"]:checked');
        if (!selectedAddress) {
            showFlashMessage("Please select an address.", "error");
            return;
        }

        const cartItems = Array.isArray(checkoutState.cartData?.items) ? checkoutState.cartData.items : [];
        if (!cartItems.length) {
            showFlashMessage("Your cart is empty.", "error");
            return;
        }

        try {
            const addressId = getSelectedAddressId();
            const paymentMethod = getPaymentMethodValue();
            const couponCode = getCouponInputValue();
            const appliedCouponCode = checkoutState.coupon.code;

            setPlaceOrderButtonState(true, paymentMethod === "RAZORPAY" ? "Opening Razorpay..." : "Placing Order...");

            if (couponCode && couponCode.toUpperCase() !== appliedCouponCode) {
                await applyCouponCode(couponCode, { silent: true });
            }

            const finalCouponCode = checkoutState.coupon.code || null;

            if (paymentMethod === "RAZORPAY") {
                await handleRazorpayOrder(addressId, finalCouponCode);
                return;
            }

            await handleCodOrder(addressId, finalCouponCode);
        } catch (error) {
            showFlashMessage(error.message || "Unable to place order.", "error");
            setPlaceOrderButtonState(false, "Place Order");
        }
    });

    document.addEventListener("input", (event) => {
        if (event.target?.id === "checkout-coupon-code") {
            checkoutState.couponInput = event.target.value;
            if (!event.target.value.trim()) {
                checkoutState.couponMessage = "";
                checkoutState.couponMessageType = "info";
            }
        }
    });

    document.addEventListener("keydown", async (event) => {
        if (event.target?.id !== "checkout-coupon-code" || event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        try {
            await applyCouponCode(getCouponInputValue());
        } catch (error) {
            showFlashMessage(error.message || "Unable to apply coupon.", "error");
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    bindCheckoutActions();
    await loadCheckoutData();
});
