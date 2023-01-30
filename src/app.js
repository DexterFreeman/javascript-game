
const maxHeightOfScreen = 446; 
const maxWidthOfScreen = 264;
const sizeOfEachBlock = 23;

let canvas;
let context; 
let gameBoardArrHeight = 20;
let gameBoardArrWidth = 12; 
let startX = 4; 
let startY = 0; 
let score = 0;
let coordinateArray = [...Array(gameBoardArrHeight)].map(e => Array(gameBoardArrWidth).fill(0))
let currentShape = [[1,0], [0, 1], [1,1], [2, 1]]


//Initialise variable
let shapesArray = [];
// Push T 
shapesArray.push([[1,0], [0,1], [1,1], [2,1]]);
// Push I
shapesArray.push([[0,0], [1,0], [2,0], [3,0]]);
// Push J
shapesArray.push([[0,0], [0,1], [1,1], [2,1]]);
// Push Square
shapesArray.push([[0,0], [1,0], [0,1], [1,1]]);
// Push L 
shapesArray.push([[2,0], [0,1], [1,1], [2,1]]);
// Push S
shapesArray.push([[1,0], [2,0], [0,1], [1,1]]);
// Push Z
shapesArray.push([[0,0], [1,0], [1,1], [2,1]]);

//Put in order of corresponding colour to the index of the shapes array, so each shape belongs to the same index of it's mathcing colour. 
let shapeColours = ["purple","cyan","orange", "yellow", "blue", "green", "red" ]


let currentShapeColour; 
let gameBoardArray = [...Array(gameBoardArrHeight)].map(e => Array(gameBoardArrWidth).fill(0))
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
        
        let x = currentShape[index][0] + startX;
        let y = currentShape[index][1] + startY;

        gameBoardArray[x][y] = 1;

        let coordX = coordinateArray[x][y].x; 
        let coordY = coordinateArray[x][y].y; 

        context.fillStyle = currentShapeColour; 
        context.fillRect(coordX, coordY, 21, 21);
        
    }
}

const handleKeyPress = (event) => {

}


document.addEventListener('keydown', handleKeyPress);
document.addEventListener('DOMContentLoaded', setupCanvas)