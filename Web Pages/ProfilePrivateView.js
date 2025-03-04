document.addEventListener("DOMContentLoaded", function () {
    const avatarOptions = document.querySelectorAll(".avatar");
    const profileAvatar = document.getElementById("profile-avatar");
    const saveButton = document.querySelector(".btn.green");
    
    // Create message element for feedback
    const avatarMessage = document.createElement("p");
    avatarMessage.id = "avatar-message";
    avatarMessage.style.fontSize = "14px";
    avatarMessage.style.display = "none"; // Initially hidden

    // Append message below avatar options
    document.querySelector(".avatar-options").after(avatarMessage);

    let selectedAvatar = null; // Track selected avatar

    // Function to handle avatar selection
    avatarOptions.forEach(avatar => {
        avatar.addEventListener("click", function () {
            // Remove 'selected' class from all avatars
            avatarOptions.forEach(av => av.classList.remove("selected"));
            // Add 'selected' class to the clicked avatar
            this.classList.add("selected");
            // Immediately display selected avatar on profile
            profileAvatar.src = this.src;
            // Store the selected avatar temporarily
            selectedAvatar = this.src;
            // Hide error message (if any)
            avatarMessage.style.display = "none";
        });
    });

    // Save the avatar when button is clicked
saveButton.addEventListener("click", async function () {
    if (!selectedAvatar) {
        avatarMessage.textContent = "⚠️ Please select an avatar before saving.";
        avatarMessage.style.color = "red";
        avatarMessage.style.display = "block";
        return;
    }

    // Create form data and include both avatar and username
    let formData = new FormData();
    formData.append("avatar", selectedAvatar);
    formData.append("username", localStorage.getItem("username")); // Append username

    try {
        let response = await fetch("/update_avatar", {
            method: "POST",
            body: formData
        });

        let result = await response.json();
        if (response.ok) {
            avatarMessage.textContent = "✅ Avatar Updated!";
            avatarMessage.style.color = "rgb(77, 247, 77)";
            avatarMessage.style.display = "block";
        } else {
            avatarMessage.textContent = "⚠️ " + result.error;
            avatarMessage.style.color = "red";
            avatarMessage.style.display = "block";
        }
    } catch (error) {
        avatarMessage.textContent = "⚠️ Error updating avatar.";
        avatarMessage.style.color = "red";
        avatarMessage.style.display = "block";
    }
});
    


        

    // Load saved avatar from localStorage
const savedAvatar = localStorage.Item("userAvatar");
    if (savedAvatar) {
        profileAvatar.src = savedAvatar;
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const username = localStorage.getItem("username"); // Retrieve username
    if (!username) {
        console.error("No username found in localStorage.");
        return;
    }

    // Build form data with username
    let formData = new FormData();
    formData.append("username", username);

    // Use POST to fetch user details
    fetch('/get_user_details', {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // If server returned an error, handle it or log it
        if (data.error) {
            console.error("Error from server:", data.error);
            return;
        }
        
        // Update the DOM with the user details
        document.getElementById("display-name").textContent      = data.name;
        document.getElementById("display-username").textContent  = "@" + data.username;
        document.getElementById("display-role").textContent      = data.role;
        document.getElementById("profile-avatar").src            = data.avatar || "Images/default.png";
    })
    .catch(error => console.error("Error fetching user details:", error));
});


function validatePassword() {
    const password = document.getElementById("newPassword").value;
    const passwordError = document.getElementById("passwordError");

    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[-_!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
        passwordError.textContent = "⚠️ Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.";
        passwordError.style.color = "red";
        return false;
    } else {
        passwordError.textContent = "";
        return true;
    }
}

function changePassword() {
    if (validatePassword()) {
        const passwordError = document.getElementById("passwordError");
        passwordError.textContent = "✅ Password updated successfully!";
        passwordError.style.color = "rgb(77, 247, 77)";
        passwordError.style.display = "block"; // Make sure it's visible

        setTimeout(() => {
            passwordError.textContent = "";  // Clear the message
            passwordError.style.display = "block"; // Reset to default display (use block or inline as per your design)
            passwordError.style.color = "red"; // Reset to default color for error
        }, 3000);

        // Clear the input field
        document.getElementById("newPassword").value = "";
    }
}


function logout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("username")
        localStorage.removeItem("userType")
        alert("Logged out successfully.");
        window.location.href = "/Web Pages/LoginPage.html";
    }
}
function deleteAccount() {
    if (confirm("Are you sure you want to delete your account?")) {
        alert("Account deleted.");
    }
}
function togglePassword() {
    const passwordInput = document.getElementById("newPassword");
    const toggleIcon = document.querySelector(".toggle-password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.textContent = "👁️"; // Change icon to "hide" mode
    } else {
        passwordInput.type = "password";
        toggleIcon.textContent = "🙈"; // Change icon to "show" mode
    }
}

// Rank thresholds - adjust as needed
const rankThresholds = [
    { rank: "Beginner", points: 0 },
    { rank: "Intermediate", points: 100 },
    { rank: "Advanced", points: 250 },
    { rank: "Expert", points: 500 },
    { rank: "Master", points: 1000 }
];

document.addEventListener("DOMContentLoaded", function () {
    updateProgress();
});

function getCurrentRank(points) {
    let currentRank = rankThresholds[0].rank;
    let nextRank = rankThresholds[1].rank; // Default next rank
    let currentThreshold = rankThresholds[0].points;
    let nextThreshold = rankThresholds[1].points;

    for (let i = 0; i < rankThresholds.length; i++) {
        if (points >= rankThresholds[i].points) {
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

function updateProgress() {
    let points = parseInt(document.getElementById("points").innerText) || 0;
    let progressBar = document.getElementById("progress");
    let rankDisplay = document.getElementById("rank");
    let nextRankDisplay = document.getElementById("next-rank");

    let { currentRank, nextRank, currentThreshold, nextThreshold } = getCurrentRank(points);

    // Calculate progress percentage
    let progressPercentage = nextRank
        ? ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
        : 100; // If max rank, set progress bar to 100%

    progressPercentage = Math.max(0, Math.min(progressPercentage, 100)); // Ensure valid range

    // Update UI elements
    rankDisplay.innerText = currentRank;
    nextRankDisplay.innerText = nextRank ? `Next Rank: ${nextRank}` : "Max Rank Achieved";
    progressBar.style.width = `${progressPercentage}%`;
}

// Function to add points dynamically
function addPoints(newPoints) {
    let pointsElement = document.getElementById("points");
    let currentPoints = parseInt(pointsElement.innerText) || 0;
    let updatedPoints = currentPoints + newPoints;

    pointsElement.innerText = updatedPoints;
    updateProgress();
}