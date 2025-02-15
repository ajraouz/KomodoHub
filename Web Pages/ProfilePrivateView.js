document.addEventListener("DOMContentLoaded", function () {
    const avatarOptions = document.querySelectorAll(".avatar");
    const profileAvatar = document.getElementById("profile-avatar");
    const saveButton = document.querySelector(".btn.blue");
    
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
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

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
        setTimeout(() => {
            passwordError.style.display = "none"; // Hide message after 3 seconds
        }, 3000);

        // Clear the input field
        document.getElementById("newPassword").value = "";
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
