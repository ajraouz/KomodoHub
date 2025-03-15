// Ranking & Progress
const rankThresholds = [
    { rank: "Beginner", points: 0 },
    { rank: "Intermediate", points: 100 },
    { rank: "Advanced", points: 250 },
    { rank: "Expert", points: 500 },
    { rank: "Master", points: 1000 }
];

function getCurrentRank(points) {
    let currentRank = rankThresholds[0].rank;
    let nextRank = rankThresholds[1].rank;
    let currentThreshold = rankThresholds[0].points;
    let nextThreshold = rankThresholds[1].points;

    for (let i = 0; i < rankThresholds.length; i++) {
        if (points > rankThresholds[i].points) {
            currentRank = rankThresholds[i].rank;
            currentThreshold = rankThresholds[i].points;
            if (i + 1 < rankThresholds.length) {
                nextRank = rankThresholds[i + 1].rank;
                nextThreshold = rankThresholds[i + 1].points;
            } else {
                nextRank = null;
                nextThreshold = currentThreshold; // Prevent division by zero
            }
        }
    }
    return { currentRank, nextRank, currentThreshold, nextThreshold };
}

function updateProgress() {
    let points = parseInt(document.getElementById("points").innerText) || 0;
    let progressBar = document.getElementById("progress");
    let rankDisplay = document.getElementById("rank");
    let nextRankDisplay = document.getElementById("next-rank").querySelector("span");

    let { currentRank, nextRank, currentThreshold, nextThreshold } = getCurrentRank(points);
    let progressPercentage = nextRank
        ? ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
        : 100; // If max rank reached

    progressPercentage = Math.max(0, Math.min(progressPercentage, 100));
    rankDisplay.innerText = currentRank;
    nextRankDisplay.innerText = nextRank ? nextRank : "Max Rank Achieved";
    progressBar.style.width = `${progressPercentage}%`;
}

// Profile Loading (Public)
function loadPublicProfile(userID) {
    // Use userId (which is passed as "user_id" to the API)
    fetch(`/api/getSchoolProfile?user_id=${userID}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error:", data.error);
                return;
            }
            // Update the profile container with fetched data
            document.getElementById('profile-name').textContent = data.name;
            document.getElementById('profile-username').textContent = "@" + data.username;
            document.getElementById('profile-role').innerHTML = "<strong>Role:</strong> " + data.role;
            document.getElementById("profile-avatar").src = data.avatar || "Images/schoolprof.jpg";
            
            // Update contributions section
            document.getElementById('posts').textContent = data.posts;
            document.getElementById('points').textContent = data.points;
            document.getElementById('teachers').textContent = data.teachers;
            document.getElementById('students').textContent = data.students;
            updateProgress();
        })
        .catch(error => console.error("Failed to load profile:", error));
}

// Contact Form Handling
function toggleContactForm() {
    const form = document.getElementById("contact-form");
    form.style.display = (form.style.display === "flex") ? "none" : "flex";
}

function toggleContact() {
    toggleContactForm();
}

document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const name = event.target.name.value.trim();
    const email = event.target.email.value.trim();
    const message = event.target.message.value.trim();

    if (name && email && message) {
        alert("Thank you for contacting us, " + name + "! We will get back to you soon.");
        event.target.reset();
        toggleContactForm();
    } else {
        alert("Please fill in all the fields.");
    }
});

// Page Initialization
document.addEventListener("DOMContentLoaded", function () {
    updateProgress();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("user_id")) {
        const userId = urlParams.get("user_id");
        loadPublicProfile(userId);
    } else {
        console.error("No user _id provided in URL parameters.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const contributionsSection = document.querySelector('.contributions-container');
    contributionsSection.style.position = 'relative';
    const numberOfConfetti = 150; 

    for (let i = 0; i < numberOfConfetti; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");

        // Randomize horizontal position within the container
        confetti.style.left = Math.random() * 100 + "%";
        // Randomize a bit of vertical starting position so they don’t all start on the same line
        confetti.style.top = Math.random() * 90 + "px"; 

        // Set a random horizontal offset for the falling path (spread effect)
        confetti.style.setProperty("--x-offset", (Math.random() * 100 - 50) + "px");

        // Optional: Randomize background color
        confetti.style.backgroundColor = randomColor();

        // Randomize animation delay so the pieces start at different times
        confetti.style.animationDelay = Math.random() * 4 + "s";
        // Set a slower animation duration
        confetti.style.animationDuration = "7s";

        contributionsSection.appendChild(confetti);

        // Remove each confetti element after its animation 
        const delay = parseFloat(confetti.style.animationDelay) || 0;
        setTimeout(() => {
            confetti.remove();
        }, (7 + delay) * 1000);
    }
});

// Helper function to return a random color
function randomColor() {
    const colors = ["red","coral", "teal" , "green", "yellow", "purple","pink", "cyan" ];
    return colors[Math.floor(Math.random() * colors.length)];
}
