document.addEventListener('DOMContentLoaded', () => {
  // Function to start the game based on selected difficulty
window.startGame = function (difficulty) {
  console.log("Selected difficulty:", difficulty);

  document.getElementById("difficulty-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.body.style.background = "url('images/wordfinderbackground.webp') no-repeat center center/cover";

  selectedDifficulty = difficulty;
  initWordGrid();
  initLetterCircle();
};


// Function to start the game based on selected difficulty
window.startGame = function (difficulty) {
  console.log("Selected difficulty:", difficulty);

  document.getElementById("difficulty-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.body.style.background = "url('images/wordfinderbackground.webp') no-repeat center center/cover";

  selectedDifficulty = difficulty;
  initWordGrid();
  initLetterCircle();
};


// Function to start the game based on selected difficulty
window.startGame = function (difficulty) {
  console.log("Selected difficulty:", difficulty);

  document.getElementById("difficulty-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.body.style.background = "url('images/wordfinderbackground.webp') no-repeat center center/cover";

  selectedDifficulty = difficulty;
  initWordGrid();
  initLetterCircle();
};
// Function to go back to difficulty selection screen
window.goBack = function () {
  let gameContainer = document.getElementById("game-container");
  let difficultyScreen = document.getElementById("difficulty-screen");

  if (gameContainer && difficultyScreen) {
      gameContainer.style.display = "none"; 
      difficultyScreen.style.display = "flex"; 
  } else {
      console.error("Error: One or more elements not found.");
  }
};


const wordsEasy = {
  "TIGER": [0, 1, 2, 3, 4],
  "TIRE": [6, 7, 8, 9],
  "GET": [12, 13, 14],
  "TIE": [18, 19, 20],
  "TIER": [24, 25, 26, 27],
  "RITE": [30, 31, 32, 33]
};

const wordsMedium = {
    "LEOPARD": [0, 1, 2, 3, 4, 5, 6],
    "ROPE": [7, 8, 9, 10],
    "DROP": [14, 15, 16, 17],
    "PALE": [21, 22, 23, 24],
    "LEAP": [28, 29, 30, 31],
    "DRAPE": [35, 36, 37, 38, 39],
    "ORDEAL": [42, 43, 44, 45, 46, 47]
};

const wordsHard = {
    "ELEPHANT": [0, 1, 2, 3, 4, 5, 6, 7],
    "PLANT": [8, 9, 10, 11, 12],
    "PLANET": [16, 17, 18, 19, 20, 21],
    "PELT": [24, 25, 26, 27],
    "PETAL": [32, 33, 34, 35, 36],
    "EATEN": [40, 41, 42, 43, 44],
    "PATH": [48, 49, 50, 51],
    "PEEL": [56, 57, 58, 59]
};

const lettersEasy = ['T', 'I', 'G', 'E', 'R'];
const lettersMedium = ['L', 'E', 'O', 'P', 'A', 'R', 'D'];
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
      if (selectedDifficulty === 'easy') {
          words = wordsEasy;
          totalCells = 36;  // 5x5 Grid
          gridSize = 6;
      } else if (selectedDifficulty === 'medium') {
          words = wordsMedium;
          totalCells = 49;  // 7x7 Grid
          gridSize = 7;
      } else if (selectedDifficulty === 'hard') {
          words = wordsHard;
          totalCells = 64;  // 8x8 Grid
          gridSize = 8;
      }
  
      wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`;
  
      for (let i = 0; i < totalCells; i++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.dataset.index = i;  // Helps track placement
  
          if (!Object.values(words).flat().includes(i)) {
              cell.style.backgroundColor = 'black';
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
      ctx.strokeStyle = "#00FF00"; // Green color (matches letter border)
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
     * Displays the "Completed!!" popup with options to play again or find more games
     */
    function showCompletionPopup() {
      const popup = document.createElement('div');
      popup.classList.add('completion-popup');
  
      const message = document.createElement('h2');
      message.textContent = "Completed!!";
  
      const playAgainBtn = document.createElement('button');
      playAgainBtn.textContent = "Play Again!";
      playAgainBtn.addEventListener('click', () => {
        window.location.href = "WordScapes.html";
      });
  
      const moreGamesBtn = document.createElement('button');
      moreGamesBtn.textContent = "More Games?";
      moreGamesBtn.addEventListener('click', () => {
        window.location.href = "Games.html";
      });
  
      popup.appendChild(message);
      popup.appendChild(playAgainBtn);
      popup.appendChild(moreGamesBtn);
      document.body.appendChild(popup);
    }
  
    // Event listeners
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
  "TIE": "A formal accessory worn around the neck.",
  "TIER": "A level or a row in a hierarchy.",
  "RITE": "A ceremonial or religious act."
};

const wordHintsMedium = {
  "LEOPARD": "A spotted wild cat found in Africa and Asia.",
  "ROPE": "A strong, thick cord made of fibers.",
  "DROP": "To let something fall.",
  "PALE": "Lighter in color or lacking intensity.",
  "LEAP": "To jump high or far.",
  "DRAPE": "A piece of cloth hanging over something.",
  "ORDEAL": "A difficult or painful experience."
};

const wordHintsHard = {
  "ELEPHANT": "The largest land animal with a trunk.",
  "PLANT": "A living organism that grows in the soil.",
  "PLANET": "A celestial body orbiting a star.",
  "PELT": "The fur or skin of an animal.",
  "PETAL": "A single piece of a flower.",
  "EATEN": "The past tense of consuming food.",
  "PATH": "A track or route to follow.", 
  "PEEL": "To tear something."
};

// Function to provide a hint based on the selected difficulty level
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
      alert(`Hint: ${hints[randomWord]}`);
  } else {
      alert('All words found!');
  }
}

    // Initialize the game
    initWordGrid();
    initLetterCircle();
  });
  