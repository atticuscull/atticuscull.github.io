const SQUARE_SIZE = 10;

const SHRINK_FACTOR = 0.9;

var FILL_COLOR;
var EVIL_FILL;
var EVIL_PARENT;
var BORDER_COLOR;


var gridWidth;
var gridHeight;
var canvasWidth;
var canvasHeight;
var deepestLevel = 0;

function randInt(a, b) {
    return Math.floor((b - a) * Math.random()) + a
}

function get_fill_color(fraction) {
    const COLOR_1 = color(0, 0, 50);
    const COLOR_2 = color(255, 255, 255);
    return lerpColor(COLOR_1, COLOR_2, fraction);
}

class ToastBox {
    constructor(x, y, width, height, parent, level = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.children = [];
        this.parent = parent;
        this.level = level;
        deepestLevel = Math.max(level, deepestLevel);
    }
    split_vertical(split_height) {
        let sibling = new ToastBox(this.x, this.y + split_height + 1, this.width, this.height - split_height - 1, this.parent, this.level);
        this.height = split_height;
        this.parent.children.push(sibling);
    }
    split_horizontal(split_length) {
        let sibling = new ToastBox(this.x + split_length + 1, this.y, this.width - split_length - 1, this.height, this.parent, this.level);
        this.width = split_length;
        this.parent.children.push(sibling);
    }
    shrink() {
        let child = new ToastBox(this.x + 1, this.y + 1, this.width - 2, this.height - 2, this, this.level + 1);
        this.children.push(child);
        this.active = false;
    }

    generate() {
        if (this.width < 3 || this.height < 3) {
            this.active = false;
            return;
        }
        this.shrink();

        while (true) {
            if (Math.random() < Math.pow(SHRINK_FACTOR, this.children.length)) {
                let childIndex = randInt(0, this.children.length);
                let child = this.children[childIndex];
                if (Math.random() < child.width / (child.height + child.width)) {
                    if (child.width >= 3) {
                        child.split_horizontal(randInt(1, child.width - 1));
                    }
                } else {
                    if (child.height >= 3) {
                        child.split_vertical(randInt(1, child.height - 1));
                    }
                }
            } else {
                break;
            }

        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].generate();
        }
    }
    drawSelf(rect) {
        fill(get_fill_color(this.level / deepestLevel));
        rect(this.x * SQUARE_SIZE, this.y * SQUARE_SIZE, this.width * SQUARE_SIZE, this.height * SQUARE_SIZE);
    }

    drawAll(rect) {
        this.drawSelf(rect);
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].drawAll(rect);
        }
    }
}

function setup() {
    FILL_COLOR = color(255, 255, 255);
    EVIL_FILL = color(255, 0, 0);
    EVIL_PARENT = color(0, 255, 0);
    BORDER_COLOR = color(0, 0, 0);

    let maxWidth = windowWidth * 0.45;
    let maxHeight = windowHeight * 0.4
    gridWidth = Math.floor(maxWidth / SQUARE_SIZE);
    gridHeight = Math.floor(maxHeight / SQUARE_SIZE);
    canvasWidth = gridWidth * SQUARE_SIZE;
    canvasHeight = gridHeight * SQUARE_SIZE; 
    

    var canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('#canvas-container');

    drawNewToast();
    var regenerateButton = select("#regenerate");
    regenerateButton.mouseClicked(drawNewToast);

}

function drawNewToast() {
    var root = new ToastBox(0, 0, gridWidth, gridHeight);
    root.generate();

    fill(FILL_COLOR);
    stroke(BORDER_COLOR);
    root.drawAll(rect);
}
