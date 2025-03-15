//Rank Thresholds 
const rankThresholds = [
    { rank: "Beginner", points: 0 },
    { rank: "Intermediate", points: 100 },
    { rank: "Advanced", points: 250 },
    { rank: "Expert", points: 500 },
    { rank: "Master", points: 1000 }
];

//Get Current Rank and Progress
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
                nextRank = null; // No next rank
                nextThreshold = currentThreshold; // Prevent division by zero
            }
        }
    }

    return { currentRank, nextRank, currentThreshold, nextThreshold };
}

//Update Progress Bar and Rank
function updateProgress() {
    let points = parseInt(document.getElementById("points").innerText) || 0;
    let progressBar = document.getElementById("progress");
    let rankDisplay = document.getElementById("rank");
    let nextRankDisplay = document.getElementById("next-rank");

    let { currentRank, nextRank, currentThreshold, nextThreshold } = getCurrentRank(points);

    // Calculate progress percentage
    let progressPercentage = nextRank
        ? ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
        : 100; // If max rank, progress is full

    progressPercentage = Math.max(0, Math.min(progressPercentage, 100)); // Ensure valid range

    // Update UI elements
    rankDisplay.innerText = currentRank;
    nextRankDisplay.innerText = nextRank ? nextRank : "Max Rank Achieved";
    progressBar.style.width = `${progressPercentage}%`;
}

//Dynamically Add Points
function addPoints(newPoints) {
    let pointsElement = document.getElementById("points");
    let currentPoints = parseInt(pointsElement.innerText) || 0;
    pointsElement.innerText = currentPoints + newPoints;
    updateProgress();
}

//Load User Profile 
function loadPublicProfile(userId, userRole) {
    console.log(`Fetching profile for user ID: ${userId} (Role: ${userRole})`);

    fetch(`/api/getUserProfile?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log("Profile Data Received:", data);
            if (data.error) {
                console.error("Error:", data.error);
                return;
            }

            // Update UI with Profile Data
            document.getElementById("profile-name").innerText = data.name;
            document.getElementById("profile-username").innerText = "@" + data.username;
            document.getElementById("profile-role").innerText = "Role: " + data.role;
            document.getElementById("profile-avatar").src = data.avatar || "Images/default.png";
            document.getElementById("posts").innerText = data.posts;
            document.getElementById("points").innerText = data.points;
            updateProgress();

            // Show admin-specific sections if the user is an admin
            if (data.role.toLowerCase() === "admin") {
                showAdminSections(data);
            }
        })
        .catch(error => console.error("Failed to load profile:", error));
}

//Show Admin-Specific Sections
function showAdminSections(data) {
    document.getElementById("membersContribution").style.display = "block";
    document.getElementById("members").innerText = data.members || "0";

    document.getElementById("staffContribution").style.display = "block";
    document.getElementById("staff").innerText = data.staff || "0";

    document.getElementById("studentsContribution").style.display = "block";
    document.getElementById("students").innerText = data.students || "0";
}

//Page Initialization
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);

    // Load profile only if the required parameters are present
    if (urlParams.has("user_id") && urlParams.has("role")) {
        const userId = urlParams.get("user_id");
        const userRole = urlParams.get("role");
        loadPublicProfile(userId, userRole);
    } else {
        console.error("Required URL parameters (user_id and role) are missing.");
    }
});
