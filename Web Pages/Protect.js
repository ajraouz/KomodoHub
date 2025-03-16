document.addEventListener("DOMContentLoaded", function () {
  const restrictedPages = ["Post.html","Games.html"];
  const currentPage = window.location.pathname.split("/").pop();

  const currentUser = localStorage.getItem("username");
  const currentRole = localStorage.getItem("userType");

  if (restrictedPages.includes(currentPage)) {
    if (!currentUser) {
      alert("You must be logged in to access this page.");
      window.location.href = "/Web Pages/LoginPage.html";
      return;
    }
  }

  document.querySelectorAll(".profile-link").forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();

      const targetUsername = link.getAttribute("data-username");
      const targetRole = link.getAttribute("data-role");
      
      // User clicked their own profile
      if (targetUsername === currentUser) {
        window.location.href = "/Web Pages/ProfilePrivateView.html";
        return;
      }

      if (currentRole === "member") {
        if (["student", "teacher", "principal", "admin"].includes(targetRole)) {
          alert("As a member, you cannot view this profile.");
          return;
        }
      }

      window.location.href = `/Web Pages/ProfilePublicView.html?user_id=${encodeURIComponent(link.getAttribute("data-user_id"))}&role=${encodeURIComponent(targetRole)}`;
    });
  });
});
