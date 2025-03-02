    let currentDifficulty = null;

        function startGame(difficulty) {
        currentDifficulty = difficulty;
        const container = document.getElementById("game-container");
        const canvas = document.getElementById("puzzleCanvas");
        const img = document.getElementById("sourceImage");
    
        // Set different images for different difficulty levels
        if (difficulty === 'easy') {
            container.style.width = "420px";
            canvas.width = 400;
            canvas.height = 400;
            img.src = "Images/jigsaw_easy.png";  // Set Easy image
            canvas.style.backgroundImage = "url('Images/easy_background.jpg')";
        } else if (difficulty === 'medium') {
            container.style.width = "520px";
            canvas.width = 500;
            canvas.height = 500;
            img.src = "Images/jigsaw_medium.png"; // Set Medium image
            canvas.style.backgroundImage = "url('Images/medium_background.jpg')";
        } else if (difficulty === 'hard') {
            container.style.width = "620px";
            canvas.width = 600;
            canvas.height = 600;
            img.src = "Images/jigsaw_hard.png"; // Set Hard image
            canvas.style.backgroundImage = "url('Images/hard_background.jpg')";
        }
    
        document.getElementById("difficulty-screen").style.display = "none";
        container.style.display = "block";
        initJigsawGame();
    }
    


        function initJigsawGame() {
        const canvas = document.getElementById("puzzleCanvas");
        const ctx = canvas.getContext("2d");
        const img = document.getElementById("sourceImage");

        // Set grid dimensions based on difficulty
        let rows, cols;
        if (currentDifficulty === 'easy') {
            rows = 3;
            cols = 3;
        } else if (currentDifficulty === 'medium') {
            rows = 4;
            cols = 4;
        } else if (currentDifficulty === 'hard') {
            rows = 5;
            cols = 6;
        }
        
        const pieceWidth = canvas.width / cols;
        const pieceHeight = canvas.height / rows;

        let pieces = [], selectedPiece = null, offsetX, offsetY;

        img.onload = function() {
            createPieces();
            shufflePieces();
            drawPieces();

            canvas.addEventListener("mousedown", onMouseDown);
            canvas.addEventListener("mousemove", onMouseMove);
            canvas.addEventListener("mouseup", onMouseUp);
        };

        if (img.complete) {
            img.onload();
        }

        function createPieces() {
            pieces = [];
            for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const piece = {
                sx: x * (img.width / cols),
                sy: y * (img.height / rows),
                x: Math.random() * (canvas.width - pieceWidth),
                y: Math.random() * (canvas.height - pieceHeight),
                width: pieceWidth,
                height: pieceHeight,
                row: y,
                col: x,
                correct: false,
                edges: {
                    top: y === 0 ? null : null,
                    right: x === cols - 1 ? null : false, 
                    bottom: y === rows - 1 ? null : false,
                    left: x === 0 ? null : null
                }
                };
                if (y > 0) {
                const pieceAbove = pieces[(y - 1) * cols + x];
                piece.edges.top = !pieceAbove.edges.bottom;
                }
                if (x > 0) {
                const pieceLeft = pieces[y * cols + (x - 1)];
                piece.edges.left = !pieceLeft.edges.right;
                }
                if (x < cols - 1) {
                piece.edges.right = ((x + y) % 2 === 0);
                }
                if (y < rows - 1) {
                piece.edges.bottom = ((x + y) % 2 === 0);
                }
                pieces.push(piece);
            }
            }
        }

        function shufflePieces() {
            pieces.sort(() => Math.random() - 0.5);
        }

        function drawPieces() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(piece => drawPiece(piece));
        }

        function drawPiece(piece) {
            ctx.save();
            ctx.beginPath();
            drawJigsawShape(ctx, piece.x, piece.y, piece.width, piece.height, piece.edges);
            ctx.clip();

            const expansion = piece.width * 0.25;
            const sourceX = piece.sx - expansion;
            const sourceY = piece.sy - expansion;
            const sourceWidth = (img.width / cols) + 2 * expansion;
            const sourceHeight = (img.height / rows) + 2 * expansion;

            ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            piece.x - expansion, piece.y - expansion,
            piece.width + 2 * expansion, piece.height + 2 * expansion
            );

            ctx.restore();
            ctx.stroke();
        }

        function drawJigsawShape(ctx, x, y, w, h, edges) {
            const size = Math.min(w, h) / 4;
            ctx.moveTo(x, y);
            // top edge
            if (edges.top === null) {
            ctx.lineTo(x + w, y);
            } else {
            const mid = x + w / 2;
            ctx.lineTo(mid - size, y);
            ctx.bezierCurveTo(
                mid - size / 2,
                y - (edges.top ? size : -size),
                mid + size / 2,
                y - (edges.top ? size : -size),
                mid + size,
                y
            );
            ctx.lineTo(x + w, y);
            }
            // right edge
            if (edges.right === null) {
            ctx.lineTo(x + w, y + h);
            } else {
            const mid = y + h / 2;
            ctx.lineTo(x + w, mid - size);
            ctx.bezierCurveTo(
                x + w + (edges.right ? size : -size),
                mid - size / 2,
                x + w + (edges.right ? size : -size),
                mid + size / 2,
                x + w,
                mid + size
            );
            ctx.lineTo(x + w, y + h);
            }
            // bottom edge
            if (edges.bottom === null) {
            ctx.lineTo(x, y + h);
            } else {
            const mid = x + w / 2;
            ctx.lineTo(mid + size, y + h);
            ctx.bezierCurveTo(
                mid + size / 2,
                y + h + (edges.bottom ? size : -size),
                mid - size / 2,
                y + h + (edges.bottom ? size : -size),
                mid - size,
                y + h
            );
            ctx.lineTo(x, y + h);
            }
            // left edge
            if (edges.left === null) {
            ctx.lineTo(x, y);
            } else {
            const mid = y + h / 2;
            ctx.lineTo(x, mid + size);
            ctx.bezierCurveTo(
                x - (edges.left ? size : -size),
                mid + size / 2,
                x - (edges.left ? size : -size),
                mid - size / 2,
                x,
                mid - size
            );
            ctx.lineTo(x, y);
            }
            ctx.closePath();
        }

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
            };
        }

        function getPieceAt(pos) {
            return pieces.find(piece =>
            !piece.correct &&
            pos.x > piece.x &&
            pos.x < piece.x + piece.width &&
            pos.y > piece.y &&
            pos.y < piece.y + piece.height
            );
        }

        function onMouseDown(e) {
            const pos = getMousePos(e);
            selectedPiece = getPieceAt(pos);
            if (selectedPiece) {
            offsetX = pos.x - selectedPiece.x;
            offsetY = pos.y - selectedPiece.y;
            pieces.splice(pieces.indexOf(selectedPiece), 1);
            pieces.push(selectedPiece);
            }
        }

        function onMouseMove(e) {
            if (!selectedPiece) return;
            const pos = getMousePos(e);
            selectedPiece.x = pos.x - offsetX;
            selectedPiece.y = pos.y - offsetY;
            // Keep piece within canvas
            selectedPiece.x = Math.max(0, Math.min(selectedPiece.x, canvas.width - selectedPiece.width));
            selectedPiece.y = Math.max(0, Math.min(selectedPiece.y, canvas.height - selectedPiece.height));
            drawPieces();
        }

        function onMouseUp() {
            if (!selectedPiece) return;
            const correctX = selectedPiece.col * pieceWidth;
            const correctY = selectedPiece.row * pieceHeight;
            const dx = selectedPiece.x - correctX;
            const dy = selectedPiece.y - correctY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 20) {
            selectedPiece.x = correctX;
            selectedPiece.y = correctY;
            selectedPiece.correct = true;
            highlightPiece(selectedPiece);
            } else {
            selectedPiece.correct = false;
            }
            drawPieces();
            checkPuzzleComplete();
            selectedPiece = null;
        }

        function highlightPiece(piece) {
            let shineAlpha = 1.0;
            const shineInterval = setInterval(() => {
            drawPieces();
            ctx.save();
            ctx.globalAlpha = shineAlpha;
            ctx.strokeStyle = "lightgreen";
            ctx.lineWidth = 4;
            ctx.beginPath();
            drawJigsawShape(ctx, piece.x, piece.y, piece.width, piece.height, piece.edges);
            ctx.stroke();
            ctx.restore();
            shineAlpha -= 0.05;
            if (shineAlpha <= 0) {
                clearInterval(shineInterval);
                drawPieces();
            }
            }, 50);
        }

        function checkPuzzleComplete() {
            const allCorrect = pieces.every(piece => piece.correct);
            if (allCorrect) {
                alert("Puzzle Completed!"); // First popup
                
                // Determine the score based on difficulty
                let score = 0;
                if (currentDifficulty === 'easy') {
                    score = 5;
                } else if (currentDifficulty === 'medium') {
                    score = 10;
                } else if (currentDifficulty === 'hard') {
                    score = 20;
                }
                

                // Create the second popup dynamically
                const popup = document.createElement("div");
                popup.id = "completionPopup";
                popup.style.position = "fixed";
                popup.style.top = "50%";
                popup.style.left = "50%";
                popup.style.transform = "translate(-50%, -50%)";
                popup.style.background = "linear-gradient(135deg, #ffb6c1, #e2f0cb)"; // Softer pink with a muted pastel green
                popup.style.padding = "20px";
                popup.style.border = "2px solid #c27ba0"; // Elegant rose-pink border
                popup.style.boxShadow = "0px 4px 15px rgba(0,0,0,0.3)";
                popup.style.textAlign = "center";
                popup.style.zIndex = "1000";
                popup.style.borderRadius = "12px";
                popup.style.fontFamily = "'Times New Roman', serif";
                popup.style.color = "#80314d"; // Deep mauve-pink text
                popup.style.background = "linear-gradient(135deg, #ffb6c1, #e2f0cb)"; // Soft pink & pastel green
                popup.style.border = "2px solid #c27ba0"; // Elegant rose-pink border
                popup.style.color = "#80314d"; // Deep mauve-pink text
                popup.style.animation = "whiteShine 2s infinite alternate ease-in-out";

        
                // Message
                const message = document.createElement("p");
                message.textContent = "Congratulations!";
                message.style.fontSize = "18px";
                message.style.fontWeight = "bold";
                popup.appendChild(message);
        
                // Score display
                const scoreText = document.createElement("p");
                scoreText.textContent = `Your Score: ${score}`;
                scoreText.style.fontSize = "16px";
                scoreText.style.fontWeight = "bold";
                scoreText.style.color = "black";
                popup.appendChild(scoreText);
        
                // Restart button (Redirects to Difficulty Selection)
                const restartButton = document.createElement("button");
                restartButton.textContent = "Restart";
                restartButton.style.margin = "10px";
                restartButton.style.padding = "8px 16px";
                restartButton.style.fontSize = "14px";
                restartButton.style.cursor = "pointer";
                restartButton.style.border = "none";
                restartButton.style.background = "#4A9F6E";
                restartButton.style.color = "white";
                restartButton.style.borderRadius = "5px";
                restartButton.style.transition = "all 0.4s ease-in-out";
                restartButton.style.fontFamily = "'Times New Roman', serif";
                restartButton.onmouseover = function() {
                    restartButton.style.background = "linear-gradient(135deg, #4A9F6E, #5FB98A)"; // Shiny glow effect
                    restartButton.style.boxShadow = "0px 0px 12px rgba(74, 159, 110, 0.8)";
                };
                restartButton.onmouseout = function() {
                    restartButton.style.background = "#4A9F6E"; // Reset to original
                    restartButton.style.boxShadow = "none";
                };
                restartButton.onclick = () => {
                    document.body.removeChild(popup);
                    document.getElementById("game-container").style.display = "none";
                    document.getElementById("difficulty-screen").style.display = "flex";
                };
                popup.appendChild(restartButton);
        
                // Play More Games button (Redirects to "Games.html")
                const playMoreButton = document.createElement("button");
                playMoreButton.textContent = "Play More Games";
                playMoreButton.style.margin = "10px";
                playMoreButton.style.padding = "8px 16px";
                playMoreButton.style.fontSize = "14px";
                playMoreButton.style.cursor = "pointer";
                playMoreButton.style.border = "none";
                playMoreButton.style.background = "#D95A78";
                playMoreButton.style.color = "white";
                playMoreButton.style.borderRadius = "5px";
                playMoreButton.style.transition = "all 0.4s ease-in-out";
                playMoreButton.style.fontFamily = "'Times New Roman', serif";
                playMoreButton.onmouseover = function() {
                    playMoreButton.style.background = "linear-gradient(135deg, #ff6f91, #d81b60)"; // Shiny glow effect
                    playMoreButton.style.boxShadow = "0px 0px 12px rgba(216, 27, 96, 0.8)";
                };
                playMoreButton.onmouseout = function() {
                    playMoreButton.style.background = "#D95A78"; // Reset to original
                    playMoreButton.style.boxShadow = "none";
                };
                playMoreButton.onclick = () => {
                    window.location.href = "Games.html";
                };
                popup.appendChild(playMoreButton);
        
                // Append the popup to the document
                document.body.appendChild(popup);    
            }
        }

        // Hide toggle
        const toggleCheckbox = document.getElementById("toggleBackgroundCheckbox");
        const toggleLabel = document.getElementById("toggleLabel");
        toggleCheckbox.addEventListener("change", () => {
            if (toggleCheckbox.checked) {
                if (currentDifficulty === 'easy') {
                    canvas.style.backgroundImage = "url('Images/jigsaw_easy.png')";
                } else if (currentDifficulty === 'medium') {
                    canvas.style.backgroundImage = "url('Images/jigsaw_medium.png')";
                } else if (currentDifficulty === 'hard') {
                    canvas.style.backgroundImage = "url('Images/jigsaw_hard.png')";
                }
                toggleLabel.textContent = "Hide: On";
            } else {
                canvas.style.backgroundImage = "none";
                toggleLabel.textContent = "Hide: Off";
            }
        });
        }

        function exitGame() {
        if (confirm("Are you sure you want to quit the game? Your progress will be lost.")) {
            document.getElementById("game-container").style.display = "none";
            document.getElementById("difficulty-screen").style.display = "flex";
        }
        }
