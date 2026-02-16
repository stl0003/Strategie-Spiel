export class Building {
    constructor(width, height, image, gridX, gridY, buildingLevel = 1) {
        this.width = width;
        this.height = height;
        this.image = image;
        this.gridX = gridX;
        this.gridY = gridY;
        this.x = gridX * 30;
        this.y = gridY * 30;
        this.buildingLevel = buildingLevel;
    }

    upgrade(newImage) {
        this.buildingLevel++;
        this.image = newImage;
    }
}