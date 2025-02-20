document.addEventListener("DOMContentLoaded", function () {
    const gamesList = document.getElementById("games-list");

    const games = [
        { name: "Animal Silhouette Guessing", img: "Images/Silhouette_logo.png", link: "SilhouetteGame.html" },
        { name: "Word Search Game", img: "Images/Wordsearch_logo.png", link: "WordSearchGame.html" },
        { name: "Animal Silhouette Guessing", img: "Images/Silhouette_logo.png", link: "SilhouetteGame.html" },
        { name: "Word Search Game", img: "Images/Wordsearch_logo.png", link: "WordSearchGame.html" },
        { name: "Animal Silhouette Guessing", img: "Images/Silhouette_logo.png", link: "SilhouetteGame.html" },
        { name: "Word Search Game", img: "Images/Wordsearch_logo.png", link: "WordSearchGame.html" },
        { name: "Animal Silhouette Guessing", img: "Images/Silhouette_logo.png", link: "SilhouetteGame.html" },
        { name: "Word Search Game", img: "Images/Wordsearch_logo.png", link: "WordSearchGame.html" }
    ];

    games.forEach(game => {
        const gameItem = document.createElement("div");
        gameItem.classList.add("game-item");

        gameItem.innerHTML = `
            <a href="${game.link}">
                <img src="${game.img}" alt="${game.name}">
                <p>${game.name}</p>
            </a>
        `;

        gamesList.appendChild(gameItem);
    });
});
