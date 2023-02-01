
const resetButton = document.querySelector(".game__resetButton");
const pageScore = document.querySelector("#score"); 
const pageLevel = document.querySelector("#level")
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



const setupCanvas = () => {
    canvas = document.getElementById("game-canvas");
    context = canvas.getContext('2d');
    canvas.width = 592;
    canvas.height = 956;
    context.scale(2,2);
    context.fillStyle = "black";
    context.fillRect(0,0, canvas.width, canvas.height);
    context.strokeStyle = "#181819";
    for (let index = 0; index < gameBoardArrayWidth+1; index++) {
        context.strokeRect(index*23+9.5,8, 1, 459);
        
    }
   
    for (let i = 0; i < gameBoardArrayHeight+1; i++) {
        
        context.strokeRect(10,i*23+7.5, 276, 1);
        
    }
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

const isCollidingWall = (shape, shapeXCoordinate, shapeYCoordinate) => {
    for (let index = 0; index < shape.length; index++) {
        //Checks X position for each square in the current shape
        let newShapeX = shape[index][0] + shapeXCoordinate;
        let newShapeY = shape[index][1] + shapeYCoordinate; 
        if((newShapeX <= 0 || typeof(stoppedShapeArray[newShapeX-1][newShapeY]) === 'string')&& currentDirection === possibleDirections.left){

            return true;
        } else if((newShapeX >= 11 || typeof(stoppedShapeArray[newShapeX+1][newShapeY]) === 'string') && currentDirection === possibleDirections.right){
            return true;
        }  
    }
    return false; 
    
}

const isCollidingDown = (shape, shapeXCoordinate, shapeYCoordinate) => {
    let shapeCopy = shape; 

    for (let index = 0; index < shapeCopy.length; index++) {
        const square = shapeCopy[index];
        let newShapeX = square[0] + shapeXCoordinate; 
        let newShapeY = square[1] + shapeYCoordinate; 

        if(currentDirection === directions.down){
            newShapeY++; 
        }
        if(typeof stoppedShapeArray[newShapeX][newShapeY] === 'string'){
            handleCollisionDown(currentShapeX, currentShapeY, shapeCopy); 
            return true; 
        }
        else if (newShapeY >= 20){
            handleCollisionDown(currentShapeX, currentShapeY, shapeCopy); 
            return true; 
        }    
    }
    return false;
}

const handleCollisionDown = (shapeXCoordinate, shapeYCoordinate, newShape) => {
    //Has the user lost?
    if(hasUserLost(shapeYCoordinate)){
        winOrLose = "Game Over";
        alert("Game over")
        handleButtonPress();
    }
    //If not, stop draw the shape, and continue playing.
    else {
        for(let index = 0; index < newShape.length; index++){
            let square = newShape[index];
            let x = square[0] + shapeXCoordinate;
            let y = square[1] + shapeYCoordinate;
                // Add the current Tetromino color
                stoppedShapeArray[x][y] = currentShapeColour;
            }
        checkAndClearRows();
        createShape(); 
        currentDirection = directions.idle; 
        currentShapeX = 4;
        currentShapeY = 0; 
        drawShape(); 
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
    if(!isCollidingDown(currentShape, currentShapeX, currentShapeY)){
        deleteShape();
        currentShapeY++;
        drawShape();
    }
}


const handleKeyPress = (event) => {
    if(!isGameOver){
        switch(event.keyCode){

            case 37:
                currentDirection = possibleDirections.left;
                if(!isCollidingWall(currentShape, currentShapeX, currentShapeY)){
                    deleteShape(); 
                    currentShapeX--;
                    drawShape(); 
                }
              
                //Move left
                //Can you move left? 
                //If yes then move the current shape, delete old position and redraw
                break;

            case 39:
              
                currentDirection = possibleDirections.right;
                if(!isCollidingWall(currentShape, currentShapeX, currentShapeY)){
                    deleteShape();
                    currentShapeX++;
                    drawShape(); 
                }
                //Move right
                break;


            case 40:
            
                MoveTetrominoDown();
                //Move down
                break;

            case 38:
               
                rotateShape(); 
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

        context.fillStyle = "black"; 
        context.fillRect(coordX, coordY, 21, 21);
        
    }
}

const handleButtonPress = () => {
    score = 0;
    level = 1; 
    pageScore.innerHTML = "0"
    pageLevel.innerHTML = "1"
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

const getLastSquareX = () => {
    let lastX = 0; 
    for (let index = 0; index < currentShape.length; index++) {
        const square = currentShape[index]; 
       
        if(square[0] > lastX){
            lastX = square[0]
        }
        
    }

    return lastX; 
}


const rotateShape = () => {
    const newShape = new Array(); 
    //Shallow copy
    const shapeCopy = currentShape; 
    //Deep copy
    const currentShapeBackup = [...currentShape]; 

    for (let index = 0; index < shapeCopy.length; index++) {
        const currentSquareX = shapeCopy[index][0];
        const currentSquareY = shapeCopy[index][1];
        const newShapeX = (getLastSquareX() - currentSquareY);
        const newShapeY = currentSquareX; 
        newShape.push([newShapeX, newShapeY]);
    }
    deleteShape(); 
    try{
        currentShape = newShape; 
        drawShape(); 
    }
    catch (exception){
        if (exception instanceof TypeError){
            currentShape = currentShapeBackup; 
            deleteShape(); 
            drawShape(); 
        }
    }
}

const checkAndClearRows = () => {
    let rowsToClear = 0;
    let startOfClearing = 0; 
    for (let index = 0; index < gameBoardArrayHeight; index++) {

        let isRowFull = true; 

        for (let i = 0; i < gameBoardArrayWidth; i++) {
            let square = stoppedShapeArray[i][index]
            if (square === 0 || (typeof square === 'undefined')){
                isRowFull = false; 
                break
            }
            
        }

        if(isRowFull){

            //If it's the first row to be cleared, set start of clearing to the current row. 
            if(startOfClearing === 0){
                startOfClearing = index; 
            }
            rowsToClear++; 

            for (let rowIndex = 0; rowIndex < gameBoardArrayWidth; rowIndex++) {
                stoppedShapeArray[rowIndex][index] = 0;
                gameBoardArray[rowIndex][index] = 0;

                const coordX = coordinateArray[rowIndex][index].x; 
                const coordY = coordinateArray[rowIndex][index].y; 
                context.fillStyle = 'black';
                context.fillRect(coordX, coordY, 21, 21)
                
            }
        } 
    }
    if(rowsToClear > 0){
        score += (rowsToClear*100)
        updateLevel(score)
        pageScore.innerHTML = score; 
        moveRowsDown(rowsToClear, startOfClearing); 
    }
}

const moveRowsDown = (rowsToClear, startOfClearing) => {
    for (let y = startOfClearing-1; y >= 0; y--) {

        for(let x=0; x < gameBoardArrayWidth; x++){

            let newY = y + rowsToClear; 
            let square = stoppedShapeArray[x][y];
            let nextSquare = stoppedShapeArray[x][newY];

            if(typeof square == 'string'){
                nextSquare = square;
                gameBoardArray[x][newY] = 1;
                stoppedShapeArray[x][newY] = square; 
                let coordX = coordinateArray[x][newY].x; 
                let coordY = coordinateArray[x][newY].y; 
                context.fillStyle = nextSquare; 
                context.fillRect(coordX, coordY, 21, 21);
                square = 0; 
                gameBoardArray[x][y] = 0; 
                stoppedShapeArray[x][y] = 0; 
                coordX = coordinateArray[x][y].x;
                coordY = coordinateArray[x][y].y;
                context.fillStyle = 'black'
                context.fillRect(coordX, coordY, 21 , 21)
            }
        }
        
    }
}


const updateLevel = (score) => {
    if(score <= 1000){
        level = 1; 
        pageLevel.innerHTML = "1"
          
    }
    else if (score <= 2000){
        level = 2; 
        pageLevel.innerHTML = "2"
      

    }
    else if (score <= 3000){ 
        level = 3; 
        pageLevel.innerHTML = "3"
     
    }
    else if (score <= 4000){ 
        level = 4; 
        pageLevel.innerHTML = "4"
     
    }
    else if (score <= 5000){ 
        level = 5; 
        pageLevel.innerHTML = "5"
     
    }
    else if (score <= 6000){ 
        level = 6; 
        pageLevel.innerHTML = "6"
     
    }
    else if (score <= 7000){ 
        level = 7; 
        pageLevel.innerHTML = "7"
     
    }
    else if (score <= 8000){ 
        level = 8; 
        pageLevel.innerHTML = "8"
     
    }
    else if (score <= 9000){ 
        level = 9; 
        pageLevel.innerHTML = "9"
     
    }
           
    


}
//regulary moves the current block down if the game isn't over. 
window.setInterval(() => {
    if(isGameOver != "Game Over"){
        MoveTetrominoDown();
    }
  }, (2000 - (score * 100)));
 



resetButton.addEventListener('click', handleButtonPress)
document.addEventListener('keydown', handleKeyPress);

document.addEventListener('DOMContentLoaded', setupCanvas)