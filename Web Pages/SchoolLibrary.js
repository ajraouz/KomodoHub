document.addEventListener("DOMContentLoaded", function () {
    fetchArticles();
});

function fetchArticles() {
    fetch("/articles")  
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector(".container"); 

            data.forEach(article => {
                const card = createCard(article);
                container.prepend(card);  
            });            
        })
        .catch(error => console.error("Error fetching articles:", error));
}

function createCard(article) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute("data-id", article.id);
    card.onclick = function() {
        showModal(article);
    };

    const userRole = localStorage.getItem('userRole');  // Get current user
    const loggedInUser = localStorage.getItem('username'); 

    // Create delete button if user has permission
    if (
        userRole === 'admin' || 
        (userRole === 'principal' && (article.role === 'teacher' || article.role === 'student')) ||
        (userRole === 'teacher' && article.role === 'student') ||
        (loggedInUser === article.username)
    ) {
    }

    // Card Header
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');

    // Profile picture link to PublicProfileView.html
    const profileLink = document.createElement('a');
    profileLink.href = "ProfilePublicView.html";
    profileLink.classList.add('profile-link');

    const profileImg = document.createElement('img');
    profileImg.classList.add('profile-img');

    if (article.profile_image && article.profile_image.trim()) {
        let cleanUrl = article.profile_image;
    
        // Forcefully remove any duplicate occurrences of the base URL
        cleanUrl = cleanUrl.replace(/(http:\/\/127.0.0.1:5001\/)+/g, "http://127.0.0.1:5001/");
        cleanUrl = cleanUrl.replace(/\/Web Pages\/Web Pages\//g, "/Web Pages/");
    
        profileImg.src = cleanUrl;
    } else {
        profileImg.style.display = "none"; 
    }
    

    profileImg.alt = 'Profile';
    profileLink.appendChild(profileImg);

    const cardInfo = document.createElement('div');
    cardInfo.classList.add('card-info');

    const profileInfo = document.createElement('div');
    profileInfo.classList.add('profile-info');

    const usernameSpan = document.createElement('span');
    usernameSpan.classList.add('username');
    usernameSpan.innerText = article.username;

    const roleSpan = document.createElement('span');
    roleSpan.classList.add('role');
    roleSpan.innerText = article.role;

    profileInfo.appendChild(usernameSpan);
    profileInfo.appendChild(roleSpan);

    const timestamp = document.createElement('div');
    timestamp.classList.add('timestamp');
    const date = document.createElement('span');
    date.classList.add('date');
    date.innerText = article.date;
    const time = document.createElement('span');
    time.classList.add('time');
    time.innerText = article.time;

    timestamp.appendChild(date);
    timestamp.appendChild(time);

    cardInfo.appendChild(profileInfo);
    cardInfo.appendChild(timestamp);
    cardHeader.appendChild(profileLink);
    cardHeader.appendChild(cardInfo);

    // Card Image
    const img = document.createElement('img');
    img.src = article.image ? article.image : 'images/default.png';  
    img.alt = article.title;

    // Card Title
    const title = document.createElement('h3');
    title.innerText = article.title;

    // Card Content
    const content = document.createElement('p');
    content.innerText = article.content.substring(0, 100) + '...';

    // Append elements to the card
    card.appendChild(cardHeader);
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(content);

    return card; 
}

// Function to show the modal when a card is clicked
function showModal(article) {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('overlay');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    const image = document.getElementById('modal-image');
    const profile = document.getElementById('modal-profile');
    const username = document.getElementById('modal-username');
    const role = document.getElementById('modal-role');
    const date = document.getElementById('modal-date');
    const time = document.getElementById('modal-time');
    const profileLink = document.getElementById('modal-profile-link'); 

    title.innerText = article.title;
    content.innerText = article.content;

    // FEnsure base64 image is handled correctly
    image.src = article.image && article.image.startsWith("data:image") ? article.image : 'images/default.png';

    if (article.profile_image && article.profile_image.trim()) {
        let cleanUrl = article.profile_image;
    
        // Forcefully remove any duplicate occurrences of the base URL
        cleanUrl = cleanUrl.replace(/(http:\/\/127.0.0.1:5001\/)+/g, "http://127.0.0.1:5001/");
        cleanUrl = cleanUrl.replace(/\/Web Pages\/Web Pages\//g, "/Web Pages/");
    
        profile.src = cleanUrl;
    } else {
        profile.style.display = "none"; 
    }
    
    

    username.innerText = article.username;
    role.innerText = article.role;
    date.innerText = article.date;
    time.innerText = article.time;

    const deleteButton = document.getElementById("delete-post-btn");
    const userRole = localStorage.getItem('userRole');  
    const loggedInUser = localStorage.getItem('username');

    // Show the delete button only if user has permission
    if (
        userRole === 'admin' || 
        (userRole === 'principal' && (article.role === 'teacher' || article.role === 'student')) ||
        (userRole === 'teacher' && article.role === 'student') ||
        (loggedInUser === article.username)
    ) {
        deleteButton.style.display = "inline-block";
        console.log("Opening modal for article ID:", article.id);  

        if (!article.id) {
            console.error(" Missing post ID for deletion.");
            return;
        }
    
        deleteButton.onclick = function (event) {
            event.stopPropagation();
            confirmDelete(article.id);
        };        
    } else {
        deleteButton.style.display = "none"; // Hide for unauthorized users
    }



    // Set profile link in modal
    profileLink.href = "ProfilePublicView.html";  

    modal.style.display = 'block';
    overlay.style.display = 'block';
}
function confirmDelete(postId) {
    document.getElementById("delete-modal-overlay").style.display = "block";
    document.getElementById("delete-modal").style.display = "block";

    document.getElementById("confirm-delete-btn").onclick = function () {
        deletePost(postId);
        closeDeleteModal();
    };

    document.getElementById("cancel-delete-btn").onclick = function () {
        closeDeleteModal();
    };
}
function closeDeleteModal() {
    document.getElementById("delete-modal-overlay").style.display = "none";
    document.getElementById("delete-modal").style.display = "none";
}

function closeDeleteModal() {
    document.getElementById("delete-modal-overlay").style.display = "none";
    document.getElementById("delete-modal").style.display = "none";
}

function deletePost(postId) {
    const username = localStorage.getItem("username");

    console.log("🔍 Attempting to delete post...");
    console.log("Post ID:", postId);
    console.log("Username:", username);

    if (!postId || !username) {
        console.error("❌ Missing data in delete request.");
        alert("Error: Missing data. Please refresh and try again.");
        return;
    }

    fetch("http://127.0.0.1:5001/delete_post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: postId,   
            owner: username 
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            console.log("Post deleted successfully.");

            removePostFromUI(postId);  // Remove post from UI
            closeModal(); // 
        } else {
            console.error("Delete error:", data.error);
            alert("Failed to delete post: " + data.error);
        }
    })
    .catch(error => console.error("Network request error:", error));
}

// Function to remove post from UI without refreshing
function removePostFromUI(postId) {
    const container = document.getElementById("container");
    const posts = container.getElementsByClassName("card");

    for (let i = 0; i < posts.length; i++) {
        if (posts[i].getAttribute("data-id") === postId.toString()) {
            posts[i].remove();
            break;
        }
    }
}


function closeModal() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('overlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';
}
