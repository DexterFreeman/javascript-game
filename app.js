
const resetButton = document.querySelector(".game__resetButton");
const pageScore = document.querySelector("#score"); 
const pageLevel = document.querySelector("#level");
const heldShapeRender = document.querySelector(".game__hold");
const heldImage = document.querySelector(".game__hold-image");
const highScores = document.querySelector(".game__highscores")


let allScores = []
let trackShape; 
let isBlockPlaced = false; 
let canSwitch = true; 
let heldShape = ""; 
let canvas;
let context; 
let gameBoardArrayHeight = 20;
let gameBoardArrayWidth = 12; 
let currentShapeX = 4; 
let currentShapeY = 0; 
let score = 0;
let level = 1; 
let coordinateArray = [...Array(gameBoardArrayHeight)].map(e => Array(gameBoardArrayWidth).fill(0))
let currentShape = [[1,0], [0, 1], [1,1], [2, 1]]
let winOrLose = "Playing"
let difficultyInterval = setInterval(() => {moveShapeDown();}, (2000 - (level * 190)));

//Object to track the current direction the block is moving
const possibleDirections = {
    idle: 0, 
    down: 1, 
    left: 2, 
    right: 3, 
}

let currentShapeDirection = possibleDirections.idle;

//Initialise variable
const shapesArray = [
    [[1,0], [0,1], [1,1], [2,1]], 
    [[0,0], [1,0], [2,0], [3,0]],
    [[0,0], [0,1], [1,1], [2,1]], 
    [[0,0], [1,0], [0,1], [1,1]],
    [[2,0], [0,1], [1,1], [2,1]], 
    [[1,0], [2,0], [0,1], [1,1]], 
    [[0,0], [1,0], [1,1], [2,1]] 
];

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

const startGame = () => {
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

    createShape();
    setupCoordinateArray(); 
    drawCurrentShape(); 
}


const createShape = () => {
    let randomSelector = Math.floor(Math.random() * shapesArray.length);
    currentShape = shapesArray[randomSelector];
    currentShapeColour = shapeColours[randomSelector];
}

const setupCoordinateArray = () => {
    let heightIndex = 0, widthIndex = 0;
    for(let y = 9; y <= 446; y += 23){
        // 12 * 23 = 276 - 12 = 264 Max X value
        for(let x = 11; x <= 264; x += 23){
            coordinateArray[heightIndex][widthIndex] = new Coordinates(x,y);
            heightIndex++;
          
        }
        widthIndex++;
        heightIndex = 0;
    }
}

const drawCurrentShape = () => {
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
        if((newShapeX <= 0 || typeof(stoppedShapeArray[newShapeX-1][newShapeY]) === 'string')&& currentShapeDirection === possibleDirections.left){

            return true;
        } else if((newShapeX >= 11 || typeof(stoppedShapeArray[newShapeX+1][newShapeY]) === 'string') && currentShapeDirection === possibleDirections.right){
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

        if(currentShapeDirection === directions.down){
            newShapeY++; 
        }
        if(typeof stoppedShapeArray[newShapeX][newShapeY] === 'string'){
           
            return true; 
        }
        else if (newShapeY >= 20){
            
            return true; 
        }    
    }
    return false;
}

const updateScores = (score) => {
    highScores.innerHTML = "<h1>Highscores:</h1>";
    allScores.push(score);
    allScores.sort((a,b) => a-b);
    allScores.reverse(); 
    allScores.forEach(element => {
        highScores.innerHTML += `<p>${element}</p>`
    });
}

const handleCollisionDown = (shapeXCoordinate, shapeYCoordinate, newShape) => {
    //Has the user lost?
    canSwitch = true; 
    trackShape = "";
    isBlockPlaced = false; 
    if(hasUserLost(shapeYCoordinate)){
        winOrLose = "Game Over";
        alert("Game over")
        
        updateScores(score); 
        resetGame();
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
        currentShapeDirection = directions.idle; 
        currentShapeX = 4;
        currentShapeY = 0; 
        drawCurrentShape(); 
    }
}

const hasUserLost = (yCoordinate) => {
    if(yCoordinate <= 2){
        return true; 
    }
    return false; 
}

const moveShapeDown = () => {
    currentShapeDirection = directions.down;
    //Check for a vertical collision, either with floor or the wall
    if(!isCollidingDown(currentShape, currentShapeX, currentShapeY)){
        deleteCurrentShape();
        currentShapeY++;
        drawCurrentShape();
    }
    else{
        handleCollisionDown(currentShapeX, currentShapeY, currentShape); 
    }
}


const handleKeyPress = (event) => {
    //Prevents swap shape to be spammed. 
    if(event.keyCode == 16 && event.repeat){return;}
    if(winOrLose != "Game Over"){
        switch(event.keyCode){
            case 37:
                currentShapeDirection = possibleDirections.left;
                if(!isCollidingWall(currentShape, currentShapeX, currentShapeY)){
                    deleteCurrentShape(); 
                    currentShapeX--;
                    drawCurrentShape(); 
                }
                //Move left
                //Can you move left? 
                //If yes then move the current shape, delete old position and redraw
                break;
            case 39:
              
                currentShapeDirection = possibleDirections.right;
                if(!isCollidingWall(currentShape, currentShapeX, currentShapeY)){
                    deleteCurrentShape();
                    currentShapeX++;
                    drawCurrentShape(); 
                }
                //Move right
                break;
            case 40:
                moveShapeDown();
                //Move down
                break;
            case 38:
                rotateShape(); 
                break;
            case 16: 
                holdShape(currentShape); 
                break; 
        }
    }
}

const holdShape = () => {
    if (trackShape == undefined || trackShape == ""){
        trackShape = currentShape; 
    }
    if (canSwitch){
        if(heldShape == ""){
            heldShape = trackShape;
            renderHeldShape(heldShape); 
            deleteCurrentShape();
            currentShape = ""
            trackShape = ""
            currentShapeX = 4;
            currentShapeY = 0; 
            createShape();
            drawCurrentShape(); 
        }
        else{
            renderHeldShape(trackShape); 
            deleteCurrentShape(); 
            let tempShape = trackShape;
            currentShape = heldShape;
            heldShape = tempShape;
            currentShapeColour = shapeColours[shapesArray.indexOf(currentShape)]
            currentShapeX = 4;
            currentShapeY = 0; 
            drawCurrentShape(); 
            
        }
        canSwitch = false; 
    }
    
}


const renderHeldShape = (shapeToRender) => {
    switch(shapesArray.indexOf(shapeToRender)){
        case 0:
            heldImage.src = "./images/TBlock.png"
            break;

        case 1:
            heldImage.src = "./images/IBlock.png"
            break;

        case 2:
            heldImage.src = "./images/JBlock.png"
            break;

        case 3:
            heldImage.src = "./images/squareBlock.png"
            break;

        case 4:
            heldImage.src = "./images/LBlock.png"
            break;
        
        case 5:
            heldImage.src = "./images/SBlock.png"
            break; 

        case 6:
            heldImage.src = "./images/ZBlock.png"
            break;

        default: 
           alert("Error: Piece to hold not recognised")
            
    }
}

const deleteCurrentShape = () => {
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

const resetGame = () => {
    score = 0;
    level = 1; 
    setDifficulty(level)
    pageScore.innerHTML = "0"
    pageLevel.innerHTML = "1"
    heldImage.src = ""
    heldShape = ""
    deleteCurrentShape(); 
    winOrLose = "Playing"
    currentShapeX = 4; 
    currentShapeY = 0; 
    //Reset arrays and current shape
    gameBoardArray = [...Array(gameBoardArrayHeight)].map(e => Array(gameBoardArrayWidth).fill(0))
    stoppedShapeArray = [...Array(20)].map(e => Array(12).fill(0));
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
    if(isBlockPlaced == false){
        trackShape = currentShape
        isBlockPlaced = true; 
    }
    const newShape = new Array(); 
    const shapeCopy = currentShape; 
    const currentShapeBackup = [...currentShape]; 

    for (let index = 0; index < shapeCopy.length; index++) {
        const currentSquareX = shapeCopy[index][0];
        const currentSquareY = shapeCopy[index][1];
        const newShapeX = (getLastSquareX() - currentSquareY);
        const newShapeY = currentSquareX; 
        newShape.push([newShapeX, newShapeY]);
    }
    
    if(isCollidingDown(newShape, currentShapeX, currentShapeY) || isCollidingWall(newShape, currentShapeX, currentShapeY)){
        
    }
    else{
        deleteCurrentShape(); 
        //Error occurs if you try to rotate out of the array bounds. I.E outside the game walls. 
        try{
            currentShape = newShape; 
            drawCurrentShape(); 
        }
        catch (exception){
            if (exception instanceof TypeError){
                currentShape = currentShapeBackup; 
                deleteCurrentShape(); 
                drawCurrentShape(); 
            }
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
    if(score <= 500){
        level = 1; 
        setDifficulty(level); 
        pageLevel.innerHTML = "1"
          
    }
    else if (score <= 1000){
        level = 2; 
        setDifficulty(level); 
        pageLevel.innerHTML = "2"
      

    }
    else if (score <= 1500){ 
        level = 3; 
        setDifficulty(level); 
        pageLevel.innerHTML = "3"
     
    }
    else if (score <= 2000){ 
        level = 4; 
        setDifficulty(level); 
        pageLevel.innerHTML = "4"
     
    }
    else if (score <= 2500){ 
        level = 5; 
        setDifficulty(level); 
        pageLevel.innerHTML = "5"
     
    }
    else if (score <= 3000){ 
        level = 6; 
        setDifficulty(level); 
        pageLevel.innerHTML = "6"
     
    }
    else if (score <= 3500){ 
        level = 7; 
        setDifficulty(level); 
        pageLevel.innerHTML = "7"
     
    }
    else if (score <= 4000){ 
        level = 8; 
        setDifficulty(level); 
        pageLevel.innerHTML = "8"
     
    }
    else if (score <= 4500){ 
        level = 9; 
        setDifficulty(level); 
        pageLevel.innerHTML = "9"
     
    }
    else if (score <= 5000){ 
        level = 10; 
        setDifficulty(level); 
        pageLevel.innerHTML = "10"
     
    }
}

const setDifficulty = (level) => {
    clearInterval(difficultyInterval)
    difficultyInterval = setInterval(() => {if(winOrLose != "Game Over"){moveShapeDown();}}, (2000 - (level * 190)));
    
}

resetButton.addEventListener('click', resetGame)
document.addEventListener('keydown', handleKeyPress);
document.addEventListener('DOMContentLoaded', startGame)