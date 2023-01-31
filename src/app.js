
const resetButton = document.querySelector(".game__resetButton");
console.log(resetButton);
let canvas;
let context; 
let gameBoardArrayHeight = 20;
let gameBoardArrayWidth = 12; 
let currentShapeX = 4; 
let currentShapeY = 0; 
let score = 0;
let coordinateArray = [...Array(gameBoardArrayHeight)].map(e => Array(gameBoardArrayWidth).fill(0))
let currentShape = [[1,0], [0, 1], [1,1], [2, 1]]
let isGameOver = false; 

//Object to track the current direction the block is moving
const possibleDirections = {
    idle: 0, 
    down: 1, 
    left: 2, 
    right: 3, 
}

let currentDirection = possibleDirections.idle;

//Initialise variable
const shapesArray = [[[1,0], [0,1], [1,1], [2,1]], [[0,0], [1,0], [2,0], [3,0]],[[0,0], [0,1], [1,1], [2,1]], [[0,0], [1,0], [0,1], [1,1]],[[2,0], [0,1], [1,1], [2,1]], [[1,0], [2,0], [0,1], [1,1]], [[0,0], [1,0], [1,1], [2,1]] ];


//Put in order of corresponding colour to the index of the shapes array, so each shape belongs to the same index of it's mathcing colour. 
let shapeColours = ["purple","cyan","orange", "yellow", "blue", "green", "red" ]


let currentShapeColour; 
let stoppedShapeArray = [...Array(20)].map(e => Array(12).fill(0));
 
let gameBoardArray = [...Array(gameBoardArrayHeight)].map(e => Array(gameBoardArrayWidth).fill(0))
let directions = {
    idle: 0,
    down: 1, 
    left: 2, 
    right: 3, 

};
let direction; 


//Made of coords, x,y that matches with coord array to matchup with where we want to draw each shape
class Coordinates {
    constructor(x,y){
        this.x = x;
        this.y = y; 
    }
}



const createCoordinateArray = () => {
    let i = 0, j = 0;
    //increments down array
    for(let y=9; y <= maxHeightOfScreen; y+= sizeOfEachBlock){
        //increments left to right
        for(let x=11; x <= maxWidthOfScreen;x+= 23){
            coordinateArray[i][j] = new Coordinates(x,y)
            i++;

        }
        j++; 
        i=0; 
    }

}

const setupCanvas = () => {
    canvas = document.getElementById("game-canvas");
    context = canvas.getContext('2d');
    canvas.width = 592;
    canvas.height = 956;

    context.scale(2,2);

    context.fillStyle = "lightgray";
    context.fillRect(0,0, canvas.width, canvas.height);

    context.strokeStyle = "black";
    context.strokeRect(8, 8, 280, 462);
    startGame(); 


}


const startGame = () => {
    //Deletes shape so if it's a restart, it deleted any current shape
    deleteShape(); 
    createShape();
    setupCoordinateArray(); 
    drawShape(); 
}


const createShape = () => {
    let randomSelector = Math.floor(Math.random() * shapesArray.length);
    currentShape = shapesArray[randomSelector];
    currentShapeColour = shapeColours[randomSelector];
}


const setupCoordinateArray = () => {
    let i = 0, j = 0;
    for(let y = 9; y <= 446; y += 23){
        // 12 * 23 = 276 - 12 = 264 Max X value
        for(let x = 11; x <= 264; x += 23){
            coordinateArray[i][j] = new Coordinates(x,y);
            i++;
        }
        j++;
        i = 0;
    }
}

const drawShape = () => {
    for (let index = 0; index < currentShape.length; index++) {
        
        let x = currentShape[index][0] + currentShapeX;
        let y = currentShape[index][1] + currentShapeY;

        gameBoardArray[x][y] = 1;

        let coordX = coordinateArray[x][y].x; 
        let coordY = coordinateArray[x][y].y; 

        context.fillStyle = currentShapeColour; 
        context.fillRect(coordX, coordY, 21, 21);
        
    }
}

const isCollidingWall = () => {
    for (let index = 0; index < currentShape.length; index++) {
        //Checks X position for each square in the current shape
        let newShapeX = currentShape[index][0] + currentShapeX;
        let newShapeY = currentShape[index][1] + currentShapeY; 
        console.log(newShapeX, newShapeY);
        if((newShapeX <= 0 || typeof(stoppedShapeArray[newShapeX-1][newShapeY]) === 'string')&& currentDirection === possibleDirections.left){
            console.log("Hitting wall");
            return true;
        } else if((newShapeX >= 11 || typeof(stoppedShapeArray[newShapeX+1][newShapeY]) === 'string') && currentDirection === possibleDirections.right){
            console.log("Hitting wall");
            return true;
        }  
    }
    return false; 
    
}

const isCollidingDown = () => {
    let shapeCopy = currentShape; 
    let collision = false;

    for (let index = 0; index < shapeCopy.length; index++) {
        const square = shapeCopy[index];
        let newShapeX = square[0] + currentShapeX; 
        let newShapeY = square[1] + currentShapeY; 
        if(currentDirection === directions.down){
            newShapeY++; 
        }
        if(typeof stoppedShapeArray[newShapeX][newShapeY] === 'string'){
            collision = true; 
            break;
        }
        else if (newShapeY >= 20){
            collision = true;
            break;
        }    
    }
    if(collision){
        console.log("Collision down");
        if(hasUserLost(currentShapeY)){
            winOrLose = "Game Over";
            alert("Game over")
            handleButtonPress();
        }
        else {
            for(let i = 0; i < shapeCopy.length; i++){
                let square = shapeCopy[i];
                let x = square[0] + currentShapeX;
                let y = square[1] + currentShapeY;
                // Add the current Tetromino color
                stoppedShapeArray[x][y] = currentShapeColour;
            }
            createShape(); 
            currentDirection = directions.idle; 
            currentShapeX = 4;
            currentShapeY = 0; 
            drawShape(); 
        }

    }


}


const hasUserLost = (yCoordinate) => {
    if(yCoordinate <= 2){
        return true; 
    }
    return false; 
}

const MoveTetrominoDown = () => {
    currentDirection = directions.down;
 
    //Check for a vertical collision, either with floor or the wall
    if(!isCollidingDown()){
        deleteShape();
        currentShapeY++;
        drawShape();
    }
}


const handleKeyPress = (event) => {
    if(!isGameOver){
        switch(event.keyCode){

            case 65:
                console.log("A");
                currentDirection = possibleDirections.left;
                if(!isCollidingWall()){
                    deleteShape(); 
                    currentShapeX--;
                    drawShape(); 
                }
              
                //Move left
                //Can you move left? 
                //If yes then move the current shape, delete old position and redraw
                break;
            case 68:
                console.log("D");
                currentDirection = possibleDirections.right;
                if(!isCollidingWall()){
                    deleteShape();
                    currentShapeX++;
                    drawShape(); 
                }
                
                //Move right
                break;
            case 83:
                console.log("S");
                MoveTetrominoDown();
                //Move down
                break;

            case 87:
                console.log("W");
                //Rotate block
                break;

        }
    }
}




const deleteShape = () => {
    //Fills current shape with gray to remove it from the canvas. 
    for (let index = 0; index < currentShape.length; index++) {
        
        let x = currentShape[index][0] + currentShapeX;
        let y = currentShape[index][1] + currentShapeY;

        gameBoardArray[x][y] = 1;

        let coordX = coordinateArray[x][y].x; 
        let coordY = coordinateArray[x][y].y; 

        context.fillStyle = "lightgray"; 
        context.fillRect(coordX, coordY, 21, 21);
        
    }
}

const handleButtonPress = () => {
    deleteShape(); 
    currentShapeX = 4; 
    currentShapeY = 0; 
    //Reset arrays and current shape
    
    gameBoardArray = [...Array(gameBoardArrayHeight)].map(e => Array(gameBoardArrayWidth).fill(0))
    coordinateArray = [...Array(gameBoardArrayHeight)].map(e => Array(gameBoardArrayWidth).fill(0))
    stoppedShapeArray = [...Array(20)].map(e => Array(12).fill(0));
    setupCanvas();
    startGame(); 
}

resetButton.addEventListener('click', handleButtonPress)
document.addEventListener('keydown', handleKeyPress);

document.addEventListener('DOMContentLoaded', setupCanvas)