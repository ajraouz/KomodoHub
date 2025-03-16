let articlesData = [];

document.addEventListener("DOMContentLoaded", function () {
    fetchArticles();

    document.getElementById("searchButton").addEventListener("click", applyFilters);
});

function fetchArticles() {
    fetch("http://127.0.0.1:5001/community_articles")
        .then(response => response.json())
        .then(data => {
            articlesData = data; // Save the articles globally
            renderArticles(articlesData);
        })
        .catch(error => console.error("Error fetching community articles:", error));
}

function renderArticles(articles) {
    const container = document.getElementById("container");
    container.innerHTML = ""; // Clear current articles
    articles.forEach(article => {
        const card = createCard(article);
        container.prepend(card);
    });
}


function applyFilters() {
    const userTypeFilter = document.getElementById("userTypeFilter").value.toLowerCase();
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const orderFilter = document.getElementById("orderFilter").value; 

    const filteredArticles = articlesData.filter(article => {
        const matchesUserType =
            userTypeFilter === "" || article.userType.toLowerCase() === userTypeFilter;
        

        const matchesSearch =
            searchQuery === "" ||
            article.userType.toLowerCase().includes(searchQuery) ||
            (article.name && article.name.toLowerCase().includes(searchQuery)) ||
            (article.username && article.username.toLowerCase().includes(searchQuery)) ||
            (article.title && article.title.toLowerCase().includes(searchQuery));

        return matchesUserType && matchesSearch;
    });

    let orderedArticles = filteredArticles;
    if (orderFilter === "old") {
        orderedArticles = filteredArticles.slice().reverse();
    }
    
    renderArticles(orderedArticles);
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

    // Create profile link with image
    const profileLink = document.createElement("a");
    profileLink.classList.add("profile-link");
    profileLink.setAttribute("data-user_id", article.user_id);
    profileLink.setAttribute("data-role", article.userType);
    profileLink.setAttribute("data-username", article.username || article.name);
    profileLink.href = getProfileLink(article.user_id, article.username || article.name, article.userType);

    const profileImg = document.createElement("img");
    profileImg.classList.add("profile-img");
    profileImg.alt = "Profile";
    profileImg.src = article.profile_image && article.profile_image !== "null" ? article.profile_image : "Images/default.png";
    profileLink.appendChild(profileImg);

    // Create a container for profile information and timestamp
    const cardInfo = document.createElement("div");
    cardInfo.classList.add("card-info"); 


    const profileInfo = document.createElement("div");
    profileInfo.classList.add("profile-info");

    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("username");
    usernameSpan.innerText = article.name || article.username;

    const roleSpan = document.createElement("span");
    roleSpan.classList.add("role");
    roleSpan.innerText = article.userType;

    profileInfo.append(usernameSpan, roleSpan);

    const timestampContainer = document.createElement("div");
    timestampContainer.classList.add("timestamp");

    const dateSpan = document.createElement("span");
    dateSpan.classList.add("date");
    dateSpan.innerText = article.date;  

    const timeSpan = document.createElement("span");
    timeSpan.classList.add("time");
    timeSpan.innerText = article.time;  

    timestampContainer.append(dateSpan, timeSpan);


    cardInfo.append(profileInfo, timestampContainer);


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
    document.getElementById("modal-image").src = article.image.startsWith("data:image") 
        ? article.image 
        : "images/default.png";
    document.getElementById("modal-profile").src = article.profile_image && article.profile_image !== "null" 
        ? sanitizeImageUrl(article.profile_image) 
        : "Images/default.png";

    const modalProfileLink = document.getElementById("modal-profile-link");
    
    modalProfileLink.setAttribute("data-user_id", article.user_id);
    modalProfileLink.setAttribute("data-role", article.userType);
    modalProfileLink.setAttribute("data-username", article.username || article.name);

    modalProfileLink.href = getProfileLink(article.user_id, article.username || article.name, article.userType);

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
