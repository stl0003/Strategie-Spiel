export class Tile {
    constructor(x, y, terrainKey, image) {
        this.x = x;
        this.y = y;
        this.gridX = x / 30;
        this.gridY = y / 30;
        this.terrainKey = terrainKey;
        this.image = image;
        this.explored = false;
    }
}