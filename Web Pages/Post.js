document.addEventListener("DOMContentLoaded", () => {
    const postButton = document.getElementById("post-button");
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const mediaUpload = document.getElementById("media-upload");
    
    postButton.addEventListener("click", () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const media = mediaUpload.files[0];

        if (!title || !content) {
            alert("Title and content cannot be empty.");
            return;
        }

        const post = {
            title,
            content,
            media: media ? media.name : null,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem("post", JSON.stringify(post));
        alert("Post saved successfully!");
        
        titleInput.value = "";
        contentInput.value = "";
        mediaUpload.value = "";
    });
});
