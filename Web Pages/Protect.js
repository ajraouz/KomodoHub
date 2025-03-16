document.addEventListener("DOMContentLoaded", function () {
  // Pages that require a user to be logged in
  const restrictedPages = ["Post.html", "Games.html"];
  const currentPage = window.location.pathname.split("/").pop();

  // Current user and role from LocalStorage
  const currentUser = localStorage.getItem("username");
  const currentRole = localStorage.getItem("userType");
  // If a restricted page is accessed by a non-logged-in user, redirect
  if (restrictedPages.includes(currentPage)) {
    if (!currentUser) {
      alert("You must be logged in to access this page.");
      window.location.href = "/Web Pages/LoginPage.html";
      return;
    }
  }
  // Profile link logic
  document.querySelectorAll(".profile-link").forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();

      // Gather attributes from the clicked link
      const targetUsername = link.getAttribute("data-username");
      const targetRole     = link.getAttribute("data-role");
      const userId         = link.getAttribute("data-user_id");

      //If the user clicked their own profile => private profile
      if (targetUsername === currentUser) {
        window.location.href = "/Web Pages/ProfilePrivateView.html";
        return;
      }

      // Student or teacher profile must be logged in as student, teacher, principal, or admin
      if (["student", "teacher"].includes(targetRole)) {
        if (
          !currentRole || 
          !["student", "teacher", "principal", "admin"].includes(currentRole)
        ) {
          alert("You do not have permission to view this profile.");
          return;
        }
      }

      // Principal (School) profile , Everyone can see
      if (targetRole === "principal") {
        if (currentRole === "principal") {
          // If I'm also a principal, view private page
          window.location.href = "/Web Pages/SchoolPrivatePage.html";
        } else {
          // Otherwise, go to the public school page
          window.location.href =
            `/Web Pages/SchoolPage.html?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(targetRole)}`;
        }
        return;
      }

      // Admin profile ,Everyone can see goes to public profile view
      if (targetRole === "admin") {
        window.location.href = 
          `/Web Pages/ProfilePublicView.html?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(targetRole)}`;
        return;
      }

      // For any other role not covered above , public profile
      window.location.href =
        `/Web Pages/ProfilePublicView.html?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(targetRole)}`;
    });
  });
});
