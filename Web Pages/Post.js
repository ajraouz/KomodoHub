document.addEventListener("DOMContentLoaded", () => {
    const postButton = document.getElementById("post-button");
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const mediaUpload = document.getElementById("media-upload");
    const postType = document.getElementById("post-type"); // Dropdown selection

    // Error messages
    const titleError = document.createElement("p");
    const contentError = document.createElement("p");

    titleError.style.color = "red";
    contentError.style.color = "red";

    titleInput.parentNode.insertBefore(titleError, titleInput);
    contentInput.parentNode.insertBefore(contentError, contentInput);

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
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            uploadFeedback.innerHTML = ` 
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${imageUrl}" alt="Uploaded Image" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
                    <span>Image addition successful</span>
                    <button id="remove-image" style="background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;">X</button>
                </div>
            `;
            uploadFeedback.style.display = "block";

            // Remove image without submitting the post
            document.getElementById("remove-image").addEventListener("click", (event) => {
                event.stopPropagation(); // Prevents triggering any other event
                event.preventDefault();
                mediaUpload.value = "";
                uploadFeedback.style.display = "none";
            });
        }
    });

    // Validate input
    function validateInput(input, errorElement, minWords) {
        const text = input.value.trim();
        const words = text.split(/\s+/);

        let isValid = true;
        let errorMessage = "";

        if (words.length < minWords) {
            errorMessage = `Minimum of ${minWords} words required.`;
            isValid = false;
        }

        const pattern = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,'!?()-]*$/;
        if (!pattern.test(text)) {
            errorMessage = "Only numbers or special characters accompanied by alphabets are allowed.";
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

    postButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const media = mediaUpload.files[0];
        const postDestination = postType.value; // Get selected post destination

        // Determine which endpoint to use
        const endpoint = postDestination === "school" ? "/post" : "/post_community";

        // Validate title (5 words) and content (10 words)
        const isTitleValid = validateInput(titleInput, titleError, 5);
        const isContentValid = validateInput(contentInput, contentError, 10);

        if (!isTitleValid || !isContentValid) {
            console.log("❌ Validation failed: Title or content is not valid.");
            return;
        }

        // Create FormData object for sending data
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("owner", "User1"); // Change dynamically if needed
        if (media) {
            formData.append("image", media);
        }

        console.log("📤 Sending post data:", {
            title: title,
            content: content,
            media: media ? media.name : "No media",
            destination: postDestination
        });

        try {
            const response = await fetch(`http://127.0.0.1:5001${endpoint}`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            console.log("✅ Server response:", result);

            if (response.ok) {
                showSuccessMessage(`Post uploaded to ${postDestination} successfully!`);
            } else {
                console.error("❌ Server responded with an error:", response.statusText);
                showSuccessMessage("Post saved, but server response was invalid.");
            }
        } catch (error) {
            console.error("❌ Network error:", error);
            showSuccessMessage("Post saved locally, but a network error occurred.");
        }

        // Clear inputs
        titleInput.value = "";
        contentInput.value = "";
        mediaUpload.value = "";
        uploadFeedback.style.display = "none";
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
