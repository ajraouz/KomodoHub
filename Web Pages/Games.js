document.addEventListener("DOMContentLoaded", function () {
    const gamesList = document.getElementById("games-list");

    const games = [
        { name: "Animal Silhouette Guessing", img: "Images/Silhouette_logo.png", link: "SilhouetteGame.html" },
        { name: "Jigsaw Puzzle Game", img: "Images/Jigsaw_logo.jpg", link: "JigsawGame.html" },
        { name: "Slide & Solve", img: "Images/Sliding_logo.png", link: "SlidingGame.html" },
        { name: "Hangman Jungle Game", img: "Images/Hangman_logo.png", link: "hangman.html" },
        { name: "Word Search Game", img: "Images/Wordsearch_logo.png", link: "WordSearchGame.html" },
        { name: "WordScapes", img: "Images/Wordscapes_logo.png", link: "WordScapes.html" },
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
