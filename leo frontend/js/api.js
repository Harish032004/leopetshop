const API_BASE_URL = "http://localhost:8080/api";
const TOKEN_KEY = "leo_token";
const USER_KEY = "leo_user";
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, "");
const API_TIMEOUT_MS = 15000;

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function getStoredUser() {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch (error) {
        localStorage.removeItem(USER_KEY);
        return null;
    }
}

function setStoredUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function removeStoredUser() {
    localStorage.removeItem(USER_KEY);
}

function clearStoredAuth() {
    removeToken();
    removeStoredUser();
}

function getUserRole() {
    return getStoredUser()?.role || null;
}

function resolveMediaUrl(url) {
    if (!url) {
        return "";
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("data:")
    ) {
        return url;
    }

    if (url.startsWith("assets/") || url.startsWith("./assets/") || url.startsWith("../assets/")) {
        return url.replace(/^\.\//, "");
    }

    if (url.startsWith("/")) {
        return `${SERVER_BASE_URL}${url}`;
    }

    if (url.startsWith("uploads/")) {
        return `${SERVER_BASE_URL}/${url}`;
    }

    return `${SERVER_BASE_URL}/uploads/${url}`;
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : null;
}

function extractErrorMessage(payload, fallbackMessage) {
    if (!payload) {
        return fallbackMessage;
    }

    if (typeof payload === "string") {
        return payload;
    }

    if (payload.error) {
        return payload.error;
    }

    if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
        const messages = Object.entries(payload.data)
            .map(([field, message]) => `${field}: ${message}`)
            .join(", ");
        if (messages) {
            return messages;
        }
    }

    if (payload.message) {
        return payload.message;
    }

    if (payload.data && typeof payload.data === "string") {
        return payload.data;
    }

    return fallbackMessage;
}

async function apiRequest(endpoint, method = "GET", body = null) {
    const headers = {};
    const token = getToken();
    const isAdminRequest = String(endpoint || "").startsWith("/admin/");

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (isAdminRequest) {
        console.log("ADMIN REQUEST START", {
            endpoint,
            method,
            tokenExists: Boolean(token)
        });
    }

    if (body !== null) {
        headers["Content-Type"] = "application/json";
    }

    const options = {
        method,
        headers
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
        options.signal = controller.signal;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const payload = await parseResponse(response);

        if (isAdminRequest) {
            console.log("ADMIN REQUEST RESPONSE", {
                endpoint,
                method,
                status: response.status,
                ok: response.ok,
                body: payload
            });
        }

        if (!response.ok) {
            throw new Error(
                extractErrorMessage(payload, `Request failed with status ${response.status}`)
            );
        }

        return payload;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("Request timed out. Using fallback data.");
        }

        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

function apiGet(endpoint) {
    return apiRequest(endpoint, "GET");
}

function apiPost(endpoint, body) {
    return apiRequest(endpoint, "POST", body);
}

function apiPut(endpoint, body) {
    return apiRequest(endpoint, "PUT", body);
}

function apiDelete(endpoint) {
    return apiRequest(endpoint, "DELETE");
}
