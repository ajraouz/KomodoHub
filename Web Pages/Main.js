document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".login");
    const storedUser = localStorage.getItem("username");

    if (storedUser) {
        loginButton.textContent = "Profile";
        loginButton.addEventListener("click", function () {
            window.location.href = "/Web Pages/ProfilePrivateView.html"; // Redirect to login
        });
    } else {
        loginButton.textContent = "Login";
        loginButton.addEventListener("click", function () {
            window.location.href = "/Web Pages/LoginPage.html"; // Redirect to login
        });
    }
});
