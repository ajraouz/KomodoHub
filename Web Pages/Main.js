document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".login");
    const storedUser = localStorage.getItem("username");

    if (storedUser) {
        loginButton.textContent = "Logout";
        loginButton.addEventListener("click", function () {
            localStorage.removeItem("username");
            localStorage.removeItem("userType");  // Corrected key
            window.location.href = "LoginPage.html"; // Redirect to login
        });
    } else {
        loginButton.textContent = "Login";
        loginButton.addEventListener("click", function () {
            window.location.href = "LoginPage.html"; // Redirect to login
        });
    }
});
