//GLOBAL VARIABLES
let tilePositions = [];  // Array that tracks where each tile belongs.
let gridSize = 3;        // Default grid size is 3×3 (easy).
let moves = 0;           // Tracks the number of moves made by the player.
let gameActive = false;  // Whether the game is currently active or not.
let currentImage = '';

// Images used for each difficulty
const images = [
  'Images/SlidingImages/sliding_bali.png',
  'Images/SlidingImages/sliding_tiger.png',
  'Images/SlidingImages/sliding_rhino.png',
  'Images/SlidingImages/sliding_anoa.png',
  'Images/SlidingImages/sliding_tarsius.png',
  'Images/SlidingImages/sliding_gibbon.png',
  'Images/SlidingImages/sliding_celebes.png',
  'Images/SlidingImages/sliding_orangutan.png',
  'Images/SlidingImages/sliding_bekantan.png'
];

//Initializes the puzzle for the selected difficulty.
function startGame(difficulty) {
  document.body.style.background = "url('Images/SlidingImages/Sliding_background.png') ";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundAttachment = "fixed"; 
  // Hide the difficulty screen and show the puzzle UI
  document.getElementById('difficulty-container').style.display = 'none';
  document.getElementById('difficulty-screen').style.display = 'none';
  document.getElementById('main-game-container').style.display = 'flex';
  document.getElementById('game-container').style.display = 'block';
  document.getElementById('puzzle-container').style.display = 'block';
  const puzzleContainer = document.getElementById('puzzle-container');
  puzzleContainer.style.display = 'grid';
  
  // Randomly select an image from the array
  const randomIndex = Math.floor(Math.random() * images.length);
  currentImage = images[randomIndex];  // Store the randomly selected image

  // Update the reference image in the DOM
  const referenceImgElement = document.getElementById("reference-img");
  referenceImgElement.src = currentImage;

  referenceImgElement.className = `reference-img ${difficulty}`;
  const referenceContainer = document.getElementById("reference-container");
  referenceContainer.className = `reference-container ${difficulty}`;


  // Clear any existing puzzle tiles
  puzzleContainer.innerHTML = '';

  // Add class to puzzleContainer for correct grid layout (easy, medium, hard)
  puzzleContainer.className = `puzzle-container ${difficulty}`;

  // Decide the grid size for the chosen difficulty
  switch (difficulty) {
    case 'easy':
      gridSize = 3;
      break;
    case 'medium':
      gridSize = 4;
      break;
    case 'hard':
      gridSize = 5;
      break;
  }

  // Build the array of tile positions. Example: for 3×3 => [0,1,2,3,4,5,6,7,null]
  const totalTiles = gridSize * gridSize;
  tilePositions = [];
  for (let i = 0; i < totalTiles - 1; i++) {
    tilePositions.push(i);
  }
  tilePositions.push(null); // The empty space

  // Shuffle the positions to create a solvable puzzle
  tilePositions = shuffleArray(tilePositions);
  while (!isSolvable(tilePositions, gridSize)) {
    swapAnyTwoNonBlankTiles(tilePositions);}

  // Reset move counter
  moves = 0;
  document.getElementById('move-count').innerText = moves;

  // Create the tiles in the DOM according to shuffled tilePositions
  tilePositions.forEach((tileValue, index) => {
    const tileElement = document.createElement('div');
    tileElement.classList.add('tile', difficulty);

    if (tileValue !== null) {
      // Calculate the row and column of this tile in the *solved* state
      const row = Math.floor(tileValue / gridSize);
      const col = tileValue % gridSize;

      // Each puzzle is 300×300 overall, so each tile is a slice of that 300×300 image
      tileElement.style.backgroundImage = `url('${currentImage}')`;
      tileElement.style.backgroundSize = '300px 300px';  
      tileElement.style.backgroundPosition = `-${col * (300 / gridSize)}px -${row * (300 / gridSize)}px`;

      // Optionally, show tile numbers (uncomment if want numeric labels)
      // tileElement.textContent = tileValue + 1;
    } else {
      // Null => empty tile
      tileElement.classList.add('empty');
    }

    // Add click event to attempt moving this tile
    tileElement.addEventListener('click', () => moveTile(index, gridSize));
    puzzleContainer.appendChild(tileElement);
  });

  // Mark the game as active
  gameActive = true;
  // After the forEach that creates & appends tiles:
  updatePuzzleUI();

}

//Attempts to move the clicked tile if it is adjacent to the empty tile. If moved, increments `moves` and checks win.
function moveTile(tileIndex, gridSize) {
  if (!gameActive) return;

  // Find where the empty tile is
  const emptyIndex = tilePositions.indexOf(null);

  // If the clicked tile is not adjacent, do nothing
  if (!isAdjacent(tileIndex, emptyIndex, gridSize)) return;

  // Swap the tile with the empty tile
  [tilePositions[tileIndex], tilePositions[emptyIndex]] = [tilePositions[emptyIndex], tilePositions[tileIndex]];

  // Increment moves and update display
  moves++;
  document.getElementById('move-count').innerText = moves;

  // Re-render puzzle to reflect the new positions
  updatePuzzleUI();

  // Check if the puzzle is solved
  if (checkWin()) {
    showFinalScore();
  }
}

//Helper to determine if two positions in tilePositions are adjacent in a grid (above, below, left, or right).
function isAdjacent(index1, index2, gridSize) {
  // If indexes are the same, can't be adjacent
  if (index1 === index2) return false;

  // Calculate row/col for each index
  const row1 = Math.floor(index1 / gridSize);
  const col1 = index1 % gridSize;
  const row2 = Math.floor(index2 / gridSize);
  const col2 = index2 % gridSize;

  // Manhattan distance = 1 => adjacent
  const distance = Math.abs(row1 - row2) + Math.abs(col1 - col2);
  return distance === 1;
}

//Re-applies the correct background positions and empty tile to each .tile element based on tilePositions[].
function updatePuzzleUI() {
  const puzzleContainer = document.getElementById('puzzle-container');
  const tileElements = puzzleContainer.querySelectorAll('.tile');

  // Loop through each tile and reset its background based on tilePositions
  tilePositions.forEach((tileValue, index) => {
    const tileElement = tileElements[index];

    // Clear any "empty" classes or text
    tileElement.classList.remove('empty');
    tileElement.textContent = '';

    if (tileValue !== null) {
      // The puzzle's difficulty is already in tileElement.classList
      const difficulty = tileElement.classList.contains('easy')
        ? 'easy'
        : tileElement.classList.contains('medium')
        ? 'medium'
        : 'hard';

      const row = Math.floor(tileValue / gridSize);
      const col = tileValue % gridSize;
      tileElement.style.backgroundImage = `url('${currentImage}')`;
      // Decide which “backgroundDimension” to use:
      let backgroundDimension;
      if (difficulty === 'easy') {
        backgroundDimension = 300;   // 3×3 => each tile is 100 px
      } else if (difficulty === 'medium') {
        backgroundDimension = 400;   // 4×4 => each tile is 100 px
      } else { // hard
        backgroundDimension = 500;   // 5×5 => each tile is 100 px
      }

      // Then apply it:
      tileElement.style.backgroundSize = `${backgroundDimension}px ${backgroundDimension}px`;
      tileElement.style.backgroundPosition = `-${col * (backgroundDimension / gridSize)}px -${row * (backgroundDimension / gridSize)}px`;

      // Optionally, label with number:
      // tileElement.textContent = tileValue + 1;
    } else {
      tileElement.classList.add('empty');
      tileElement.style.backgroundImage = 'none';
    }
  });
}

//Returns true if tilePositions is in the solved state: [0,1,2,3,..., totalTiles-2, null]
function checkWin() {
  // The last slot is null, so compare all others
  for (let i = 0; i < tilePositions.length - 1; i++) {
    if (tilePositions[i] !== i) {
      return false;
    }
  }
  return true;
}

//Displays the final score popup and sets the score text
function showFinalScore() {
  gameActive = false; // Stop moves

  // Get the difficulty class from puzzle container
  let difficulty = "";
  const puzzleContainer = document.getElementById("puzzle-container");
  if (puzzleContainer.classList.contains("easy")) {
      difficulty = "easy";
  } else if (puzzleContainer.classList.contains("medium")) {
      difficulty = "medium";
  } else if (puzzleContainer.classList.contains("hard")) {
      difficulty = "hard";
  }

  // Assign points based on difficulty
  let points = 0;
  if (difficulty === "easy") {
      points = 10;
  } else if (difficulty === "medium") {
      points = 20;
  } else if (difficulty === "hard") {
      points = 30;
  }

  document.getElementById('final-score-value').innerText = moves;
  document.getElementById("final-points-value").innerText = points;
  document.getElementById("game-container").style.display = "none"; // Hide game
  document.getElementById('final-score-container').style.display = 'block';
  document.getElementById("puzzle-container").style.display = "none";
  document.getElementById('main-game-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'none';
}

function goBack() {
  document.body.style.background = "url('Images/SlidingImages/Sliding_backg.png)";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundAttachment = "fixed";
  document.getElementById("difficulty-screen").style.display = "flex";
  document.getElementById('difficulty-container').style.display = 'flex';
  document.getElementById("puzzle-container").style.display = "none";
  document.getElementById('main-game-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'none';
}

//Hides the final score and re-displays the difficulty screen.(Or could directly call startGame('easy') etc.)
function restartGame() {
  score = 0;
  document.body.style.background = "url('Images/SlidingImages/Sliding_backg.png') ";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundAttachment = "fixed";
  // Hide puzzle and final score container
  document.getElementById('final-score-container').style.display = 'none';
  document.getElementById('puzzle-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('main-game-container').style.display = 'none';

  // Show difficulty screen again
  document.getElementById('difficulty-screen').style.display = 'flex';
  document.getElementById('difficulty-container').style.display = 'flex';
}

//Similar to restart, but "More Games" might do something else
function cancelGame() {
  window.location.href = "Games.html"; 
}

function quitGame() {
  // Check if the game is in progress by checking the visibility of the game container
  const gameContainer = document.getElementById('main-game-container');
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

//Fisher-Yates shuffle for array randomization.
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


function isSolvable(tiles, gridSize) {
  let blankRow = 0; 
  const arr = [];

  // Identify blank tile's row index & build a list of non-blank tiles
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === null) {
      blankRow = Math.floor(i / gridSize);
    } else {
      arr.push(tiles[i]);
    }
  }

  // Count inversions
  let inversionCount = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        inversionCount++;
      }
    }
  }

  // Solvability rules differ for odd vs. even grid sizes
  if (gridSize % 2 !== 0) {
    // Odd grid => solvable if inversionCount is even
    return (inversionCount % 2 === 0);
  } else {
    // Even grid => consider the row of the blank (from bottom)
    const blankRowFromBottom = gridSize - blankRow; 
    const isBlankOnOddRowFromBottom = (blankRowFromBottom % 2 !== 0);
    const isInversionCountEven = (inversionCount % 2 === 0);
    // If blank is on an odd row from bottom, puzzle is solvable if inversions are even
    // If blank is on an even row from bottom, puzzle is solvable if inversions are odd
    return isBlankOnOddRowFromBottom === isInversionCountEven;
  }
}

//Swaps any two non-blank tiles (0 is blank), to flip the inversion parity.
function swapAnyTwoNonBlankTiles(tiles) {
  let idx1 = -1;
  let idx2 = -1;

  // find first non-blank tile
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] !== 0) {
      idx1 = i;
      break;
    }
  }
  // find second non-blank tile
  for (let i = tiles.length - 1; i >= 0; i--) {
    if (tiles[i] !== 0) {
      idx2 = i;
      break;
    }
  }

  if (idx1 !== -1 && idx2 !== -1 && idx1 !== idx2) {
    // swap the two
    [tiles[idx1], tiles[idx2]] = [tiles[idx2], tiles[idx1]];
  }
}

