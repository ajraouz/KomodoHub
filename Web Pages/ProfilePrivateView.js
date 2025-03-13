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
        avatarMessage.innerHTML = '<img src="Images/icons/error.png" alt="Error Icon" class="icon"> Please select an avatar before saving.';
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
            avatarMessage.innerHTML = '<img src="Images/icons/success.png" alt="Success Icon" class="icon"> Avatar updated successfully!';
            avatarMessage.style.color = "rgb(77, 247, 77)";
            avatarMessage.style.display = "block";

            // Hide the message after 3 seconds
            setTimeout(() => {
                avatarMessage.style.display = "none";
            }, 3000);

        } else {
            avatarMessage.innerHTML = '<img src="Images/icons/error.png" alt="Error Icon" class="icon"> ' + result.error;
            avatarMessage.style.color = "red";
            avatarMessage.style.display = "block";
        }
    } catch (error) {
        avatarMessage.innerHTML = '<img src="Images/icons/error.png" alt="Error Icon" class="icon"> Error updating avatar.';
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
        document.getElementById("posts").textContent             = data.posts;
        document.getElementById("points").textContent            = data.points 
                
        updateProgress();  

        // If the user is an admin, show and update the "Members Involved" section
        if (data.role.toLowerCase() === "admin") {
            // Members Involved
            document.getElementById("membersContribution").style.display = "block";
            document.getElementById("members").innerText = data.members || "0";
            
            // School Staff Involved
            document.getElementById("staffContribution").style.display = "block";
            document.getElementById("staff").innerText = data.staff || "0";
            
            // Students Involved
            document.getElementById("studentsContribution").style.display = "block";
            document.getElementById("students").innerText = data.students || "0";
        }

         // show access code section only for teacher user type
         if (data.role === "teacher") {
            document.getElementById("access-code-section").style.display = "block";
        } else {
            document.getElementById("access-code-section").style.display = "none";
        }

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
        passwordError.innerHTML = '<img src="Images/icons/error.png" alt="Error Icon" class="icon"> Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.';
        passwordError.style.color = "red";
        return false;
    } else {
        passwordError.textContent = "";
        return true;
    }
}

function changePassword() {
    if (!validatePassword()) {
      return;
    }
    
    // Retrieve the new password from the input field
    const newPassword = document.getElementById("newPassword").value;
    
    // Extract the username from the display element; adjust if stored elsewhere
    let username = document.getElementById("display-username").textContent.trim();
    if (username.startsWith('@')) {
      username = username.substring(1);
    }
    
    // Create a FormData object to send the username and new password to the server
    const formData = new FormData();
    formData.append('username', username);
    formData.append('newPassword', newPassword);
    
    // Send the POST request to the update password endpoint
    fetch('/update_password', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      const passwordError = document.getElementById("passwordError");
      
      if (data.success) {
        // Display success message
        passwordError.innerHTML = '<img src="Images/icons/success.png" alt="Success Icon" class="icon"> Password updated successfully!';
        passwordError.style.color = "rgb(77, 247, 77)";
        passwordError.style.display = "block"; // Make sure it's visible

        // Clear the input field
        document.getElementById("newPassword").value = "";

        // Hide message after 3 seconds
        setTimeout(() => {
            passwordError.style.display = "none";
        }, 3000);
      } 
      else {
        // Display error message returned from the server
        passwordError.textContent = "Error updating password: " + data.error;
        passwordError.style.color = "red";
        passwordError.style.display = "block";
      }
      
      // Reset the message after 3 seconds
      setTimeout(() => {
        passwordError.textContent = ""; // Clear the message
        passwordError.style.display = "block"; 
        passwordError.style.color = "red"; // Reset to default error color
      }, 3000);
    })
    .catch(error => {
      console.error('Error:', error);
      const passwordError = document.getElementById("passwordError");
      passwordError.textContent = "An error occurred while updating the password.";
      passwordError.style.color = "red";
      passwordError.style.display = "block";
      
      setTimeout(() => {
        passwordError.textContent = "";
        passwordError.style.display = "block";
        passwordError.style.color = "red";
      }, 3000);
    });
}


function logout(event) {
    event.preventDefault();
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("username")
        localStorage.removeItem("userType")
        alert("Logged out successfully.");
        window.location.href = "/Web Pages/HomePage.html";
    }
}

function deleteAccount() {
    // Confirm deletion with the user
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        return;
    }
    
    // Retrieve the username from the profile display 
    let username = document.getElementById("display-username").textContent.trim();
    if (username.startsWith('@')) {
        username = username.substring(1);
    }
    
    // Create a FormData object and append the username
    const formData = new FormData();
    formData.append('username', username);
    
    // Send a POST request to the delete_account endpoint
    fetch('/delete_account', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Account deleted successfully!");
            localStorage.removeItem("username");
            localStorage.removeItem("userType");
            // Redirect the user to the home page
            window.location.href = "HomePage.html";
        } else {
            alert("Error deleting account: " + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while deleting the account.");
    });
}

function togglePassword() {
    const passwordInput = document.getElementById("newPassword");
    const toggleIcon = document.querySelector(".toggle-password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.src = "Images/icons/shownpassword.png"; // Change icon to "hide" mode
    } else {
        passwordInput.type = "password";
        toggleIcon.src = "Images/icons/hiddenpassword.png"; // Change icon to "show" mode
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
    nextRankDisplay.innerText = nextRank ? `${nextRank}` : "Max Rank Achieved";
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

function validateStudentAccessCode() {
    const accessCodeInput = document.getElementById("newStudentAccessCode");
    const messageElement = document.getElementById("studentAccessCodeMessage");
    const newAccessCode = accessCodeInput.value.trim();
    
    if (newAccessCode.length < 5) {
        messageElement.innerHTML = '<img src="Images/icons/error.png" alt="Error Icon" class="icon"> Access code must be at least 5 characters.';
        messageElement.style.color = "red";
        return false;
    } else {
        messageElement.textContent = "";
        return true;
    }
}

function changeStudentAccessCode() {
    const accessCodeInput = document.getElementById("newStudentAccessCode");
    const newAccessCode = accessCodeInput.value.trim();
    const messageElement = document.getElementById("studentAccessCodeMessage");

    // Validate the new access code length
    if (!validateStudentAccessCode()) {
        return;
    }
    
    // Create URL-encoded form data and append the username from localStorage
    const formData = new URLSearchParams();
    formData.append('newStudentAccessCode', newAccessCode);
    formData.append('username', localStorage.getItem("username")); // Append username

    fetch('/update_student_access_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
         if (data.success) {
            messageElement.innerHTML = '<img src="Images/icons/success.png" alt="Success Icon" class="icon"> Student access code updated successfully!';
            messageElement.style.color = "rgb(77, 247, 77)";
            // Clear the input field after a successful update
            accessCodeInput.value = "";
            setTimeout(() => { messageElement.textContent = ""; }, 5000);
         } else {
            messageElement.textContent = "Failed to update student access code: " + data.error;
            messageElement.style.color = "red";
            setTimeout(() => { messageElement.textContent = ""; }, 5000);
         }
    })
    .catch(error => {
         console.error("Error updating student access code:", error);
         messageElement.textContent = "Error updating student access code.";
         messageElement.style.color = "red";
         setTimeout(() => { messageElement.textContent = ""; }, 5000);
    });
}