document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".login");
    const storedUser = localStorage.getItem("userType");

    if (storedUser === 'principal') {
        loginButton.textContent = "Profile";
        loginButton.addEventListener("click", function () {
            window.location.href = "/Web Pages/SchoolPrivatePage.html";
        });
    }
    else if (storedUser === 'student' || storedUser === 'teacher' || storedUser === 'member' || storedUser === 'admin'){
        loginButton.textContent = "Profile";
        loginButton.addEventListener("click", function () {
            window.location.href = "/Web Pages/ProfilePrivateView.html";
        });
    }
    else {
        loginButton.textContent = "Login";
        loginButton.addEventListener("click", function () {
            window.location.href = "/Web Pages/LoginPage.html"; // Redirect to login
        });
    }
});
