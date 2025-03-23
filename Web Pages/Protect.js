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
      // delay the redirection to give the user a chance to see the protected Pages
      setTimeout(function() {
        alert("You must be logged in to access this page.");
        window.location.href = "/Web Pages/LoginPage.html"; }, 
      50); // 50 milliseconds
      return;
    }
  }
  
  // Use event delegation to capture clicks on dynamically added profile links
  document.body.addEventListener("click", function(event) {
    // Check if the clicked element or one of its parents has the "profile-link" class
    const link = event.target.closest(".profile-link");
    if (!link) return;
    event.preventDefault();

    // Gather attributes from the clicked link
    const targetUsername = link.getAttribute("data-username");
    const targetRole     = link.getAttribute("data-role");
    const userId         = link.getAttribute("data-user_id");

    // Get the proper profile URL using our helper function
    const profileUrl = getProfileLink(userId, targetUsername, targetRole);
    if (profileUrl === "#") {
      alert("You do not have permission to view this profile.");
      return;
    }
    window.location.href = profileUrl;
  });
});

function getProfileLink(userId, username, role) {
  const currentUser = localStorage.getItem("username");
  const currentRole = localStorage.getItem("userType");

  // When a user clicks on their own profile:
  if (username === currentUser) {
    if (currentRole === "principal" && currentUser === "KhairunnisaUjungRayaPrimary") {
      return "/Web Pages/SchoolPrivatePage.html";
    }
    return "/Web Pages/ProfilePrivateView.html";
  }
  
  if (["student", "teacher"].includes(role)) {
    if (!currentRole || !["student", "teacher", "principal", "admin"].includes(currentRole)) {
      return "#"; 
    }
  }
  
  if (role === "principal") {
    if (currentRole === "principal") {
      return "/Web Pages/SchoolPrivatePage.html";
    } else {
      return `/Web Pages/SchoolPage.html?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`;
    }
  }
  
  if (role === "admin") {
    return `/Web Pages/ProfilePublicView.html?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`;
  }
  
  // For any other role, default to public profile view.
  return `/Web Pages/ProfilePublicView.html?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`;
}
