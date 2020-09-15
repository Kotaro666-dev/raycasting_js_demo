const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 7;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.25;

const UP_MOVE = 87
const DOWN_MOVE = 83

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    hasWallAt(x, y) {
        // if (1 < x || x > WINDOW_WIDTH || 1 < y || y < WINDOW_HEIGHT) {
        //     return (false);
        // }
        var mapGridIndexX = Math.floor(x / TILE_SIZE)
        var mapGridIndexY = Math.floor(y / TILE_SIZE)

        if (this.grid[mapGridIndexY][mapGridIndexX] == 1) {
            return (true);
        } else {
            return (false);
        }
    }
    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE;
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(
                    MINIMAP_SCALE_FACTOR * tileX,
                    MINIMAP_SCALE_FACTOR * tileY,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE
                );
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 8;
        this.turnDirection = 0; // -1 == left, +1 == right
        this.walkDirection = 0; // -1 if back, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = 1 * (Math.PI / 180);
    }
    update() {
        // TODO:
        // Update player position based on turnDirection and walkDirection
        this.rotationAngle += this.turnDirection * this.rotationSpeed;

        var moveStep = this.walkDirection * this.moveSpeed; // Hypoteuse or 斜辺
        var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;
        // this.x += Math.cos(this.rotationAngle) * moveStep; // Adjacent or 隣辺
        // this.y += Math.sin(this.rotationAngle) * moveStep; // Opposite or 対辺

        // ONLY SET NEW PLAYER POSITION IF IT IS NOT COLLIDING WITH THE NEW MAP
        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }

    }
    render() {
        noStroke();
        fill("gray");
        circle(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * this.radius
        );
        stroke("red");
        line(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * (this.x + Math.cos(this.rotationAngle) * 50),
            MINIMAP_SCALE_FACTOR * (this.y + Math.sin(this.rotationAngle) * 50)
        );
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    cast() {
        var xintercept, yintercept;
        var xstep, ystep;

        /////////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION CODE
        ////////////////////////////////////////
        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;

        // FIND THE Y-COORDINATE OF THE CLOSEST HORIZONTAL GRID INTERSECTION
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

        // FIND THE X-COORDINATE OF THE CLOSEST HORIZONTAL GRID INTERSECTION
        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        // CALCULATE THE INCREMENT XSTEP AND YSTEP;
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = ystep / Math.tan(this.rayAngle);
        xstep *= this.isRayFacingLeft && xstep > 0 ? -1 : 1;
        xstep *= this.isRayFacingRight && xstep < 0 ? -1 : 1;

        var nextHorzTouchX = xintercept;
        var nextHorzTouchY = yintercept;

        // if (this.isRayFacingUp) {
        //     nextHorzTouchY--;
        // }

        // INCREMENT XSTEP AND YSTEP UTNIL WE FIND A WALL
        while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH &&
                nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
                // WE FOUND A WALL HIT
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;

                // TEST
                // stroke("red");
                // line(player.x, player.y, wallHitX, wallHitY);

                break ;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }

        /////////////////////////////////////////
        // VERTICAL RAY-GRID INTERSECTION CODE
        ////////////////////////////////////////
        var foundVertWallHit = false;
        var vertWallHitX = 0;
        var vertWallHitY = 0;

        // FIND THE X-COORDINATE OF THE CLOSEST VERTICAL GRID INTERSECTION
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

        // FIND THE Y-COORDINATE OF THE CLOSEST VERTICAL GRID INTERSECTION
        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        // CALCULATE THE INCREMENT XSTEP AND YSTEP;
        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= this.isRayFacingUp && ystep > 0 ? -1 : 1;
        ystep *= this.isRayFacingDown && ystep < 0 ? -1 : 1;

        var nextVertTouchX = xintercept;
        var nextVertTouchY = yintercept;

        // if (this.isRayFacingLeft) {
        //     nextVertTouchX--;
        // }

        // INCREMENT XSTEP AND YSTEP UTNIL WE FIND A WALL
        while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH &&
                nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
                // WE FOUND A WALL HIT
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;

                // TEST
                // stroke("blue");
                // line(player.x, player.y, vertWallHitX, vertWallHitY);

                break ;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        // CALCULATE BOTH HORIZONTAL AND VERTICAL DISTANCES AND SHOOSE THE SMALLEST VALUE
        var horizontalHitDistance = (foundHorzWallHit)
            ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
            : Number.MAX_VALUE;
        var verticalHitDistance = (foundVertWallHit)
            ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
            : Number.MAX_VALUE;

        // ONLY STORE THE SMALLEST OF THE DISTANCES
        if (verticalHitDistance < horizontalHitDistance) {
            this.wallHitX = vertWallHitX;
            this.wallHitY = vertWallHitY;
            this.distance = verticalHitDistance;
            this.wasHitVertical = true;
        } else {
            this.wallHitX = horzWallHitX;
            this.wallHitY = horzWallHitY;
            this.distance = horizontalHitDistance;
            this.wasHitVertical = false;
        }
    }
    render() {
        stroke("rgba(255, 0, 0, 0.1)");
        line(
            MINIMAP_SCALE_FACTOR * player.x,
            MINIMAP_SCALE_FACTOR * player.y,
            MINIMAP_SCALE_FACTOR * this.wallHitX,
            MINIMAP_SCALE_FACTOR * this.wallHitY
        );
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
    console.log(keyCode);
    if (keyCode == UP_MOVE) {
        player.walkDirection = 1;
    } else if (keyCode == DOWN_MOVE) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased() {
    // INIT
    if (keyCode == UP_MOVE) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_MOVE) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    }
}

function castAllRays() {
    // start first ray subtracting half of the FOV
    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    // loop all columns casting the rays
    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = new Ray(rayAngle);
        ray.cast();
        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;
    }
}

function render3DProjectedWalls() {

    // LOOP EVERY RAY INT THE ARRAY OF RAYS
    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = rays[i];

        // var rayDistance = ray.distance;

        // FIX THE FISHBOWL DISTORTION: CALCULATE THE CORRECT DISTANCE
        var correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

        // CALCULATE THE DISTANCE TO THE PROJECTION PLANE
        var distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

        // PROJECTED WALL HEIGHT
        var wallStripHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;

        // COMPUTE THE TRANSPARENCY BASED ON THE WALL DISTANCE
        var opacity = 300.0 / correctWallDistance;
        // var opacity = 1.0;
        var color = ray.wasHitVertical ? 255 : 200;


        // RENDER A RECTANGLE WITH THE CALCULATED WALL HEIGHT
        fill(`rgba(${color}, ${color}, ${color}, ${opacity})`);
        noStroke();
        rect(
            i * WALL_STRIP_WIDTH,
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
            WALL_STRIP_WIDTH,
            wallStripHeight
        );
    }

}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return (Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)));
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

}

function update() {
    // TODO: update all game objects before we render the next frame
    player.update();
    castAllRays();
}

function draw() {
    clear("#212121");
    update();

    render3DProjectedWalls();

    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
}
