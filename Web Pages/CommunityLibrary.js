document.addEventListener("DOMContentLoaded", function () {
    fetchArticles();
});

function fetchArticles() {
    fetch("http://127.0.0.1:5001/community_articles")
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector(".container");
            data.forEach(article => {
                const card = createCard(article);
                container.prepend(card);
            });
        })
        .catch(error => console.error("Error fetching community articles:", error));
}

function createCard(article) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-id", article.id);
    card.onclick = function () {
        showModal(article);
    };

    const cardHeader = createCardHeader(article);
    const img = createCardImage(article);
    const title = createCardTitle(article);
    const content = createCardContent(article);

    card.append(cardHeader, img, title, content);
    return card;
}

function createCardHeader(article) {
    const cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");

    const profileLink = document.createElement("a");
    profileLink.href = `ProfilePublicView.html?user_id=${encodeURIComponent(article.user_id)}&role=${encodeURIComponent(article.userType)}`;
    profileLink.classList.add("profile-link");

    const profileImg = document.createElement("img");
    profileImg.classList.add("profile-img");
    profileImg.alt = "Profile";
    profileImg.src = article.profile_image && article.profile_image !== "null" 
        ? sanitizeImageUrl(article.profile_image) 
        : "Images/default.png";
    
    profileLink.appendChild(profileImg);

    const profileInfo = document.createElement("div");
    profileInfo.classList.add("profile-info");

    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("username");
    usernameSpan.innerText = article.name || article.username;

    const roleSpan = document.createElement("span");
    roleSpan.classList.add("role");
    roleSpan.innerText = article.userType;

    profileInfo.append(usernameSpan, roleSpan);

    const timestamp = document.createElement("div");
    timestamp.classList.add("timestamp");

    const date = document.createElement("span");
    date.classList.add("date");
    date.innerText = article.date;

    const time = document.createElement("span");
    time.classList.add("time");
    time.innerText = article.time;

    timestamp.append(date, time);

    const cardInfo = document.createElement("div");
    cardInfo.classList.add("card-info");
    cardInfo.append(profileInfo, timestamp);

    cardHeader.append(profileLink, cardInfo);
    return cardHeader;
}

function createCardImage(article) {
    const img = document.createElement("img");
    img.src = article.image ? article.image : "images/default.png";
    img.alt = article.title;
    return img;
}

function createCardTitle(article) {
    const title = document.createElement("h3");
    title.innerText = article.title;
    return title;
}

function createCardContent(article) {
    const content = document.createElement("p");
    content.innerText = article.content.substring(0, 100) + "...";
    return content;
}

function showModal(article) {
    document.getElementById("modal-title").innerText = article.title;
    document.getElementById("modal-content").innerText = article.content;
    document.getElementById("modal-image").src = article.image && article.image.startsWith("data:image") 
        ? article.image 
        : "images/default.png";
    document.getElementById("modal-profile").src = article.profile_image && article.profile_image !== "null" 
        ? sanitizeImageUrl(article.profile_image) 
        : "Images/default.png";

    document.getElementById("modal-profile-link").href = `ProfilePublicView.html?user_id=${encodeURIComponent(article.user_id)}&role=${encodeURIComponent(article.userType)}`;
    document.getElementById("modal-username").innerText = article.name || article.username;
    document.getElementById("modal-role").innerText = article.userType;
    document.getElementById("modal-date").innerText = article.date;
    document.getElementById("modal-time").innerText = article.time;
    
    handleDeleteButton(article);

    document.getElementById("modal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function handleDeleteButton(article) {
    const deleteButton = document.getElementById("delete-post-btn");
    const userType = localStorage.getItem("userType");
    const loggedInUser = localStorage.getItem("username");

    let canDelete = false;

    if (userType === "admin") {
        canDelete = true;
    } else if (userType === "principal") {
        // Allow principals to delete their own posts or posts from teachers/students
        canDelete = (loggedInUser === article.username || article.userType === "teacher" || article.userType === "student");
        if (article.username === "community" || article.userType === "principal") {
            canDelete = true;
        }
    } else if (userType === "teacher") {
        canDelete = (loggedInUser === article.username || article.userType === "student");
    } else if (userType === "student" || userType === "member") {
        canDelete = (loggedInUser === article.username);
    }

    deleteButton.style.display = canDelete ? "inline-block" : "none";

    if (canDelete) {
        deleteButton.onclick = function (event) {
            event.stopPropagation();
            confirmDelete(article.id);
        };
    }
}

function confirmDelete(postId) {
    document.getElementById("delete-modal-overlay").style.display = "block";
    document.getElementById("delete-modal").style.display = "block";

    document.getElementById("confirm-delete-btn").onclick = function () {
        deletePost(postId);
        closeDeleteModal();
    };

    document.getElementById("cancel-delete-btn").onclick = closeDeleteModal;
}

function closeDeleteModal() {
    document.getElementById("delete-modal-overlay").style.display = "none";
    document.getElementById("delete-modal").style.display = "none";
}

function deletePost(postId) {
    const username = localStorage.getItem("username");

    if (!postId || !username) {
        alert("Error: Missing data. Please refresh and try again.");
        return;
    }

    // Call the community-specific deletion endpoint
    fetch("http://127.0.0.1:5001/delete_community_post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, owner: username }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            removePostFromUI(postId);
            closeModal();
        } else {
            alert("Failed to delete post: " + data.error);
        }
    })
    .catch(error => console.error("Network request error:", error));
}

function removePostFromUI(postId) {
    const posts = document.querySelectorAll(".card");
    posts.forEach(post => {
        if (post.getAttribute("data-id") === postId.toString()) {
            post.remove();
        }
    });
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function sanitizeImageUrl(url) {
    if (!url || typeof url !== "string") return "images/default.png";
    return url
        .replace(/(http:\/\/127.0.0.1:5001\/)+/g, "http://127.0.0.1:5001/")
        .replace(/\/Web Pages\/Web Pages\//g, "/Web Pages/");
}
