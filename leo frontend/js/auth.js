(function authModule() {
    function isLoggedIn() {
        return Boolean(getToken());
    }

    function logout() {
        removeToken();
        removeStoredUser();
        window.location.href = "login.html";
    }

    function renderLoginPage() {
        const root = document.getElementById("login-form-root");
        if (!root) {
            return;
        }

        root.innerHTML = `
            <span class="eyebrow">Customer login</span>
            <h1>Sign in</h1>
            <p>Use your Leo's Pet Barkery account to manage orders and checkout details.</p>
            <form class="form-grid" id="login-form">
                <div class="field">
                    <label for="login-email">Email</label>
                    <input id="login-email" type="email" placeholder="name@example.com" value="customer@example.com">
                </div>
                <div class="field">
                    <label for="login-password">Password</label>
                    <input id="login-password" type="password" placeholder="Enter password" value="Password@123">
                </div>
                <div class="auth-helper-row">
                    <button class="auth-text-button" type="button" id="forgot-password-toggle">Forgot password?</button>
                </div>
                <button class="cta-button" type="submit">Login</button>
                <p class="muted">New here? <a href="register.html">Create an account</a></p>
            </form>
            <div class="auth-inline-card" id="forgot-password-card" hidden>
                <strong>Reset your password</strong>
                <p class="muted">Enter your registered email and we'll send you a reset link.</p>
                <div class="auth-inline-status" id="forgot-password-status" hidden></div>
                <form class="form-grid" id="forgot-password-form">
                    <div class="field">
                        <label for="forgot-email">Email</label>
                        <input id="forgot-email" type="email" placeholder="name@example.com">
                    </div>
                    <button class="ghost-button" type="submit">Send reset link</button>
                </form>
            </div>
        `;

        const forgotPasswordCard = root.querySelector("#forgot-password-card");
        const forgotPasswordStatus = root.querySelector("#forgot-password-status");
        root.querySelector("#forgot-password-toggle").addEventListener("click", () => {
            forgotPasswordCard.hidden = !forgotPasswordCard.hidden;
            if (!forgotPasswordCard.hidden) {
                root.querySelector("#forgot-email").value = root.querySelector("#login-email").value.trim();
                forgotPasswordStatus.hidden = true;
                forgotPasswordStatus.textContent = "";
                forgotPasswordStatus.className = "auth-inline-status";
            }
        });

        root.querySelector("#login-form").addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                const payload = {
                    email: root.querySelector("#login-email").value.trim(),
                    password: root.querySelector("#login-password").value.trim()
                };

                const response = await apiPost("/auth/login", payload);
                const token = response?.data?.token;
                if (!token) {
                    throw new Error("Login token was not returned.");
                }

                setToken(token);
                setStoredUser({
                    name: response?.data?.name || "Leo Customer",
                    email: response?.data?.email || payload.email,
                    role: response?.data?.role || "CUSTOMER"
                });
                showFlashMessage("Login successful.", "success");
                window.location.href = syncPostLoginRedirect() || "my-account.html";
            } catch (error) {
                showFlashMessage(error.message || "Unable to login right now.", "error");
            }
        });

        root.querySelector("#forgot-password-form").addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = root.querySelector("#forgot-email").value.trim();
            const submitButton = root.querySelector("#forgot-password-form button[type='submit']");

            forgotPasswordStatus.hidden = false;
            forgotPasswordStatus.className = "auth-inline-status";
            forgotPasswordStatus.textContent = "Sending reset link...";
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
            }
            window.alert("Sending reset password link...");

            try {
                await apiPost("/auth/forgot-password", {
                    email
                });
                const successMessage = "We have sent the link to reset your password. Please check your email inbox and spam folder.";
                showFlashMessage(successMessage, "success");
                forgotPasswordStatus.hidden = false;
                forgotPasswordStatus.className = "auth-inline-status is-success";
                forgotPasswordStatus.textContent = `If ${email || "that email"} is registered, we've sent the reset link to the inbox. Please also check spam.`;
            } catch (error) {
                showFlashMessage(error.message || "Unable to send reset email right now.", "error");
                forgotPasswordStatus.hidden = false;
                forgotPasswordStatus.className = "auth-inline-status is-error";
                forgotPasswordStatus.textContent = error.message || "Unable to send reset email right now.";
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Send reset link";
                }
            }
        });
    }

    function renderRegisterPage() {
        const root = document.getElementById("register-form-root");
        if (!root) {
            return;
        }

        root.innerHTML = `
            <span class="eyebrow">Create your account</span>
            <h1>Register</h1>
            <p>Set up your account so your pet favorites, addresses, and orders stay in one convenient place.</p>
            <form class="form-grid" id="register-form">
                <div class="form-grid two-column">
                    <div class="field">
                        <label for="register-name">Full name</label>
                        <input id="register-name" type="text" placeholder="Your full name">
                    </div>
                    <div class="field">
                        <label for="register-phone">Phone</label>
                        <input id="register-phone" type="tel" placeholder="Your phone number">
                    </div>
                </div>
                <div class="field">
                    <label for="register-email">Email</label>
                    <input id="register-email" type="email" placeholder="name@example.com">
                </div>
                <div class="field">
                    <label for="register-password">Password</label>
                    <input id="register-password" type="password" placeholder="Create password">
                </div>
                <button class="cta-button" type="submit">Create Account</button>
                <p class="muted">Already have an account? <a href="login.html">Sign in</a></p>
            </form>
        `;

        root.querySelector("#register-form").addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                await apiPost("/auth/register", {
                    name: root.querySelector("#register-name").value.trim(),
                    phone: root.querySelector("#register-phone").value.trim(),
                    email: root.querySelector("#register-email").value.trim(),
                    password: root.querySelector("#register-password").value.trim()
                });
                showFlashMessage("Registration successful. Please login.", "success");
                window.setTimeout(() => {
                    window.location.href = "login.html";
                }, 700);
            } catch (error) {
                showFlashMessage(error.message || "Registration failed.", "error");
            }
        });
    }

    function renderResetPasswordPage() {
        const root = document.getElementById("reset-password-form-root");
        if (!root) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token") || "";

        root.innerHTML = `
            <span class="eyebrow">Reset access</span>
            <h1>Create a new password</h1>
            <p>Choose a strong password for your Leo's Pet Barkery account.</p>
            <div class="auth-inline-card" id="reset-password-status">
                <strong>Checking reset link...</strong>
            </div>
            <form class="form-grid" id="reset-password-form" hidden>
                <div class="field">
                    <label for="reset-password">New password</label>
                    <input id="reset-password" type="password" placeholder="Enter new password">
                </div>
                <div class="field">
                    <label for="reset-confirm-password">Confirm password</label>
                    <input id="reset-confirm-password" type="password" placeholder="Confirm new password">
                </div>
                <button class="cta-button" type="submit">Update Password</button>
                <p class="muted">Remembered it? <a href="login.html">Back to login</a></p>
            </form>
        `;

        const statusCard = root.querySelector("#reset-password-status");
        const form = root.querySelector("#reset-password-form");

        if (!token) {
            statusCard.innerHTML = `
                <strong>Invalid reset link</strong>
                <p class="muted">This reset link is missing or broken. Please request a new one from the login page.</p>
            `;
            return;
        }

        apiGet(`/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
            .then(() => {
                statusCard.innerHTML = `
                    <strong>Reset link verified</strong>
                    <p class="muted">You can now create a new password.</p>
                `;
                form.hidden = false;
            })
            .catch((error) => {
                statusCard.innerHTML = `
                    <strong>Reset link unavailable</strong>
                    <p class="muted">${error.message || "This reset link is invalid or expired."}</p>
                    <p class="muted"><a href="login.html">Go back to login</a></p>
                `;
            });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const newPassword = root.querySelector("#reset-password").value.trim();
            const confirmPassword = root.querySelector("#reset-confirm-password").value.trim();

            if (newPassword.length < 8) {
                showFlashMessage("Password must be at least 8 characters long.", "error");
                return;
            }

            if (newPassword !== confirmPassword) {
                showFlashMessage("Passwords do not match.", "error");
                return;
            }

            try {
                await apiPost("/auth/reset-password", {
                    token,
                    newPassword
                });
                showFlashMessage("Password reset successful. Please login with your new password.", "success");
                window.setTimeout(() => {
                    window.location.href = "login.html";
                }, 900);
            } catch (error) {
                showFlashMessage(error.message || "Unable to reset password right now.", "error");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (isLoggedIn() && ["login", "register"].includes(document.body.dataset.page)) {
            window.location.href = "my-account.html";
            return;
        }

        renderLoginPage();
        renderRegisterPage();
        renderResetPasswordPage();
    });

    window.LeoAuth = {
        isLoggedIn,
        logout
    };
})();
