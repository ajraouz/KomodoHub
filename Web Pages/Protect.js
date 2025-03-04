document.addEventListener("DOMContentLoaded", function () {
    const restrictedPages = ["CommunityLibrary.html", "SchoolLibrary.html", "/Web Pages/Post.html", "/Web Pages/Games.html"];
    const currentPage = window.location.pathname.split("/").pop();
    
    if (restrictedPages.includes(currentPage)) {
        const storedUser = localStorage.getItem("username");

        if (!storedUser) {
            alert("You must be logged in to access this page.");
            window.location.href = "/Web Pages/LoginPage.html"; // Redirect to login
        }
    }
});
