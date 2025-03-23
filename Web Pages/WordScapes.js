document.addEventListener('DOMContentLoaded', () => {
window.startGame = function (difficulty) {
  console.log("Selected difficulty:", difficulty);

  document.getElementById("difficulty-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.body.style.background = "url('images/wordfinderbackground.webp') no-repeat center center/cover";

  selectedDifficulty = difficulty;
  initWordGrid();
  initLetterCircle();
  // Reveal Button Logic
  const revealBtn = document.getElementById('reveal-btn');
  const revealCounter = document.getElementById('reveal-counter'); // Get the counter element
  let revealUses;
  
  // Set reveal limits based on difficulty
  function setRevealLimit() {
      if (selectedDifficulty === 'easy') {
          revealUses = 5;
      } else if (selectedDifficulty === 'medium') {
          revealUses = 10;
      } else if (selectedDifficulty === 'hard') {
          revealUses = 15;
      }
      revealCounter.textContent = revealUses; // Display initial reveal count
  }
  
  // Function to reveal a random hidden letter
  function revealLetter() {
    if (revealUses > 0) {
        // Find all word-related cells that are still hidden
        const hiddenWordCells = [];

        for (let word in words) {
            words[word].forEach(index => {
                const cell = wordGrid.querySelector(`[data-index='${index}']`);
                if (cell.textContent === '') {
                    hiddenWordCells.push({ cell, word, index });
                }
            });
        }

        if (hiddenWordCells.length > 0) {
            // Pick a random hidden letter from the words
            const randomSelection = hiddenWordCells[Math.floor(Math.random() * hiddenWordCells.length)];
            const { cell, word, index } = randomSelection;

            // Reveal the correct letter from the word
            const letterIndex = words[word].indexOf(index);
            cell.textContent = word[letterIndex]; // Correct letter
            cell.style.backgroundColor = '#FFD700'; // Highlight in gold

            // Reduce the number of available reveals
            revealUses--;
            revealCounter.textContent = revealUses; // Update counter display

            if (revealUses === 0) {
                revealBtn.disabled = true; // Disable button when no more uses left
                revealBtn.style.opacity = "0.5";
                revealCounter.style.backgroundColor = "red"; // Indicate no more reveals
            }
        }
    }
}

  
  // Set reveal limit when the game starts
  setRevealLimit();
  revealBtn.addEventListener('click', revealLetter);
  

};

window.goBack = function () {
  console.log("Returning to WordScapes.html...");

  // Reset UI elements
  document.getElementById("game-container").style.display = "none";
  document.getElementById("difficulty-screen").style.display = "flex"; 

  // Reload the page to fully reset everything
  window.location.href = "WordScapes.html"; 
};



const wordsEasy = {
  "TIGER": [0, 1, 2, 3, 4],
  "TIRE": [0, 7, 14, 21],
  "GET": [2 , 9, 16],
  "TIE": [18, 19, 20],
  "TIER": [6, 13, 20, 27],
  "RITE": [4, 11, 18, 25]
};

const wordsMedium = {
    "TARSIUS": [14, 15, 16, 17, 18, 19, 20],
    "RATS": [0, 7, 14, 21],
    "STAIRS": [20, 27, 34, 41, 48, 55],
    "STAR": [17, 24, 31, 38],
    "SUITS": [51, 52, 53, 54, 55],
    "RUST": [0, 1, 2, 3],
    "AIR": [46, 53, 60]
};

const wordsHard = {
    "ELEPHANT": [40, 41, 42, 43, 44, 45, 46, 47],
    "PLANT": [43, 51, 59, 67, 75],
    "PLANET": [22, 30, 38, 46, 54, 62],
    "PELT": [4, 12, 20, 28],
    "PETAL": [26, 27, 28, 29, 30],
    "EATEN": [73, 74, 75, 76, 77],
    "PATH": [4, 5, 6, 7],
    "PEEL": [32, 40, 48, 56],
    "PLANE": [8, 9, 10, 11, 12],
    "ALE": [1, 9, 17],
    "PAN": [58, 59, 60]
};

const lettersEasy = ['T', 'I', 'G', 'E', 'R'];
const lettersMedium = ['T', 'A', 'R', 'S', 'I', 'U', 'S'];
const lettersHard = ['E', 'L', 'E', 'P', 'H', 'A', 'N', 'T'];


    const wordGrid = document.querySelector('.word-grid');
    const letterCircle = document.querySelector('.letter-circle');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const hintBtn = document.getElementById('hint-btn');
  
    let selectedLetters = '';
    let selectedLetterElements = [];
    let foundWords = [];
    let isDragging = false;
  
    // Create canvas for drawing the connecting line
    const canvas = document.createElement('canvas');
    canvas.classList.add('drag-line-canvas');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
  
    /**
     * Prevents default text selection behavior while dragging
     */
    document.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });
  
    /**
     * Initialize the word grid
     */
    function initWordGrid() {
      wordGrid.innerHTML = '';
      
      let totalCells;
      let gridSize;
      wordGrid.classList.remove('hard-mode');
      if (selectedDifficulty === 'easy') {
          words = wordsEasy;
          totalCells = 28;  
          gridSize = 7;
      } else if (selectedDifficulty === 'medium') {
          words = wordsMedium;
          totalCells = 62;  
          gridSize = 7;
      } else if (selectedDifficulty === 'hard') {
          words = wordsHard;
          totalCells = 80;  
          gridSize = 8;
          wordGrid.classList.add('hard-mode');
      }
  
      wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`;
      
  
      for (let i = 0; i < totalCells; i++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.dataset.index = i;  // Helps track placement
  
          if (!Object.values(words).flat().includes(i)) {
              cell.style.backgroundColor = 'transparent';
          }
  
          wordGrid.appendChild(cell);
      }
  }
  
  
  
    /**
     * Initialize the letter circle
     */
    function initLetterCircle() {
      letterCircle.innerHTML = '';
      
      let radius;
      let fontSize;
      let circleSize;
      
      if (selectedDifficulty === 'easy') {
          letters = lettersEasy;
          radius = 80;
          fontSize = '22px';
          circleSize = '220px';
      } else if (selectedDifficulty === 'medium') {
          letters = lettersMedium;
          radius = 100;
          fontSize = '18px';
          circleSize = '260px';
      } else if (selectedDifficulty === 'hard') {
          letters = lettersHard;
          radius = 120;
          fontSize = '16px';
          circleSize = '300px';
      }
  
      letterCircle.style.width = circleSize;
      letterCircle.style.height = circleSize;
  
      const angleStep = (2 * Math.PI) / letters.length;
  
      letters.forEach((letter, index) => {
          const angle = index * angleStep;
          const x = radius * Math.cos(angle) + radius;
          const y = radius * Math.sin(angle) + radius;
  
          const letterDiv = document.createElement('div');
          letterDiv.classList.add('letter');
          letterDiv.textContent = letter;
          letterDiv.style.left = `${x}px`;
          letterDiv.style.top = `${y}px`;
          letterDiv.style.fontSize = fontSize;
          letterDiv.addEventListener('mousedown', onLetterMouseDown);
  
          letterCircle.appendChild(letterDiv);
      });
  
      // Update canvas size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }
  
  
    /**
     * Handles the start of letter selection
     */
    function onLetterMouseDown(event) {
      isDragging = true;
      selectedLetters = '';
      selectedLetterElements = [];
      selectedLetters += event.target.textContent;
      selectedLetterElements.push(event.target);
      event.target.classList.add('selected');
  
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  
    /**
     * Handles letter selection while dragging, with line following the mouse
     */
    function onMouseMove(event) {
      if (!isDragging) return;
      event.preventDefault();
  
      const hoveredLetter = document.elementFromPoint(event.clientX, event.clientY);
  
      if (hoveredLetter && hoveredLetter.classList.contains('letter')) {
        if (!selectedLetterElements.includes(hoveredLetter)) {
          selectedLetters += hoveredLetter.textContent;
          selectedLetterElements.push(hoveredLetter);
          hoveredLetter.classList.add('selected');
        }
      }
  
      drawConnectingLine(event.clientX, event.clientY);
    }
  
    /**
     * Draws a line following the mouse while selecting letters
     */
    function drawConnectingLine(mouseX, mouseY) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = "#00FF00"; 
      ctx.lineWidth = 8;
  
      selectedLetterElements.forEach((letter, index) => {
        const rect = letter.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
  
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
  
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
    }
  
    /**
     * Handles end of letter selection
     */
    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      checkWord(selectedLetters);
      resetSelection();
    }
  
    /**
     * Checks if selected word is valid
     */
    function checkWord(word) {
      word = word.toUpperCase();
      if (words[word] && !foundWords.includes(word)) {
        foundWords.push(word);
        revealWordInGrid(word);
        checkCompletion();
      }
    }
  
    /**
     * Reveals found word in the word grid
     */
    function revealWordInGrid(word) {
      const cellIndexes = words[word];
      cellIndexes.forEach((index, i) => {
          const cell = wordGrid.querySelector(`[data-index='${index}']`);
          cell.textContent = word[i];
          cell.style.backgroundColor = '#76B041'; // Green background
      });
  }
  
  
    /**
     * Resets selected letters after checking the word
     */
    function resetSelection() {
      selectedLetters = '';
      selectedLetterElements.forEach(letter => letter.classList.remove('selected'));
      selectedLetterElements = [];
    }
  
    /**
     * Checks if all words have been found and shows the completion popup
     */
    function checkCompletion() {
      if (foundWords.length === Object.keys(words).length) {
        showCompletionPopup();
      }
    }
  
/**
 * Displays the "Completed!!" popup with points and options to play again or find more games
 */
function showCompletionPopup() {
  const popup = document.createElement('div');
  popup.classList.add('completion-popup');

  const message = document.createElement('h2');
  message.textContent = "🎉 You Won! 🎉";

  // Calculate points based on difficulty
  let points = 0;
  if (selectedDifficulty === 'easy') {
      points = 5;
  } else if (selectedDifficulty === 'medium') {
      points = 10;
  } else if (selectedDifficulty === 'hard') {
      points = 20;
  }

  const pointsDisplay = document.createElement('p');
  pointsDisplay.textContent = `⭐ You earned: ${points} points! ⭐`;

  // Update points using the same approach as JigsawGame.js
  const username = localStorage.getItem('username');
  if (username) {
      updateScoreInDB(username, points);
  }

  const playAgainBtn = document.createElement('button');
  playAgainBtn.textContent = "🔄 Play Again";
  playAgainBtn.addEventListener('click', () => {
      window.location.href = "WordScapes.html";
  });

  const moreGamesBtn = document.createElement('button');
  moreGamesBtn.textContent = "🎮 More Games";
  moreGamesBtn.addEventListener('click', () => {
      window.location.href = "Games.html";
  });

  popup.appendChild(message);
  popup.appendChild(pointsDisplay);
  popup.appendChild(playAgainBtn);
  popup.appendChild(moreGamesBtn);
  document.body.appendChild(popup);
}

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
    shuffleBtn.addEventListener('click', shuffleLetters);
    hintBtn.addEventListener('click', provideHint);
  
    function shuffleLetters() {
      letters.sort(() => Math.random() - 0.5);
      initLetterCircle();
    }
  
    // Object containing words as keys and their respective hints as values for each difficulty level
const wordHintsEasy = {
  "TIGER": "A large carnivorous cat known for its stripes.",
  "TIRE": "To begin to feel as if you have no energy and want to rest or go to sleep.",
  "GET": "To obtain or acquire something.",
  "TIE": "A formal accessory worn around the neck often worn with a suit.",
  "TIER": "A level or a row in a hierarchy. often used to rank",
  "RITE": "A ceremonial or religious act."
};

const wordHintsMedium = {  
  "TARSIUS": "A small primate with big eyes, known for jumping between trees.",  
  "RATS": "Rodents often found in cities and sewers.",  
  "STAR": "A bright object in the night sky, like the Sun.",  
  "STAIRS": "Steps used to go up or down in a building.",  
  "AIR": "What we breathe to stay alive.",  
  "RUST": "A reddish-brown coating that forms on iron when it gets wet.",  
  "SUIT": "A formal outfit often worn for work or special occasions."  
};

const wordHintsHard = {
  "ELEPHANT": "The largest land animal with a trunk.",
  "PLANT": "A living organism that grows in the soil.",
  "PLANET": "A celestial body orbiting a star.",
  "PELT": "The fur or skin of an animal.",
  "PETAL": "A single piece of a flower.",
  "EATEN": "A past tense of consuming food.",
  "PATH": "A track or route to follow.", 
  "PEEL": "To cut/tear something, often used when referring to fruits or vegetables",
  "PLANE": "A flying vehicle with wings.",  
  "ALE": "A type of drink, like beer.", 
  "PAN": "A kitchen tool used for cooking food." 
};

function provideHint() {
  let hints;
  if (selectedDifficulty === 'easy') {
      hints = wordHintsEasy;
  } else if (selectedDifficulty === 'medium') {
      hints = wordHintsMedium;
  } else if (selectedDifficulty === 'hard') {
      hints = wordHintsHard;
  }

  // Get remaining words that haven't been found
  const remainingWords = Object.keys(hints).filter(word => !foundWords.includes(word));

  if (remainingWords.length > 0) {
      const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)]; // Pick a random remaining word
      showHintPopup(hints[randomWord]); // Call function to display popup
  } else {
      showHintPopup("All words found!");
  }
}
function showHintPopup(hintText) {
  // Remove any existing hint popups before creating a new one
  const existingPopup = document.querySelector('.hint-popup');
  if (existingPopup) {
      existingPopup.remove();
  }

  // Create the hint popup container
  const popup = document.createElement('div');
  popup.classList.add('hint-popup');

  // Create the hint text
  const hintMessage = document.createElement('p');
  hintMessage.textContent = hintText;

  popup.appendChild(hintMessage);
  document.body.appendChild(popup);

  // Close popup when clicking anywhere on the screen
  setTimeout(() => {
      document.addEventListener('click', closeHintPopup, { once: true });
  }, 100);
}

function closeHintPopup() {
  const popup = document.querySelector('.hint-popup');
  if (popup) {
      popup.remove();
  }
}

    // Initialize the game
    initWordGrid();
    initLetterCircle();
  });
  

