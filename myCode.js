var sketchProc = function( processingInstance ){
	with ( processingInstance ){

		/* **********	BEGIN GENERAL NONCUSTOM CODE	********** */

		processingInstance.size(400, 400);
		processingInstance.background(0xFFF);

		var mouseIsPressed = false;
		processingInstance.mousePressed = function () { mouseIsPressed = true; };
		processingInstance.mouseReleased = function () { mouseIsPressed = false; };

		var keyIsPressed = false;
		processingInstance.keyPressed = function () { keyIsPressed = true; };
		processingInstance.keyReleased = function () { keyIsPressed = false; };

		// This function is required to use "getImage"
		function getImage(s) {
			processingInstance.externals.sketch.imageCache.add(s);
			return processingInstance.loadImage(s);
		}
		
		/* **********	BEGIN GENERAL CUSTOM CODE	********** */

		// Global variables
		var NUM_COLS		= 5;
		var NUM_ROWS		= 4;

		// Initialize these in the initializeGame() function
		var flippedTiles;
		var tiles;
		var delayStartFC;		// FC = Frame Count, used with draw
		var numTries;

		// Get images for faces
		var faces = [
			getImage("leafers-seed.png"),
			getImage("leafers-seedling.png"),
			getImage("leafers-sapling.png"),
			getImage("leafers-tree.png"),
			getImage("leafers-ultimate.png"),
			getImage("marcimus.png"),
			getImage("mr-pants.png"),
			getImage("mr-pink.png"),
			getImage("old-spice-man.png"),
			getImage("robot_female_1.png"),
			getImage("piceratops-tree.png"),
			getImage("orange-juice-squid.png")
		];

		/*
		*	Potential values:	0 -	Choose either "Start Game" or "End Game" buttons
		*						1 -	Draw the tiles
		*						2 - Play the game
		*						3 - "End Game" pressed: Game Over message
		*/
		var playGame = 0;

		background(255, 255, 150);

		/* **********	BEGIN SPECIFIC CUSTOM CODE	********** */

		/* ****************************************
		*					BUTTON				  *
		**************************************** */

		// Constructor: set defaults
		var Button = function(buttonConfig) {
			this.x =		buttonConfig.x			|| 0;
			this.y =		buttonConfig.y			|| 0;
			this.width =	buttonConfig.width		|| 130;
			this.height =	buttonConfig.height		|| 40;
			this.label =	buttonConfig.label		|| "New Game";
			this.onClick =	buttonConfig.onClick	|| function() {};
		};

		// Function to draw the button
		Button.prototype.draw = function() {
			fill(0, 0, 0);
			rect(this.x, this.y, this.width, this.height, 5);
			fill(255, 255, 255);
			textSize(19);
			textAlign(LEFT, TOP);
			text(this.label, this.x+20, this.y+this.height/4);
		};

		// Function to check if you've clicked the button
		Button.prototype.isMouseInside = function() {
			return (mouseX >= this.x &&
					mouseX <= (this.x+this.width) &&
					mouseY >= this.y &&
					mouseY <= (this.y+this.height));
		};

		// Function to handle mouse click
		Button.prototype.handleMouseClick = function() {
			if ( this.isMouseInside() ) {
				this.onClick();
			}
		};
		
		// Define button
		var startButton = new Button({
			x:			135,
			y:			100,
			onClick:	function() {
				playGame = 1;
				loop();
			}
		});

		var exitButton = new Button({
			x:			135,
			y:			150,
			label:		"End Game",
			onClick:	function() {
				//document.body.innerHTML = "<h1>GAME OVER !!!</h1>";
				background(255, 255, 150);
				fill(255, 0, 0);
				textSize(36);
				text("GAME OVER !!!", 75, 160);
				playGame = 3;
				noLoop();
			}
		});
		
		/* ****************************************
		*					TILE				  *
		**************************************** */
		
		// Tile constructor function
		var Tile = function(x, y, face) {
			this.x			= x;
			this.y			= y;
			this.face		= face;
			this.width		= 70;
			//this.isMatch	= false;
		};

		// Draw the tile face down
		Tile.prototype.drawFaceDown = function() {
			fill(214, 247, 202);
			strokeWeight(2);
			rect(this.x, this.y, this.width, this.width, 10);
			image(getImage("leaf-green.png"), this.x, this.y, this.width, this.width);
			this.isFaceUp = false;
		};

		// Draw the tile face up
		Tile.prototype.drawFaceUp = function() {
			fill(214, 247, 202);
			strokeWeight(2);
			rect(this.x, this.y, this.width, this.width, 10);
			image(this.face, this.x, this.y, this.width, this.width);
			this.isFaceUp = true;
		};

		// Check to see if the mouse is over a card
		Tile.prototype.isUnderMouse = function(x, y) {
			return ( x >= this.x && x <= this.x + this.width  &&
					 y >= this.y && y <= this.y + this.width );
		};

		// Function to handle mouse click
		Tile.prototype.handleMouseClick = function() {
			
			// Is the mouse over the card?
			if ( this.isUnderMouse(mouseX, mouseY) ) {
				
				// Flip 2 cards as long as they're not face up
				if ( flippedTiles.length < 2  &&  !this.isFaceUp ) {

					// Turn the card over and increment the counter
					this.drawFaceUp();
					flippedTiles.push(this);
						
					// Once you flip 2 cards, get ready to flip them back over
					if ( flippedTiles.length === 2 ) {
						if ( flippedTiles[0].face === flippedTiles[1].face ) {
							flippedTiles[0].isMatch = true;
							flippedTiles[1].isMatch = true;
						}
							
						// Increment global score-keeping variable
						numTries++;
							
						// Set initial frame count
						delayStartFC = frameCount;
							
						// Call draw
						loop();
					}
				}
			}
		};

		// initializeGame: select images from the faces array, 2 of each, and randomize
		var initializeGame = function() {
			// Initialize global variables
			flippedTiles	= [];
			tiles			= [];
			delayStartFC	= null;
			numTries		= 0;
			
			// Local variables
			var possibleFaces = faces.slice(0);
			var selected = [];
			
			// You need half the number of cards for faces.
			for (var i = 0; i < (NUM_COLS * NUM_ROWS) / 2; i++) {
				
				// Randomly pick one from the array of faces
				var randomInd = floor(random(faces.length));
				var face = faces[randomInd];
			
				// Push 2 copies onto array
				selected.push(face);
				selected.push(face);
				
				// Remove from faces array so we don't re-pick
				faces.splice(randomInd, 1);
			}

			// Sort the faces array randomly:
			selected.sort(function() {
				return 0.5 - Math.random();
			});

			// Generate x, y coordinate of the tiles array
			for (var i = 0; i < NUM_COLS; i++) {
				for (var j = 0; j < NUM_ROWS; j++) {
					tiles.push( new Tile(i * 78 + 10, j * 78 + 40, selected.pop()) );
				}
			}
		};

		/* ****************************************
		*				MOUSE CLICK				  *
		**************************************** */

		// Turn over any clicked cards
		mouseClicked = function() {
			
			if ( playGame === 0 ) {
				startButton.handleMouseClick();
				exitButton.handleMouseClick();
			}
			else if ( playGame === 2 ) {
				for (var i = 0; i < tiles.length; i++) {
					tiles[i].handleMouseClick();
				}
			
				// Check that you've found all matches
				var foundAllMatches = true;
				for (var i = 0; i < tiles.length; i++) {
					foundAllMatches = foundAllMatches && tiles[i].isMatch;
				}

				// If all matches found, display the score
				if ( foundAllMatches ) {
					background(255, 255, 150);
					fill(255, 0, 0);
					textSize(24);
					text("Nice job!", 150, 250);
					text("You found them all in " + numTries + " tries.", 50, 300);
						
					// Reset variables
					playGame = 0;
					//tiles = [];
					//loop();
				}
			}
		};

		/* ****************************************
		*				START GAME				  *
		**************************************** */
		draw = function() {
			
			if ( playGame === 0 ) {
				// Draw the start and exit buttons:
				//background(255, 255, 150);
				startButton.draw();
				exitButton.draw();
			} else if ( playGame === 1 ) {
				// Initialize the game
				initializeGame();

				// Draw the tiles
				background(255, 255, 150);

				for (var i = 0; i < tiles.length; i++) {
					tiles[i].drawFaceDown();
				}
				
				// Set variable to play the game
				playGame = 2;
			}
			
			// If you've flipped 2 cards and 2 seconds haven't passed
			if ( delayStartFC  &&  ( frameCount - delayStartFC ) > 60 ) {
					
				// Turn the cards over again
				for (var i = 0; i < tiles.length; i++) {
					if (!tiles[i].isMatch) {
						tiles[i].drawFaceDown();
					}
				}
					
				// Reset counters
				flippedTiles = [];
				delayStartFC = null;
				
				// Don't call draw
				noLoop();
			}
		};

		/* **********	END SPECIFIC CUSTOM CODE	********** */
	}
};
