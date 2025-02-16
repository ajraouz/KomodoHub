
document.addEventListener("DOMContentLoaded", function () {
    console.log("Page loaded. Showing difficulty screen.");
    
    // Ensure difficulty selection screen is visible first
    document.getElementById("difficulty-screen").style.display = "flex";
    document.getElementById("game-container").style.display = "none";
});

let currentAnimal = {};
let usedAnimals = [];
let questionNumber = 0;
let score = 0;
let totalQuestions = 5;

const animals = [
    { name: "Sumatran Tiger", image: "Images/sumatran_tiger.jpg", silhouette: "images/sil_sumatran_tiger.png", hint: "A critically endangered big cat from Indonesia." },
    { name: "Sumatran Elephant", image: "Images/sumatran_elephant.png", silhouette: "images/sil_sumatran_elephant.png", hint: "A small yet powerful pachyderm from Sumatra." },
    { name: "Javan Rhinoceros", image: "Images/javan_rhinoceros.jpg", silhouette: "images/sil_javan_rhinoceros.png", hint: "One of the rarest rhino species, found in Java." },
    { name: "Banteng", image: "Images/banteng.jpg", silhouette: "images/sil_banteng.png", hint: "A species of wild cattle native to Southeast Asia." },
    { name: "Javan Gibbon", image: "Images/javan_gibbon.jpeg", silhouette: "images/sil_javan_gibbon.png", hint: "A small primate known for its loud calls and long arms." },
    { name: "Orangutan", image: "Images/orangutan.jpg", silhouette: "images/sil_orangutan.png", hint: "A great ape famous for its intelligence and orange fur." },
    { name: "Bekantan", image: "Images/bekantan.png", silhouette: "images/sil_bekantan.png", hint: "A monkey with a very long nose found in Borneo." },
    { name: "Komodo", image: "Images/komodo.jpg", silhouette: "images/sil_komodo.png", hint: "The world's largest lizard, found in Indonesia." },
    { name: "Bali Myna", image: "Images/bali_myna.jpg", silhouette: "images/sil_bali_myna.png", hint: "A beautiful white bird found only on Bali." },
    { name: "Maleo", image: "Images/maleo.png", silhouette: "images/sil_maleo.png", hint: "A bird that buries its eggs in warm sand to hatch." },
    { name: "Anoa", image: "Images/anoa.jpg", silhouette: "images/sil_anoa.png", hint: "The smallest wild buffalo, found in Sulawesi." },
    { name: "Javan Eagle", image: "Images/javan_eagle.jpg", silhouette: "images/sil_javan_eagle.png", hint: "Indonesia’s national bird, known for its hunting skills." },
    { name: "Tarsius", image: "Images/tarsius.png", silhouette: "images/sil_tarsius.png", hint: "A small primate with big eyes and strong legs for jumping." },
    { name: "Celebes Crested Macaque", image: "Images/celebes_crested_macaque.jpg", silhouette: "images/sil_celebes_crested_macaque.png", hint: "A black-furred monkey famous for its 'selfie' photo." }
];

// Function to smoothly transition the image without flashing
function updateImage(imageSrc) {
    const imageElement = document.getElementById("animal-image");
    const tempImage = new Image();

    tempImage.onload = function() {
        imageElement.style.opacity = "0"; // Start fade-out
        setTimeout(() => {
            imageElement.src = imageSrc;
            imageElement.style.opacity = "1"; // Fade-in after change
        }, 300); // Delay matches transition time
    };

    tempImage.src = imageSrc; // Preload image
}



// Function to load the next animal silhouette and question
function loadNextAnimal() {
    if (questionNumber >= totalQuestions) {
        endGame();
        return;
    }

    currentAnimal = animals[questionNumber]; // Get the current animal
    document.getElementById("hint-text").textContent = currentAnimal.hint;

    // Use updateImage to prevent flashing
    updateImage(currentAnimal.silhouette);

    questionNumber++;
}

// Function to start the game
function startGame(difficulty) {
    document.body.style.background = "url('Images/silh_bg.png') no-repeat center center/cover";
    console.log(`Game started with difficulty: ${difficulty}`);

    totalQuestions = difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 14;
    
    questionNumber = 0;
    score = 0;
    usedAnimals = [];
    updateScoreDisplay();

    document.getElementById("difficulty-screen").style.display = "none";
    document.getElementById("game-container").style.display = "flex";

    nextQuestion();
}

function nextQuestion() {
    if (questionNumber >= totalQuestions) {
        endGame();
        return;
    }

    questionNumber++;
    document.getElementById("question-number").innerText = `Question ${questionNumber} of ${totalQuestions}`;
    document.getElementById("feedback").innerText = "";
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("options-container").innerHTML = "";

    do {
        currentAnimal = animals[Math.floor(Math.random() * animals.length)];
    } while (usedAnimals.includes(currentAnimal.name));

    usedAnimals.push(currentAnimal.name);

    // Display silhouette image
    const imageElement = document.getElementById("animal-image");
    imageElement.style.display = "block";
    imageElement.src = currentAnimal.silhouette;
    imageElement.classList.add("silhouette");
    imageElement.classList.remove("revealed");

    document.getElementById("hint-text").innerText = currentAnimal.hint;

    // Generate answer choices
    let choices = animals.filter(a => a.name !== currentAnimal.name);
    choices = choices.sort(() => 0.5 - Math.random()).slice(0, 3);
    choices.push(currentAnimal);
    choices = choices.sort(() => 0.5 - Math.random());

    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";
    choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.innerText = choice.name;
        btn.classList.add("option-btn");
        btn.onclick = () => checkAnswer(choice, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedAnimal, selectedButton) {
    document.querySelectorAll(".option-btn").forEach(btn => btn.disabled = true);

    const imageElement = document.getElementById("animal-image");
    imageElement.src = currentAnimal.image;
    imageElement.classList.remove("silhouette");
    imageElement.classList.add("revealed");

    if (selectedAnimal.name === currentAnimal.name) {
        document.getElementById("feedback").innerText = "Correct!";
        document.getElementById("feedback").style.color = "green";
        selectedButton.classList.add("correct");
        score++;
    } else {
        document.getElementById("feedback").innerText = `Wrong! The correct answer is: ${currentAnimal.name}`;
        document.getElementById("feedback").style.color = "red";
        selectedButton.classList.add("wrong");

        document.querySelectorAll(".option-btn").forEach(btn => {
            if (btn.innerText === currentAnimal.name) {
                btn.classList.add("correct");
            }
        });
    }

    document.getElementById("next-btn").style.display = "block";
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById("score").innerText = `Score: ${score}`;
}

function goBack() {
    document.body.style.background = "url('Images/game_sil_bg.png') no-repeat center center/cover";
    document.getElementById("difficulty-screen").style.display = "flex";
    document.getElementById("game-container").style.display = "none";
}

function endGame() {
    document.getElementById("game-container").style.display = "none"; // Hide game
    document.getElementById("final-score-container").style.display = "block"; // Show final score
    document.getElementById("final-score").innerText = "Your Final Score: " + score;
}

function restartGame() {
    score = 0;
    questionIndex = 0;
    updateScoreDisplay(); // Reset score display
    document.body.style.background = "url('Images/game_sil_bg.png') no-repeat center center/cover";
    document.getElementById("final-score-container").style.display = "none"; // Hide final score
    document.getElementById("difficulty-screen").style.display = "flex"; // Show difficulty selection
}

function cancelGame() {
    window.location.href = "GamePage.html"; //will make in week 3
}
function confirmExit() {
    let confirmQuit = confirm("Are you sure you want to quit?");
    if (confirmQuit) {
        document.getElementById("game-container").style.display = "none"; // Hide game
        document.getElementById("final-score-container").style.display = "block"; // Show final score

        restartGame(); 
    }
}