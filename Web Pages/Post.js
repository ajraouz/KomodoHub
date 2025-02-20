document.addEventListener("DOMContentLoaded", () => {
    const postButton = document.getElementById("post-button");
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const mediaUpload = document.getElementById("media-upload");

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
                    <button style="background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;">X</button>
                </div>
            `;
            uploadFeedback.style.display = "block";

            // Remove image and hide confirmation bar
            uploadFeedback.querySelector("button").addEventListener("click", () => {
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

    // Check for minimum word count
    if (words.length < minWords) {
        errorMessage = `Minimum of ${minWords} words required.`;
        isValid = false;
    }
    // Updated regex: allows alphabets, numbers, and special characters, but requires at least one alphabet
    const pattern = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,'!?()-]*$/;
    if (!pattern.test(text)) {
        errorMessage = "Only numbers or special characters accompanied by alphabets are allowed.";
        isValid = false;
    }

    // Show or hide error message
    if (!isValid) {
        errorElement.textContent = errorMessage;
        input.style.border = "2px solid red";
    } else {
        errorElement.textContent = "";
        input.style.border = "2px solid green";
    }

    return isValid;
}

    postButton.addEventListener("click", () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const media = mediaUpload.files[0];

        // Validate title (5 words) and content (10 words)
        const isTitleValid = validateInput(titleInput, titleError, 5);
        const isContentValid = validateInput(contentInput, contentError, 10);

        if (!isTitleValid || !isContentValid) {
            return;
        }

        const post = {
            title,
            content,
            media: media ? media.name : null,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem("post", JSON.stringify(post));

        // Success indication
        const successMessage = document.createElement("p");
        successMessage.textContent = "Post saved successfully!";
        successMessage.style.color = "green";
        successMessage.style.fontWeight = "bold";
        successMessage.style.textAlign = "center";

        titleInput.style.border = "2px solid green";
        contentInput.style.border = "2px solid green";

        titleInput.value = "";
        contentInput.value = "";
        mediaUpload.value = "";
        uploadFeedback.style.display = "none";

        // Hide the post button and show the success message
        postButton.style.display = "none";
        postButton.parentNode.appendChild(successMessage);

        titleInput.style.transition = "box-shadow 0.5s ease";
        contentInput.style.transition = "box-shadow 0.5s ease";

        titleInput.style.boxShadow = "0 0 10px green";
        contentInput.style.boxShadow = "0 0 10px green";

        setTimeout(() => {
            titleInput.style.boxShadow = "none";
            contentInput.style.boxShadow = "none";
            successMessage.remove();
            postButton.style.display = "block"; // Show the button again after the timeout
        }, 3000);
    });
});
