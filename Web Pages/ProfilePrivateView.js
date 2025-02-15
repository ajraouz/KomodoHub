function setAvatar(element) {
    document.getElementById("profile-avatar").src = element.src;

    let avatars = document.querySelectorAll(".avatar");
    avatars.forEach(avatar => avatar.classList.remove("selected"));
    
    element.classList.add("selected");
}

function validatePassword() {
    const password = document.getElementById("newPassword").value;
    const passwordError = document.getElementById("passwordError");

    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
        passwordError.textContent = "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.";
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
        passwordError.textContent = "Password updated successfully!";
        passwordError.style.color = "green";

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
