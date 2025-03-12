
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
    { name: "Sumatran Tiger", image: "Images/sumatran_tiger.jpg", silhouette: "images/sil_sumatran_tiger.png", hint: "Adapted to its rainforest habitat, it is a solitary and territorial animal. It primarily preys on deer, wild boar, and smaller mammals, using stealth and power to ambush its prey." },
    { name: "Sumatran Elephant", image: "Images/sumatran_elephant.png", silhouette: "images/sil_sumatran_elephant.png", hint: "As herbivores, they consume a varied diet of leaves, fruits, bark, and grasses, playing a crucial role in seed dispersal and forest regeneration." },
    { name: "Javan Rhinoceros", image: "Images/javan_rhinoceros.jpg", silhouette: "images/sil_javan_rhinoceros.png", hint: "It relies on mud wallows to cool off and maintain skin health. Extremely shy, it avoids human contact and is rarely seen in the wild." },
    { name: "Banteng", image: "Images/banteng.jpg", silhouette: "images/sil_banteng.png", hint: "They are crepuscular, meaning they are most active during dawn and dusk. Highly alert and cautious, they rely on their keen senses to detect predators like tigers and leopards." },
    { name: "Javan Gibbon", image: "Images/javan_gibbon.jpeg", silhouette: "images/sil_javan_gibbon.png", hint: "It has soft, silvery-gray fur with a darker face and expressive eyes. Weighing between 4 to 8 kg, these lack tails, relying on their powerful limbs to swing effortlessly through the treetops." },
    { name: "Orangutan", image: "Images/orangutan.jpg", silhouette: "images/sil_orangutan.png", hint: "They are the world's largest tree-dwelling primates, known for their distinctive reddish-brown fur and highly intelligent behavior. Males can weigh over 100 kg, while females are smaller." },
    { name: "Bekantan", image: "Images/bekantan.png", silhouette: "images/sil_bekantan.png", hint: "It is a unique and charismatic primate, native to the mangrove forests, peat swamps, and riverine forests of Borneo best known for its large, drooping nose, which is more pronounced in males." },
    { name: "Komodo", image: "Images/komodo.jpg", silhouette: "images/sil_komodo.png", hint: "It is the world's largest lizard, growing up to 3 meters long and weighing over 90 kg. It has a muscular body covered in tough, scaly skin, strong limbs, and a long, powerful tail." },
    { name: "Bali Myna", image: "Images/bali_myna.jpg", silhouette: "images/sil_bali_myna.png", hint: "They are recognized for its pure white feathers, bright blue skin around the eyes, and elegant black wing and tail tips. It measures around 25 cm in length and weighs approximately 100 grams." },
    { name: "Maleo", image: "Images/maleo.png", silhouette: "images/sil_maleo.png", hint: "They are endemic to the tropical lowland and coastal forests of Sulawesi in Indonesia. They bury their eggs in hot sand or volcanic soil, allowing natural heat to hatch their young." },
    { name: "Anoa", image: "Images/anoa.jpg", silhouette: "images/sil_anoa.png", hint: "Weighing between 150 to 300 kg, it is the smallest living wild bovine. They have short, smooth dark brown to black fur, with small, straight horns that curve slightly backward." },
    { name: "Javan Eagle", image: "Images/javan_eagle.jpg", silhouette: "images/sil_javan_eagle.png", hint: "It has striking brown plumage with a lighter underside, bold black-and-white wing markings, and a prominent crest of long feathers on its head. This gives it a majestic, almost mythical appearance." },
    { name: "Tarsius", image: "Images/tarsius.png", silhouette: "images/sil_tarsius.png", hint: "These are among the smallest primates, having soft, brownish-gray fur, large bat-like ears, and distinctive, oversized eyes, allowing them to see in near-total darkness." },
    { name: "Celebes Crested Macaque", image: "Images/celebes_crested_macaque.jpg", silhouette: "images/sil_celebes_crested_macaque.png", hint: "It is a medium-sized primate known for its striking appearance, with a prominent black crest of hair on its head that gives it a unique, almost “quiffed” look." }
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
    document.body.style.background = "url('Images/silh_bg.png') ";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed"; // Forces fixed background
    
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

function flipHint() {
    const hintBox = document.querySelector('#hint-box');
    hintBox.classList.toggle('flipped');
}

function nextQuestion() {
    if (questionNumber >= totalQuestions) {
        endGame();
        return;
    }
    // Reset the hint box for the next question
    const hintBox = document.querySelector('#hint-box');
    hintBox.classList.remove('flipped');

    // Reset hint text
    const hintText = document.querySelector('#hint-text');
    hintText.textContent = "This animal's hint will appear here.";

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
    document.body.style.background = "url('Images/game_sil_bg.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
    document.getElementById("difficulty-screen").style.display = "flex";
    document.getElementById("game-container").style.display = "none";
}

function endGame() {
    document.getElementById("game-container").style.display = "none"; // Hide game
    document.getElementById("final-score-container").style.display = "block"; // Show final score
    document.getElementById("final-score").innerText = "Your Final Score: " + score;

    const currentUsername = localStorage.getItem("username");
    updateScoreInDB(currentUsername, score);
}

// Function to update the score in the database
function updateScoreInDB(username, score) {
    fetch('/update_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `username=${encodeURIComponent(username)}&score=${encodeURIComponent(score)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error updating score:', data.error);
        } else {
            console.log('Score updated successfully:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function restartGame() {
    score = 0;
    questionIndex = 0;
    updateScoreDisplay(); // Reset score display
    document.body.style.background = "url('Images/game_sil_bg.png') ";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
    document.getElementById("final-score-container").style.display = "none"; // Hide final score
    document.getElementById("difficulty-screen").style.display = "flex"; // Show difficulty selection
}

function cancelGame() {
    window.location.href = "Games.html"; 
}

function quitGame() {
    // Check if the game is in progress by checking the visibility of the game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer.style.display !== 'none') {
        // Confirm with the user before quitting
        if (confirm('Are you sure you want to quit the game? Your progress will be lost.')) {
            // Reset game state or redirect to Games page
            gameContainer.style.display = 'none';
            document.getElementById('difficulty-screen').style.display = 'flex';
            window.location.href = 'Games.html'; // Redirect to Games page
        } else {
            // Prevent navigation if user cancels the quit
            event.preventDefault();
        }
    }
}
