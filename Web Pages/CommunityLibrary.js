document.addEventListener("DOMContentLoaded", function () {
    fetchArticles();
});

function fetchArticles() {
    fetch("http://127.0.0.1:5001/community_articles")  // Flask API Endpoint
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector(".container"); // The scrolling articles container

            data.forEach(article => {
                const card = createCard(article);
                container.appendChild(card);
            });
        })
        .catch(error => console.error("Error fetching community articles:", error));
}

function createCard(article) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.onclick = function() {
        showModal(article);
    };

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');

    // Profile picture link to PublicProfileView.html
    const profileLink = document.createElement('a');
    profileLink.href = "ProfilePublicView.html";
    profileLink.classList.add('profile-link');

    const profileImg = document.createElement('img');
    profileImg.classList.add('profile-img');

    // Ensure profile image has a valid source
    if (article.profile_image && article.profile_image.trim()) {
        profileImg.src = article.profile_image.startsWith("http") ? article.profile_image : `http://127.0.0.1:5001/${article.profile_image}`;
    } else {
        profileImg.src = 'images/default.png'; // Default image fallback
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

    const img = document.createElement('img');
    img.src = article.image ? article.image : 'images/default.jpg';  
    img.alt = article.title;

    const title = document.createElement('h3');
    title.innerText = article.title;

    const content = document.createElement('p');
    content.innerText = article.content.substring(0, 100) + '...';

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

    // FIX: Ensure base64 image is handled correctly
    image.src = article.image && article.image.startsWith("data:image") ? article.image : 'images/default.jpg';

    // Ensure profile image is set correctly
    profile.src = article.profile_image && article.profile_image.trim() ? article.profile_image : 'images/default.png';  

    username.innerText = article.username;
    role.innerText = article.role;
    date.innerText = article.date;
    time.innerText = article.time;

    // Set profile link in modal
    profileLink.href = "ProfilePublicView.html";  

    modal.style.display = 'block';
    overlay.style.display = 'block';
}


// Function to close the modal
function closeModal() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('overlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';
}
