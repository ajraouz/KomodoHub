document.addEventListener("DOMContentLoaded", async () => {
    const postButton = document.getElementById("post-button");
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const mediaUpload = document.getElementById("media-upload");
    const postType = document.getElementById("post-type"); 
    const dropdownLabel = document.querySelector("label[for='post-type']"); 

    const username = localStorage.getItem("username");

    try {
        let formData = new FormData();
        formData.append("username", username);

        let response = await fetch("/get_user_details", {
            method: "POST",
            body: formData
        });

        let data = await response.json();

        if (data.error) {
            console.error("Error retrieving user details:", data.error);
            return;
        }

        // Update profile section
        document.getElementById("display-name").textContent = data.name;
        document.getElementById("display-username").textContent = "@" + data.username;
        document.getElementById("display-role").textContent = data.role;

        document.querySelector(".profile-img").src = data.avatar && data.avatar.trim()
            ? (data.avatar.startsWith("http") ? data.avatar : `http://127.0.0.1:5001/${data.avatar}`)
            : "images/default.png";

        // Set owner field dynamically in the form
        document.getElementById("post-owner").value = data.username;

        // Apply restrictions based on role
        if (data.role.toLowerCase() === "member") {
            postType.value = "community"; 
            postType.style.display = "none"; 
            dropdownLabel.style.display = "none";
        } else if (["principal", "teacher", "student"].includes(data.role.toLowerCase())) {
            postType.value = "school"; 
            postType.style.display = "none"; 
            dropdownLabel.style.display = "none";
        } else if (data.role.toLowerCase() === "admin") {
            // Allow admins to choose "Both"
            document.querySelector("option[value='both']").style.display = "block"; 
        }        
        // Admins can see the dropdown (default behavior)
        
    } catch (error) {
        console.error("Error fetching profile data:", error);
    }

    // Error messages
    const titleError = document.createElement("p");
    const contentError = document.createElement("p");
    const mediaError = document.createElement("p"); 

    titleError.style.color = "red";
    contentError.style.color = "red";
    mediaError.style.color = "red";

    titleInput.parentNode.insertBefore(titleError, titleInput);
    contentInput.parentNode.insertBefore(contentError, contentInput);
    mediaUpload.parentNode.insertBefore(mediaError, mediaUpload.nextSibling); 

    // Image confirmation bar
    const uploadFeedback = document.createElement("div");
    uploadFeedback.style.display = "none";
    uploadFeedback.style.backgroundColor = "#ebf5ec";
    uploadFeedback.style.color = "black";
    uploadFeedback.style.padding = "10px";
    uploadFeedback.style.border = "1px solid green";
    uploadFeedback.style.borderRadius = "5px";
    uploadFeedback.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    uploadFeedback.style.position = "absolute";
    uploadFeedback.style.marginTop = "10px";
    uploadFeedback.style.zIndex = "1000";

    mediaUpload.parentNode.appendChild(uploadFeedback);

    // Show confirmation bar with image preview
    mediaUpload.addEventListener("change", () => {
        const file = mediaUpload.files[0];
        const allowedTypes = [
            "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp",
        ];

        if (file) {
            // Check if the file type is allowed
            if (!allowedTypes.includes(file.type)) {
                mediaError.textContent = "Invalid file type. Only images are allowed.";
                mediaUpload.value = ""; // Clear the file input
                return;
            } else {
                mediaError.textContent = "";
            }

            // Show preview based on file type
            let previewContent = "";
            const fileUrl = URL.createObjectURL(file);

            if (file.type.startsWith("image/")) {
                previewContent = `<img src="${fileUrl}" alt="Uploaded Image" style="width: 40px; height: 40px; border-radius: 5px; object-fit: cover;">`;
            } else {
                previewContent = `<span style="font-size: 16px;">📄 ${file.name}</span>`;
            }
            

            uploadFeedback.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                ${previewContent}
                <span style="color: green; font-weight: bold;">Media uploaded successfully!</span>
                <button id="remove-image" style="background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;">X</button>
            </div>
        `;


            uploadFeedback.style.display = "block";

            // Remove uploaded media
            document.getElementById("remove-image").addEventListener("click", (event) => {
                event.stopPropagation();
                event.preventDefault();
                mediaUpload.value = "";
                uploadFeedback.style.display = "none";
                const successMessage = uploadFeedback.querySelector("p");
                if (successMessage) {
                    successMessage.remove();
                }
            });
        }

    });

    function validateInput(input, errorElement, minWords) {
        const text = input.value.trim();
        const words = text.split(/\s+/);
    
        let isValid = true;
        let errorMessage = "";
    
        if (words.length < minWords) {
            errorMessage = `Minimum of ${minWords} words required.`;
            isValid = false;
        }
    
        // New validation conditions:
        const containsLetters = /[a-zA-Z]/.test(text);
        const containsNumbers = /[0-9]/.test(text);
        const containsSymbols = /[^a-zA-Z0-9\s]/.test(text);
    
        if (!containsLetters) {
            errorMessage = "Text must contain at least one letter.";
            isValid = false;
        } else if (!containsLetters && (containsNumbers || containsSymbols)) {
            errorMessage = "Numbers or special characters must be accompanied by letters.";
            isValid = false;
        } else if (text.length === 0) {
            errorMessage = "Post cannot be empty.";
            isValid = false;
        }
    
        if (!isValid) {
            errorElement.textContent = errorMessage;
            input.style.border = "2px solid red";
        } else {
            errorElement.textContent = "";
            input.style.border = "2px solid green";
        }
    
        return isValid;
    }
    
    function showConfirmationPopup(callback) {
        // Remove existing popup if present
        const existingPopup = document.getElementById("custom-popup");
        if (existingPopup) {
            existingPopup.remove();
        }
    
        // Create popup container
        const popup = document.createElement("div");
        popup.id = "custom-popup";
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.background = "#ebf5ec";
        popup.style.padding = "20px";
        popup.style.borderRadius = "10px";
        popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        popup.style.textAlign = "center";
        popup.style.zIndex = "1000";
    
        // Pop-up content
        popup.innerHTML = `
            <h3>Confirm Post</h3>
            <p>Are you sure you want to post this?</p>
            <button id="confirm-btn" style="background: green; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px;">Accept</button>
            <button id="cancel-btn" style="background: red; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
        `;
    
        document.body.appendChild(popup);
    
        document.getElementById("confirm-btn").addEventListener("click", () => {
            document.body.removeChild(popup);
            callback(true);
        });
    
        document.getElementById("cancel-btn").addEventListener("click", () => {
            document.body.removeChild(popup);
            callback(false);
        });
    }
    let lastPostTime = 0; // Stores timestamp of the last post

    postButton.addEventListener("click", async (event) => {
        event.preventDefault();
    
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const media = mediaUpload.files[0];
        const postDestination = postType.value;
    
        // 30-second cooldown before allowing another post
        const currentTime = Date.now();
        if (currentTime - lastPostTime < 30000) {  // 30 seconds = 30,000 ms
            mediaError.textContent = "Please wait 30 seconds before posting again.";
            return;
        } else {
            mediaError.textContent = ""; // Clear previous error message
        }
    
        // Determine which endpoints to use
        let endpoint1 = null;
        let endpoint2 = null;
    
        if (postDestination === "school") {
            endpoint1 = "/post";
        } else if (postDestination === "community") {
            endpoint1 = "/post_community";
        } else if (postDestination === "both") {
            endpoint1 = "/post";
            endpoint2 = "/post_community";
        }
    
        // Validate title (1 word) and content (10 words)
        const isTitleValid = validateInput(titleInput, titleError, 1);
        const isContentValid = validateInput(contentInput, contentError, 10);
    
        if (!isTitleValid || !isContentValid) {
            console.log("Validation failed: Title or content is not valid.");
            return;
        }
    
        if (!mediaUpload.files[0]) {
            console.log("Media is missing.");
            mediaError.textContent = "You must upload an image before posting.";
            return;
        } else {
            mediaError.textContent = "";
        }
    
        // Function to send the post
        async function submitPost(endpoint, formData) {
            try {
                const response = await fetch(`http://127.0.0.1:5001${endpoint}`, {
                    method: "POST",
                    body: formData,
                });
    
                const result = await response.json();
                console.log(`Server response from ${endpoint}:`, result);
    
                return response.ok;
            } catch (error) {
                console.error(`Network error while posting to ${endpoint}:`, error);
                return false;
            }
        }
    
        // Show confirmation pop-up before posting
        showConfirmationPopup(async (confirmed) => {
            if (!confirmed) return;
    
            lastPostTime = Date.now(); // Update last post timestamp to enforce cooldown
    
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("owner", document.getElementById("post-owner").value);
            formData.append("image", mediaUpload.files[0]);
    
            console.log("Sending post data:", {
                title: title,
                content: content,
                destination: postDestination,
            });
    
            let success1 = endpoint1 ? await submitPost(endpoint1, formData) : false;
            let success2 = endpoint2 ? await submitPost(endpoint2, formData) : false;
            
            if (postDestination === "both") {
                if (success1 && success2) {
                    showSuccessMessage(`Post uploaded to **both** School and Community Library!`);
                } else {
                    showSuccessMessage(`Post failed. Please try again.`);
                }
            } else if (postDestination === "school") {
                if (success1) {
                    showSuccessMessage(`Post uploaded to **School Library** successfully!`);
                } else {
                    showSuccessMessage(`Post failed. Please try again.`);
                }
            } else if (postDestination === "community") {
                if (success1) {
                    showSuccessMessage(`Post uploaded to **Community Library** successfully!`);
                } else {
                    showSuccessMessage(`Post failed. Please try again.`);
                }
            }
            // Clear inputs
            titleInput.value = "";
            contentInput.value = "";
            mediaUpload.value = "";
            uploadFeedback.style.display = "none";
        });
    });
    
    

    function showSuccessMessage(message) {
        const existingMessage = document.querySelector(".success-message");
        if (existingMessage) {
            existingMessage.remove();
        }

        const successMessage = document.createElement("p");
        successMessage.textContent = message;
        successMessage.className = "success-message";
        successMessage.style.color = "green";
        successMessage.style.fontWeight = "bold";
        successMessage.style.textAlign = "center";
        successMessage.style.marginTop = "15px";

        document.querySelector(".container").appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }
});
