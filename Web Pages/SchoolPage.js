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
    saveButton.addEventListener("click", function () {
        if (!selectedAvatar) {
            // Show error message if no avatar is selected
            avatarMessage.textContent = "⚠️ Please select an avatar before saving.";
            avatarMessage.style.color = "red";
            avatarMessage.style.display = "block";
            return;
        }

        // Save the selected avatar
        localStorage.setItem("userAvatar", selectedAvatar);
        avatarMessage.textContent = "✅ Avatar Saved!";
        avatarMessage.style.color = "rgb(77, 247, 77)";
        avatarMessage.style.display = "block";

        // Hide the message after 3 seconds
        setTimeout(() => {
            avatarMessage.style.display = "none";
        }, 3000);
    });

    // Load saved avatar from localStorage
    const savedAvatar = localStorage.getItem("userAvatar");
    if (savedAvatar) {
        profileAvatar.src = savedAvatar;
    }
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
    const passwordError = document.getElementById("passwordError");

    if (validatePassword()) {
        passwordError.textContent = "✅ Password updated successfully!";
        passwordError.style.color = "rgb(77, 247, 77)";
        passwordError.style.display = "block";  // Ensure it's visible

        // Clear the input field
        document.getElementById("newPassword").value = "";

        // Hide message after 3 seconds
        setTimeout(() => {
            passwordError.style.display = "none";
        }, 3000);
    } else {
        // If validation fails, show the error message
        passwordError.style.display = "block";  // Ensure it's visible
    }
}


function logout() {
    if (confirm("Are you sure you want to log out?")) {
        alert("Logged out successfully.");
        window.location.href = "login.html"; 
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

// Toggle Contact Form
function toggleContactForm() {
    const form = document.getElementById("contact-form");
    form.style.display = (form.style.display === "flex") ? "none" : "flex";
}

// Form Validation and Submission
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
// Toggle Contact Form
function toggleContact() {
    const form = document.getElementById("contact-form");
    form.style.display = (form.style.display === "flex") ? "none" : "flex";
}
// Fun Sound Effects
const clickSound = new Audio('Sounds/click.mp3');  // Add a click sound
const rankUpSound = new Audio('Sounds/rankup.mp3'); // Add a rank-up sound

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        clickSound.play();
    });
});

// Confetti Animation for Rank Up
const rankElement = document.getElementById('rank');
if (rankElement.innerText === 'Beginner') {
    rankElement.addEventListener('click', () => {
        rankUpSound.play();
        // Simple confetti effect
        const confettiElement = document.createElement('div');
        confettiElement.classList.add('confetti');
        document.body.appendChild(confettiElement);
        setTimeout(() => confettiElement.remove(), 3000);
    });
}
